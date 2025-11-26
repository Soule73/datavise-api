/**
 * Tests pour les routes dashboards v1
 */

import request from "supertest";
import express, { Express } from "express";
import dashboardsRouter from "../../../src/v1/routes/dashboards.routes";
import { initPermissionsAndRoles } from "../../../src/data/initPermissions";
import { createTestUser, generateTestToken } from "../../helpers/testHelpers";
import Dashboard from "../../../src/models/Dashboard";
import Widget from "../../../src/models/Widget";
import DataSource from "../../../src/models/DataSource";

const app: Express = express();
app.use(express.json());
app.use("/api/v1/dashboards", dashboardsRouter);

describe("Dashboards v1 Routes", () => {
    let authToken: string;
    let testUserId: string;

    beforeEach(async () => {
        await initPermissionsAndRoles();
        const result = await createTestUser({ roleName: "admin" });
        testUserId = String(result.user._id);
        authToken = generateTestToken(testUserId, "admin");
    });

    afterEach(async () => {
        await Dashboard.deleteMany({});
        await Widget.deleteMany({});
        await DataSource.deleteMany({});
    });

    describe("POST /api/v1/dashboards", () => {
        it("devrait créer un dashboard avec succès", async () => {
            const payload = {
                title: "Dashboard Test 2025",
                visibility: "private",
            };

            const res = await request(app)
                .post("/api/v1/dashboards")
                .set("Authorization", `Bearer ${authToken}`)
                .send(payload);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.title).toBe(payload.title);
            expect(res.body.data.visibility).toBe(payload.visibility);
            expect(res.body.data._id).toBeDefined();
        });

        it("devrait échouer avec un titre trop court", async () => {
            const payload = {
                title: "AB",
            };

            const res = await request(app)
                .post("/api/v1/dashboards")
                .set("Authorization", `Bearer ${authToken}`)
                .send(payload);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("devrait créer un dashboard avec layout complet", async () => {
            const payload = {
                title: "Dashboard avec widgets",
                layout: [
                    {
                        i: "widget_123",
                        widgetId: "widget_123",
                        w: 6,
                        h: 4,
                        x: 0,
                        y: 0,
                    },
                    {
                        i: "widget_456",
                        widgetId: "widget_456",
                        w: 6,
                        h: 4,
                        x: 6,
                        y: 0,
                    },
                ],
                visibility: "public",
                autoRefreshIntervalValue: 30,
                autoRefreshIntervalUnit: "second",
            };

            const res = await request(app)
                .post("/api/v1/dashboards")
                .set("Authorization", `Bearer ${authToken}`)
                .send(payload);

            expect(res.status).toBe(201);
            expect(res.body.data.layout).toHaveLength(2);
            expect(res.body.data.autoRefreshIntervalValue).toBe(30);
        });

        it("devrait échouer sans authentification", async () => {
            const payload = { title: "Test" };

            const res = await request(app)
                .post("/api/v1/dashboards")
                .send(payload);

            expect(res.status).toBe(401);
        });
    });

    describe("GET /api/v1/dashboards", () => {
        it("devrait lister les dashboards avec pagination", async () => {
            await request(app)
                .post("/api/v1/dashboards")
                .set("Authorization", `Bearer ${authToken}`)
                .send({ title: "Dashboard 1" });

            await request(app)
                .post("/api/v1/dashboards")
                .set("Authorization", `Bearer ${authToken}`)
                .send({ title: "Dashboard 2" });

            const res = await request(app)
                .get("/api/v1/dashboards")
                .set("Authorization", `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.meta.pagination).toBeDefined();
            expect(res.body.meta.pagination.total).toBeGreaterThanOrEqual(2);
            expect(res.body.links).toBeDefined();
        });

        it("devrait filtrer par visibility", async () => {
            await request(app)
                .post("/api/v1/dashboards")
                .set("Authorization", `Bearer ${authToken}`)
                .send({ title: "Dashboard Public", visibility: "public" });

            await request(app)
                .post("/api/v1/dashboards")
                .set("Authorization", `Bearer ${authToken}`)
                .send({ title: "Dashboard Private", visibility: "private" });

            const res = await request(app)
                .get("/api/v1/dashboards?visibility=public")
                .set("Authorization", `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.every((d: any) => d.visibility === "public")).toBe(true);
        });

        it("devrait paginer correctement avec limit et page", async () => {
            for (let i = 1; i <= 5; i++) {
                await request(app)
                    .post("/api/v1/dashboards")
                    .set("Authorization", `Bearer ${authToken}`)
                    .send({ title: `Dashboard ${i}` });
            }

            const res = await request(app)
                .get("/api/v1/dashboards?page=1&limit=2")
                .set("Authorization", `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(2);
            expect(res.body.meta.pagination.page).toBe(1);
            expect(res.body.meta.pagination.limit).toBe(2);
        });

        it("devrait échouer sans authentification", async () => {
            const res = await request(app).get("/api/v1/dashboards");
            expect(res.status).toBe(401);
        });
    });

    describe("GET /api/v1/dashboards/:id", () => {
        it("devrait récupérer un dashboard par ID", async () => {
            const createRes = await request(app)
                .post("/api/v1/dashboards")
                .set("Authorization", `Bearer ${authToken}`)
                .send({ title: "Dashboard Test" });

            const dashboardId = createRes.body.data._id;

            const res = await request(app)
                .get(`/api/v1/dashboards/${dashboardId}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data._id).toBe(dashboardId);
            expect(res.body.data.title).toBe("Dashboard Test");
        });

        it("devrait retourner 404 pour un ID inexistant", async () => {
            const fakeId = "507f1f77bcf86cd799439011";

            const res = await request(app)
                .get(`/api/v1/dashboards/${fakeId}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it("devrait retourner 400 pour un ID invalide", async () => {
            const res = await request(app)
                .get("/api/v1/dashboards/invalid-id")
                .set("Authorization", `Bearer ${authToken}`);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe("PATCH /api/v1/dashboards/:id", () => {
        it("devrait mettre à jour le titre d'un dashboard", async () => {
            const createRes = await request(app)
                .post("/api/v1/dashboards")
                .set("Authorization", `Bearer ${authToken}`)
                .send({ title: "Original Title" });

            const dashboardId = createRes.body.data._id;

            const res = await request(app)
                .patch(`/api/v1/dashboards/${dashboardId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({ title: "Updated Title" });

            expect(res.status).toBe(200);
            expect(res.body.data.title).toBe("Updated Title");
        });

        it("devrait mettre à jour le layout", async () => {
            const createRes = await request(app)
                .post("/api/v1/dashboards")
                .set("Authorization", `Bearer ${authToken}`)
                .send({ title: "Dashboard" });

            const dashboardId = createRes.body.data._id;

            const newLayout = [
                {
                    i: "widget_789",
                    widgetId: "widget_789",
                    w: 12,
                    h: 6,
                    x: 0,
                    y: 0,
                },
            ];

            const res = await request(app)
                .patch(`/api/v1/dashboards/${dashboardId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({ layout: newLayout });

            expect(res.status).toBe(200);
            expect(res.body.data.layout).toHaveLength(1);
            expect(res.body.data.layout[0].widgetId).toBe("widget_789");
        });

        it("devrait échouer avec validation error", async () => {
            const createRes = await request(app)
                .post("/api/v1/dashboards")
                .set("Authorization", `Bearer ${authToken}`)
                .send({ title: "Dashboard" });

            const dashboardId = createRes.body.data._id;

            const res = await request(app)
                .patch(`/api/v1/dashboards/${dashboardId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({ title: "AB" });

            expect(res.status).toBe(400);
        });
    });

    describe("DELETE /api/v1/dashboards/:id", () => {
        it("devrait supprimer un dashboard", async () => {
            const createRes = await request(app)
                .post("/api/v1/dashboards")
                .set("Authorization", `Bearer ${authToken}`)
                .send({ title: "To Delete" });

            const dashboardId = createRes.body.data._id;

            const res = await request(app)
                .delete(`/api/v1/dashboards/${dashboardId}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            const getRes = await request(app)
                .get(`/api/v1/dashboards/${dashboardId}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(getRes.status).toBe(404);
        });

        it("devrait retourner 404 pour un ID inexistant", async () => {
            const fakeId = "507f1f77bcf86cd799439011";

            const res = await request(app)
                .delete(`/api/v1/dashboards/${fakeId}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(res.status).toBe(404);
        });
    });

    describe("PATCH /api/v1/dashboards/:id/sharing", () => {
        it("devrait activer le partage", async () => {
            const createRes = await request(app)
                .post("/api/v1/dashboards")
                .set("Authorization", `Bearer ${authToken}`)
                .send({ title: "Dashboard Sharing" });

            const dashboardId = createRes.body.data._id;

            const res = await request(app)
                .patch(`/api/v1/dashboards/${dashboardId}/sharing`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({ enabled: true });

            expect(res.status).toBe(200);
            expect(res.body.data.shareEnabled).toBe(true);
            expect(res.body.data.shareId).toBeDefined();
        });

        it("devrait désactiver le partage", async () => {
            const createRes = await request(app)
                .post("/api/v1/dashboards")
                .set("Authorization", `Bearer ${authToken}`)
                .send({ title: "Dashboard" });

            const dashboardId = createRes.body.data._id;

            await request(app)
                .patch(`/api/v1/dashboards/${dashboardId}/sharing`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({ enabled: true });

            const res = await request(app)
                .patch(`/api/v1/dashboards/${dashboardId}/sharing`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({ enabled: false });

            expect(res.status).toBe(200);
            expect(res.body.data.shareEnabled).toBe(false);
        });

        it("devrait échouer sans champ enabled", async () => {
            const createRes = await request(app)
                .post("/api/v1/dashboards")
                .set("Authorization", `Bearer ${authToken}`)
                .send({ title: "Dashboard" });

            const dashboardId = createRes.body.data._id;

            const res = await request(app)
                .patch(`/api/v1/dashboards/${dashboardId}/sharing`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({});

            expect(res.status).toBe(400);
        });
    });

    describe("GET /api/v1/dashboards/shared/:shareId (public)", () => {
        it("devrait récupérer un dashboard partagé sans auth", async () => {
            const createRes = await request(app)
                .post("/api/v1/dashboards")
                .set("Authorization", `Bearer ${authToken}`)
                .send({ title: "Public Dashboard" });

            const dashboardId = createRes.body.data._id;

            const enableShareRes = await request(app)
                .patch(`/api/v1/dashboards/${dashboardId}/sharing`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({ enabled: true });

            const shareId = enableShareRes.body.data.shareId;

            const res = await request(app).get(
                `/api/v1/dashboards/shared/${shareId}`
            );

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.shareId).toBe(shareId);
        });

        it("devrait retourner 404 pour un shareId invalide", async () => {
            const res = await request(app).get(
                "/api/v1/dashboards/shared/invalid-share-id"
            );

            expect(res.status).toBe(404);
        });
    });

    describe("GET /api/v1/dashboards/shared/:shareId/sources (public)", () => {
        it("devrait récupérer les sources d'un dashboard partagé", async () => {
            const dataSource = await DataSource.create({
                name: "Test Source",
                type: "json",
                endpoint: "http://example.com/data",
                userId: testUserId,
                ownerId: testUserId,
            });

            const widget = await Widget.create({
                widgetId: "widget_test_123",
                title: "Test Widget",
                name: "Test Widget",
                type: "bar",
                userId: testUserId,
                ownerId: testUserId,
                config: {},
                dataSourceId: dataSource._id,
            });

            const createRes = await request(app)
                .post("/api/v1/dashboards")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    title: "Dashboard with Sources",
                    layout: [
                        {
                            i: widget.widgetId,
                            widgetId: widget.widgetId,
                            w: 6,
                            h: 4,
                            x: 0,
                            y: 0,
                        },
                    ],
                });

            const dashboardId = createRes.body.data._id;

            const enableShareRes = await request(app)
                .patch(`/api/v1/dashboards/${dashboardId}/sharing`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({ enabled: true });

            const shareId = enableShareRes.body.data.shareId;

            const res = await request(app).get(
                `/api/v1/dashboards/shared/${shareId}/sources`
            );

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
});
