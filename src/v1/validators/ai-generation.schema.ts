import { z } from "zod";
import { idParamSchema } from "./common.schema";

export const generateWidgetsSchema = z.object({
    dataSourceId: z.string().regex(/^[0-9a-fA-F]{24}$/, "ID de source invalide"),
    conversationId: z.string().regex(/^[0-9a-fA-F]{24}$/, "ID de conversation invalide"),
    userPrompt: z.string().min(10, "Le prompt doit contenir au moins 10 caractères").max(1000).optional(),
    maxWidgets: z.number().int().min(1).max(10).default(5),
    preferredTypes: z.array(z.enum(["kpi", "bar", "line", "pie", "table", "radar", "bubble", "scatter"])).optional(),
});

export const refineWidgetsSchema = z.object({
    dataSourceId: z.string().regex(/^[0-9a-fA-F]{24}$/, "ID de source invalide"),
    currentWidgets: z.array(z.object({
        id: z.string(),
        name: z.string(),
        type: z.string(),
        config: z.record(z.string(), z.unknown()),
    })).min(1, "Au moins un widget requis"),
    refinementPrompt: z.string().min(10, "Le prompt de raffinement doit contenir au moins 10 caractères").max(1000),
});

export const refineWidgetsDbSchema = z.object({
    dataSourceId: z.string().regex(/^[0-9a-fA-F]{24}$/, "ID de source invalide"),
    widgetIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).min(1, "Au moins un ID de widget requis"),
    refinementPrompt: z.string().min(10, "Le prompt de raffinement doit contenir au moins 10 caractères").max(1000),
});

export const analyzeSourceSchema = z.object({
    dataSourceId: z.string().regex(/^[0-9a-fA-F]{24}$/, "ID de source invalide"),
});

export { idParamSchema };
