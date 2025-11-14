/**
 * Routes pour les data sources v1
 */

import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requirePermission } from "../../middleware/requirePermission";
import { validateBody, validateParams, validateQuery } from "../middlewares/validate.middleware";
import { paginate } from "../middlewares/paginate.middleware";
import uploadFileService from "../../services/upload_file_service";
import {
    createDataSourceSchema,
    updateDataSourceSchema,
    listDataSourcesQuerySchema,
    fetchDataQuerySchema,
    detectColumnsSchema,
    idParamSchema,
} from "../validators/data-source.schema";
import {
    createDataSource,
    listDataSources,
    getDataSource,
    updateDataSource,
    deleteDataSource,
    detectColumns,
    fetchData,
} from "../controllers/data-sources.controller";

const router = Router();

/**
 * @swagger
 * /api/v1/data-sources:
 *   post:
 *     summary: Créer une nouvelle source de données
 *     tags: [Data Sources]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: "Ventes 2025"
 *               type:
 *                 type: string
 *                 enum: [json, csv, elasticsearch]
 *                 example: "csv"
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Fichier CSV (requis si type=csv)
 *               endpoint:
 *                 type: string
 *                 format: uri
 *                 example: "https://api.example.com/data"
 *               visibility:
 *                 type: string
 *                 enum: [public, private]
 *                 default: private
 *               timestampField:
 *                 type: string
 *                 example: "date"
 *               httpMethod:
 *                 type: string
 *                 enum: [GET, POST]
 *                 default: GET
 *               authType:
 *                 type: string
 *                 enum: [none, bearer, apiKey, basic]
 *                 default: none
 *               esIndex:
 *                 type: string
 *                 example: "sales-*"
 *     responses:
 *       201:
 *         description: Source créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 */
router.post(
    "/",
    requireAuth,
    requirePermission("datasource:canCreate"),
    uploadFileService,
    validateBody(createDataSourceSchema),
    createDataSource
);

/**
 * @swagger
 * /api/v1/data-sources:
 *   get:
 *     summary: Lister les sources de données avec pagination
 *     tags: [Data Sources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [json, csv, elasticsearch]
 *         description: Filtrer par type
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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Liste paginée des sources
 *       401:
 *         description: Non authentifié
 */
router.get(
    "/",
    requireAuth,
    requirePermission("datasource:canView"),
    validateQuery(listDataSourcesQuerySchema),
    paginate(10, 100),
    listDataSources
);

/**
 * @swagger
 * /api/v1/data-sources/detect-columns:
 *   post:
 *     summary: Détecter les colonnes d'une source de données
 *     tags: [Data Sources]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [json, csv, elasticsearch]
 *               file:
 *                 type: string
 *                 format: binary
 *               endpoint:
 *                 type: string
 *                 format: uri
 *               sourceId:
 *                 type: string
 *                 description: ID d'une source existante
 *     responses:
 *       200:
 *         description: Colonnes détectées
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     columns:
 *                       type: array
 *                       items:
 *                         type: string
 *                     preview:
 *                       type: array
 *                       items:
 *                         type: object
 *                     types:
 *                       type: object
 *       400:
 *         description: Configuration invalide
 */
router.post(
    "/detect-columns",
    requireAuth,
    requirePermission("datasource:canView"),
    uploadFileService,
    validateBody(detectColumnsSchema),
    detectColumns
);

/**
 * @swagger
 * /api/v1/data-sources/{id}:
 *   get:
 *     summary: Récupérer une source par ID
 *     tags: [Data Sources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Source trouvée
 *       404:
 *         description: Source non trouvée
 */
router.get(
    "/:id",
    requireAuth,
    requirePermission("datasource:canView"),
    validateParams(idParamSchema),
    getDataSource
);

/**
 * @swagger
 * /api/v1/data-sources/{id}:
 *   patch:
 *     summary: Mettre à jour une source
 *     tags: [Data Sources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               visibility:
 *                 type: string
 *                 enum: [public, private]
 *     responses:
 *       200:
 *         description: Source mise à jour
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Source non trouvée
 */
router.patch(
    "/:id",
    requireAuth,
    requirePermission("datasource:canUpdate"),
    validateParams(idParamSchema),
    validateBody(updateDataSourceSchema),
    updateDataSource
);

/**
 * @swagger
 * /api/v1/data-sources/{id}:
 *   delete:
 *     summary: Supprimer une source
 *     tags: [Data Sources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Source supprimée
 *       400:
 *         description: Source utilisée par des widgets
 *       404:
 *         description: Source non trouvée
 */
router.delete(
    "/:id",
    requireAuth,
    requirePermission("datasource:canDelete"),
    validateParams(idParamSchema),
    deleteDataSource
);

/**
 * @swagger
 * /api/v1/data-sources/{id}/data:
 *   get:
 *     summary: Récupérer les données d'une source
 *     tags: [Data Sources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: shareId
 *         schema:
 *           type: string
 *         description: ID de partage (accès public)
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 100
 *       - in: query
 *         name: fields
 *         schema:
 *           type: string
 *         description: Champs séparés par virgule
 *       - in: query
 *         name: forceRefresh
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Données récupérées
 *       404:
 *         description: Source non trouvée
 */
router.get(
    "/:id/data",
    async (req, res, next) => {
        if (req.query.shareId) {
            return fetchData(req as any, res);
        }
        next();
    },
    requireAuth,
    requirePermission("datasource:canView"),
    validateParams(idParamSchema),
    validateQuery(fetchDataQuerySchema),
    fetchData
);

export default router;
