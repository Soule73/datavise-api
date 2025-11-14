/**
 * Schémas de validation Zod pour les widgets
 */

import { z } from "zod";
import { mongoIdSchema } from "./common.schema";

/**
 * Types de widgets supportés
 */
const widgetTypeEnum = z.enum([
    "kpi",
    "card",
    "kpiGroup",
    "bar",
    "line",
    "pie",
    "table",
    "radar",
    "bubble",
    "scatter",
]);

/**
 * Visibilité des widgets
 */
const visibilityEnum = z.enum(["public", "private"]);

/**
 * Configuration générique d'un widget
 */
const widgetConfigSchema = z
    .object({
        metrics: z.array(z.any()).optional(),
        buckets: z.array(z.any()).optional(),
        globalFilters: z.array(z.any()).optional(),
        styles: z.record(z.string(), z.any()).optional(),
    })
    .passthrough();

/**
 * Schéma pour la création d'un widget
 */
export const createWidgetSchema = z.object({
    widgetId: z.string().min(1, "widgetId est requis"),
    title: z
        .string()
        .min(3, "Le titre doit contenir au moins 3 caractères")
        .max(100, "Le titre ne peut pas dépasser 100 caractères"),
    type: widgetTypeEnum,
    dataSourceId: mongoIdSchema,
    config: widgetConfigSchema.optional(),
    visibility: visibilityEnum.optional().default("private"),
    isGeneratedByAI: z.boolean().optional().default(false),
    conversationId: mongoIdSchema.optional(),
    isDraft: z.boolean().optional().default(false),
    description: z.string().max(500).optional(),
    reasoning: z.string().max(1000).optional(),
    confidence: z.number().min(0).max(1).optional(),
});

/**
 * Schéma pour la mise à jour d'un widget
 */
export const updateWidgetSchema = z
    .object({
        title: z
            .string()
            .min(3, "Le titre doit contenir au moins 3 caractères")
            .max(100, "Le titre ne peut pas dépasser 100 caractères")
            .optional(),
        type: widgetTypeEnum.optional(),
        dataSourceId: mongoIdSchema.optional(),
        config: widgetConfigSchema.optional(),
        visibility: visibilityEnum.optional(),
        isDraft: z.boolean().optional(),
        description: z.string().max(500).optional(),
    })
    .strict();

/**
 * Schéma pour les paramètres de requête de liste de widgets
 */
export const listWidgetsQuerySchema = z.object({
    type: widgetTypeEnum.optional(),
    visibility: visibilityEnum.optional(),
    dataSourceId: mongoIdSchema.optional(),
    isDraft: z
        .string()
        .optional()
        .transform((val) => val === "true"),
    isGeneratedByAI: z
        .string()
        .optional()
        .transform((val) => val === "true"),
    page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 10)),
});

/**
 * Types dérivés pour TypeScript
 */
export type CreateWidgetDTO = z.infer<typeof createWidgetSchema>;
export type UpdateWidgetDTO = z.infer<typeof updateWidgetSchema>;
export type ListWidgetsQuery = z.infer<typeof listWidgetsQuerySchema>;
