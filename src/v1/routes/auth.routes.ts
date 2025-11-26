import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requirePermission } from "../../middleware/requirePermission";
import { validateBody, validateParams, validateQuery } from "../middlewares/validate.middleware";
import {
    registerSchema,
    loginSchema,
    createUserSchema,
    updateUserSchema,
    createRoleSchema,
    updateRoleSchema,
    listUsersQuerySchema,
    listRolesQuerySchema,
    idParamSchema,
} from "../validators/auth.schema";
import * as authController from "../controllers/auth.controller";

const router = Router();

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: Doit contenir majuscule, minuscule et chiffre
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       422:
 *         description: Email déjà utilisé ou validation échouée
 */
router.post(
    "/register",
    validateBody(registerSchema),
    authController.register
);

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connexion réussie avec token JWT
 *       401:
 *         description: Identifiants invalides
 */
router.post(
    "/login",
    validateBody(loginSchema),
    authController.login
);

/**
 * @openapi
 * /api/v1/auth/profile:
 *   get:
 *     summary: Récupérer le profil de l'utilisateur authentifié
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur
 *       401:
 *         description: Non authentifié
 */
router.get(
    "/profile",
    requireAuth,
    authController.getProfile
);

/**
 * @openapi
 * /api/v1/auth/users:
 *   post:
 *     summary: Créer un nouvel utilisateur (admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password, roleId]
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               roleId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Utilisateur créé
 *       400:
 *         description: Validation échouée
 */
router.post(
    "/users",
    requireAuth,
    requirePermission("user:canCreate"),
    validateBody(createUserSchema),
    authController.createUser
);

/**
 * @openapi
 * /api/v1/auth/users:
 *   get:
 *     summary: Lister tous les utilisateurs
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
 *       - in: query
 *         name: roleId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Liste paginée des utilisateurs
 */
router.get(
    "/users",
    requireAuth,
    requirePermission("user:canView"),
    validateQuery(listUsersQuerySchema),
    authController.listUsers
);

/**
 * @openapi
 * /api/v1/auth/users/{id}:
 *   get:
 *     summary: Récupérer un utilisateur par ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *       404:
 *         description: Utilisateur introuvable
 */
router.get(
    "/users/:id",
    requireAuth,
    requirePermission("user:canView"),
    validateParams(idParamSchema),
    authController.getUserById
);

/**
 * @openapi
 * /api/v1/auth/users/{id}:
 *   put:
 *     summary: Mettre à jour un utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               roleId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour
 *       404:
 *         description: Utilisateur introuvable
 */
router.put(
    "/users/:id",
    requireAuth,
    requirePermission("user:canUpdate", true),
    validateParams(idParamSchema),
    validateBody(updateUserSchema),
    authController.updateUser
);

/**
 * @openapi
 * /api/v1/auth/users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Utilisateur supprimé
 *       404:
 *         description: Utilisateur introuvable
 */
router.delete(
    "/users/:id",
    requireAuth,
    requirePermission("user:canDelete"),
    validateParams(idParamSchema),
    authController.deleteUser
);

/**
 * @openapi
 * /api/v1/auth/roles:
 *   get:
 *     summary: Lister tous les rôles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
 *     responses:
 *       200:
 *         description: Liste paginée des rôles
 */
router.get(
    "/roles",
    requireAuth,
    requirePermission("role:canView"),
    validateQuery(listRolesQuerySchema),
    authController.listRoles
);

/**
 * @openapi
 * /api/v1/auth/roles:
 *   post:
 *     summary: Créer un nouveau rôle
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, permissions]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Rôle créé
 *       400:
 *         description: Validation échouée
 */
router.post(
    "/roles",
    requireAuth,
    requirePermission("role:canCreate"),
    validateBody(createRoleSchema),
    authController.createRole
);

/**
 * @openapi
 * /api/v1/auth/roles/{id}:
 *   put:
 *     summary: Mettre à jour un rôle
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Rôle mis à jour
 *       404:
 *         description: Rôle introuvable
 */
router.put(
    "/roles/:id",
    requireAuth,
    requirePermission("role:canUpdate"),
    validateParams(idParamSchema),
    validateBody(updateRoleSchema),
    authController.updateRole
);

/**
 * @openapi
 * /api/v1/auth/roles/{id}:
 *   delete:
 *     summary: Supprimer un rôle
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Rôle supprimé
 *       400:
 *         description: Rôle utilisé par des utilisateurs
 */
router.delete(
    "/roles/:id",
    requireAuth,
    requirePermission("role:canDelete"),
    validateParams(idParamSchema),
    authController.deleteRole
);

/**
 * @openapi
 * /api/v1/auth/permissions:
 *   get:
 *     summary: Lister toutes les permissions
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des permissions
 */
router.get(
    "/permissions",
    requireAuth,
    requirePermission("role:canView"),
    authController.listPermissions
);

export default router;
