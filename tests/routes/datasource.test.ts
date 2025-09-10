import request from 'supertest';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import datasourceRoutes from '../../src/routes/datasource';
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
app.use('/api/datasources', datasourceRoutes);

describe('DataSource Routes', () => {
    let testUser: any;
    let authToken: string;
    let testDataSource: any;

    afterEach(async () => {
        // Nettoyer les données de test
        if (testUser?.user?._id) {
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

        // Créer une datasource de test
        testDataSource = await DataSource.create({
            name: 'Test DataSource',
            type: 'csv',
            ownerId: testUser.user._id,
            visibility: 'private',
            config: {}
        });
    });

    describe('POST /api/datasources', () => {
        it('should create datasource with valid data and permissions', async () => {
            const datasourceData = {
                name: 'New DataSource',
                type: 'csv',
                visibility: 'private',
                config: {}
            };

            const response = await request(app)
                .post('/api/datasources')
                .set('Authorization', `Bearer ${authToken}`)
                .send(datasourceData);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('name', 'New DataSource');
            expect(response.body.data).toHaveProperty('_id');
        });

        it('should return 401 without authentication', async () => {
            const datasourceData = {
                name: 'Test DataSource',
                type: 'csv'
            };

            const response = await request(app)
                .post('/api/datasources')
                .send(datasourceData);

            expect(response.status).toBe(401);
        });

        it('should return 400 with invalid data', async () => {
            const datasourceData = {
                // missing name
                type: 'csv'
            };

            const response = await request(app)
                .post('/api/datasources')
                .set('Authorization', `Bearer ${authToken}`)
                .send(datasourceData);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Erreur de validation');
        });
    });

    describe('GET /api/datasources/:id', () => {
        it('should get datasource by id with valid permissions', async () => {
            const response = await request(app)
                .get(`/api/datasources/${testDataSource._id}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('name', 'Test DataSource');
            expect(response.body.data).toHaveProperty('_id', testDataSource._id.toString());
        });

        it('should return 401 without authentication', async () => {
            const response = await request(app)
                .get(`/api/datasources/${testDataSource._id}`);

            expect(response.status).toBe(401);
        });

        it('should return 404 for non-existent datasource', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const response = await request(app)
                .get(`/api/datasources/${fakeId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /api/datasources/:id', () => {
        it('should update datasource with valid data and permissions', async () => {
            const updateData = {
                name: 'Updated DataSource Name'
            };

            const response = await request(app)
                .put(`/api/datasources/${testDataSource._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveProperty('name', 'Updated DataSource Name');
        });

        it('should return 401 without authentication', async () => {
            const updateData = {
                name: 'Updated Name'
            };

            const response = await request(app)
                .put(`/api/datasources/${testDataSource._id}`)
                .send(updateData);

            expect(response.status).toBe(401);
        });

        it('should return 404 for non-existent datasource', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const updateData = {
                name: 'Updated Name'
            };

            const response = await request(app)
                .put(`/api/datasources/${fakeId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData);

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });
    });

    describe('DELETE /api/datasources/:id', () => {
        it('should delete datasource with valid permissions', async () => {
            const response = await request(app)
                .delete(`/api/datasources/${testDataSource._id}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);

            // Vérifier que la datasource a été supprimée
            const deletedDataSource = await DataSource.findById(testDataSource._id);
            expect(deletedDataSource).toBeNull();
        });

        it('should return 401 without authentication', async () => {
            const response = await request(app)
                .delete(`/api/datasources/${testDataSource._id}`);

            expect(response.status).toBe(401);
        });

        it('should return 404 for non-existent datasource', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const response = await request(app)
                .delete(`/api/datasources/${fakeId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/datasources', () => {
        it('should list user datasources with valid permissions', async () => {
            // Créer une datasource supplémentaire pour le test
            await DataSource.create({
                name: 'Another DataSource',
                type: 'json',
                ownerId: testUser.user._id,
                visibility: 'private',
                config: {}
            });

            const response = await request(app)
                .get('/api/datasources')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(2);
            expect(response.body.data[0]).toHaveProperty('name');
        });

        it('should return empty array when user has no datasources', async () => {
            // Supprimer la datasource de test
            await DataSource.deleteMany({ ownerId: testUser.user._id });

            const response = await request(app)
                .get('/api/datasources')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual([]);
        });

        it('should return 401 without authentication', async () => {
            const response = await request(app)
                .get('/api/datasources');

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/datasources/:id/data', () => {
        it('should get datasource data with valid permissions', async () => {
            const response = await request(app)
                .get(`/api/datasources/${testDataSource._id}/data`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        it('should return 401 without authentication', async () => {
            const response = await request(app)
                .get(`/api/datasources/${testDataSource._id}/data`);

            expect(response.status).toBe(401);
        });

        it('should return 404 for non-existent datasource', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const response = await request(app)
                .get(`/api/datasources/${fakeId}/data`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });
});
