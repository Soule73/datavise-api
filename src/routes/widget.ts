import express from "express";
import { requirePermission } from "../middleware/requirePermission";
import { requireAuth } from "../middleware/auth";
import widgetController from "../controllers/widgetController";

const router = express.Router();

/**
 * Route pour lister tous les widgets.
 * L'utilisateur doit être authentifié et avoir
 *
 * la permission "widget:canView".
 *
 * ROUTE GET /widgets
 */
router.get(
  "/",
  requireAuth,
  requirePermission("widget:canView"),
  widgetController.list
);

/**
 * Route pour créer un widget.
 * L'utilisateur doit être authentifié et avoir
 *
 * la permission "widget:canCreate".
 *
 * ROUTE POST /widgets
 */
router.post(
  "/",
  requireAuth,
  requirePermission("widget:canCreate"),
  widgetController.create
);

/**
 * Route pour mettre à jour un widget.
 * L'utilisateur doit être authentifié et avoir
 *
 * la permission "widget:canUpdate".
 *
 * @param {string} id - L'ID du widget à mettre à jour.
 *
 * ROUTE PUT /widgets/:id
 */
router.put(
  "/:id",
  requireAuth,
  requirePermission("widget:canUpdate"),
  widgetController.update
);

/**
 * Route pour supprimer un widget.
 * L'utilisateur doit être authentifié et avoir
 *
 * la permission "widget:canDelete".
 *
 * @param {string} id - L'ID du widget à supprimer.
 *
 * ROUTE DELETE /widgets/:id
 *
 */
router.delete(
  "/:id",
  requireAuth,
  requirePermission("widget:canDelete"),
  widgetController.remove
);

/**
 * Route pour récupérer un widget par son ID.
 * L'utilisateur doit être authentifié et avoir
 *
 * la permission "widget:canView".
 *
 * @param {string} id - L'ID du widget à récupérer.
 *
 * ROUTE GET /widgets/:id
 */
router.get(
  "/:id",
  requireAuth,
  requirePermission("widget:canView"),
  widgetController.getById
);

/**
 * GET /widgets/conversation/:conversationId
 * Récupère tous les widgets d'une conversation (drafts inclus)
 */
router.get(
  "/conversation/:conversationId",
  requireAuth,
  requirePermission("widget:canView"),
  widgetController.getByConversation
);

/**
 * PATCH /widgets/:id/publish
 * Publie un widget draft (isDraft: false)
 */
router.patch(
  "/:id/publish",
  requireAuth,
  requirePermission("widget:canUpdate"),
  widgetController.publishWidget
);

export default router;
