import request from 'supertest';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import authRoutes from '../../src/routes/auth';
import { createTestUser } from '../helpers/testHelpers';
import { initPermissionsAndRoles } from '../../src/data/initPermissions';
import User from '../../src/models/User';

// Charger les variables d'environnement de test
dotenv.config({ path: '.env.test' });

// Créer une application Express pour les tests
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
    afterEach(async () => {
        // Nettoyer les utilisateurs de test créés
        await User.deleteMany({
            email: {
                $in: [
                    'newuser@example.com',
                    'existing@example.com',
                    'login@example.com',
                    'profile@example.com'
                ]
            }
        });
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            // Initialiser les permissions et rôles d'abord
            await initPermissionsAndRoles();

            const userData = {
                username: 'newuser',
                email: 'newuser@example.com',
                password: 'password123',
                roleName: 'user'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.user.email).toBe(userData.email);
            expect(response.body.data.user.username).toBe(userData.username);
            expect(response.body.data.user.password).toBeUndefined();
            expect(response.body.data.token).toBeDefined();
        });

        it('should not register user with existing email', async () => {
            // Initialiser les permissions et rôles d'abord
            await initPermissionsAndRoles();

            // Créer d'abord un utilisateur
            await createTestUser({
                email: 'existing@example.com',
                roleName: 'user'
            });

            const userData = {
                username: 'anotheruser',
                email: 'existing@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(422);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('email est déjà utilisé');
        });

        it('should not register user with invalid email format', async () => {
            const userData = {
                username: 'testuser',
                email: 'invalid-email',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(422);

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/auth/login', () => {
        let testUser: any;

        beforeEach(async () => {
            // Initialiser les permissions et rôles d'abord
            await initPermissionsAndRoles();

            const result = await createTestUser({
                username: 'loginuser',
                email: 'login@example.com',
                password: 'password123',
                roleName: 'user'
            });
            testUser = result.user;
        });

        it('should login with valid credentials', async () => {
            const loginData = {
                email: 'login@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('Connexion réussie');
            expect(response.body.data.user.email).toBe(loginData.email);
            expect(response.body.data.user.password).toBeUndefined();
            expect(response.body.data.token).toBeDefined();
        });

        it('should not login with invalid email', async () => {
            const loginData = {
                email: 'nonexistent@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Identifiants invalides');
        });
    });

    describe('GET /api/auth/profile', () => {
        let testUser: any;
        let authToken: string;

        beforeEach(async () => {
            // Initialiser les permissions et rôles d'abord
            await initPermissionsAndRoles();

            const result = await createTestUser({
                username: 'profileuser',
                email: 'profile@example.com',
                password: 'password123',
                roleName: 'user'
            });
            testUser = result.user;

            // Se connecter pour obtenir un token
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'profile@example.com',
                    password: 'password123'
                });

            authToken = loginResponse.body.data.token;
        });

        it('should get user profile with valid token', async () => {
            const response = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.user.email).toBe('profile@example.com');
            expect(response.body.data.user.username).toBe('profileuser');
            expect(response.body.data.user.password).toBeUndefined();
        });
    });
});

