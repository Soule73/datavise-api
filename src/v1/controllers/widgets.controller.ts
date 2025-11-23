/**
 * Contrôleurs pour les widgets v1
 */

import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import widgetService from "../../services/widgetService";
import { ApiResponseBuilder } from "../utils/response.util";
import type {
    CreateWidgetDTO,
    UpdateWidgetDTO,
    ListWidgetsQuery,
} from "../validators/widget.schema";

/**
 * Crée un nouveau widget
 * POST /api/v1/widgets
 */
export const createWidget = async (req: AuthRequest, res: Response) => {
    try {
        const body = req.body as CreateWidgetDTO;
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

        const result = await widgetService.create({
            widgetId: body.widgetId,
            title: body.title,
            type: body.type,
            dataSourceId: body.dataSourceId as any,
            config: body.config,
            visibility: body.visibility,
            userId: userId as any,
            isGeneratedByAI: body.isGeneratedByAI,
            conversationId: body.conversationId as any,
            isDraft: body.isDraft,
            description: body.description,
            reasoning: body.reasoning,
            confidence: body.confidence,
        });

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

        const widgetUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}/${(result.data as any)._id}`;

        return res
            .status(201)
            .json(
                ApiResponseBuilder.created(
                    result.data,
                    widgetUrl,
                    "Widget créé avec succès"
                )
            );
    } catch (error: any) {
        return res
            .status(500)
            .json(
                ApiResponseBuilder.error(
                    "Erreur lors de la création du widget",
                    error.message,
                    500
                )
            );
    }
};

/**
 * Liste les widgets avec pagination
 * GET /api/v1/widgets
 */
export const listWidgets = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const query = req.query as unknown as ListWidgetsQuery;
        const pagination = req.pagination;

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

        const result = await widgetService.list(userId);

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

        let widgets = result.data;

        console.log(query)



        // if (query.type) {
        //     widgets = widgets.filter((w) => w.type === query.type);
        // }
        // if (query.visibility) {
        //     widgets = widgets.filter((w) => w.visibility === query.visibility);
        // }
        // if (query.dataSourceId) {
        //     widgets = widgets.filter(
        //         (w) => w.dataSourceId.toString() === query.dataSourceId
        //     );
        // }
        // if (query.isDraft !== undefined) {
        //     widgets = widgets.filter((w) => w.isDraft === query.isDraft);
        // }
        // if (query.isGeneratedByAI !== undefined) {
        //     widgets = widgets.filter(
        //         (w) => w.isGeneratedByAI === query.isGeneratedByAI
        //     );
        // }

        const total = widgets.length;
        const { page, limit, skip } = pagination || {
            page: 1,
            limit: 10,
            skip: 0,
        };
        const paginatedWidgets = widgets.slice(skip, skip + limit);

        const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;
        const queryParams = Object.keys(query).reduce(
            (acc, key) => {
                if (key !== "page" && key !== "limit" && query[key as keyof ListWidgetsQuery] !== undefined) {
                    acc[key] = String(query[key as keyof ListWidgetsQuery]);
                }
                return acc;
            },
            {} as Record<string, string>
        );

        return res
            .status(200)
            .json(
                ApiResponseBuilder.paginated(
                    paginatedWidgets,
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
                    "Erreur lors de la récupération des widgets",
                    error.message,
                    500
                )
            );
    }
};

/**
 * Récupère un widget par son ID
 * GET /api/v1/widgets/:id
 */
export const getWidget = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const result = await widgetService.getById(id);

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

        const widgetUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

        return res
            .status(200)
            .json(
                ApiResponseBuilder.success(result.data, undefined, {
                    links: { self: widgetUrl },
                })
            );
    } catch (error: any) {
        return res
            .status(500)
            .json(
                ApiResponseBuilder.error(
                    "Erreur lors de la récupération du widget",
                    error.message,
                    500
                )
            );
    }
};

/**
 * Met à jour un widget
 * PATCH /api/v1/widgets/:id
 */
export const updateWidget = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const body = req.body as UpdateWidgetDTO;
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

        const result = await widgetService.update(id, {
            ...body,
            ...(body.dataSourceId && { dataSourceId: body.dataSourceId as any }),
            userId: userId as any,
        });

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
                    "Widget mis à jour avec succès"
                )
            );
    } catch (error: any) {
        return res
            .status(500)
            .json(
                ApiResponseBuilder.error(
                    "Erreur lors de la mise à jour du widget",
                    error.message,
                    500
                )
            );
    }
};

/**
 * Supprime un widget
 * DELETE /api/v1/widgets/:id
 */
export const deleteWidget = async (req: AuthRequest, res: Response) => {
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

        const result = await widgetService.remove(id);

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
            .json(ApiResponseBuilder.deleted("Widget supprimé avec succès"));
    } catch (error: any) {
        return res
            .status(500)
            .json(
                ApiResponseBuilder.error(
                    "Erreur lors de la suppression du widget",
                    error.message,
                    500
                )
            );
    }
};
