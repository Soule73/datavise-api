import { Request, Response } from "express";
import userService from "../services/userService";
import { handleServiceResult } from "../utils/api";

/**
 * Contrôleur pour gérer les opérations liées aux utilisateurs et aux rôles.
 * Permet de s'inscrire, se connecter, créer, mettre à jour et supprimer des utilisateurs,
 * ainsi que de gérer les rôles et permissions.
 * @module userController
 */
export default {
  /**
   * Inscription d'un nouvel utilisateur.
   * @param {Request} req - La requête HTTP contenant les données de l'utilisateur.
   * @param {Response} res - La réponse HTTP.
   * @returns {Promise<Response>} - La réponse HTTP avec le résultat de l'inscription.
   */
  async register(req: Request, res: Response): Promise<Response> {
    const result = await userService.register(req.body);

    return handleServiceResult(res, result, 201);
  },

  /**
   * Connexion d'un utilisateur existant.
   * @param {Request} req - La requête HTTP contenant les informations de connexion.
   * @param {Response} res - La réponse HTTP.
   * @returns {Promise<Response>} - La réponse HTTP avec le résultat de la connexion.
   */
  async login(req: Request, res: Response): Promise<Response> {
    const result = await userService.login(req.body);

    return handleServiceResult(res, result);
  },

  /**
   * Récupération des informations de l'utilisateur authentifié.
   * @param {Request} req - La requête HTTP.
   * @param {Response} res - La réponse HTTP.
   * @returns {Promise<Response>} - La réponse HTTP avec les informations de l'utilisateur.
   */
  async createUser(req: Request, res: Response): Promise<Response> {
    const result = await userService.createUser(req.body);

    return handleServiceResult(res, result, 201);
  },

  /**
   * Récupération des informations d'un utilisateur par son ID.
   * @param {Request} req - La requête HTTP contenant l'ID de l'utilisateur.
   * @param {Response} res - La réponse HTTP.
   * @returns {Promise<Response>} - La réponse HTTP avec les informations de l'utilisateur.
   */
  async updateUser(req: Request, res: Response): Promise<Response> {
    const result = await userService.updateUser(req.params.id, req.body);

    return handleServiceResult(res, result);
  },

  /**
   * Suppression d'un utilisateur par son ID.
   * @param {Request} req - La requête HTTP contenant l'ID de l'utilisateur à supprimer.
   * @param {Response} res - La réponse HTTP.
   * @returns {Promise<Response>} - La réponse HTTP avec le résultat de la suppression.
   */
  async deleteUser(req: Request, res: Response): Promise<Response> {
    const result = await userService.deleteUser(req.params.id);
    return handleServiceResult(res, result);
  },

  /**
   * Récupération des rôles disponibles avec la possibilité de suppression.
   * @param {Request} req - La requête HTTP.
   * @param {Response} res - La réponse HTTP.
   * @returns {Promise<Response>} - La réponse HTTP avec la liste des rôles.
   */
  async listRoles(req: Request, res: Response): Promise<Response> {
    const result = await userService.listRolesWithCanDelete();

    return handleServiceResult(res, result);
  },

  /**
   * Création d'un nouveau rôle.
   * @param {Request} req - La requête HTTP contenant les données du rôle.
   * @param {Response} res - La réponse HTTP.
   * @returns {Promise<Response>} - La réponse HTTP avec le résultat de la création du rôle.
   */
  async createRole(req: Request, res: Response): Promise<Response> {
    const result = await userService.createRole(req.body);

    return handleServiceResult(res, result, 201);
  },

  /**
   * Récupération des informations d'un rôle par son ID.
   * @param {Request} req - La requête HTTP contenant l'ID du rôle.
   * @param {Response} res - La réponse HTTP.
   * @returns {Promise<Response>} - La réponse HTTP avec les informations du rôle.
   */
  async updateRole(req: Request, res: Response): Promise<Response> {
    const result = await userService.updateRole(req.params.id, req.body);

    return handleServiceResult(res, result);
  },

  /**
   * Suppression d'un rôle par son ID.
   * @param {Request} req - La requête HTTP contenant l'ID du rôle à supprimer.
   * @param {Response} res - La réponse HTTP.
   * @returns {Promise<Response>} - La réponse HTTP avec le résultat de la suppression du rôle.
   */
  async deleteRole(req: Request, res: Response): Promise<Response> {
    const result = await userService.deleteRole(req.params.id);

    return handleServiceResult(res, result);
  },

  /**
   * Récupération des permissions disponibles.
   * @param {Request} req - La requête HTTP.
   * @param {Response} res - La réponse HTTP.
   * @returns {Promise<Response>} - La réponse HTTP avec la liste des permissions.
   */
  async listPermissions(req: Request, res: Response): Promise<Response> {
    const result = await userService.listPermissions();

    return handleServiceResult(res, result);
  },

  /**
   * Récupération des permissions d'un rôle par son ID.
   * @param {Request} req - La requête HTTP contenant l'ID du rôle.
   * @param {Response} res - La réponse HTTP.
   * @returns {Promise<Response>} - La réponse HTTP avec les permissions du rôle.
   */
  async listUsers(req: Request, res: Response): Promise<Response> {
    const users = await userService.listUsers();

    return handleServiceResult(res, users);
  },

  /**
   * Récupération du profil de l'utilisateur authentifié.
   * @param {Request} req - La requête HTTP avec l'utilisateur authentifié.
   * @param {Response} res - La réponse HTTP.
   * @returns {Promise<Response>} - La réponse HTTP avec le profil de l'utilisateur.
   */
  async getProfile(req: Request, res: Response): Promise<Response> {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur non authentifié"
      });
    }

    const result = await userService.getProfile(userId);

    return handleServiceResult(res, result);
  },
};
