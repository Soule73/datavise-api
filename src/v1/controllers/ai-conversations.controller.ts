import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import aiConversationService from "../../services/aiConversationService";
import { ApiResponseBuilder } from "../utils/response.util";

export const createConversation = async (req: AuthRequest, res: Response) => {
    const { dataSourceId, title, initialPrompt } = req.body;

    const result = await aiConversationService.createConversation({
        userId: req.user!.id,
        dataSourceId,
        title,
        initialPrompt,
    });

    if (result.success) {
        return res.status(201).json(
            ApiResponseBuilder.success(result.data, result.message)
        );
    }

    return res.status(result.status || 500).json(
        ApiResponseBuilder.error(result.message, undefined, result.status)
    );
};

export const listConversations = async (req: AuthRequest, res: Response) => {
    const { page = 1, limit = 20, dataSourceId } = req.query;

    const result = await aiConversationService.getUserConversations(req.user!.id);

    if (result.success) {
        let conversations = result.data;

        if (dataSourceId) {
            conversations = conversations.filter(
                (conv: any) => conv.dataSourceId?._id?.toString() === dataSourceId
            );
        }

        const total = conversations.length;
        const startIndex = (Number(page) - 1) * Number(limit);
        const endIndex = startIndex + Number(limit);
        const paginatedData = conversations.slice(startIndex, endIndex);

        return res.status(200).json(
            ApiResponseBuilder.paginated(
                paginatedData,
                Number(page),
                Number(limit),
                total,
                "/api/v1/ai/conversations"
            )
        );
    }

    return res.status(result.status || 500).json(
        ApiResponseBuilder.error(result.message, undefined, result.status)
    );
};

export const getConversation = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const result = await aiConversationService.getConversationById(id, req.user!.id);

    if (result.success) {
        return res.status(200).json(
            ApiResponseBuilder.success(result.data, result.message)
        );
    }

    return res.status(result.status || 404).json(
        ApiResponseBuilder.error(result.message, undefined, result.status)
    );
};

export const addMessage = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { role, content, widgetsGenerated } = req.body;

    const result = await aiConversationService.addMessage(id, req.user!.id, {
        role,
        content,
        widgetsGenerated,
    });

    if (result.success) {
        return res.status(200).json(
            ApiResponseBuilder.success(result.data, result.message)
        );
    }

    return res.status(result.status || 500).json(
        ApiResponseBuilder.error(result.message, undefined, result.status)
    );
};

export const updateConversation = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { title } = req.body;

    const result = await aiConversationService.updateTitle(id, req.user!.id, title);

    if (result.success) {
        return res.status(200).json(
            ApiResponseBuilder.success(result.data, result.message)
        );
    }

    return res.status(result.status || 500).json(
        ApiResponseBuilder.error(result.message, undefined, result.status)
    );
};

export const deleteConversation = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const result = await aiConversationService.deleteConversation(id, req.user!.id);

    if (result.success) {
        return res.status(200).json(
            ApiResponseBuilder.success(result.data, result.message)
        );
    }

    return res.status(result.status || 500).json(
        ApiResponseBuilder.error(result.message, undefined, result.status)
    );
};
