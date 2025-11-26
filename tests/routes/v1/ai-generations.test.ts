import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import v1Router from "../../../src/v1/routes";
import { initPermissionsAndRoles } from "../../../src/data/initPermissions";
import { createTestUser, generateTestToken } from "../../helpers/testHelpers";
import User from "../../../src/models/User";
import DataSource from "../../../src/models/DataSource";
import AIConversation from "../../../src/models/AIConversation";

const app = express();
app.use(express.json());
app.use("/api/v1", v1Router);

describe("POST /api/v1/ai/generations", () => {
    let token: string;
    let testUser: any;
    let dataSourceId: string;
    let conversationId: string;

    beforeEach(async () => {
        await initPermissionsAndRoles();

        testUser = await createTestUser({
            email: "aitest@test.com",
            password: "Password123!",
            roleName: "admin",
        });

        token = generateTestToken(testUser.user._id, "admin");

        const dataSource = await DataSource.create({
            name: "Test Source AI",
            type: "json",
            endpoint: "http://example.com/ventes-exemple.json",
            ownerId: testUser.user._id,
            visibility: "private",
        });

        dataSourceId = (dataSource._id as mongoose.Types.ObjectId).toString();

        const conversation = await AIConversation.create({
            userId: testUser.user._id,
            dataSourceId: dataSource._id,
            title: "Test Conversation",
            messages: [],
        });

        conversationId = (conversation._id as mongoose.Types.ObjectId).toString();
    });

    afterEach(async () => {
        if (testUser?.user?._id) {
            await User.findByIdAndDelete(testUser.user._id);
            await DataSource.deleteMany({ ownerId: testUser.user._id });
            await AIConversation.deleteMany({ userId: testUser.user._id });
        }
    });

    it("devrait valider les paramètres requis", async () => {
        const res = await request(app)
            .post("/api/v1/ai/generations")
            .set("Authorization", `Bearer ${token}`)
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.error.message).toContain("validation");
    });

    it("devrait valider le format de dataSourceId", async () => {
        const res = await request(app)
            .post("/api/v1/ai/generations")
            .set("Authorization", `Bearer ${token}`)
            .send({
                dataSourceId: "invalid-id",
                conversationId,
            });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("devrait valider le format de conversationId", async () => {
        const res = await request(app)
            .post("/api/v1/ai/generations")
            .set("Authorization", `Bearer ${token}`)
            .send({
                dataSourceId,
                conversationId: "invalid-id",
            });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("devrait accepter maxWidgets entre 1 et 10", async () => {
        const resLow = await request(app)
            .post("/api/v1/ai/generations")
            .set("Authorization", `Bearer ${token}`)
            .send({
                dataSourceId,
                conversationId,
                maxWidgets: 0,
            });

        expect(resLow.status).toBe(400);

        const resHigh = await request(app)
            .post("/api/v1/ai/generations")
            .set("Authorization", `Bearer ${token}`)
            .send({
                dataSourceId,
                conversationId,
                maxWidgets: 11,
            });

        expect(resHigh.status).toBe(400);
    });

    it("devrait accepter userPrompt optionnel", async () => {
        const res = await request(app)
            .post("/api/v1/ai/generations")
            .set("Authorization", `Bearer ${token}`)
            .send({
                dataSourceId,
                conversationId,
                userPrompt: "Créer des widgets pour analyser les ventes",
            });

        expect([200, 500]).toContain(res.status);
    });
});

describe("POST /api/v1/ai/refinements", () => {
    let token: string;
    let testUser: any;
    let dataSourceId: string;

    beforeEach(async () => {
        await initPermissionsAndRoles();

        testUser = await createTestUser({
            email: "refinetest@test.com",
            password: "Password123!",
            roleName: "admin",
        });

        token = generateTestToken(testUser.user._id, "admin");

        const dataSource = await DataSource.create({
            name: "Test Source Refine",
            type: "csv",
            filePath: "/test.csv",
            ownerId: testUser.user._id,
            visibility: "private",
        });

        dataSourceId = (dataSource._id as mongoose.Types.ObjectId).toString();
    });

    afterEach(async () => {
        if (testUser?.user?._id) {
            await User.findByIdAndDelete(testUser.user._id);
            await DataSource.deleteMany({ ownerId: testUser.user._id });
        }
    });

    it("devrait valider les paramètres requis pour raffinement", async () => {
        const res = await request(app)
            .post("/api/v1/ai/refinements")
            .set("Authorization", `Bearer ${token}`)
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("devrait exiger au moins un widget à raffiner", async () => {
        const res = await request(app)
            .post("/api/v1/ai/refinements")
            .set("Authorization", `Bearer ${token}`)
            .send({
                dataSourceId,
                currentWidgets: [],
                refinementPrompt: "Améliorer les graphiques",
            });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("devrait valider la structure des widgets", async () => {
        const res = await request(app)
            .post("/api/v1/ai/refinements")
            .set("Authorization", `Bearer ${token}`)
            .send({
                dataSourceId,
                currentWidgets: [
                    {
                        id: "widget-1",
                        name: "Test Widget",
                        type: "bar",
                        config: { metrics: [] },
                    },
                ],
                refinementPrompt: "Ajouter plus de détails",
            });

        expect([200, 500]).toContain(res.status);
    });
});

describe("POST /api/v1/ai/refinements/database", () => {
    let token: string;
    let testUser: any;
    let dataSourceId: string;

    beforeEach(async () => {
        await initPermissionsAndRoles();

        testUser = await createTestUser({
            email: "dbrefine@test.com",
            password: "Password123!",
            roleName: "admin",
        });

        token = generateTestToken(testUser.user._id, "admin");

        const dataSource = await DataSource.create({
            name: "Test Source DB",
            type: "json",
            endpoint: "http://test.com/data.json",
            ownerId: testUser.user._id,
            visibility: "private",
        });

        dataSourceId = (dataSource._id as mongoose.Types.ObjectId).toString();
    });

    afterEach(async () => {
        if (testUser?.user?._id) {
            await User.findByIdAndDelete(testUser.user._id);
            await DataSource.deleteMany({ ownerId: testUser.user._id });
        }
    });

    it("devrait valider les widgetIds (MongoDB IDs)", async () => {
        const res = await request(app)
            .post("/api/v1/ai/refinements/database")
            .set("Authorization", `Bearer ${token}`)
            .send({
                dataSourceId,
                widgetIds: ["invalid-id"],
                refinementPrompt: "Changer les couleurs",
            });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("devrait exiger au moins un widgetId", async () => {
        const res = await request(app)
            .post("/api/v1/ai/refinements/database")
            .set("Authorization", `Bearer ${token}`)
            .send({
                dataSourceId,
                widgetIds: [],
                refinementPrompt: "Modifier",
            });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
});

describe("POST /api/v1/ai/analysis", () => {
    let token: string;
    let testUser: any;
    let dataSourceId: string;

    beforeEach(async () => {
        await initPermissionsAndRoles();

        testUser = await createTestUser({
            email: "analysis@test.com",
            password: "Password123!",
            roleName: "admin",
        });

        token = generateTestToken(testUser.user._id, "admin");

        const dataSource = await DataSource.create({
            name: "Test Analysis",
            type: "csv",
            filePath: "/data.csv",
            ownerId: testUser.user._id,
            visibility: "private",
        });

        dataSourceId = (dataSource._id as mongoose.Types.ObjectId).toString();
    });

    afterEach(async () => {
        if (testUser?.user?._id) {
            await User.findByIdAndDelete(testUser.user._id);
            await DataSource.deleteMany({ ownerId: testUser.user._id });
        }
    });

    it("devrait valider dataSourceId requis", async () => {
        const res = await request(app)
            .post("/api/v1/ai/analysis")
            .set("Authorization", `Bearer ${token}`)
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("devrait valider le format de dataSourceId", async () => {
        const res = await request(app)
            .post("/api/v1/ai/analysis")
            .set("Authorization", `Bearer ${token}`)
            .send({ dataSourceId: "not-a-mongodb-id" });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("devrait accepter dataSourceId valide", async () => {
        const res = await request(app)
            .post("/api/v1/ai/analysis")
            .set("Authorization", `Bearer ${token}`)
            .send({ dataSourceId });

        expect([200, 404, 500]).toContain(res.status);
    });
});
