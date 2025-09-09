import express, { Express, Request, Response } from 'express';
import * as dotenv from 'dotenv';
import connectDB from './config/database';
// import userRoutes from './routes/userRoutes';
import { startServer } from './utils/banner';
import cors from 'cors';
import mongoose from 'mongoose';

import authRoutes from "./routes/auth";
import dataSourceRoutes from "./routes/datasource";
import widgetRoutes from "./routes/widget";
import dashboardRoutes from "./routes/dashboard";
import uploadsRoutes from "./routes/uploads";

// Load environment variables from .env file
dotenv.config();

const app: Express = express();
const port = Number(process.env.PORT) || 7000;

// Connect to MongoDB
connectDB();

// Middleware to parse JSON bodies
app.use(express.json());

// CORS configuration

app.use(cors());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "API Data-Vise opérationnelle" });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ message: 'Application Running, Mongo Status:' + mongoose.connection.readyState });
});

app.use("/api/auth", authRoutes);

app.use("/api/sources", dataSourceRoutes);

app.use("/api/widgets", widgetRoutes);

app.use("/api/dashboards", dashboardRoutes);

app.use("/api/uploads", uploadsRoutes);


console.log(process.env);
// Start server with banner
startServer(app, port);
