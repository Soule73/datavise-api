import { Router } from "express";
import { requirePermission } from "../middleware/requirePermission";
import { requireAuth } from "../middleware/auth";
import dataSourceController from "../controllers/dataSourceController";
import uploadFileService from "../services/upload_file_service";

const router = Router();

/**
 * Endpoint pour créer une nouvelle source.
 * Ce point d'entrée accepte un fichier via multipart/form-data.
 * Le fichier doit être envoyé avec le champ "file".
 * L'utilisateur doit être authentifié et avoir
 *
 * la permission "datasource:canCreate".
 *
 * ROUTE POST /sources
 *
 */
router.post(
  "/",
  requireAuth,
  requirePermission("datasource:canCreate"),
  uploadFileService,
  dataSourceController.create
);

/** * Endpoint pour lister toutes les sources de données.
 * L'utilisateur doit être authentifié et avoir
 *
 * la permission "datasource:canView".
 *
 * ROUTE GET /sources
 *
 */
router.get(
  "/",
  requireAuth,
  requirePermission("datasource:canView"),
  dataSourceController.list
);

/**
 * Endpoint pour récupérer une source par ID.
 * L'utilisateur doit être authentifié et avoir
 *
 * la permission "datasource:canView".
 *
 * @param {id} req - La requête HTTP contenant l'ID de la source.
 *
 * ROUTE GET sources/:id
 *
 */
router.get(
  "/:id",
  requireAuth,
  requirePermission("datasource:canView"),
  dataSourceController.getById
);

/**
 * Endpoint pour mettre à jour une source.
 * L'utilisateur doit être authentifié et avoir
 *
 * la permission "datasource:canUpdate".
 *
 * @param {id} req - La requête HTTP contenant l'ID de la source à mettre à jour.
 *
 * ROUTE PUT sources/:id
 */
router.put(
  "/:id",
  requireAuth,
  requirePermission("datasource:canUpdate"),
  dataSourceController.update
);

/**
 * Endpoint pour supprimer une source.
 * L'utilisateur doit être authentifié et avoir
 *
 * la permission "datasource:canDelete".
 *
 * @param {id} req - La requête HTTP contenant l'ID de la source à supprimer.
 *
 * ROUTE DELETE sources/:id
 *
 */


router.delete(
  "/:id",
  requireAuth,
  requirePermission("datasource:canDelete"),
  dataSourceController.remove
);

/**
 * Endpoint pour détecter dynamiquement les colonnes d'une source.
 * L'utilisateur doit être authentifié et avoir
 *
 * la permission "datasource:canView".
 *
 * Ce point d'entrée accepte un fichier via multipart/form-data.
 * Le fichier doit être envoyé avec le champ "file".
 *
 * @route POST /sources/detect-columns
 *
 */
router.post(
  "/detect-columns",
  requireAuth,
  requirePermission("datasource:canView"),
  uploadFileService,
  dataSourceController.detectColumns
);


/**
 * Récupère les données d'une source.
 * L'utilisateur doit être authentifié et avoir
 * la permission "datasource:canView".
 * Ce point d'entrée accepte un paramètre `shareId` dans la requête.
 * Si `shareId` est présent, l'authentification n'est pas requise
 * et les données sont accessibles publiquement.
 *
 * @param {id} req - La requête HTTP contenant l'ID de la source
 *
 * ROUTE GET /sources/:id/data
 *
 */
router.get(
  "/:id/data",
  async (req, res, next) => {
    if (req.query.shareId) {
      return dataSourceController.fetchData(req, res, next);
    }
    next();
  },
  requireAuth,
  requirePermission("datasource:canView"),
  dataSourceController.fetchData
);


/**
 * Endpoint pour récupérer un fichier JSON de test.
 */
router.get("/demo/ventes", dataSourceController.demoVentes);

export default router;
