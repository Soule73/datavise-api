/**
 * Contrôleurs pour les data sources v1
 */

import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import dataSourceService from "../../services/dataSourceService";
import { ApiResponseBuilder } from "../utils/response.util";
import type {
    CreateDataSourceDTO,
    UpdateDataSourceDTO,
    ListDataSourcesQuery,
    FetchDataQuery,
    DetectColumnsDTO,
} from "../validators/data-source.schema";

/**
 * Crée une nouvelle source de données
 * POST /api/v1/data-sources
 */
export const createDataSource = async (req: AuthRequest, res: Response) => {
    try {
        const body = req.body as CreateDataSourceDTO;
        const userId = req.user?.id;
        const file = (req as any).file;

        if (!userId) {
            return res
                .status(401)
                .json(
                    ApiResponseBuilder.error(
                        "Utilisateur non authentifié",
                        undefined,
                        401
                    )
                );
        }

        const payload = {
            ...body,
            ownerId: userId,
            filePath: file?.path,
        };

        const result = await dataSourceService.create(payload);

        if (!result.success) {
            return res
                .status(result.status || 400)
                .json(
                    ApiResponseBuilder.error(
                        result.message,
                        undefined,
                        result.status
                    )
                );
        }

        const sourceUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}/${(result.data as any)._id}`;

        return res
            .status(201)
            .json(
                ApiResponseBuilder.created(
                    result.data,
                    sourceUrl,
                    "Source de données créée avec succès"
                )
            );
    } catch (error: any) {
        return res
            .status(500)
            .json(
                ApiResponseBuilder.error(
                    "Erreur lors de la création de la source",
                    error.message,
                    500
                )
            );
    }
};

/**
 * Liste les sources de données avec pagination
 * GET /api/v1/data-sources
 */
export const listDataSources = async (req: AuthRequest, res: Response) => {
    try {
        const query = req.query as unknown as ListDataSourcesQuery;
        const { page, limit, skip } = req.pagination || {
            page: 1,
            limit: 10,
            skip: 0,
        };

        const result = await dataSourceService.list();

        if (!result.success) {
            return res
                .status(result.status || 400)
                .json(
                    ApiResponseBuilder.error(
                        result.message,
                        undefined,
                        result.status
                    )
                );
        }

        let sources = result.data;

        if (query.type) {
            sources = sources.filter((s) => s.type === query.type);
        }
        if (query.visibility) {
            sources = sources.filter((s) => s.visibility === query.visibility);
        }

        const total = sources.length;
        const paginatedSources = sources.slice(skip, skip + limit);

        const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;
        const queryParams: Record<string, string> = {};
        if (query.type) queryParams.type = query.type;
        if (query.visibility) queryParams.visibility = query.visibility;

        return res
            .status(200)
            .json(
                ApiResponseBuilder.paginated(
                    paginatedSources,
                    page,
                    limit,
                    total,
                    baseUrl,
                    queryParams
                )
            );
    } catch (error: any) {
        return res
            .status(500)
            .json(
                ApiResponseBuilder.error(
                    "Erreur lors de la récupération des sources",
                    error.message,
                    500
                )
            );
    }
};

/**
 * Récupère une source de données par son ID
 * GET /api/v1/data-sources/:id
 */
export const getDataSource = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const result = await dataSourceService.getById(id);

        if (!result.success) {
            return res
                .status(result.status || 404)
                .json(
                    ApiResponseBuilder.error(
                        result.message,
                        undefined,
                        result.status
                    )
                );
        }

        const sourceUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

        return res
            .status(200)
            .json(
                ApiResponseBuilder.success(result.data, undefined, {
                    links: { self: sourceUrl },
                })
            );
    } catch (error: any) {
        return res
            .status(500)
            .json(
                ApiResponseBuilder.error(
                    "Erreur lors de la récupération de la source",
                    error.message,
                    500
                )
            );
    }
};

/**
 * Met à jour une source de données
 * PATCH /api/v1/data-sources/:id
 */
export const updateDataSource = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const body = req.body as UpdateDataSourceDTO;

        const result = await dataSourceService.update(id, body);

        if (!result.success) {
            return res
                .status(result.status || 400)
                .json(
                    ApiResponseBuilder.error(
                        result.message,
                        undefined,
                        result.status
                    )
                );
        }

        return res
            .status(200)
            .json(
                ApiResponseBuilder.success(
                    result.data,
                    "Source mise à jour avec succès"
                )
            );
    } catch (error: any) {
        return res
            .status(500)
            .json(
                ApiResponseBuilder.error(
                    "Erreur lors de la mise à jour de la source",
                    error.message,
                    500
                )
            );
    }
};

/**
 * Supprime une source de données
 * DELETE /api/v1/data-sources/:id
 */
export const deleteDataSource = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const result = await dataSourceService.remove(id);

        if (!result.success) {
            return res
                .status(result.status || 400)
                .json(
                    ApiResponseBuilder.error(
                        result.message,
                        undefined,
                        result.status
                    )
                );
        }

        return res
            .status(200)
            .json(
                ApiResponseBuilder.deleted("Source supprimée avec succès")
            );
    } catch (error: any) {
        return res
            .status(500)
            .json(
                ApiResponseBuilder.error(
                    "Erreur lors de la suppression de la source",
                    error.message,
                    500
                )
            );
    }
};

/**
 * Détecte les colonnes d'une source de données
 * POST /api/v1/data-sources/detect-columns
 */
export const detectColumns = async (req: AuthRequest, res: Response) => {
    try {
        const body = req.body as DetectColumnsDTO;
        const file = (req as any).file;

        const params = {
            ...body,
            filePath: file?.path,
        };

        const result = await dataSourceService.detectColumns(params);

        if (!result.success) {
            return res
                .status(result.status || 400)
                .json(
                    ApiResponseBuilder.error(
                        result.message,
                        undefined,
                        result.status
                    )
                );
        }

        return res
            .status(200)
            .json(
                ApiResponseBuilder.success(
                    result.data,
                    "Colonnes détectées avec succès"
                )
            );
    } catch (error: any) {
        return res
            .status(500)
            .json(
                ApiResponseBuilder.error(
                    "Erreur lors de la détection des colonnes",
                    error.message,
                    500
                )
            );
    }
};

/**
 * Récupère les données d'une source de données
 * GET /api/v1/data-sources/:id/data
 */
export const fetchData = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const query = req.query as unknown as FetchDataQuery;

        const options = {
            from: query.from,
            to: query.to,
            page: query.page,
            pageSize: query.pageSize,
            fields: query.fields,
            forceRefresh: query.forceRefresh,
            shareId: query.shareId,
        };

        const result = await dataSourceService.fetchData(id, options);

        if (!result.success) {
            return res
                .status(result.status || 400)
                .json(
                    ApiResponseBuilder.error(
                        result.message,
                        undefined,
                        result.status
                    )
                );
        }

        const response = ApiResponseBuilder.success(
            result.data,
            "Données récupérées avec succès"
        );

        if ((result as any).total !== undefined) {
            response.meta = {
                ...response.meta,
                total: (result as any).total,
            };
        }

        return res.status(200).json(response);
    } catch (error: any) {
        return res
            .status(500)
            .json(
                ApiResponseBuilder.error(
                    "Erreur lors de la récupération des données",
                    error.message,
                    500
                )
            );
    }
};
