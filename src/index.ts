import express, { Express, Request, Response } from 'express';
import * as dotenv from 'dotenv';
import connectDB from './config/database';
// import userRoutes from './routes/userRoutes';
import { startServer } from './utils/banner';
import cors from 'cors';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';


import v1Routes from "./v1/routes/index";

// Load environment variables from .env file
dotenv.config();

const app: Express = express();
const port = Number(process.env.PORT) || 7000;

const allowedOrigins = process.env.CORS_ALLOW_ORIGINS
  ? process.env.CORS_ALLOW_ORIGINS.split(',').map(origin => origin.trim())
  : [process.env.CORS_ORIGIN || 'http://localhost:5173'];

// Connect to MongoDB
connectDB();

// Middleware to parse JSON bodies
app.use(express.json());

// CORS configuration

app.use(cors({
  origin: (origin, callback) => {
    // Permettre les requêtes sans origine (comme les applications mobiles ou les tests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Non autorisé par la politique CORS'));
    }
  },
  // Permettre les cookies et les headers d'authentification
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Routes
app.get("/", (req, res) => {
  res.json({ message: "API Data-Vise opérationnelle" });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ message: 'Application Running, Mongo Status:' + mongoose.connection.readyState });
});

// Route de test pour la configuration CORS
app.get('/cors-test', (req: Request, res: Response) => {
  res.json({
    message: 'Configuration CORS active',
    origin: req.get('Origin') || 'Aucune origine',
    allowedOrigins: allowedOrigins,
    timestamp: new Date().toISOString()
  });
});

// Documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "DataVise API Documentation",
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
  },
}));

// JSON de la spec OpenAPI
app.get('/api-docs.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use("/api/v1", v1Routes);

// Start server with banner
startServer(app, port);
