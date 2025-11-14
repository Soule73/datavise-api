import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import aiWidgetService from "../../services/aiWidgetService";
import { ApiResponseBuilder } from "../utils/response.util";
import type { AIGenerateRequest } from "../../types/aiType";

export const generateWidgets = async (req: AuthRequest, res: Response) => {
    const { dataSourceId, conversationId, userPrompt, maxWidgets, preferredTypes } = req.body;

    const request: AIGenerateRequest = {
        dataSourceId,
        conversationId,
        userId: req.user!.id,
        userPrompt,
        maxWidgets,
        preferredTypes,
    };

    const result = await aiWidgetService.generateWidgets(request);

    if (result.success) {
        return res.status(200).json(
            ApiResponseBuilder.success(result.data, result.message)
        );
    }

    return res.status(result.status || 500).json(
        ApiResponseBuilder.error(result.message, undefined, result.status)
    );
};

export const refineWidgets = async (req: AuthRequest, res: Response) => {
    const { dataSourceId, currentWidgets, refinementPrompt } = req.body;

    const result = await aiWidgetService.refineWidgets(
        dataSourceId,
        currentWidgets,
        refinementPrompt
    );

    if (result.success) {
        return res.status(200).json(
            ApiResponseBuilder.success(result.data, result.message)
        );
    }

    return res.status(result.status || 500).json(
        ApiResponseBuilder.error(result.message, undefined, result.status)
    );
};

export const refineWidgetsDb = async (req: AuthRequest, res: Response) => {
    const { dataSourceId, widgetIds, refinementPrompt } = req.body;

    const result = await aiWidgetService.refineWidgetsInDatabase(
        dataSourceId,
        widgetIds,
        refinementPrompt
    );

    if (result.success) {
        return res.status(200).json(
            ApiResponseBuilder.success(result.data, result.message)
        );
    }

    return res.status(result.status || 500).json(
        ApiResponseBuilder.error(result.message, undefined, result.status)
    );
};

export const analyzeSource = async (req: AuthRequest, res: Response) => {
    const { dataSourceId } = req.body;

    try {
        const analysis = await aiWidgetService.analyzeDataSource(dataSourceId);

        return res.status(200).json(
            ApiResponseBuilder.success(analysis, "Analyse terminée avec succès")
        );
    } catch (error: any) {
        return res.status(500).json(
            ApiResponseBuilder.error(error.message || "Erreur lors de l'analyse", undefined, 500)
        );
    }
};
