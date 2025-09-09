import dataSourceService from "../services/dataSourceService";
import { Request, Response, NextFunction } from "express";
import fs from "fs";
import { handleServiceResult } from "../utils/api";
import DataSource from "../models/DataSource";
import path from "path";

/**
 * Contrôleur pour gérer les opérations liées aux sources de données.
 * Permet de lister, créer, mettre à jour, supprimer des sources de données,
 * ainsi que de détecter les colonnes et récupérer des données.
 * @module dataSourceController
 */
const dataSourceController = {
  /**
   * Liste toutes les sources de données de l'utilisateur authentifié.
   * @param {Request} req - La requête HTTP.
   * @param {Response} res - La réponse HTTP.
   * @param {NextFunction} next - La fonction de rappel pour passer au middleware suivant.
   * @returns {Promise<Response>} - La réponse HTTP avec la liste des sources de données.
   */
  async list(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    const result = await dataSourceService.list();

    return handleServiceResult(res, result);
  },

  /**
   * Crée une nouvelle source de données pour l'utilisateur authentifié.
   * @param {Request} req - La requête HTTP contenant les données de la source de données.
   * @param {Response} res - La réponse HTTP.
   * @param {NextFunction} next - La fonction de rappel pour passer au middleware suivant.
   * @returns {Promise<Response>} - La réponse HTTP avec la source de données créée.
   */
  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {

    const userId = (req as any).user?.id;

    const file = (req as any).file as any | undefined;

    let filePath = undefined;

    if (file) {
      filePath = `uploads/${file.filename}`;
    }

    const result = await dataSourceService.create({
      ...req.body,
      filePath,
      endpoint: file ? undefined : req.body.endpoint,
      ownerId: userId,
    });

    return handleServiceResult(res, result, 201);

  },

  /**
   * Récupère une source de données par son ID.
   * @param {Request} req - La requête HTTP contenant l'ID de la source de données.
   * @param {Response} res - La réponse HTTP.
   * @param {NextFunction} next - La fonction de rappel pour passer au middleware suivant.
   * @returns {Promise<Response>} - La réponse HTTP avec la source de données récupérée.
   */
  async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    const result = await dataSourceService.getById(req.params.id);

    return handleServiceResult(res, result);
  },

  /**
   * Met à jour une source de données existante.
   * @param {Request} req - La requête HTTP contenant l'ID de la source de données et les données à mettre à jour.
   * @param {Response} res - La réponse HTTP.
   * @param {NextFunction} next - La fonction de rappel pour passer au middleware suivant.
   * @returns {Promise<Response>} - La réponse HTTP avec la source de données mise à jour.
   */
  async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const {
        name,
        type,
        endpoint,
        filePath,
        config,
        httpMethod,
        authType,
        authConfig,
        timestampField,
        esIndex,
        esQuery,
      } = req.body;

      const updatePayload: any = {
        name,
        type,
        endpoint,
        filePath,
        config,
        timestampField,
        httpMethod,
        authType,
        authConfig,
        esIndex,
        esQuery,
      };
      const updated = await DataSource.findByIdAndUpdate(
        req.params.id,
        updatePayload,
        { new: true }
      );
      if (!updated) {
        return res.status(404).json({ error: "Source non trouvée" });
      }
      return res.json({ data: updated });
    } catch (err) {
      next(err);
      return;
    }
  },

  /**
   * Supprime une source de données par son ID.
   * @param {Request} req - La requête HTTP contenant l'ID de la source de données à supprimer.
   * @param {Response} res - La réponse HTTP.
   * @param {NextFunction} next - La fonction de rappel pour passer au middleware suivant.
   * @returns {Promise<Response>} - La réponse HTTP indiquant le succès ou l'échec de la suppression.
   */
  async remove(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    const result = await dataSourceService.remove(req.params.id);
    return handleServiceResult(res, result);
  },

  /**
   * Détecte les colonnes d'une source de données à partir d'un fichier ou d'une API.
   * @param {Request} req - La requête HTTP contenant les paramètres de la source de données.
   * @param {Response} res - La réponse HTTP.
   * @param {NextFunction} next - La fonction de rappel pour passer au middleware suivant.
   * @returns {Promise<Response>} - La réponse HTTP avec les colonnes détectées.
   */
  async detectColumns(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    const {
      type,
      endpoint,
      filePath,
      sourceId,
      httpMethod,
      authType,
      authConfig,
      esIndex,
      esQuery,
    } = req.body;

    const file = (req as any).file as any | undefined;

    let tempFilePath = filePath;

    if (file) {
      tempFilePath = file.path;
    }

    const result = await dataSourceService.detectColumns({
      sourceId,
      type,
      endpoint,
      filePath: tempFilePath,
      httpMethod,
      authType,
      authConfig,
      esIndex,
      esQuery,
    });

    if (file) {
      fs.unlink(file.path, () => { });
    }

    return handleServiceResult(res, result);
  },

  /**
   * Récupère les données d'une source de données par son ID.
   * @param {Request} req - La requête HTTP contenant l'ID de la source de données et les paramètres de pagination.
   * @param {Response} res - La réponse HTTP.
   * @param {NextFunction} next - La fonction de rappel pour passer au middleware suivant.
   * @returns {Promise<Response>} - La réponse HTTP avec les données récupérées.
   */
  async fetchData(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    const { id } = req.params;
    const { from, to, page, pageSize, fields } = req.query;
    const result = await dataSourceService.fetchData(id, {
      from: from as string | undefined,
      to: to as string | undefined,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      fields: fields ? String(fields) : undefined,
    });
    return handleServiceResult(res, result);
  },

  /**
   * Envoie un fichier d'exemple de données de ventes.
   * @param {Request} req - La requête HTTP.
   * @param {Response} res - La réponse HTTP.
   * @returns {Promise<void>} - Envoie le fichier JSON d'exemple.
   *
   * NOTE: cette méthode peur étre supprimée si elle n'est pas utilisée.
   * Elle est utilisée pour fournir un exemple de données de ventes.
   */
  async demoVentes(req: Request, res: Response): Promise<void> {
    res.sendFile(
      path.resolve(__dirname, "../data/ventes-exemple.json")
    );
  },
};

export default dataSourceController;
