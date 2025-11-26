/**
 * Tests pour les routes data sources v1
 */

import request from "supertest";
import express, { Express } from "express";
import dataSourcesRouter from "../../../src/v1/routes/data-sources.routes";
import { initPermissionsAndRoles } from "../../../src/data/initPermissions";
import { createTestUser, generateTestToken } from "../../helpers/testHelpers";
import DataSource from "../../../src/models/DataSource";
import Widget from "../../../src/models/Widget";

const app: Express = express();
app.use(express.json());
app.use("/api/v1/data-sources", dataSourcesRouter);

describe("Data Sources v1 Routes", () => {
    let authToken: string;
    let testUserId: string;

    beforeEach(async () => {
        await initPermissionsAndRoles();
        const result = await createTestUser({ roleName: "admin" });
        testUserId = String(result.user._id);
        authToken = generateTestToken(testUserId, "admin");
    });

    afterEach(async () => {
        await DataSource.deleteMany({});
        await Widget.deleteMany({});
    });

    describe("POST /api/v1/data-sources", () => {
        it("devrait créer une source JSON avec succès", async () => {
            const payload = {
                name: "API Externe",
                type: "json",
                endpoint: "https://api.example.com/data",
                visibility: "private",
                httpMethod: "GET",
                authType: "none",
            };

            const res = await request(app)
                .post("/api/v1/data-sources")
                .set("Authorization", `Bearer ${authToken}`)
                .send(payload);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe(payload.name);
            expect(res.body.data.type).toBe(payload.type);
            expect(res.body.data._id).toBeDefined();
        });

        it("devrait échouer avec un nom trop court", async () => {
            const payload = {
                name: "A",
                type: "json",
                endpoint: "https://api.example.com/data",
            };

            const res = await request(app)
                .post("/api/v1/data-sources")
                .set("Authorization", `Bearer ${authToken}`)
                .send(payload);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("devrait échouer si endpoint manquant pour type JSON", async () => {
            const payload = {
                name: "Source Sans Endpoint",
                type: "json",
            };

            const res = await request(app)
                .post("/api/v1/data-sources")
                .set("Authorization", `Bearer ${authToken}`)
                .send(payload);

            expect(res.status).toBe(400);
        });

        it("devrait créer une source Elasticsearch", async () => {
            const payload = {
                name: "ES Source",
                type: "elasticsearch",
                endpoint: "https://elasticsearch.example.com",
                esIndex: "logs-*",
                visibility: "private",
            };

            const res = await request(app)
                .post("/api/v1/data-sources")
                .set("Authorization", `Bearer ${authToken}`)
                .send(payload);

            expect(res.status).toBe(201);
            expect(res.body.data.type).toBe("elasticsearch");
            expect(res.body.data.esIndex).toBe("logs-*");
        });

        it("devrait échouer sans authentification", async () => {
            const payload = {
                name: "Test",
                type: "json",
                endpoint: "https://api.example.com",
            };

            const res = await request(app)
                .post("/api/v1/data-sources")
                .send(payload);

            expect(res.status).toBe(401);
        });
    });

    describe("GET /api/v1/data-sources", () => {
        it("devrait lister les sources avec pagination", async () => {
            await request(app)
                .post("/api/v1/data-sources")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    name: "Source 1",
                    type: "json",
                    endpoint: "https://api1.example.com",
                });

            await request(app)
                .post("/api/v1/data-sources")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    name: "Source 2",
                    type: "csv",
                    endpoint: "https://api2.example.com",
                });

            const res = await request(app)
                .get("/api/v1/data-sources")
                .set("Authorization", `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.meta.pagination).toBeDefined();
            expect(res.body.meta.pagination.total).toBeGreaterThanOrEqual(2);
            expect(res.body.links).toBeDefined();
        });

        it("devrait filtrer par type", async () => {
            await request(app)
                .post("/api/v1/data-sources")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    name: "JSON Source",
                    type: "json",
                    endpoint: "https://json.example.com",
                });

            await request(app)
                .post("/api/v1/data-sources")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    name: "CSV Source",
                    type: "csv",
                });

            const res = await request(app)
                .get("/api/v1/data-sources?type=json")
                .set("Authorization", `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.every((s: any) => s.type === "json")).toBe(
                true
            );
        });

        it("devrait filtrer par visibility", async () => {
            await request(app)
                .post("/api/v1/data-sources")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    name: "Public Source",
                    type: "json",
                    endpoint: "https://public.example.com",
                    visibility: "public",
                });

            await request(app)
                .post("/api/v1/data-sources")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    name: "Private Source",
                    type: "json",
                    endpoint: "https://private.example.com",
                    visibility: "private",
                });

            const res = await request(app)
                .get("/api/v1/data-sources?visibility=public")
                .set("Authorization", `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(
                res.body.data.every((s: any) => s.visibility === "public")
            ).toBe(true);
        });

        it("devrait paginer correctement", async () => {
            for (let i = 1; i <= 5; i++) {
                await request(app)
                    .post("/api/v1/data-sources")
                    .set("Authorization", `Bearer ${authToken}`)
                    .send({
                        name: `Source ${i}`,
                        type: "json",
                        endpoint: `https://api${i}.example.com`,
                    });
            }

            const res = await request(app)
                .get("/api/v1/data-sources?page=1&limit=2")
                .set("Authorization", `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(2);
            expect(res.body.meta.pagination.page).toBe(1);
            expect(res.body.meta.pagination.limit).toBe(2);
        });
    });

    describe("GET /api/v1/data-sources/:id", () => {
        it("devrait récupérer une source par ID", async () => {
            const createRes = await request(app)
                .post("/api/v1/data-sources")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    name: "Test Source",
                    type: "json",
                    endpoint: "https://api.example.com",
                });

            const sourceId = createRes.body.data._id;

            const res = await request(app)
                .get(`/api/v1/data-sources/${sourceId}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data._id).toBe(sourceId);
            expect(res.body.data.name).toBe("Test Source");
            expect(res.body.data.isUsed).toBeDefined();
        });

        it("devrait retourner 404 pour un ID inexistant", async () => {
            const fakeId = "507f1f77bcf86cd799439011";

            const res = await request(app)
                .get(`/api/v1/data-sources/${fakeId}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it("devrait retourner 400 pour un ID invalide", async () => {
            const res = await request(app)
                .get("/api/v1/data-sources/invalid-id")
                .set("Authorization", `Bearer ${authToken}`);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe("PATCH /api/v1/data-sources/:id", () => {
        it("devrait mettre à jour le nom d'une source", async () => {
            const createRes = await request(app)
                .post("/api/v1/data-sources")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    name: "Original Name",
                    type: "json",
                    endpoint: "https://api.example.com",
                });

            const sourceId = createRes.body.data._id;

            const res = await request(app)
                .patch(`/api/v1/data-sources/${sourceId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({ name: "Updated Name" });

            expect(res.status).toBe(200);
            expect(res.body.data.name).toBe("Updated Name");
        });

        it("devrait mettre à jour la visibilité", async () => {
            const createRes = await request(app)
                .post("/api/v1/data-sources")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    name: "Source",
                    type: "json",
                    endpoint: "https://api.example.com",
                    visibility: "private",
                });

            const sourceId = createRes.body.data._id;

            const res = await request(app)
                .patch(`/api/v1/data-sources/${sourceId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({ visibility: "public" });

            expect(res.status).toBe(200);
            expect(res.body.data.visibility).toBe("public");
        });

        it("devrait échouer avec validation error", async () => {
            const createRes = await request(app)
                .post("/api/v1/data-sources")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    name: "Source",
                    type: "json",
                    endpoint: "https://api.example.com",
                });

            const sourceId = createRes.body.data._id;

            const res = await request(app)
                .patch(`/api/v1/data-sources/${sourceId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({ name: "A" });

            expect(res.status).toBe(400);
        });
    });

    describe("DELETE /api/v1/data-sources/:id", () => {
        it("devrait supprimer une source non utilisée", async () => {
            const createRes = await request(app)
                .post("/api/v1/data-sources")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    name: "To Delete",
                    type: "json",
                    endpoint: "https://api.example.com",
                });

            const sourceId = createRes.body.data._id;

            const res = await request(app)
                .delete(`/api/v1/data-sources/${sourceId}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            const getRes = await request(app)
                .get(`/api/v1/data-sources/${sourceId}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(getRes.status).toBe(404);
        });

        it("devrait échouer si la source est utilisée par un widget", async () => {
            const createRes = await request(app)
                .post("/api/v1/data-sources")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    name: "Used Source",
                    type: "json",
                    endpoint: "https://api.example.com",
                });

            const sourceId = createRes.body.data._id;

            await Widget.create({
                widgetId: "widget_test",
                title: "Test Widget",
                name: "Test Widget",
                type: "bar",
                userId: testUserId,
                ownerId: testUserId,
                dataSourceId: sourceId,
                config: {},
            });

            const res = await request(app)
                .delete(`/api/v1/data-sources/${sourceId}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(res.status).toBe(400);
            expect(res.body.error.message).toContain("utilisée");
        });

        it("devrait retourner 404 pour un ID inexistant", async () => {
            const fakeId = "507f1f77bcf86cd799439011";

            const res = await request(app)
                .delete(`/api/v1/data-sources/${fakeId}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(res.status).toBe(404);
        });
    });
});
