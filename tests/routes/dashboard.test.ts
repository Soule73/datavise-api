import request from 'supertest';
import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import dashboardRoutes from '../../src/routes/dashboard';
import Dashboard from '../../src/models/Dashboard';
import User from '../../src/models/User';
import { createTestUser, generateTestToken } from '../helpers/testHelpers';
import { initPermissionsAndRoles } from '../../src/data/initPermissions';

// Charger les variables d'environnement de test
dotenv.config({ path: '.env.test' });

// Créer une application Express pour les tests
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/dashboards', dashboardRoutes);

describe('Dashboard Routes', () => {
    let testUser: any;
    let authToken: string;
    let testDashboard: any;

    afterEach(async () => {
        // Nettoyer les données de test
        if (testUser?.user?._id) {
            await Dashboard.deleteMany({ userId: testUser.user._id });
            await User.findByIdAndDelete(testUser.user._id);
        }
    });

    beforeEach(async () => {
        // Initialiser les permissions et rôles
        await initPermissionsAndRoles();

        // Créer l'utilisateur de test avec le rôle admin
        testUser = await createTestUser({
            username: 'testuser',
            email: 'test@example.com',
            roleName: 'admin'
        });

        // Générer le token d'authentification
        authToken = generateTestToken(testUser.user._id, 'admin');

        // Créer un dashboard de test
        testDashboard = await Dashboard.create({
            title: 'Test Dashboard',
            userId: testUser.user._id,
            ownerId: testUser.user._id,
            visibility: 'private',
            layout: []
        });
    });

    describe('POST /api/dashboards', () => {
        it('should create dashboard with valid data and permissions', async () => {
            const dashboardData = {
                title: 'New Dashboard',
                visibility: 'private'
            };

            const response = await request(app)
                .post('/api/dashboards')
                .set('Authorization', `Bearer ${authToken}`)
                .send(dashboardData);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('title', 'New Dashboard');
            expect(response.body.data).toHaveProperty('_id');
        });

        it('should return 401 without authentication', async () => {
            const dashboardData = {
                title: 'New Dashboard',
                visibility: 'private'
            };

            const response = await request(app)
                .post('/api/dashboards')
                .send(dashboardData);

            expect(response.status).toBe(401);
        });

        it.skip('should return 400 with invalid data', async () => {
            const dashboardData = {
                // missing title
                visibility: 'private'
            };

            const response = await request(app)
                .post('/api/dashboards')
                .set('Authorization', `Bearer ${authToken}`)
                .send(dashboardData);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/dashboards/:id', () => {
        it('should get dashboard by id with valid permissions', async () => {
            const response = await request(app)
                .get(`/api/dashboards/${testDashboard._id}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('title', 'Test Dashboard');
            expect(response.body.data).toHaveProperty('_id', testDashboard._id.toString());
        });

        it('should return 401 without authentication', async () => {
            const response = await request(app)
                .get(`/api/dashboards/${testDashboard._id}`);

            expect(response.status).toBe(401);
        });

        it('should return 404 for non-existent dashboard', async () => {
            const response = await request(app)
                .get('/api/dashboards/507f1f77bcf86cd799439011')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /api/dashboards/:id', () => {
        it('should update dashboard with valid data and permissions', async () => {
            const updateData = {
                title: 'Updated Dashboard Title'
            };

            const response = await request(app)
                .put(`/api/dashboards/${testDashboard._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('title', 'Updated Dashboard Title');
        });

        it('should return 401 without authentication', async () => {
            const updateData = {
                title: 'Updated Dashboard Title'
            };

            const response = await request(app)
                .put(`/api/dashboards/${testDashboard._id}`)
                .send(updateData);

            expect(response.status).toBe(401);
        });

        it('should return 404 for non-existent dashboard', async () => {
            const updateData = {
                title: 'Updated Dashboard Title'
            };

            const response = await request(app)
                .put('/api/dashboards/507f1f77bcf86cd799439011')
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });

    describe('DELETE /api/dashboards/:id', () => {
        it('should delete dashboard with valid permissions', async () => {
            const response = await request(app)
                .delete(`/api/dashboards/${testDashboard._id}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(204);

            // Verify dashboard is deleted
            const deletedDashboard = await Dashboard.findById(testDashboard._id);
            expect(deletedDashboard).toBeNull();
        });

        it('should return 401 without authentication', async () => {
            const response = await request(app)
                .delete(`/api/dashboards/${testDashboard._id}`);

            expect(response.status).toBe(401);
        });

        it('should return 404 for non-existent dashboard', async () => {
            const response = await request(app)
                .delete('/api/dashboards/507f1f77bcf86cd799439011')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/dashboards', () => {
        it('should list user dashboards with valid permissions', async () => {
            // Create additional dashboard
            await Dashboard.create({
                dashboardId: 'test-dashboard-2',
                title: 'Second Dashboard',
                widgets: [],
                userId: testUser.user._id,
                ownerId: testUser.user._id,
                visibility: 'private',
                layout: []
            });

            const response = await request(app)
                .get('/api/dashboards')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(2);
            expect(response.body.data[0]).toHaveProperty('title');
            expect(response.body.data[1]).toHaveProperty('title');
        });

        it('should return empty array when user has no dashboards', async () => {
            // Clear all dashboards
            await Dashboard.deleteMany({});

            const response = await request(app)
                .get('/api/dashboards')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual([]);
        });

        it('should return 401 without authentication', async () => {
            const response = await request(app)
                .get('/api/dashboards');

            expect(response.status).toBe(401);
        });
    });
});
