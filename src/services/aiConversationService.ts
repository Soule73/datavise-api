import AIConversation, { IAIMessage } from "../models/AIConversation";
import Widget from "../models/Widget";
import DataSource from "../models/DataSource";
import type { ApiResponse } from "../types/api";
import { toApiSuccess, toApiError } from "../utils/api";
import type { Types } from "mongoose";

interface CreateConversationData {
    userId: string;
    dataSourceId: string;
    title?: string;
    initialPrompt?: string;
}

interface AddMessageData {
    role: "user" | "assistant";
    content: string;
    widgetsGenerated?: number;
}

/**
 * Service pour gérer les conversations AI Builder
 */
const aiConversationService = {
    /**
     * Crée une nouvelle conversation
     */
    async createConversation(
        data: CreateConversationData
    ): Promise<ApiResponse<any>> {
        try {
            const source = await DataSource.findById(data.dataSourceId);
            if (!source) {
                return toApiError("Source de données introuvable", 404);
            }

            const title =
                data.title ||
                `Conversation - ${source.name} - ${new Date().toLocaleDateString("fr-FR")}`;

            const conversation = new AIConversation({
                userId: data.userId,
                dataSourceId: data.dataSourceId,
                title,
                messages: data.initialPrompt
                    ? [
                        {
                            role: "user",
                            content: data.initialPrompt,
                            timestamp: new Date(),
                        },
                    ]
                    : [],
            });

            await conversation.save();

            console.log("✅ [AIConversation] Conversation créée:", {
                id: conversation._id,
                title: conversation.title,
            });

            return toApiSuccess(conversation, "Conversation créée avec succès");
        } catch (error: any) {
            console.error("❌ [AIConversation] Erreur création:", error);
            return toApiError(
                error.message || "Erreur lors de la création de la conversation",
                500
            );
        }
    },

    /**
     * Récupère toutes les conversations d'un utilisateur
     */
    async getUserConversations(userId: string): Promise<ApiResponse<any>> {
        try {
            const conversations = await AIConversation.find({ userId })
                .populate("dataSourceId", "name type")
                .sort({ updatedAt: -1 })
                .lean();

            console.log(
                `📋 [AIConversation] ${conversations.length} conversations trouvées pour user ${userId}`
            );

            return toApiSuccess(conversations);
        } catch (error: any) {
            console.error("❌ [AIConversation] Erreur récupération:", error);
            return toApiError(
                error.message || "Erreur lors de la récupération des conversations",
                500
            );
        }
    },

    /**
     * Récupère une conversation par ID avec widgets complets
     */
    async getConversationById(
        conversationId: string,
        userId: string
    ): Promise<ApiResponse<any>> {
        try {
            const conversation = await AIConversation.findOne({
                _id: conversationId,
                userId,
            })
                .populate("dataSourceId", "name type")
                .lean();

            if (!conversation) {
                return toApiError("Conversation introuvable", 404);
            }

            // Récupérer tous les widgets liés à cette conversation
            const widgets = await Widget.find({
                conversationId: conversationId,
                ownerId: userId,
            })
                .sort({ createdAt: 1 })
                .lean();

            console.log("📖 [AIConversation] Conversation chargée:", {
                id: conversation._id,
                widgetsCount: widgets.length,
                messagesCount: conversation.messages.length,
            });

            return toApiSuccess({
                ...conversation,
                widgets, // ✅ Widgets récupérés via conversationId
            });
        } catch (error: any) {
            console.error("❌ [AIConversation] Erreur chargement:", error);
            return toApiError(
                error.message || "Erreur lors du chargement de la conversation",
                500
            );
        }
    },

    /**
     * Ajoute un message à une conversation
     */
    async addMessage(
        conversationId: string,
        userId: string,
        messageData: AddMessageData
    ): Promise<ApiResponse<any>> {
        try {
            const conversation = await AIConversation.findOne({
                _id: conversationId,
                userId,
            });

            if (!conversation) {
                return toApiError("Conversation introuvable", 404);
            }

            const message: IAIMessage = {
                role: messageData.role,
                content: messageData.content,
                timestamp: new Date(),
                widgetsGenerated: messageData.widgetsGenerated,
            };

            conversation.messages.push(message);
            await conversation.save();

            console.log("💬 [AIConversation] Message ajouté:", {
                conversationId,
                role: message.role,
                contentLength: message.content.length,
            });

            return toApiSuccess(conversation, "Message ajouté avec succès");
        } catch (error: any) {
            console.error("❌ [AIConversation] Erreur ajout message:", error);
            return toApiError(
                error.message || "Erreur lors de l'ajout du message",
                500
            );
        }
    },

    /**
     * Met à jour le titre d'une conversation
     */
    async updateTitle(
        conversationId: string,
        userId: string,
        title: string
    ): Promise<ApiResponse<any>> {
        try {
            const conversation = await AIConversation.findOneAndUpdate(
                { _id: conversationId, userId },
                { title },
                { new: true }
            );

            if (!conversation) {
                return toApiError("Conversation introuvable", 404);
            }

            console.log("✏️ [AIConversation] Titre mis à jour:", {
                conversationId,
                newTitle: title,
            });

            return toApiSuccess(conversation, "Titre mis à jour avec succès");
        } catch (error: any) {
            console.error("❌ [AIConversation] Erreur mise à jour titre:", error);
            return toApiError(
                error.message || "Erreur lors de la mise à jour du titre",
                500
            );
        }
    },

    /**
     * Supprime une conversation
     */
    async deleteConversation(
        conversationId: string,
        userId: string
    ): Promise<ApiResponse<any>> {
        try {
            const conversation = await AIConversation.findOneAndDelete({
                _id: conversationId,
                userId,
            });

            if (!conversation) {
                return toApiError("Conversation introuvable", 404);
            }

            console.log("🗑️ [AIConversation] Conversation supprimée:", {
                conversationId,
            });

            return toApiSuccess(
                { deletedId: conversationId },
                "Conversation supprimée avec succès"
            );
        } catch (error: any) {
            console.error("❌ [AIConversation] Erreur suppression:", error);
            return toApiError(
                error.message || "Erreur lors de la suppression de la conversation",
                500
            );
        }
    },
};

export default aiConversationService;
