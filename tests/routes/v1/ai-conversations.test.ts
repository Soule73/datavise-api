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

describe("POST /api/v1/ai/conversations - Création", () => {
    let token: string;
    let testUser: any;
    let dataSourceId: string;

    beforeEach(async () => {
        await initPermissionsAndRoles();

        testUser = await createTestUser({
            email: "convtest@test.com",
            password: "Password123!",
            roleName: "admin",
        });

        token = generateTestToken(testUser.user._id, "admin");

        const dataSource = await DataSource.create({
            name: "Source Conv",
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
            await AIConversation.deleteMany({ userId: testUser.user._id });
        }
    });

    it("devrait créer une conversation", async () => {
        const res = await request(app)
            .post("/api/v1/ai/conversations")
            .set("Authorization", `Bearer ${token}`)
            .send({
                dataSourceId,
                title: "Ma conversation",
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty("_id");
        expect(res.body.data.title).toBe("Ma conversation");
    });

    it("devrait créer avec initialPrompt", async () => {
        const res = await request(app)
            .post("/api/v1/ai/conversations")
            .set("Authorization", `Bearer ${token}`)
            .send({
                dataSourceId,
                title: "Conv avec prompt",
                initialPrompt: "Analyser les ventes",
            });

        expect(res.status).toBe(201);
        expect(res.body.data.messages).toHaveLength(1);
        expect(res.body.data.messages[0].content).toBe("Analyser les ventes");
    });

    it("devrait valider dataSourceId requis", async () => {
        const res = await request(app)
            .post("/api/v1/ai/conversations")
            .set("Authorization", `Bearer ${token}`)
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("devrait retourner 404 si source inexistante", async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();

        const res = await request(app)
            .post("/api/v1/ai/conversations")
            .set("Authorization", `Bearer ${token}`)
            .send({ dataSourceId: fakeId });

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });
});

describe("GET /api/v1/ai/conversations - Liste", () => {
    let token: string;
    let testUser: any;
    let dataSourceId: string;

    beforeEach(async () => {
        await initPermissionsAndRoles();

        testUser = await createTestUser({
            email: "listconv@test.com",
            password: "Password123!",
            roleName: "admin",
        });

        token = generateTestToken(testUser.user._id, "admin");

        const dataSource = await DataSource.create({
            name: "Source List",
            type: "csv",
            filePath: "/data.csv",
            ownerId: testUser.user._id,
            visibility: "private",
        });

        dataSourceId = (dataSource._id as mongoose.Types.ObjectId).toString();

        await AIConversation.create([
            { userId: testUser.user._id, dataSourceId, title: "Conv 1", messages: [] },
            { userId: testUser.user._id, dataSourceId, title: "Conv 2", messages: [] },
            { userId: testUser.user._id, dataSourceId, title: "Conv 3", messages: [] },
        ]);
    });

    afterEach(async () => {
        if (testUser?.user?._id) {
            await User.findByIdAndDelete(testUser.user._id);
            await DataSource.deleteMany({ ownerId: testUser.user._id });
            await AIConversation.deleteMany({ userId: testUser.user._id });
        }
    });

    it("devrait lister les conversations de l'utilisateur", async () => {
        const res = await request(app)
            .get("/api/v1/ai/conversations")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(3);
    });

    it("devrait paginer les résultats", async () => {
        const res = await request(app)
            .get("/api/v1/ai/conversations?page=1&limit=2")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(2);
        expect(res.body.meta.pagination.total).toBe(3);
    });

    it("devrait filtrer par dataSourceId", async () => {
        const otherSource = await DataSource.create({
            name: "Other Source",
            type: "json",
            endpoint: "http://test2.com/data.json",
            ownerId: testUser.user._id,
            visibility: "private",
        });

        await AIConversation.create({
            userId: testUser.user._id,
            dataSourceId: otherSource._id,
            title: "Conv Other",
            messages: [],
        });

        const res = await request(app)
            .get(`/api/v1/ai/conversations?dataSourceId=${dataSourceId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(3);
    });
});

describe("GET /api/v1/ai/conversations/:id - Détail", () => {
    let token: string;
    let testUser: any;
    let conversationId: string;

    beforeEach(async () => {
        await initPermissionsAndRoles();

        testUser = await createTestUser({
            email: "detailconv@test.com",
            password: "Password123!",
            roleName: "admin",
        });

        token = generateTestToken(testUser.user._id, "admin");

        const dataSource = await DataSource.create({
            name: "Source Detail",
            type: "json",
            endpoint: "http://test.com/detail.json",
            ownerId: testUser.user._id,
            visibility: "private",
        });

        const conversation = await AIConversation.create({
            userId: testUser.user._id,
            dataSourceId: dataSource._id,
            title: "Detail Conv",
            messages: [
                { role: "user", content: "Bonjour", timestamp: new Date() },
                { role: "assistant", content: "Salut", timestamp: new Date() },
            ],
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

    it("devrait récupérer une conversation", async () => {
        const res = await request(app)
            .get(`/api/v1/ai/conversations/${conversationId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.title).toBe("Detail Conv");
        expect(res.body.data.messages).toHaveLength(2);
    });

    it("devrait retourner 404 si conversation inexistante", async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();

        const res = await request(app)
            .get(`/api/v1/ai/conversations/${fakeId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });

    it("devrait valider le format de l'ID", async () => {
        const res = await request(app)
            .get("/api/v1/ai/conversations/invalid-id")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
});

describe("POST /api/v1/ai/conversations/:id/messages - Ajouter message", () => {
    let token: string;
    let testUser: any;
    let conversationId: string;

    beforeEach(async () => {
        await initPermissionsAndRoles();

        testUser = await createTestUser({
            email: "msgtest@test.com",
            password: "Password123!",
            roleName: "admin",
        });

        token = generateTestToken(testUser.user._id, "admin");

        const dataSource = await DataSource.create({
            name: "Source Msg",
            type: "csv",
            filePath: "/messages.csv",
            ownerId: testUser.user._id,
            visibility: "private",
        });

        const conversation = await AIConversation.create({
            userId: testUser.user._id,
            dataSourceId: dataSource._id,
            title: "Message Conv",
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

    it("devrait ajouter un message utilisateur", async () => {
        const res = await request(app)
            .post(`/api/v1/ai/conversations/${conversationId}/messages`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                role: "user",
                content: "Nouveau message",
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.messages).toHaveLength(1);
        expect(res.body.data.messages[0].content).toBe("Nouveau message");
    });

    it("devrait ajouter un message assistant", async () => {
        const res = await request(app)
            .post(`/api/v1/ai/conversations/${conversationId}/messages`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                role: "assistant",
                content: "Réponse AI",
                widgetsGenerated: 3,
            });

        expect(res.status).toBe(200);
        expect(res.body.data.messages[0].widgetsGenerated).toBe(3);
    });

    it("devrait valider role requis", async () => {
        const res = await request(app)
            .post(`/api/v1/ai/conversations/${conversationId}/messages`)
            .set("Authorization", `Bearer ${token}`)
            .send({ content: "Message sans role" });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("devrait valider role (user ou assistant)", async () => {
        const res = await request(app)
            .post(`/api/v1/ai/conversations/${conversationId}/messages`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                role: "invalid",
                content: "Message",
            });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
});

describe("PATCH /api/v1/ai/conversations/:id - Mise à jour", () => {
    let token: string;
    let testUser: any;
    let conversationId: string;

    beforeEach(async () => {
        await initPermissionsAndRoles();

        testUser = await createTestUser({
            email: "updateconv@test.com",
            password: "Password123!",
            roleName: "admin",
        });

        token = generateTestToken(testUser.user._id, "admin");

        const dataSource = await DataSource.create({
            name: "Source Update",
            type: "json",
            endpoint: "http://test.com/update.json",
            ownerId: testUser.user._id,
            visibility: "private",
        });

        const conversation = await AIConversation.create({
            userId: testUser.user._id,
            dataSourceId: dataSource._id,
            title: "Old Title",
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

    it("devrait mettre à jour le titre", async () => {
        const res = await request(app)
            .patch(`/api/v1/ai/conversations/${conversationId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "New Title" });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.title).toBe("New Title");
    });

    it("devrait valider titre requis", async () => {
        const res = await request(app)
            .patch(`/api/v1/ai/conversations/${conversationId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("devrait valider longueur minimale du titre", async () => {
        const res = await request(app)
            .patch(`/api/v1/ai/conversations/${conversationId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "AB" });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
});

describe("DELETE /api/v1/ai/conversations/:id - Suppression", () => {
    let token: string;
    let testUser: any;
    let conversationId: string;

    beforeEach(async () => {
        await initPermissionsAndRoles();

        testUser = await createTestUser({
            email: "deleteconv@test.com",
            password: "Password123!",
            roleName: "admin",
        });

        token = generateTestToken(testUser.user._id, "admin");

        const dataSource = await DataSource.create({
            name: "Source Delete",
            type: "csv",
            filePath: "/delete.csv",
            ownerId: testUser.user._id,
            visibility: "private",
        });

        const conversation = await AIConversation.create({
            userId: testUser.user._id,
            dataSourceId: dataSource._id,
            title: "To Delete",
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

    it("devrait supprimer une conversation", async () => {
        const res = await request(app)
            .delete(`/api/v1/ai/conversations/${conversationId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        const conversation = await AIConversation.findById(conversationId);
        expect(conversation).toBeNull();
    });

    it("devrait retourner 404 si conversation inexistante", async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();

        const res = await request(app)
            .delete(`/api/v1/ai/conversations/${fakeId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });
});
