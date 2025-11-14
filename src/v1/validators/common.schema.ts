/**
 * Schémas de validation communs utilisés dans toute l'API
 */

import { z } from "zod";

/**
 * Valide un ID MongoDB (ObjectId)
 */
export const mongoIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, {
    message: "ID MongoDB invalide",
});

/**
 * Schéma pour les paramètres de pagination
 */
export const paginationQuerySchema = z.object({
    page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1))
        .refine((val) => val > 0, { message: "Page doit être supérieure à 0" }),
    limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 10))
        .refine((val) => val > 0 && val <= 100, {
            message: "Limit doit être entre 1 et 100",
        }),
});

/**
 * Schéma pour un paramètre ID dans l'URL
 */
export const idParamSchema = z.object({
    id: mongoIdSchema,
});

/**
 * Schéma pour les champs de dates
 */
export const dateStringSchema = z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    {
        message: "Format de date invalide",
    }
);

/**
 * Types dérivés pour TypeScript
 */
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type IdParam = z.infer<typeof idParamSchema>;
