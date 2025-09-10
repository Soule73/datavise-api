import request from 'supertest';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import uploadsRoutes from '../../src/routes/uploads';
import User from '../../src/models/User';
import { createTestUser, generateTestToken } from '../helpers/testHelpers';
import { initPermissionsAndRoles } from '../../src/data/initPermissions';
import { getUploadsDir } from '../../src/utils/uploadsPaths';

// Charger les variables d'environnement de test
dotenv.config({ path: '.env.test' });

// Créer une application Express pour les tests
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/uploads', uploadsRoutes);

describe('Uploads Routes', () => {
    let testUser: any;
    let authToken: string;
    let testFilePath: string;
    let testFileName: string;

    afterEach(async () => {
        // Nettoyer les données de test
        if (testUser?.user?._id) {
            await User.findByIdAndDelete(testUser.user._id);
        }

        // Nettoyer le fichier de test
        if (testFilePath && fs.existsSync(testFilePath)) {
            fs.unlinkSync(testFilePath);
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

        // Créer un fichier de test
        testFileName = 'test-file.csv';
        const uploadsDir = getUploadsDir();

        // Créer le répertoire uploads s'il n'existe pas
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        testFilePath = path.join(uploadsDir, testFileName);
        const testContent = 'column1,column2,column3\nvalue1,value2,value3\nvalue4,value5,value6';
        fs.writeFileSync(testFilePath, testContent, 'utf8');
    });

    describe('GET /api/uploads/:filename', () => {
        it('should download file with valid authentication', async () => {
            const response = await request(app)
                .get(`/api/uploads/${testFileName}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toMatch(/text\/csv/);
            expect(response.headers['content-disposition']).toContain(`filename="${testFileName}"`);
            expect(response.text).toContain('column1,column2,column3');
        });

        it('should return 401 without authentication', async () => {
            const response = await request(app)
                .get(`/api/uploads/${testFileName}`);

            expect(response.status).toBe(401);
        });

        it('should return 404 for non-existent file', async () => {
            const response = await request(app)
                .get('/api/uploads/non-existent-file.csv')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Fichier non trouvé.');
        });

        it('should handle text files with correct content-type', async () => {
            // Créer un fichier texte de test
            const txtFileName = 'test-file.txt';
            const txtFilePath = path.join(getUploadsDir(), txtFileName);
            fs.writeFileSync(txtFilePath, 'This is a test text file', 'utf8');

            const response = await request(app)
                .get(`/api/uploads/${txtFileName}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toMatch(/text\/plain/);
            expect(response.headers['content-disposition']).toContain(`filename="${txtFileName}"`);
            expect(response.text).toContain('This is a test text file');

            // Nettoyer le fichier texte
            if (fs.existsSync(txtFilePath)) {
                fs.unlinkSync(txtFilePath);
            }
        });

        it('should handle other file types with generic content-disposition', async () => {
            // Créer un fichier JSON de test
            const jsonFileName = 'test-file.json';
            const jsonFilePath = path.join(getUploadsDir(), jsonFileName);
            const jsonContent = JSON.stringify({ test: 'data', number: 123 });
            fs.writeFileSync(jsonFilePath, jsonContent, 'utf8');

            const response = await request(app)
                .get(`/api/uploads/${jsonFileName}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.headers['content-disposition']).toContain(`filename="${jsonFileName}"`);

            // Nettoyer le fichier JSON
            if (fs.existsSync(jsonFilePath)) {
                fs.unlinkSync(jsonFilePath);
            }
        });
    });
});
