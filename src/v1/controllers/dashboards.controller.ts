/**
 * Contrôleurs pour les dashboards v1
 */

import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import dashboardService from "../../services/dashboardService";
import { ApiResponseBuilder } from "../utils/response.util";
import type {
    CreateDashboardDTO,
    UpdateDashboardDTO,
    ListDashboardsQuery,
    UpdateSharingDTO,
} from "../validators/dashboard.schema";

/**
 * Crée un nouveau dashboard
 * POST /api/v1/dashboards
 */
export const createDashboard = async (req: AuthRequest, res: Response) => {
    try {
        const body = req.body as CreateDashboardDTO;
        const userId = req.user?.id;

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

        const result = await dashboardService.createDashboard(userId, body);

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

        const dashboardUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}/${(result.data as any)._id}`;

        return res
            .status(201)
            .json(
                ApiResponseBuilder.created(
                    result.data,
                    dashboardUrl,
                    "Dashboard créé avec succès"
                )
            );
    } catch (error: any) {
        return res
            .status(500)
            .json(
                ApiResponseBuilder.error(
                    "Erreur lors de la création du dashboard",
                    error.message,
                    500
                )
            );
    }
};

/**
 * Liste les dashboards avec pagination
 * GET /api/v1/dashboards
 */
export const listDashboards = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const query = req.query as unknown as ListDashboardsQuery;
        const { page, limit, skip } = req.pagination || {
            page: 1,
            limit: 10,
            skip: 0,
        };

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

        const result = await dashboardService.listUserDashboards(userId);

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

        let dashboards = result.data;

        if (query.visibility) {
            dashboards = dashboards.filter(
                (d) => d.visibility === query.visibility
            );
        }

        const total = dashboards.length;
        const paginatedDashboards = dashboards.slice(skip, skip + limit);

        const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;
        const queryParams: Record<string, string> = {};
        if (query.visibility) {
            queryParams.visibility = query.visibility;
        }

        return res
            .status(200)
            .json(
                ApiResponseBuilder.paginated(
                    paginatedDashboards,
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
                    "Erreur lors de la récupération des dashboards",
                    error.message,
                    500
                )
            );
    }
};

/**
 * Récupère un dashboard par son ID
 * GET /api/v1/dashboards/:id
 */
export const getDashboard = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const result = await dashboardService.getDashboardById(id, userId);

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

        const dashboardUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

        return res
            .status(200)
            .json(
                ApiResponseBuilder.success(result.data, undefined, {
                    links: { self: dashboardUrl },
                })
            );
    } catch (error: any) {
        return res
            .status(500)
            .json(
                ApiResponseBuilder.error(
                    "Erreur lors de la récupération du dashboard",
                    error.message,
                    500
                )
            );
    }
};

/**
 * Met à jour un dashboard
 * PATCH /api/v1/dashboards/:id
 */
export const updateDashboard = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const body = req.body as UpdateDashboardDTO;
        const userId = req.user?.id;

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

        const result = await dashboardService.updateDashboard(id, body, userId);

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
                    "Dashboard mis à jour avec succès"
                )
            );
    } catch (error: any) {
        return res
            .status(500)
            .json(
                ApiResponseBuilder.error(
                    "Erreur lors de la mise à jour du dashboard",
                    error.message,
                    500
                )
            );
    }
};

/**
 * Supprime un dashboard
 * DELETE /api/v1/dashboards/:id
 */
export const deleteDashboard = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

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

        const result = await dashboardService.deleteDashboard(id, userId);

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
                ApiResponseBuilder.deleted("Dashboard supprimé avec succès")
            );
    } catch (error: any) {
        return res
            .status(500)
            .json(
                ApiResponseBuilder.error(
                    "Erreur lors de la suppression du dashboard",
                    error.message,
                    500
                )
            );
    }
};

/**
 * Met à jour les paramètres de partage d'un dashboard
 * PATCH /api/v1/dashboards/:id/sharing
 */
export const updateSharing = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { enabled } = req.body as UpdateSharingDTO;
        const userId = req.user?.id;

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

        const result = enabled
            ? await dashboardService.enableShare(id, userId)
            : await dashboardService.disableShare(id, userId);

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
                    `Partage ${enabled ? "activé" : "désactivé"} avec succès`
                )
            );
    } catch (error: any) {
        return res
            .status(500)
            .json(
                ApiResponseBuilder.error(
                    "Erreur lors de la mise à jour du partage",
                    error.message,
                    500
                )
            );
    }
};

/**
 * Récupère un dashboard partagé (route publique)
 * GET /api/v1/dashboards/shared/:shareId
 */
export const getSharedDashboard = async (req: AuthRequest, res: Response) => {
    try {
        const { shareId } = req.params;

        const result = await dashboardService.getSharedDashboard(shareId);

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

        return res.status(200).json(ApiResponseBuilder.success(result.data));
    } catch (error: any) {
        return res
            .status(500)
            .json(
                ApiResponseBuilder.error(
                    "Erreur lors de la récupération du dashboard partagé",
                    error.message,
                    500
                )
            );
    }
};

/**
 * Récupère les sources de données d'un dashboard partagé (route publique)
 * GET /api/v1/dashboards/shared/:shareId/sources
 */
export const getSharedDashboardSources = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const { shareId } = req.params;

        const result =
            await dashboardService.getSharedDashboardSources(shareId);

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

        return res.status(200).json(ApiResponseBuilder.success(result.data));
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
