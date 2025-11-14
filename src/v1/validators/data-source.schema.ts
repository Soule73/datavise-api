/**
 * Schémas de validation Zod pour les data sources
 */

import { z } from "zod";
import { paginationQuerySchema, idParamSchema } from "./common.schema";

export { idParamSchema };

const authConfigSchema = z.object({
    token: z.string().optional(),
    apiKey: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    headerName: z.string().optional(),
}).optional();

export const createDataSourceSchema = z.object({
    name: z.string().min(2).max(100),
    type: z.enum(["json", "csv", "elasticsearch"]),
    endpoint: z.string().url().optional(),
    visibility: z.enum(["public", "private"]).default("private"),
    timestampField: z.string().optional(),
    httpMethod: z.enum(["GET", "POST"]).default("GET"),
    authType: z.enum(["none", "bearer", "apiKey", "basic"]).default("none"),
    authConfig: authConfigSchema,
    esIndex: z.string().optional(),
    esQuery: z.any().optional(),
    config: z.record(z.string(), z.unknown()).optional(),
}).superRefine((data, ctx) => {
    if (data.type === "json" && !data.endpoint) {
        ctx.addIssue({
            path: ["endpoint"],
            code: z.ZodIssueCode.custom,
            message: "endpoint est requis pour le type JSON",
        });
    }
    if (data.type === "elasticsearch") {
        if (!data.endpoint) {
            ctx.addIssue({
                path: ["endpoint"],
                code: z.ZodIssueCode.custom,
                message: "endpoint est requis pour Elasticsearch",
            });
        }
        if (!data.esIndex) {
            ctx.addIssue({
                path: ["esIndex"],
                code: z.ZodIssueCode.custom,
                message: "esIndex est requis pour Elasticsearch",
            });
        }
    }
});

export const updateDataSourceSchema = createDataSourceSchema.partial();

export const listDataSourcesQuerySchema = paginationQuerySchema.extend({
    type: z.enum(["json", "csv", "elasticsearch"]).optional(),
    visibility: z.enum(["public", "private"]).optional(),
}).strict();

export const fetchDataQuerySchema = z.object({
    from: z.string().optional(),
    to: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(1000).default(100),
    fields: z.string().optional(),
    forceRefresh: z.coerce.boolean().default(false),
    shareId: z.string().optional(),
}).strict();

export const detectColumnsSchema = z.object({
    type: z.enum(["json", "csv", "elasticsearch"]),
    endpoint: z.string().url().optional(),
    httpMethod: z.enum(["GET", "POST"]).default("GET"),
    authType: z.enum(["none", "bearer", "apiKey", "basic"]).default("none"),
    authConfig: authConfigSchema,
    esIndex: z.string().optional(),
    esQuery: z.any().optional(),
    sourceId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
}).superRefine((data, ctx) => {
    if (data.type === "json" && !data.endpoint && !data.sourceId) {
        ctx.addIssue({
            path: ["endpoint"],
            code: z.ZodIssueCode.custom,
            message: "endpoint ou sourceId requis pour le type JSON",
        });
    }
    if (data.type === "elasticsearch" && !data.endpoint && !data.sourceId) {
        ctx.addIssue({
            path: ["endpoint"],
            code: z.ZodIssueCode.custom,
            message: "endpoint ou sourceId requis pour Elasticsearch",
        });
    }
});

export type CreateDataSourceDTO = z.infer<typeof createDataSourceSchema>;
export type UpdateDataSourceDTO = z.infer<typeof updateDataSourceSchema>;
export type ListDataSourcesQuery = z.infer<typeof listDataSourcesQuerySchema>;
export type FetchDataQuery = z.infer<typeof fetchDataQuerySchema>;
export type DetectColumnsDTO = z.infer<typeof detectColumnsSchema>;
