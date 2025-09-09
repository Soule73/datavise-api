import { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth";
import dashboardService from "../services/dashboardService";
import { handleServiceResult, toApiError } from "../utils/api";

/**
 * Contrôleur pour gérer les opérations liées aux dashboards.
 * Permet de créer, lire, mettre à jour et supprimer des dashboards,
 * ainsi que de gérer le partage public.
 * @module dashboardController
 */
const dashboardController = {
  /**
   * Crée un nouveau dashboard pour l'utilisateur authentifié.
   * @param {AuthRequest} req - La requête HTTP contenant les données du dashboard.
   * @param {Response} res - La réponse HTTP.
   * @param {NextFunction} next - La fonction de rappel pour passer au middleware suivant.
   * @returns {Promise<Response>} - La réponse HTTP avec le dashboard créé.
   */
  async createDashboard(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    const timeRange = req.body.timeRange || {};

    const userId = req.user!.id;

    const result = await dashboardService.createDashboard(userId, {
      ...req.body,
      userId,
      ownerId: userId,
      visibility: req.body.visibility ?? "private",
      autoRefreshIntervalValue: req.body.autoRefreshIntervalValue,
      autoRefreshIntervalUnit: req.body.autoRefreshIntervalUnit,
      timeRange,
    });

    return handleServiceResult(res, result, 201);
  },

  /**
   * Récupère un dashboard par son ID.
   * @param {Request} req - La requête HTTP contenant l'ID du dashboard.
   * @param {Response} res - La réponse HTTP.
   * @param {NextFunction} next - La fonction de rappel pour passer au middleware suivant.
   * @returns {Promise<Response>} - La réponse HTTP avec le dashboard récupéré.
   */
  async getDashboardById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    const result = await dashboardService.getDashboardById(req.params.id);

    return handleServiceResult(res, result);
  },

  /**
   * Met à jour un dashboard existant.
   * @param {Request} req - La requête HTTP contenant l'ID du dashboard et les données à mettre à jour.
   * @param {Response} res - La réponse HTTP.
   * @param {NextFunction} next - La fonction de rappel pour passer au middleware suivant.
   * @returns {Promise<Response>} - La réponse HTTP avec le dashboard mis à jour.
   */
  async updateDashboard(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    const timeRange = req.body.timeRange || {};

    const userId = (req as AuthRequest).user?.id;

    const result = await dashboardService.updateDashboard(req.params.id, {
      ...req.body,
      userId,
      visibility: req.body.visibility ?? "private",
      autoRefreshIntervalValue: req.body.autoRefreshIntervalValue,
      autoRefreshIntervalUnit: req.body.autoRefreshIntervalUnit,
      timeRange,
    });

    return handleServiceResult(res, result);
  },

  /**
   * Supprime un dashboard par son ID.
   * @param {Request} req - La requête HTTP contenant l'ID du dashboard à supprimer.
   * @param {Response} res - La réponse HTTP.
   * @param {NextFunction} next - La fonction de rappel pour passer au middleware suivant.
   * @returns {Promise<Response>} - La réponse HTTP indiquant la suppression réussie.
   */
  async deleteDashboard(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    const result = await dashboardService.deleteDashboard(req.params.id);

    return handleServiceResult(res, result, 204);
  },

  /**
   * Liste les dashboards de l'utilisateur authentifié.
   * @param {AuthRequest} req - La requête HTTP contenant les informations de l'utilisateur.
   * @param {Response} res - La réponse HTTP.
   * @param {NextFunction} next - La fonction de rappel pour passer au middleware suivant.
   * @returns {Promise<Response>} - La réponse HTTP avec la liste des dashboards.
   */
  async listUserDashboards(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    try {
      const result = await dashboardService.listUserDashboards(req.user!.id);

      return handleServiceResult(res, result);
    } catch (e) {
      next(e);

      return res.status(500).json(toApiError("Internal Server Error", 500));
    }
  },

  /**
   * Liste les dashboards partagés avec l'utilisateur authentifié.
   * @param {AuthRequest} req - La requête HTTP contenant les informations de l'utilisateur.
   * @param {Response} res - La réponse HTTP.
   * @param {NextFunction} next - La fonction de rappel pour passer au middleware suivant.
   * @returns {Promise<Response>} - La réponse HTTP avec la liste des dashboards partagés.
   */
  async enableShare(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    const result = await dashboardService.enableShare(req.params.id);

    return handleServiceResult(res, result);
  },

  /**
   * Désactive le partage public d'un dashboard.
   * @param {Request} req - La requête HTTP contenant l'ID du dashboard.
   * @param {Response} res - La réponse HTTP.
   * @param {NextFunction} next - La fonction de rappel pour passer au middleware suivant.
   * @returns {Promise<Response>} - La réponse HTTP indiquant la désactivation réussie.
   */
  async disableShare(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    const result = await dashboardService.disableShare(req.params.id);

    return handleServiceResult(res, result);
  },

  /**
   * Récupère un dashboard partagé par son ID de partage.
   * @param {Request} req - La requête HTTP contenant l'ID de partage du dashboard.
   * @param {Response} res - La réponse HTTP.
   * @param {NextFunction} next - La fonction de rappel pour passer au middleware suivant.
   * @returns {Promise<Response>} - La réponse HTTP avec le dashboard partagé récupéré.
   */
  async getSharedDashboard(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    const result = await dashboardService.getSharedDashboard(
      req.params.shareId
    );
    return handleServiceResult(res, result);
  },

  /**
   * Récupère les sources d'un dashboard partagé par son ID de partage.
   * @param {Request} req - La requête HTTP contenant l'ID de partage du dashboard.
   * @param {Response} res - La réponse HTTP.
   * @param {NextFunction} next - La fonction de rappel pour passer au middleware suivant.
   * @returns {Promise<Response>} - La réponse HTTP avec les sources du dashboard partagé récupérées.
   */
  async getSharedDashboardSources(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    try {
      const { shareId } = req.params;
      const result = await dashboardService.getSharedDashboardSources(shareId);
      return handleServiceResult(res, result);
    } catch (e) {
      next(e);
      return res.status(500).json(toApiError("Internal Server Error", 500));
    }
  },
};

export default dashboardController;
