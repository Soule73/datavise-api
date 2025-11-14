import { Router } from "express";
import { requireAuth } from "../../../middleware/auth";
import { requirePermission } from "../../../middleware/requirePermission";
import { validateBody, validateParams } from "../../middlewares/validate.middleware";
import {
    generateWidgetsSchema,
    refineWidgetsSchema,
    refineWidgetsDbSchema,
    analyzeSourceSchema,
    idParamSchema,
} from "../../validators/ai-generation.schema";
import * as generationsController from "../../controllers/ai-generations.controller";

const router = Router();

/**
 * @openapi
 * /api/v1/ai/generations:
 *   post:
 *     summary: Générer des widgets via IA
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [dataSourceId, conversationId]
 *             properties:
 *               dataSourceId:
 *                 type: string
 *                 description: ID de la source de données
 *               conversationId:
 *                 type: string
 *                 description: ID de la conversation
 *               userPrompt:
 *                 type: string
 *                 description: Instructions pour la génération
 *               maxWidgets:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 default: 5
 *               preferredTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [kpi, bar, line, pie, table, radar, bubble, scatter]
 *     responses:
 *       200:
 *         description: Widgets générés avec succès
 *       400:
 *         description: Paramètres invalides
 *       500:
 *         description: Erreur serveur (clé OpenAI manquante ou erreur IA)
 */
router.post(
    "/",
    requireAuth,
    requirePermission("widget:canCreate"),
    validateBody(generateWidgetsSchema),
    generationsController.generateWidgets
);

export default router;
