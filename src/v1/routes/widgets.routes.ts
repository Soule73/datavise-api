/**
 * Routes RESTful pour les widgets (v1)
 */

import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requirePermission } from "../../middleware/requirePermission";
import { validateBody, validateParams, validateQuery } from "../middlewares/validate.middleware";
import { paginate } from "../middlewares/paginate.middleware";
import {
    createWidgetSchema,
    updateWidgetSchema,
    listWidgetsQuerySchema,
} from "../validators/widget.schema";
import { idParamSchema } from "../validators/common.schema";
import {
    createWidget,
    listWidgets,
    getWidget,
    updateWidget,
    deleteWidget,
} from "../controllers/widgets.controller";

const router = Router();

/**
 * @swagger
 * /api/v1/widgets:
 *   post:
 *     summary: Créer un nouveau widget
 *     tags: [Widgets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - widgetId
 *               - title
 *               - type
 *               - dataSourceId
 *             properties:
 *               widgetId:
 *                 type: string
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               type:
 *                 type: string
 *                 enum: [kpi, card, kpiGroup, bar, line, pie, table, radar, bubble, scatter]
 *               dataSourceId:
 *                 type: string
 *                 pattern: '^[0-9a-fA-F]{24}$'
 *               config:
 *                 type: object
 *               visibility:
 *                 type: string
 *                 enum: [public, private]
 *                 default: private
 *               isGeneratedByAI:
 *                 type: boolean
 *                 default: false
 *               isDraft:
 *                 type: boolean
 *                 default: false
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               reasoning:
 *                 type: string
 *                 maxLength: 1000
 *               confidence:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *     responses:
 *       201:
 *         description: Widget créé avec succès
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Permission refusée
 */
router.post(
    "/",
    requireAuth,
    requirePermission("widget:canCreate"),
    validateBody(createWidgetSchema),
    createWidget
);

/**
 * @swagger
 * /api/v1/widgets:
 *   get:
 *     summary: Lister les widgets avec pagination et filtres
 *     tags: [Widgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [kpi, card, kpiGroup, bar, line, pie, table, radar, bubble, scatter]
 *       - in: query
 *         name: visibility
 *         schema:
 *           type: string
 *           enum: [public, private]
 *       - in: query
 *         name: dataSourceId
 *         schema:
 *           type: string
 *       - in: query
 *         name: isDraft
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: isGeneratedByAI
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Liste paginée des widgets
 *       401:
 *         description: Non authentifié
 */
router.get(
    "/",
    requireAuth,
    requirePermission("widget:canView"),
    validateQuery(listWidgetsQuerySchema),
    paginate(10, 100),
    listWidgets
);

/**
 * @swagger
 * /api/v1/widgets/{id}:
 *   get:
 *     summary: Récupérer un widget par son ID
 *     tags: [Widgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     responses:
 *       200:
 *         description: Widget trouvé
 *       404:
 *         description: Widget non trouvé
 *       401:
 *         description: Non authentifié
 */
router.get(
    "/:id",
    requireAuth,
    requirePermission("widget:canView"),
    validateParams(idParamSchema),
    getWidget
);

/**
 * @swagger
 * /api/v1/widgets/{id}:
 *   patch:
 *     summary: Mettre à jour un widget
 *     tags: [Widgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               type:
 *                 type: string
 *                 enum: [kpi, card, kpiGroup, bar, line, pie, table, radar, bubble, scatter]
 *               dataSourceId:
 *                 type: string
 *                 pattern: '^[0-9a-fA-F]{24}$'
 *               config:
 *                 type: object
 *               visibility:
 *                 type: string
 *                 enum: [public, private]
 *               isDraft:
 *                 type: boolean
 *               description:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Widget mis à jour
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Widget non trouvé
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Permission refusée
 */
router.patch(
    "/:id",
    requireAuth,
    requirePermission("widget:canUpdate"),
    validateParams(idParamSchema),
    validateBody(updateWidgetSchema),
    updateWidget
);

/**
 * @swagger
 * /api/v1/widgets/{id}:
 *   delete:
 *     summary: Supprimer un widget
 *     tags: [Widgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     responses:
 *       200:
 *         description: Widget supprimé
 *       404:
 *         description: Widget non trouvé
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Permission refusée
 */
router.delete(
    "/:id",
    requireAuth,
    requirePermission("widget:canDelete"),
    validateParams(idParamSchema),
    deleteWidget
);

export default router;
