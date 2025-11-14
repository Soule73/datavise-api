import { Router } from "express";
import { requireAuth } from "../../../middleware/auth";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate.middleware";
import {
    createConversationSchema,
    listConversationsQuerySchema,
    addMessageSchema,
    updateConversationSchema,
    idParamSchema,
} from "../../validators/ai-conversation.schema";
import * as conversationsController from "../../controllers/ai-conversations.controller";

const router = Router();

/**
 * @openapi
 * /api/v1/ai/conversations:
 *   post:
 *     summary: Créer une nouvelle conversation AI
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [dataSourceId]
 *             properties:
 *               dataSourceId:
 *                 type: string
 *               title:
 *                 type: string
 *               initialPrompt:
 *                 type: string
 *     responses:
 *       201:
 *         description: Conversation créée
 *       400:
 *         description: Paramètres invalides
 */
router.post(
    "/",
    requireAuth,
    validateBody(createConversationSchema),
    conversationsController.createConversation
);

/**
 * @openapi
 * /api/v1/ai/conversations:
 *   get:
 *     summary: Lister les conversations de l'utilisateur
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
 *       - in: query
 *         name: dataSourceId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Liste des conversations paginée
 */
router.get(
    "/",
    requireAuth,
    validateQuery(listConversationsQuerySchema),
    conversationsController.listConversations
);

/**
 * @openapi
 * /api/v1/ai/conversations/{id}:
 *   get:
 *     summary: Récupérer une conversation avec widgets
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Conversation trouvée
 *       404:
 *         description: Conversation introuvable
 */
router.get(
    "/:id",
    requireAuth,
    validateParams(idParamSchema),
    conversationsController.getConversation
);

/**
 * @openapi
 * /api/v1/ai/conversations/{id}/messages:
 *   post:
 *     summary: Ajouter un message à la conversation
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role, content]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, assistant]
 *               content:
 *                 type: string
 *               widgetsGenerated:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Message ajouté
 */
router.post(
    "/:id/messages",
    requireAuth,
    validateParams(idParamSchema),
    validateBody(addMessageSchema),
    conversationsController.addMessage
);

/**
 * @openapi
 * /api/v1/ai/conversations/{id}:
 *   patch:
 *     summary: Mettre à jour le titre d'une conversation
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       200:
 *         description: Titre mis à jour
 */
router.patch(
    "/:id",
    requireAuth,
    validateParams(idParamSchema),
    validateBody(updateConversationSchema),
    conversationsController.updateConversation
);

/**
 * @openapi
 * /api/v1/ai/conversations/{id}:
 *   delete:
 *     summary: Supprimer une conversation
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Conversation supprimée
 *       404:
 *         description: Conversation introuvable
 */
router.delete(
    "/:id",
    requireAuth,
    validateParams(idParamSchema),
    conversationsController.deleteConversation
);

export default router;
