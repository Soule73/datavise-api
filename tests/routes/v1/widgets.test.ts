/**
 * Tests pour les routes v1 Widgets
 */

import request from "supertest";
import express, { Express } from "express";
import mongoose from "mongoose";
import widgetsRouter from "../../../src/v1/routes/widgets.routes";
import Widget from "../../../src/models/Widget";
import DataSource from "../../../src/models/DataSource";
import User from "../../../src/models/User";
import { createTestUser, generateTestToken } from "../../helpers/testHelpers";
import { initPermissionsAndRoles } from "../../../src/data/initPermissions";

const app: Express = express();
app.use(express.json());
app.use("/api/v1/widgets", widgetsRouter);

describe("V1 Widgets Routes", () => {
    let authToken: string;
    let testUser: any;
    let userId: mongoose.Types.ObjectId;
    let dataSourceId: mongoose.Types.ObjectId;
    let testWidgetId: string;

    beforeEach(async () => {
        await initPermissionsAndRoles();

        testUser = await createTestUser({
            email: "widget-tester-v1@test.com",
            password: "password123",
            roleName: "admin",
        });
        userId = testUser.user._id as mongoose.Types.ObjectId;
        authToken = generateTestToken(testUser.user._id, "admin");

        const dataSource = await DataSource.create({
            name: "Test Data Source",
            type: "json",
            config: { data: [] },
            ownerId: userId,
        });
        dataSourceId = dataSource._id;
    });

    afterEach(async () => {
        if (testUser?.user?._id) {
            await Widget.deleteMany({ ownerId: testUser.user._id });
            await DataSource.deleteMany({ ownerId: testUser.user._id });
            await User.findByIdAndDelete(testUser.user._id);
        }
    });

    describe("POST /api/v1/widgets", () => {
        it("devrait créer un widget avec validation Zod", async () => {
            const payload = {
                widgetId: "widget-test-v1-001",
                title: "Widget Test V1",
                type: "bar",
                dataSourceId: dataSourceId.toString(),
                config: {
                    metrics: [{ field: "montant", aggregation: "sum" }],
                    buckets: [{ field: "categorie" }],
                },
                visibility: "private",
            };

            const response = await request(app)
                .post("/api/v1/widgets")
                .set("Authorization", `Bearer ${authToken}`)
                .send(payload);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("_id");
            expect(response.body.data.title).toBe(payload.title);
            expect(response.body.message).toBe("Widget créé avec succès");
            expect(response.body).toHaveProperty("timestamp");
            expect(response.body.links).toHaveProperty("self");

            testWidgetId = response.body.data._id;
        });

        it("devrait rejeter un widget avec titre trop court", async () => {
            const payload = {
                widgetId: "widget-test-v1-002",
                title: "AB",
                type: "bar",
                dataSourceId: dataSourceId.toString(),
            };

            const response = await request(app)
                .post("/api/v1/widgets")
                .set("Authorization", `Bearer ${authToken}`)
                .send(payload);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toBe("Erreur de validation");
            expect(response.body.error.details).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        field: "title",
                        message: expect.stringContaining("au moins 3"),
                    }),
                ])
            );
        });

        it("devrait rejeter un type de widget invalide", async () => {
            const payload = {
                widgetId: "widget-test-v1-003",
                title: "Widget Invalide",
                type: "invalid_type",
                dataSourceId: dataSourceId.toString(),
            };

            const response = await request(app)
                .post("/api/v1/widgets")
                .set("Authorization", `Bearer ${authToken}`)
                .send(payload);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.details).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        field: "type",
                    }),
                ])
            );
        });

        it("devrait rejeter un MongoDB ObjectId invalide", async () => {
            const payload = {
                widgetId: "widget-test-v1-004",
                title: "Widget ObjectId Invalide",
                type: "bar",
                dataSourceId: "invalid-objectid",
            };

            const response = await request(app)
                .post("/api/v1/widgets")
                .set("Authorization", `Bearer ${authToken}`)
                .send(payload);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.details).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        field: "dataSourceId",
                        message: "ID MongoDB invalide",
                    }),
                ])
            );
        });
    });

    describe("GET /api/v1/widgets", () => {
        beforeAll(async () => {
            await Widget.create([
                {
                    widgetId: "widget-list-001",
                    title: "Widget Bar",
                    type: "bar",
                    dataSourceId,
                    ownerId: userId,
                    visibility: "private",
                },
                {
                    widgetId: "widget-list-002",
                    title: "Widget Line",
                    type: "line",
                    dataSourceId,
                    ownerId: userId,
                    visibility: "public",
                },
                {
                    widgetId: "widget-list-003",
                    title: "Widget Pie",
                    type: "pie",
                    dataSourceId,
                    ownerId: userId,
                    isDraft: true,
                },
            ]);
        });

        it("devrait lister les widgets avec pagination", async () => {
            const response = await request(app)
                .get("/api/v1/widgets?page=1&limit=2")
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBeLessThanOrEqual(2);
            expect(response.body.meta.pagination).toEqual(
                expect.objectContaining({
                    page: 1,
                    limit: 2,
                    total: expect.any(Number),
                    totalPages: expect.any(Number),
                })
            );
            expect(response.body.links).toHaveProperty("self");
            expect(response.body.links).toHaveProperty("first");
            expect(response.body.links).toHaveProperty("last");
        });

        it("devrait filtrer par type de widget", async () => {
            const response = await request(app)
                .get("/api/v1/widgets?type=bar")
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            response.body.data.forEach((widget: any) => {
                expect(widget.type).toBe("bar");
            });
        });

        it("devrait filtrer par visibilité", async () => {
            const response = await request(app)
                .get("/api/v1/widgets?visibility=public")
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            response.body.data.forEach((widget: any) => {
                expect(widget.visibility).toBe("public");
            });
        });

        it("devrait filtrer par isDraft", async () => {
            const response = await request(app)
                .get("/api/v1/widgets?isDraft=true")
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            response.body.data.forEach((widget: any) => {
                expect(widget.isDraft).toBe(true);
            });
        });
    });

    describe("GET /api/v1/widgets/:id", () => {
        it("devrait récupérer un widget par son ID", async () => {
            const widget = await Widget.create({
                widgetId: "widget-get-test",
                title: "Widget pour GET",
                type: "bar",
                dataSourceId,
                ownerId: userId,
            });

            const response = await request(app)
                .get(`/api/v1/widgets/${widget._id}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data._id).toBe(widget._id.toString());
            expect(response.body.meta.links).toHaveProperty("self");
        });

        it("devrait retourner 404 pour un widget inexistant", async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .get(`/api/v1/widgets/${fakeId}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toBe("Widget non trouvé.");
        });

        it("devrait rejeter un ID invalide", async () => {
            const response = await request(app)
                .get("/api/v1/widgets/invalid-id")
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.details).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        field: "id",
                        message: "ID MongoDB invalide",
                    }),
                ])
            );
        });
    });

    describe("PATCH /api/v1/widgets/:id", () => {
        it("devrait mettre à jour un widget", async () => {
            const widget = await Widget.create({
                widgetId: "widget-patch-test",
                title: "Widget pour PATCH",
                type: "bar",
                dataSourceId,
                ownerId: userId,
            });

            const updatePayload = {
                title: "Titre Mis à Jour V1",
                description: "Description mise à jour",
            };

            const response = await request(app)
                .patch(`/api/v1/widgets/${widget._id}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send(updatePayload);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.title).toBe(updatePayload.title);
            expect(response.body.data.description).toBe(
                updatePayload.description
            );
            expect(response.body.message).toBe("Widget mis à jour avec succès");
        });

        it("devrait rejeter une mise à jour avec données invalides", async () => {
            const widget = await Widget.create({
                widgetId: "widget-patch-invalid-test",
                title: "Widget pour test invalide",
                type: "bar",
                dataSourceId,
                ownerId: userId,
            });

            const invalidPayload = {
                title: "AB",
            };

            const response = await request(app)
                .patch(`/api/v1/widgets/${widget._id}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send(invalidPayload);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe("DELETE /api/v1/widgets/:id", () => {
        it("devrait supprimer un widget", async () => {
            const widget = await Widget.create({
                widgetId: "widget-delete-test",
                title: "Widget pour DELETE",
                type: "bar",
                dataSourceId,
                ownerId: userId,
            });

            const response = await request(app)
                .delete(`/api/v1/widgets/${widget._id}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeNull();
            expect(response.body.message).toBe("Widget supprimé avec succès");

            const deleted = await Widget.findById(widget._id);
            expect(deleted).toBeNull();
        });

        it("devrait retourner 404 pour un widget déjà supprimé", async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .delete(`/api/v1/widgets/${fakeId}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });
});
