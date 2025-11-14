/**
 * Schémas de validation Zod pour les dashboards
 */

import { z } from "zod";
import { paginationQuerySchema, idParamSchema } from "./common.schema";

export { idParamSchema };

/**
 * Schéma pour un élément de layout
 */
const layoutItemSchema = z.object({
    widgetId: z.string().min(1),
    width: z.string().min(1),
    height: z.number().int().positive(),
    x: z.number().int().min(0),
    y: z.number().int().min(0),
});

/**
 * Schéma pour la plage temporelle
 */
const timeRangeSchema = z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    intervalValue: z.number().int().positive().optional(),
    intervalUnit: z.enum(["minute", "hour", "day", "week", "month"]).optional(),
});

/**
 * Visibilité des dashboards
 */
const visibilityEnum = z.enum(["public", "private"]);

/**
 * Schéma pour la création d'un dashboard
 */
export const createDashboardSchema = z.object({
    title: z
        .string()
        .min(3, "Le titre doit contenir au moins 3 caractères")
        .max(100, "Le titre ne peut pas dépasser 100 caractères"),
    layout: z.array(layoutItemSchema).default([]),
    visibility: visibilityEnum.optional().default("private"),
    autoRefreshIntervalValue: z.number().int().positive().optional(),
    autoRefreshIntervalUnit: z
        .enum(["second", "minute", "hour"])
        .optional(),
    timeRange: timeRangeSchema.optional(),
});

/**
 * Schéma pour la mise à jour d'un dashboard
 */
export const updateDashboardSchema = z
    .object({
        title: z
            .string()
            .min(3, "Le titre doit contenir au moins 3 caractères")
            .max(100, "Le titre ne peut pas dépasser 100 caractères")
            .optional(),
        layout: z.array(layoutItemSchema).optional(),
        visibility: visibilityEnum.optional(),
        autoRefreshIntervalValue: z.number().int().positive().optional(),
        autoRefreshIntervalUnit: z
            .enum(["second", "minute", "hour"])
            .optional(),
        timeRange: timeRangeSchema.optional(),
    })
    .strict();

/**
 * Schéma pour les paramètres de requête de liste de dashboards
 */
export const listDashboardsQuerySchema = z.object({
    visibility: visibilityEnum.optional(),
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
 * Schéma pour la mise à jour du partage
 */
export const updateSharingSchema = z.object({
    enabled: z.boolean(),
});

/**
 * Types dérivés pour TypeScript
 */
export type CreateDashboardDTO = z.infer<typeof createDashboardSchema>;
export type UpdateDashboardDTO = z.infer<typeof updateDashboardSchema>;
export type ListDashboardsQuery = z.infer<typeof listDashboardsQuerySchema>;
export type UpdateSharingDTO = z.infer<typeof updateSharingSchema>;
