import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Charger les variables d'environnement pour les tests
dotenv.config({ path: '.env.test' });

let mongoServer: MongoMemoryServer;

// Setup global avant tous les tests
beforeAll(async () => {
    // Créer une instance MongoDB en mémoire
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connecter à la base de données de test
    await mongoose.connect(mongoUri);
}, 30000);

// Nettoyage après chaque test
afterEach(async () => {
    const collections = mongoose.connection.collections;

    // Nettoyer toutes les collections
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
});

// Nettoyage global après tous les tests
afterAll(async () => {
    // Fermer la connexion mongoose
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();

    // Arrêter le serveur MongoDB en mémoire
    if (mongoServer) {
        await mongoServer.stop();
    }
}, 30000);

// Configuration globale pour les tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key_for_testing';
process.env.JWT_EXPIRATION = '1h';
