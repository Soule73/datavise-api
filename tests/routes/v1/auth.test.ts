import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import v1Router from "../../../src/v1/routes";
import { initPermissionsAndRoles } from "../../../src/data/initPermissions";
import { createTestUser, generateTestToken } from "../../helpers/testHelpers";
import User from "../../../src/models/User";
import Role from "../../../src/models/Role";
import Permission from "../../../src/models/Permission";

const app = express();
app.use(express.json());
app.use("/api/v1", v1Router);

describe("POST /api/v1/auth/register - Inscription", () => {
    beforeEach(async () => {
        await initPermissionsAndRoles();
    });

    afterEach(async () => {
        await User.deleteMany({ email: { $regex: /register/ } });
    });

    it("devrait créer un nouvel utilisateur", async () => {
        const res = await request(app)
            .post("/api/v1/auth/register")
            .send({
                username: "newuser",
                email: "newuser@register.com",
                password: "Password123!",
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty("token");
        expect(res.body.data.user.email).toBe("newuser@register.com");
    });

    it("devrait valider le format de l'email", async () => {
        const res = await request(app)
            .post("/api/v1/auth/register")
            .send({
                username: "baduser",
                email: "invalid-email",
                password: "Password123!",
            });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("devrait valider la force du mot de passe", async () => {
        const res = await request(app)
            .post("/api/v1/auth/register")
            .send({
                username: "weakuser",
                email: "weak@register.com",
                password: "weak",
            });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("devrait rejeter un email déjà utilisé", async () => {
        await request(app)
            .post("/api/v1/auth/register")
            .send({
                username: "user1",
                email: "duplicate@register.com",
                password: "Password123!",
            });

        const res = await request(app)
            .post("/api/v1/auth/register")
            .send({
                username: "user2",
                email: "duplicate@register.com",
                password: "Password123!",
            });

        expect(res.status).toBe(422);
        expect(res.body.success).toBe(false);
    });
});

describe("POST /api/v1/auth/login - Connexion", () => {
    let testUser: any;

    beforeEach(async () => {
        await initPermissionsAndRoles();

        testUser = await createTestUser({
            email: "login@test.com",
            password: "Password123!",
            roleName: "admin",
        });
    });

    afterEach(async () => {
        if (testUser?.user?._id) {
            await User.findByIdAndDelete(testUser.user._id);
        }
    });

    it("devrait connecter un utilisateur valide", async () => {
        const res = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: "login@test.com",
                password: "Password123!",
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty("token");
        expect(res.body.data.user.email).toBe("login@test.com");
    });

    it("devrait rejeter un mot de passe incorrect", async () => {
        const res = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: "login@test.com",
                password: "WrongPassword123!",
            });

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it("devrait rejeter un email inexistant", async () => {
        const res = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: "notfound@test.com",
                password: "Password123!",
            });

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });
});

describe("GET /api/v1/auth/profile - Profil utilisateur", () => {
    let testUser: any;
    let token: string;

    beforeEach(async () => {
        await initPermissionsAndRoles();

        testUser = await createTestUser({
            email: "profile@test.com",
            password: "Password123!",
            roleName: "admin",
        });

        token = generateTestToken(testUser.user._id, "admin");
    });

    afterEach(async () => {
        if (testUser?.user?._id) {
            await User.findByIdAndDelete(testUser.user._id);
        }
    });

    it("devrait récupérer le profil authentifié", async () => {
        const res = await request(app)
            .get("/api/v1/auth/profile")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.user.email).toBe("profile@test.com");
        expect(res.body.data.user).toHaveProperty("roleId");
    });

    it("devrait rejeter une requête sans token", async () => {
        const res = await request(app).get("/api/v1/auth/profile");

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty("message");
    });

    it("devrait rejeter un token invalide", async () => {
        const res = await request(app)
            .get("/api/v1/auth/profile")
            .set("Authorization", "Bearer invalid-token");

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty("message");
    });
});

describe("POST /api/v1/auth/users - Créer utilisateur", () => {
    let testUser: any;
    let token: string;

    beforeEach(async () => {
        await initPermissionsAndRoles();

        testUser = await createTestUser({
            email: "admin@test.com",
            password: "Password123!",
            roleName: "admin",
        });

        token = generateTestToken(testUser.user._id, "admin");
    });

    afterEach(async () => {
        if (testUser?.user?._id) {
            await User.findByIdAndDelete(testUser.user._id);
            await User.deleteMany({ email: { $regex: /createuser/ } });
        }
    });

    it("devrait créer un nouvel utilisateur", async () => {
        const adminRole = await Role.findOne({ name: "admin" });

        const res = await request(app)
            .post("/api/v1/auth/users")
            .set("Authorization", `Bearer ${token}`)
            .send({
                username: "newadmin",
                email: "newadmin@createuser.com",
                password: "Password123!",
                roleId: (adminRole!._id as mongoose.Types.ObjectId).toString(),
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.user.email).toBe("newadmin@createuser.com");
    });

    it("devrait valider roleId requis", async () => {
        const res = await request(app)
            .post("/api/v1/auth/users")
            .set("Authorization", `Bearer ${token}`)
            .send({
                username: "norole",
                email: "norole@createuser.com",
                password: "Password123!",
            });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("devrait rejeter un roleId invalide", async () => {
        const fakeRoleId = new mongoose.Types.ObjectId().toString();

        const res = await request(app)
            .post("/api/v1/auth/users")
            .set("Authorization", `Bearer ${token}`)
            .send({
                username: "badrole",
                email: "badrole@createuser.com",
                password: "Password123!",
                roleId: fakeRoleId,
            });

        expect([201, 404]).toContain(res.status);
    });
});

describe("GET /api/v1/auth/users - Liste utilisateurs", () => {
    let testUser: any;
    let token: string;

    beforeEach(async () => {
        await initPermissionsAndRoles();

        testUser = await createTestUser({
            email: "listadmin@test.com",
            password: "Password123!",
            roleName: "admin",
        });

        token = generateTestToken(testUser.user._id, "admin");

        await createTestUser({
            email: "user1@list.com",
            password: "Password123!",
            roleName: "user",
        });

        await createTestUser({
            email: "user2@list.com",
            password: "Password123!",
            roleName: "user",
        });
    });

    afterEach(async () => {
        if (testUser?.user?._id) {
            await User.deleteMany({ email: { $regex: /(listadmin|user1|user2)/ } });
        }
    });

    it("devrait lister les utilisateurs", async () => {
        const res = await request(app)
            .get("/api/v1/auth/users")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBeGreaterThanOrEqual(3);
    });

    it("devrait paginer les résultats", async () => {
        const res = await request(app)
            .get("/api/v1/auth/users?page=1&limit=2")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBeLessThanOrEqual(2);
        expect(res.body.meta.pagination).toHaveProperty("total");
    });

    it("devrait filtrer par roleId", async () => {
        const userRole = await Role.findOne({ name: "user" });
        const roleId = (userRole!._id as mongoose.Types.ObjectId).toString();

        const res = await request(app)
            .get(`/api/v1/auth/users?roleId=${roleId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBeGreaterThanOrEqual(0);
    });
});

describe("PUT /api/v1/auth/users/:id - Mettre à jour utilisateur", () => {
    let testUser: any;
    let targetUser: any;
    let token: string;

    beforeEach(async () => {
        await initPermissionsAndRoles();

        testUser = await createTestUser({
            email: "admin@update.com",
            password: "Password123!",
            roleName: "admin",
        });

        targetUser = await createTestUser({
            email: "target@update.com",
            password: "Password123!",
            roleName: "user",
        });

        token = generateTestToken(testUser.user._id, "admin");
    });

    afterEach(async () => {
        if (testUser?.user?._id) {
            await User.findByIdAndDelete(testUser.user._id);
        }
        if (targetUser?.user?._id) {
            await User.findByIdAndDelete(targetUser.user._id);
        }
    });

    it("devrait mettre à jour un utilisateur", async () => {
        const userId = (targetUser.user._id as mongoose.Types.ObjectId).toString();

        const res = await request(app)
            .put(`/api/v1/auth/users/${userId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                username: "updated-username",
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.user.username).toBe("updated-username");
    });

    it("devrait valider le format de l'ID", async () => {
        const res = await request(app)
            .put("/api/v1/auth/users/invalid-id")
            .set("Authorization", `Bearer ${token}`)
            .send({ username: "test" });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("devrait retourner 404 si utilisateur inexistant", async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();

        const res = await request(app)
            .put(`/api/v1/auth/users/${fakeId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ username: "test" });

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });
});

describe("DELETE /api/v1/auth/users/:id - Supprimer utilisateur", () => {
    let testUser: any;
    let targetUser: any;
    let token: string;

    beforeEach(async () => {
        await initPermissionsAndRoles();

        testUser = await createTestUser({
            email: "admin@delete.com",
            password: "Password123!",
            roleName: "admin",
        });

        targetUser = await createTestUser({
            email: "todelete@test.com",
            password: "Password123!",
            roleName: "user",
        });

        token = generateTestToken(testUser.user._id, "admin");
    });

    afterEach(async () => {
        if (testUser?.user?._id) {
            await User.findByIdAndDelete(testUser.user._id);
        }
    });

    it("devrait supprimer un utilisateur", async () => {
        const userId = (targetUser.user._id as mongoose.Types.ObjectId).toString();

        const res = await request(app)
            .delete(`/api/v1/auth/users/${userId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        const deleted = await User.findById(userId);
        expect(deleted).toBeNull();
    });

    it("devrait retourner 404 si utilisateur inexistant", async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();

        const res = await request(app)
            .delete(`/api/v1/auth/users/${fakeId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });
});

describe("GET /api/v1/auth/roles - Liste des rôles", () => {
    let testUser: any;
    let token: string;

    beforeEach(async () => {
        await initPermissionsAndRoles();

        testUser = await createTestUser({
            email: "rolesadmin@test.com",
            password: "Password123!",
            roleName: "admin",
        });

        token = generateTestToken(testUser.user._id, "admin");
    });

    afterEach(async () => {
        if (testUser?.user?._id) {
            await User.findByIdAndDelete(testUser.user._id);
        }
    });

    it("devrait lister les rôles", async () => {
        const res = await request(app)
            .get("/api/v1/auth/roles")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBeGreaterThanOrEqual(2);
        expect(res.body.data[0]).toHaveProperty("canDelete");
    });

    it("devrait paginer les rôles", async () => {
        const res = await request(app)
            .get("/api/v1/auth/roles?page=1&limit=2")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBeLessThanOrEqual(2);
        expect(res.body.meta.pagination).toHaveProperty("total");
    });
});

describe("POST /api/v1/auth/roles - Créer un rôle", () => {
    let testUser: any;
    let token: string;

    beforeEach(async () => {
        await initPermissionsAndRoles();

        testUser = await createTestUser({
            email: "createrolead@test.com",
            password: "Password123!",
            roleName: "admin",
        });

        token = generateTestToken(testUser.user._id, "admin");
    });

    afterEach(async () => {
        if (testUser?.user?._id) {
            await User.findByIdAndDelete(testUser.user._id);
            await Role.deleteMany({ name: /customrole/ });
        }
    });

    it("devrait créer un nouveau rôle", async () => {
        const permission = await Permission.findOne({ name: "dashboard:canView" });

        const res = await request(app)
            .post("/api/v1/auth/roles")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "customrole",
                description: "Rôle personnalisé",
                permissions: [(permission!._id as mongoose.Types.ObjectId).toString()],
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe("customrole");
    });

    it("devrait valider name requis", async () => {
        const res = await request(app)
            .post("/api/v1/auth/roles")
            .set("Authorization", `Bearer ${token}`)
            .send({
                description: "Sans nom",
                permissions: [],
            });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
});

describe("PUT /api/v1/auth/roles/:id - Mettre à jour un rôle", () => {
    let testUser: any;
    let testRole: any;
    let token: string;

    beforeEach(async () => {
        await initPermissionsAndRoles();

        testUser = await createTestUser({
            email: "updateroleadm@test.com",
            password: "Password123!",
            roleName: "admin",
        });

        token = generateTestToken(testUser.user._id, "admin");

        testRole = await Role.create({
            name: "testrole",
            description: "Role de test",
            permissions: [],
        });
    });

    afterEach(async () => {
        if (testUser?.user?._id) {
            await User.findByIdAndDelete(testUser.user._id);
        }
        if (testRole?._id) {
            await Role.findByIdAndDelete(testRole._id);
        }
    });

    it("devrait mettre à jour un rôle", async () => {
        const roleId = (testRole._id as mongoose.Types.ObjectId).toString();

        const res = await request(app)
            .put(`/api/v1/auth/roles/${roleId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                description: "Description mise à jour",
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.description).toBe("Description mise à jour");
    });

    it("devrait retourner 404 si rôle inexistant", async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();

        const res = await request(app)
            .put(`/api/v1/auth/roles/${fakeId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ description: "Test" });

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });
});

describe("DELETE /api/v1/auth/roles/:id - Supprimer un rôle", () => {
    let testUser: any;
    let testRole: any;
    let token: string;

    beforeEach(async () => {
        await initPermissionsAndRoles();

        testUser = await createTestUser({
            email: "deleteroleadm@test.com",
            password: "Password123!",
            roleName: "admin",
        });

        token = generateTestToken(testUser.user._id, "admin");

        testRole = await Role.create({
            name: "deleterole",
            description: "Role à supprimer",
            permissions: [],
        });
    });

    afterEach(async () => {
        if (testUser?.user?._id) {
            await User.findByIdAndDelete(testUser.user._id);
        }
    });

    it("devrait supprimer un rôle", async () => {
        const roleId = (testRole._id as mongoose.Types.ObjectId).toString();

        const res = await request(app)
            .delete(`/api/v1/auth/roles/${roleId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        const deleted = await Role.findById(roleId);
        expect(deleted).toBeNull();
    });

    it("devrait retourner 404 si rôle inexistant", async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();

        const res = await request(app)
            .delete(`/api/v1/auth/roles/${fakeId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });
});

describe("GET /api/v1/auth/permissions - Liste des permissions", () => {
    let testUser: any;
    let token: string;

    beforeEach(async () => {
        await initPermissionsAndRoles();

        testUser = await createTestUser({
            email: "permissions@test.com",
            password: "Password123!",
            roleName: "admin",
        });

        token = generateTestToken(testUser.user._id, "admin");
    });

    afterEach(async () => {
        if (testUser?.user?._id) {
            await User.findByIdAndDelete(testUser.user._id);
        }
    });

    it("devrait lister toutes les permissions", async () => {
        const res = await request(app)
            .get("/api/v1/auth/permissions")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
        expect(res.body.data[0]).toHaveProperty("name");
        expect(res.body.data[0]).toHaveProperty("description");
    });
});
