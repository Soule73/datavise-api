import request from 'supertest';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import widgetRoutes from '../../src/routes/widget';
import Widget from '../../src/models/Widget';
import Dashboard from '../../src/models/Dashboard';
import DataSource from '../../src/models/DataSource';
import User from '../../src/models/User';
import { createTestUser, generateTestToken } from '../helpers/testHelpers';
import { initPermissionsAndRoles } from '../../src/data/initPermissions';

// Charger les variables d'environnement de test
dotenv.config({ path: '.env.test' });

// Créer une application Express pour les tests
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/widgets', widgetRoutes);

describe('Widget Routes', () => {
    let testUser: any;
    let authToken: string;
    let testWidget: any;
    let testDashboard: any;
    let testDataSource: any;

    afterEach(async () => {
        // Nettoyer les données de test
        if (testUser?.user?._id) {
            await Widget.deleteMany({ ownerId: testUser.user._id });
            await Dashboard.deleteMany({ userId: testUser.user._id });
            await DataSource.deleteMany({ ownerId: testUser.user._id });
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

        // Créer une datasource de test
        testDataSource = await DataSource.create({
            name: 'Test DataSource',
            type: 'csv',
            ownerId: testUser.user._id,
            visibility: 'private',
            config: {}
        });

        // Créer un widget de test
        testWidget = await Widget.create({
            widgetId: 'test-widget-id',
            title: 'Test Widget',
            type: 'chart',
            dataSourceId: testDataSource._id,
            ownerId: testUser.user._id,
            visibility: 'private',
            config: {
                chartType: 'bar',
                xAxis: 'date',
                yAxis: 'value'
            }
        });
    });

    describe('POST /api/widgets', () => {
        it('should create widget with valid data and permissions', async () => {
            const widgetData = {
                widgetId: 'new-widget-id',
                title: 'New Widget',
                type: 'chart',
                dataSourceId: testDataSource._id,
                visibility: 'private',
                config: {
                    chartType: 'line',
                    xAxis: 'time',
                    yAxis: 'count'
                }
            };

            const response = await request(app)
                .post('/api/widgets')
                .set('Authorization', `Bearer ${authToken}`)
                .send(widgetData);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('title', 'New Widget');
            expect(response.body.data).toHaveProperty('_id');
        });

        it('should return 401 without authentication', async () => {
            const widgetData = {
                title: 'Test Widget',
                type: 'chart'
            };

            const response = await request(app)
                .post('/api/widgets')
                .send(widgetData);

            expect(response.status).toBe(401);
        });

        it('should return 400 with invalid data', async () => {
            const widgetData = {
                // missing title
                type: 'chart'
            };

            const response = await request(app)
                .post('/api/widgets')
                .set('Authorization', `Bearer ${authToken}`)
                .send(widgetData);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Champs requis manquants.');
        });
    });

    describe('GET /api/widgets/:id', () => {
        it('should get widget by id with valid permissions', async () => {
            const response = await request(app)
                .get(`/api/widgets/${testWidget._id}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('title', 'Test Widget');
            expect(response.body.data).toHaveProperty('_id', testWidget._id.toString());
        });

        it('should return 401 without authentication', async () => {
            const response = await request(app)
                .get(`/api/widgets/${testWidget._id}`);

            expect(response.status).toBe(401);
        });

        it('should return 404 for non-existent widget', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const response = await request(app)
                .get(`/api/widgets/${fakeId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /api/widgets/:id', () => {
        it('should update widget with valid data and permissions', async () => {
            const updateData = {
                title: 'Updated Widget Title',
                config: {
                    chartType: 'pie',
                    xAxis: 'category',
                    yAxis: 'amount'
                }
            };

            const response = await request(app)
                .put(`/api/widgets/${testWidget._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('title', 'Updated Widget Title');
        });

        it('should return 401 without authentication', async () => {
            const updateData = {
                title: 'Updated Title'
            };

            const response = await request(app)
                .put(`/api/widgets/${testWidget._id}`)
                .send(updateData);

            expect(response.status).toBe(401);
        });

        it('should return 404 for non-existent widget', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const updateData = {
                title: 'Updated Title'
            };

            const response = await request(app)
                .put(`/api/widgets/${fakeId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });

    describe('DELETE /api/widgets/:id', () => {
        it('should delete widget with valid permissions', async () => {
            const response = await request(app)
                .delete(`/api/widgets/${testWidget._id}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);

            // Vérifier que le widget a été supprimé
            const deletedWidget = await Widget.findById(testWidget._id);
            expect(deletedWidget).toBeNull();
        });

        it('should return 401 without authentication', async () => {
            const response = await request(app)
                .delete(`/api/widgets/${testWidget._id}`);

            expect(response.status).toBe(401);
        });

        it('should return 404 for non-existent widget', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const response = await request(app)
                .delete(`/api/widgets/${fakeId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/widgets', () => {
        it('should list user widgets with valid permissions', async () => {
            // Créer un widget supplémentaire pour le test
            await Widget.create({
                widgetId: 'another-widget-id',
                title: 'Another Widget',
                type: 'table',
                dataSourceId: testDataSource._id,
                ownerId: testUser.user._id,
                visibility: 'private',
                config: {}
            });

            const response = await request(app)
                .get('/api/widgets')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(2);
            expect(response.body.data[0]).toHaveProperty('title');
        });

        it('should return empty array when user has no widgets', async () => {
            // Supprimer les widgets de test
            await Widget.deleteMany({ ownerId: testUser.user._id });

            const response = await request(app)
                .get('/api/widgets')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual([]);
        });

        it('should return 401 without authentication', async () => {
            const response = await request(app)
                .get('/api/widgets');

            expect(response.status).toBe(401);
        });
    });


});
