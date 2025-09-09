import express from "express";
import { requirePermission } from "../middleware/requirePermission";
import userController from "../controllers/userController";
import { requireAuth } from "../middleware/auth";

const router = express.Router();

/**
 * Route pour l'inscription d'un nouvel utilisateur.
 *
 * ROUTE POST /register
 */
router.post("/register", userController.register);

/**
 * Route pour la connexion d'un utilisateur.
 *
 * ROUTE POST /login
 *
 */
router.post("/login", userController.login);

/**
 * Route pour créer un nouvel utilisateur.
 *
 * permission requise : user:canCreate
 *
 * ROUTE POST /users
 */
router.post(
  "/users",
  requireAuth,
  requirePermission("user:canCreate"),
  userController.createUser
);

/*
 * Route pour mettre à jour un utilisateur.(admin ou l'utilisateur lui-même)
 *
 * permission requise : user:canUpdate
 * ROUTE PUT /users/:id
 */
router.put(
  "/users/:id",
  requireAuth,
  requirePermission("user:canUpdate", true),
  userController.updateUser
);

/**
 * Route pour supprimer un utilisateur.
 *
 * permision requise : user:canDelete
 * @param {string} id - L'ID de l'utilisateur à supprimer.
 *
 * ROUTE DELETE /users/:id
 */
router.delete(
  "/users/:id",
  requireAuth,
  requirePermission("user:canDelete"),
  userController.deleteUser
);

/**
 * Route pour lister tous les rôles.
 * permission requise : role:canView
 * ROUTE GET /roles
 */
router.get(
  "/roles",
  requireAuth,
  requirePermission("role:canView"),
  userController.listRoles
);

/**
 * Route pour créer un nouveau rôle.
 * permission requise : role:canCreate
 * ROUTE POST /roles
 */
router.post(
  "/roles",
  requireAuth,
  requirePermission("role:canCreate"),
  userController.createRole
);

/**
 * Route pour mettre à jour un rôle.
 * permission requise : role:canUpdate
 * @param {string} id - L'ID du rôle à mettre à jour.
 * ROUTE PUT /roles/:id
 */
router.put(
  "/roles/:id",
  requireAuth,
  requirePermission("role:canUpdate"),
  userController.updateRole
);

/**
 * Route pour supprimer un rôle.
 * permission requise : role:canDelete
 * Note: Le rôle ne peut être supprimé que s'il n'est pas utilisé par des utilisateurs.
 *
 * @param {string} id - L'ID du rôle à supprimer.
 *
 * ROUTE DELETE /roles/:id
 *
 */
router.delete(
  "/roles/:id",
  requireAuth,
  requirePermission("role:canDelete"),
  userController.deleteRole
);

/**
 * Route pour lister toutes les permissions.
 * permission requise : role:canView
 *
 * @route GET /permissions
 *
 */
router.get(
  "/permissions",
  requireAuth,
  requirePermission("role:canView"),
  userController.listPermissions
);

/**
 * Route pour lister tous les utilisateurs.
 *
 * permission requise : user:canView
 *
 * @route GET /users
 */
router.get(
  "/users",
  requireAuth,
  requirePermission("user:canView"),
  userController.listUsers
);

export default router;
