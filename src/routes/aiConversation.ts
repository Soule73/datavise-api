import { Router, Response } from "express";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import aiConversationService from "../services/aiConversationService";
import { handleServiceResult } from "../utils/api";

const router = Router();

/**
 * POST /api/ai-conversations
 * Crée une nouvelle conversation
 */
router.post(
    "/",
    requireAuth,
    async (req: AuthRequest, res: Response) => {
        const { dataSourceId, title, initialPrompt } = req.body;

        console.log("📥 [AIConversation Route] POST /", {
            userId: req.user?.id,
            dataSourceId,
            hasInitialPrompt: !!initialPrompt,
        });

        if (!dataSourceId) {
            return res
                .status(400)
                .json({ success: false, message: "dataSourceId requis" });
        }

        const result = await aiConversationService.createConversation({
            userId: req.user!.id,
            dataSourceId,
            title,
            initialPrompt,
        });

        return handleServiceResult(res, result, 201);
    }
);

/**
 * GET /api/ai-conversations
 * Récupère toutes les conversations de l'utilisateur
 */
router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
    console.log("📥 [AIConversation Route] GET /", {
        userId: req.user?.id,
    });

    const result = await aiConversationService.getUserConversations(
        req.user!.id
    );

    return handleServiceResult(res, result);
});

/**
 * GET /api/ai-conversations/:id
 * Récupère une conversation spécifique avec widgets
 */
router.get("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    console.log("📥 [AIConversation Route] GET /:id", {
        userId: req.user?.id,
        conversationId: id,
    });

    const result = await aiConversationService.getConversationById(
        id,
        req.user!.id
    );

    return handleServiceResult(res, result);
});

/**
 * POST /api/ai-conversations/:id/messages
 * Ajoute un message à une conversation
 */
router.post(
    "/:id/messages",
    requireAuth,
    async (req: AuthRequest, res: Response) => {
        const { id } = req.params;
        const { role, content, widgetsGenerated } = req.body;

        console.log("📥 [AIConversation Route] POST /:id/messages", {
            userId: req.user?.id,
            conversationId: id,
            role,
            contentLength: content?.length,
        });

        if (!role || !content) {
            return res.status(400).json({
                success: false,
                message: "role et content requis",
            });
        }

        const result = await aiConversationService.addMessage(
            id,
            req.user!.id,
            { role, content, widgetsGenerated }
        );

        return handleServiceResult(res, result);
    }
);

/**
 * PATCH /api/ai-conversations/:id
 * Met à jour le titre d'une conversation
 */
router.patch(
    "/:id",
    requireAuth,
    async (req: AuthRequest, res: Response) => {
        const { id } = req.params;
        const { title } = req.body;

        console.log("📥 [AIConversation Route] PATCH /:id", {
            userId: req.user?.id,
            conversationId: id,
            newTitle: title,
        });

        if (!title) {
            return res
                .status(400)
                .json({ success: false, message: "title requis" });
        }

        const result = await aiConversationService.updateTitle(
            id,
            req.user!.id,
            title
        );

        return handleServiceResult(res, result);
    }
);

/**
 * DELETE /api/ai-conversations/:id
 * Supprime une conversation
 */
router.delete(
    "/:id",
    requireAuth,
    async (req: AuthRequest, res: Response) => {
        const { id } = req.params;

        console.log("📥 [AIConversation Route] DELETE /:id", {
            userId: req.user?.id,
            conversationId: id,
        });

        const result = await aiConversationService.deleteConversation(
            id,
            req.user!.id
        );

        return handleServiceResult(res, result);
    }
);

export default router;
