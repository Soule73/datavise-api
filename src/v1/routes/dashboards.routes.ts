/**
 * Routes pour les dashboards v1
 */

import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requirePermission } from "../../middleware/requirePermission";
import { validateBody, validateParams } from "../middlewares/validate.middleware";
import { paginate } from "../middlewares/paginate.middleware";
import {
    createDashboardSchema,
    updateDashboardSchema,
    updateSharingSchema,
    idParamSchema,
} from "../validators/dashboard.schema";
import {
    createDashboard,
    listDashboards,
    getDashboard,
    updateDashboard,
    deleteDashboard,
    updateSharing,
    getSharedDashboard,
    getSharedDashboardSources,
} from "../controllers/dashboards.controller";

const router = Router();

/**
 * @swagger
 * /api/v1/dashboards:
 *   post:
 *     summary: Créer un nouveau dashboard
 *     tags: [Dashboards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: "Dashboard des ventes Q1"
 *               layout:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     widgetId:
 *                       type: string
 *                       example: "widget_123"
 *                     width:
 *                       type: string
 *                       example: "6"
 *                     height:
 *                       type: number
 *                       example: 4
 *                     x:
 *                       type: number
 *                       example: 0
 *                     y:
 *                       type: number
 *                       example: 0
 *               visibility:
 *                 type: string
 *                 enum: [public, private]
 *                 default: private
 *               autoRefreshIntervalValue:
 *                 type: number
 *                 example: 30
 *               autoRefreshIntervalUnit:
 *                 type: string
 *                 enum: [second, minute, hour]
 *                 example: "second"
 *               timeRange:
 *                 type: object
 *                 properties:
 *                   from:
 *                     type: string
 *                     format: date-time
 *                   to:
 *                     type: string
 *                     format: date-time
 *                   intervalValue:
 *                     type: number
 *                   intervalUnit:
 *                     type: string
 *                     enum: [second, minute, hour, day, week, month, year]
 *     responses:
 *       201:
 *         description: Dashboard créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       401:
 *         description: Non authentifié
 */
router.post(
    "/",
    requireAuth,
    requirePermission("dashboard:canCreate"),
    validateBody(createDashboardSchema),
    createDashboard
);

/**
 * @swagger
 * /api/v1/dashboards:
 *   get:
 *     summary: Lister les dashboards avec pagination
 *     tags: [Dashboards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: visibility
 *         schema:
 *           type: string
 *           enum: [public, private]
 *         description: Filtrer par visibilité
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre de résultats par page
 *     responses:
 *       200:
 *         description: Liste paginée des dashboards
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                 links:
 *                   type: object
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Non authentifié
 */
router.get(
    "/",
    requireAuth,
    requirePermission("dashboard:canView"),
    paginate(10, 100),
    listDashboards
);

/**
 * @swagger
 * /api/v1/dashboards/{id}:
 *   get:
 *     summary: Récupérer un dashboard par son ID
 *     tags: [Dashboards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du dashboard
 *     responses:
 *       200:
 *         description: Dashboard trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 *       404:
 *         description: Dashboard non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       401:
 *         description: Non authentifié
 */
router.get(
    "/:id",
    requireAuth,
    requirePermission("dashboard:canView"),
    validateParams(idParamSchema),
    getDashboard
);

/**
 * @swagger
 * /api/v1/dashboards/{id}:
 *   patch:
 *     summary: Mettre à jour un dashboard (partial update)
 *     tags: [Dashboards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du dashboard
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
 *               layout:
 *                 type: array
 *               visibility:
 *                 type: string
 *                 enum: [public, private]
 *               autoRefreshIntervalValue:
 *                 type: number
 *               autoRefreshIntervalUnit:
 *                 type: string
 *                 enum: [second, minute, hour]
 *               timeRange:
 *                 type: object
 *     responses:
 *       200:
 *         description: Dashboard mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Dashboard non trouvé
 *       401:
 *         description: Non authentifié
 */
router.patch(
    "/:id",
    requireAuth,
    requirePermission("dashboard:canUpdate"),
    validateParams(idParamSchema),
    validateBody(updateDashboardSchema),
    updateDashboard
);

/**
 * @swagger
 * /api/v1/dashboards/{id}:
 *   delete:
 *     summary: Supprimer un dashboard
 *     tags: [Dashboards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du dashboard
 *     responses:
 *       200:
 *         description: Dashboard supprimé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 *       404:
 *         description: Dashboard non trouvé
 *       401:
 *         description: Non authentifié
 */
router.delete(
    "/:id",
    requireAuth,
    requirePermission("dashboard:canDelete"),
    validateParams(idParamSchema),
    deleteDashboard
);

/**
 * @swagger
 * /api/v1/dashboards/{id}/sharing:
 *   patch:
 *     summary: Activer ou désactiver le partage d'un dashboard
 *     tags: [Dashboards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du dashboard
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - enabled
 *             properties:
 *               enabled:
 *                 type: boolean
 *                 description: true pour activer le partage, false pour désactiver
 *                 example: true
 *     responses:
 *       200:
 *         description: Paramètres de partage mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Dashboard non trouvé
 *       401:
 *         description: Non authentifié
 */
router.patch(
    "/:id/sharing",
    requireAuth,
    requirePermission("dashboard:canUpdate"),
    validateParams(idParamSchema),
    validateBody(updateSharingSchema),
    updateSharing
);

/**
 * @swagger
 * /api/v1/dashboards/shared/{shareId}:
 *   get:
 *     summary: Récupérer un dashboard partagé (route publique)
 *     tags: [Dashboards]
 *     parameters:
 *       - in: path
 *         name: shareId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de partage du dashboard
 *     responses:
 *       200:
 *         description: Dashboard partagé trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 *       404:
 *         description: Dashboard partagé non trouvé
 */
router.get("/shared/:shareId", getSharedDashboard);

/**
 * @swagger
 * /api/v1/dashboards/shared/{shareId}/sources:
 *   get:
 *     summary: Récupérer les sources de données d'un dashboard partagé (route publique)
 *     tags: [Dashboards]
 *     parameters:
 *       - in: path
 *         name: shareId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de partage du dashboard
 *     responses:
 *       200:
 *         description: Sources du dashboard partagé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 *       404:
 *         description: Dashboard partagé non trouvé
 */
router.get("/shared/:shareId/sources", getSharedDashboardSources);

export default router;
