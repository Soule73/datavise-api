import express from "express";
import { requirePermission } from "../middleware/requirePermission";
import { requireAuth } from "../middleware/auth";
import dashboardController from "../controllers/dashboardController";

const router = express.Router();

/**
 * Endpoint pour créer un nouveau dashboard.
 * L'utilisateur doit être authentifié et avoir
 *
 * la permission "dashboard:canCreate".
 *
 * ROUTE POST /dashboards
 *
 */
router.post(
  "/",
  requireAuth,
  requirePermission("dashboard:canCreate"),
  dashboardController.createDashboard
);

/**
 * Endpoint pour récupérer un dashboard par son ID.
 * L'utilisateur doit être authentifié et avoir
 *
 * la permission "dashboard:canView".
 *
 * @param {id} req - La requête HTTP contenant l'ID du dashboard à récupérer.
 *
 * ROUTE GET dashboards/:id
 */
router.get(
  "/:id",
  requireAuth,
  requirePermission("dashboard:canView"),
  dashboardController.getDashboardById
);

/**
 * Endpoint pour mettre à jour un dashboard.
 * L'utilisateur doit être authentifié et avoir
 *
 * la permission "dashboard:canUpdate".
 *
 * @param {id} req - La requête HTTP contenant l'ID du dashboard à mettre à jour.
 *
 * ROUTE PUT dashboards/:id
 */
router.put(
  "/:id",
  requireAuth,
  requirePermission("dashboard:canUpdate"),
  dashboardController.updateDashboard
);

/**
 * Endpoint pour supprimer un dashboard.
 * L'utilisateur doit être authentifié et avoir
 *
 * la permission "dashboard:canDelete".
 *
 * @param {id} req - La requête HTTP contenant l'ID du dashboard à supprimer.
 *
 * ROUTE DELETE dashboards/:id
 *
 */
router.delete(
  "/:id",
  requireAuth,
  requirePermission("dashboard:canDelete"),
  dashboardController.deleteDashboard
);

/**
 * Endpoint pour lister les dashboards de l'utilisateur courant.
 * L'utilisateur doit être authentifié et avoir
 *
 * la permission "dashboard:canView".
 *
 * ROUTE GET /dashboards
 *
 */
router.get(
  "/",
  requireAuth,
  requirePermission("dashboard:canView"),
  dashboardController.listUserDashboards
);

/**
 * Endpoint pour activer le partage public d'un dashboard.
 * L'utilisateur doit être authentifié et avoir
 *
 * la permission "dashboard:canUpdate".
 *
 * @param {id} req - La requête HTTP contenant l'ID du dashboard.
 *
 * ROUTE POST /:id/share/enable
 *
 */
router.post(
  "/:id/share/enable",
  requireAuth,
  requirePermission("dashboard:canUpdate"),
  dashboardController.enableShare
);

/**
 * Endpoint pour désactiver le partage public d'un dashboard.
 * L'utilisateur doit être authentifié et avoir
 *
 * la permission "dashboard:canUpdate".
 *
 * @param {id} req - La requête HTTP contenant l'ID du dashboard.
 *
 * ROUTE POST dashboards/:id/share/disable
 *
 */
router.post(
  "/:id/share/disable",
  requireAuth,
  requirePermission("dashboard:canUpdate"),
  dashboardController.disableShare
);

/**
 * Endpoint pour récupérer un dashboard partagé par son shareId.
 *
 * @param {shareId} req - La requête HTTP contenant le shareId du dashboard partagé.
 *
 * Cette route est publique et ne nécessite pas d'authentification.
 *
 * ROUTE GET dashboards/share/:shareId
 *
 */
router.get("/share/:shareId", dashboardController.getSharedDashboard);

/**
 * Endpoint pour récupérer les sources d'un dashboard partagé par son shareId.
 *
 * Cette route est publique et ne nécessite pas d'authentification.
 *
 * @param {shareId} req - La requête HTTP contenant le shareId du dashboard partagé.
 *
 * ROUTE GET dashboards/share/:shareId/sources
 *
 */
router.get(
  "/share/:shareId/sources",
  dashboardController.getSharedDashboardSources
);

export default router;
