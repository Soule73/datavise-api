import { z } from "zod";
import { idParamSchema } from "./common.schema";

export const createConversationSchema = z.object({
    dataSourceId: z.string().regex(/^[0-9a-fA-F]{24}$/, "ID de source invalide"),
    title: z.string().min(3).max(200).optional(),
    initialPrompt: z.string().min(10).max(1000).optional(),
});

export const listConversationsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    dataSourceId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
});

export const addMessageSchema = z.object({
    role: z.enum(["user", "assistant"], { message: "role doit être 'user' ou 'assistant'" }),
    content: z.string().min(1, "Le contenu du message ne peut pas être vide").max(5000),
    widgetsGenerated: z.number().int().min(0).optional(),
});

export const updateConversationSchema = z.object({
    title: z.string().min(3, "Le titre doit contenir au moins 3 caractères").max(200),
});

export { idParamSchema };
