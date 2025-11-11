import { Router, Response } from "express";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import { requirePermission } from "../middleware/requirePermission";
import aiWidgetService from "../services/aiWidgetService";
import { handleServiceResult } from "../utils/api";
import type {
    AIGenerateRequest,
    AIRefineRequest,
} from "../types/aiType";

const router = Router();

/**
 * POST /api/ai/generate-widgets
 * Génère des widgets intelligemment via IA
 */
router.post(
    "/generate-widgets",
    requireAuth,
    requirePermission("widget:canCreate"),
    async (req: AuthRequest, res: Response) => {
        const requestBody: Omit<AIGenerateRequest, 'userId' | 'conversationId'> = req.body;

        console.log("📥 [AI Route] POST /api/ai/generate-widgets", {
            userId: req.user?.id,
            dataSourceId: requestBody.dataSourceId,
            conversationId: req.body.conversationId,
            hasPrompt: !!requestBody.userPrompt,
            maxWidgets: requestBody.maxWidgets,
        });

        if (!requestBody.dataSourceId) {
            console.error("❌ [AI Route] dataSourceId manquant");
            return res
                .status(400)
                .json({ success: false, message: "dataSourceId requis" });
        }

        if (!req.body.conversationId) {
            console.error("❌ [AI Route] conversationId manquant");
            return res
                .status(400)
                .json({ success: false, message: "conversationId requis" });
        }

        const request: AIGenerateRequest = {
            ...requestBody,
            userId: req.user!.id,
            conversationId: req.body.conversationId,
        };

        const result = await aiWidgetService.generateWidgets(request);

        console.log("📤 [AI Route] Réponse /generate-widgets:", {
            success: result.success,
            widgetsCount: result.success ? result.data.widgets.length : 0,
            hasError: !result.success,
        });

        return handleServiceResult(res, result, 200);
    }
);

/**
 * POST /api/ai/refine-widgets
 * Raffine des widgets existants selon les instructions
 */
router.post(
    "/refine-widgets",
    requireAuth,
    requirePermission("widget:canCreate"),
    async (req: AuthRequest, res: Response) => {
        const { dataSourceId, currentWidgets, refinementPrompt }: AIRefineRequest =
            req.body;

        console.log("📥 [AI Route] POST /api/ai/refine-widgets", {
            userId: req.user?.id,
            dataSourceId,
            currentWidgetsCount: currentWidgets?.length,
            prompt: refinementPrompt?.substring(0, 100),
        });

        if (!dataSourceId || !currentWidgets || !refinementPrompt) {
            console.error("❌ [AI Route] Paramètres manquants pour raffinement");
            return res.status(400).json({
                success: false,
                message: "dataSourceId, currentWidgets et refinementPrompt requis",
            });
        }

        const result = await aiWidgetService.refineWidgets(
            dataSourceId,
            currentWidgets,
            refinementPrompt
        );

        console.log("📤 [AI Route] Réponse /refine-widgets:", {
            success: result.success,
            widgetsCount: result.success ? result.data.widgets.length : 0,
            hasError: !result.success,
        });

        return handleServiceResult(res, result, 200);
    }
);

/**
 * POST /api/ai/refine-widgets-db
 * Raffine des widgets sauvegardés dans MongoDB
 */
router.post(
    "/refine-widgets-db",
    requireAuth,
    requirePermission("widget:canUpdate"),
    async (req: AuthRequest, res: Response) => {
        const { dataSourceId, widgetIds, refinementPrompt } = req.body;

        console.log("📥 [AI Route] POST /api/ai/refine-widgets-db", {
            userId: req.user?.id,
            dataSourceId,
            widgetIdsCount: widgetIds?.length,
            prompt: refinementPrompt?.substring(0, 100),
        });

        if (!dataSourceId || !widgetIds || !refinementPrompt) {
            console.error("❌ [AI Route] Paramètres manquants pour raffinement DB");
            return res.status(400).json({
                success: false,
                message: "dataSourceId, widgetIds et refinementPrompt requis",
            });
        }

        const result = await aiWidgetService.refineWidgetsInDatabase(
            dataSourceId,
            widgetIds,
            refinementPrompt
        );

        console.log("📤 [AI Route] Réponse /refine-widgets-db:", {
            success: result.success,
            widgetsCount: result.success ? result.data.widgets.length : 0,
            hasError: !result.success,
        });

        return handleServiceResult(res, result, 200);
    }
);

/**
 * POST /api/ai/analyze-source
 * Analyse une source de données
 */
router.post(
    "/analyze-source",
    requireAuth,
    requirePermission("datasource:canView"),
    async (req: AuthRequest, res: Response) => {
        const { dataSourceId } = req.body;

        console.log("📥 [AI Route] POST /api/ai/analyze-source", {
            userId: req.user?.id,
            dataSourceId,
        });

        if (!dataSourceId) {
            console.error("❌ [AI Route] dataSourceId manquant pour analyse");
            return res
                .status(400)
                .json({ success: false, message: "dataSourceId requis" });
        }

        try {
            const analysis = await aiWidgetService.analyzeDataSource(dataSourceId);

            console.log("📤 [AI Route] Réponse /analyze-source:", {
                success: true,
                columnsCount: analysis.columns.length,
                rowCount: analysis.rowCount,
            });

            return res.status(200).json({ success: true, data: analysis });
        } catch (error: any) {
            console.error("❌ [AI Route] Erreur lors de l'analyse:", {
                message: error.message,
                stack: error.stack,
            });
            return res
                .status(500)
                .json({ success: false, message: error.message });
        }
    }
);

export default router;
