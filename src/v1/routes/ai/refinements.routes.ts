import { Router } from "express";
import { requireAuth } from "../../../middleware/auth";
import { requirePermission } from "../../../middleware/requirePermission";
import { validateBody } from "../../middlewares/validate.middleware";
import {
    refineWidgetsSchema,
    refineWidgetsDbSchema,
} from "../../validators/ai-generation.schema";
import * as generationsController from "../../controllers/ai-generations.controller";

const router = Router();

/**
 * @openapi
 * /api/v1/ai/refinements:
 *   post:
 *     summary: Raffiner des widgets existants (non sauvegardés)
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [dataSourceId, currentWidgets, refinementPrompt]
 *             properties:
 *               dataSourceId:
 *                 type: string
 *               currentWidgets:
 *                 type: array
 *                 items:
 *                   type: object
 *               refinementPrompt:
 *                 type: string
 *     responses:
 *       200:
 *         description: Widgets raffinés avec succès
 *       400:
 *         description: Paramètres invalides
 */
router.post(
    "/",
    requireAuth,
    requirePermission("widget:canCreate"),
    validateBody(refineWidgetsSchema),
    generationsController.refineWidgets
);

/**
 * @openapi
 * /api/v1/ai/refinements/database:
 *   post:
 *     summary: Raffiner des widgets sauvegardés en base
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [dataSourceId, widgetIds, refinementPrompt]
 *             properties:
 *               dataSourceId:
 *                 type: string
 *               widgetIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               refinementPrompt:
 *                 type: string
 *     responses:
 *       200:
 *         description: Widgets DB raffinés avec succès
 *       400:
 *         description: Paramètres invalides
 */
router.post(
    "/database",
    requireAuth,
    requirePermission("widget:canUpdate"),
    validateBody(refineWidgetsDbSchema),
    generationsController.refineWidgetsDb
);

export default router;
