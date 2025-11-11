import widgetService from "../services/widgetService";
import { Request, Response, NextFunction } from "express";
import { handleServiceResult } from "../utils/api";
import { AuthRequest } from "../types/authType";

/**
 * Contrôleur pour gérer les opérations liées aux widgets.
 * Permet de créer, lire, mettre à jour et supprimer des widgets.
 * @module widgetController
 */
const widgetController = {
  /**
   * Liste tous les widgets de l'utilisateur authentifié.
   * @param {AuthRequest} req - La requête HTTP contenant l'ID de l'utilisateur.
   * @param {Response} res - La réponse HTTP.
   * @param {NextFunction} next - La fonction de rappel pour passer au middleware suivant.
   * @returns {Promise<Response>} - La réponse HTTP avec la liste des widgets.
   */
  async list(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    const userId = (req as AuthRequest).user?.id;

    const result = await widgetService.list(userId);

    return handleServiceResult(res, result);
  },

  /**
   * Crée un nouveau widget pour l'utilisateur authentifié.
   * @param {AuthRequest} req - La requête HTTP contenant les données du widget.
   * @param {Response} res - La réponse HTTP.
   * @param {NextFunction} next - La fonction de rappel pour passer au middleware suivant.
   * @returns {Promise<Response>} - La réponse HTTP avec le widget créé.
   */
  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    const userId = (req as AuthRequest).user?.id;

    const result = await widgetService.create({ ...req.body, userId });

    return handleServiceResult(res, result, 201);
  },

  /**
   * Met à jour un widget existant.
   * @param {Request} req - La requête HTTP contenant l'ID du widget et les données à mettre à jour.
   * @param {Response} res - La réponse HTTP.
   * @param {NextFunction} next - La fonction de rappel pour passer au middleware suivant.
   * @returns {Promise<Response>} - La réponse HTTP avec le widget mis à jour.
   */
  async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    const userId = (req as AuthRequest).user?.id;

    const result = await widgetService.update(req.params.id, {
      ...req.body,
      userId,
    });

    return handleServiceResult(res, result);
  },

  /**
   * Supprime un widget par son ID.
   * @param {Request} req - La requête HTTP contenant l'ID du widget à supprimer.
   * @param {Response} res - La réponse HTTP.
   * @param {NextFunction} next - La fonction de rappel pour passer au middleware suivant.
   * @returns {Promise<Response>} - La réponse HTTP indiquant le succès ou l'échec de la suppression.
   */
  async remove(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    const result = await widgetService.remove(req.params.id);

    return handleServiceResult(res, result);
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    const result = await widgetService.getById(req.params.id);

    return handleServiceResult(res, result);
  },

  /**
   * Récupère tous les widgets d'une conversation
   */
  async getByConversation(req: Request, res: Response, next: NextFunction) {
    const { conversationId } = req.params;
    const userId = (req as AuthRequest).user?.id;

    const result = await widgetService.getByConversation(conversationId, userId);

    return handleServiceResult(res, result);
  },

  /**
   * Publie un widget draft (isDraft: false)
   */
  async publishWidget(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const userId = (req as AuthRequest).user?.id;

    const result = await widgetService.publishWidget(id, userId);

    return handleServiceResult(res, result);
  },
};

export default widgetController;
