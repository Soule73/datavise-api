import { Router } from "express";
import { requireAuth } from "../../../middleware/auth";
import { requirePermission } from "../../../middleware/requirePermission";
import { validateBody } from "../../middlewares/validate.middleware";
import { analyzeSourceSchema } from "../../validators/ai-generation.schema";
import * as generationsController from "../../controllers/ai-generations.controller";

const router = Router();

/**
 * @openapi
 * /api/v1/ai/analysis:
 *   post:
 *     summary: Analyser une source de données (colonnes, types, suggestions)
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [dataSourceId]
 *             properties:
 *               dataSourceId:
 *                 type: string
 *                 description: ID de la source à analyser
 *     responses:
 *       200:
 *         description: Analyse terminée
 *       400:
 *         description: Paramètres invalides
 *       500:
 *         description: Erreur lors de l'analyse
 */
router.post(
    "/",
    requireAuth,
    requirePermission("datasource:canView"),
    validateBody(analyzeSourceSchema),
    generationsController.analyzeSource
);

export default router;
