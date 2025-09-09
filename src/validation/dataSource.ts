import { z } from "zod";

export const dataSourceSchema = z.object({
    name: z.string().min(2, { message: "Le nom de la source est requis" }),
    type: z.enum(["json", "csv", "elasticsearch"], { message: "Le type est requis" }),
    endpoint: z.string().optional(),
    esIndex: z.string().optional(),
    esQuery: z.any().optional(),
    httpMethod: z.enum(["GET", "POST"]).optional(),
    authType: z.enum(["none", "bearer", "apiKey", "basic"]).optional(),
    authConfig: z.object({
        token: z.string().optional(),
        apiKey: z.string().optional(),
        username: z.string().optional(),
        password: z.string().optional(),
        headerName: z.string().optional(),
    }).optional(),
    timestampField: z.string().optional(),
    filePath: z.string().optional(),
    ownerId: z.any().optional(),
}).superRefine((data, ctx) => {
    if ((data.type === "json" || data.type === "elasticsearch") && (!data.endpoint || data.endpoint.trim() === "")) {
        ctx.addIssue({
            code: "custom",
            path: ["endpoint"],
            message: "L'endpoint est requis",
        });
    }
    if (data.type === "json" && data.endpoint && !/^https?:\/\//.test(data.endpoint)) {
        ctx.addIssue({
            code: "custom",
            path: ["endpoint"],
            message: "URL de la source invalide",
        });
    }
    if (data.type === "csv" && data.endpoint && data.endpoint.trim() !== "" && !/^https?:\/\//.test(data.endpoint)) {
        ctx.addIssue({
            code: "custom",
            path: ["endpoint"],
            message: "URL de la source invalide",
        });
    }
    if (data.type === "elasticsearch") {
        if (!data.endpoint || data.endpoint.trim() === "") {
            ctx.addIssue({
                code: "custom",
                path: ["endpoint"],
                message: "L'endpoint Elasticsearch est requis",
            });
        }
        if (!data.esIndex || data.esIndex.trim() === "") {
            ctx.addIssue({
                code: "custom",
                path: ["esIndex"],
                message: "L'index Elasticsearch est requis",
            });
        }
    }
    if (data.authType === "bearer" && (!data.authConfig?.token || data.authConfig.token.trim() === "")) {
        ctx.addIssue({
            code: "custom",
            path: ["authConfig", "token"],
            message: "Le token Bearer est requis",
        });
    }
    if (data.authType === "apiKey" && (!data.authConfig?.apiKey || data.authConfig.apiKey.trim() === "")) {
        ctx.addIssue({
            code: "custom",
            path: ["authConfig", "apiKey"],
            message: "La clé API est requise",
        });
    }
    if (data.authType === "basic") {
        if (!data.authConfig?.username || data.authConfig.username.trim() === "") {
            ctx.addIssue({
                code: "custom",
                path: ["authConfig", "username"],
                message: "Le nom d'utilisateur est requis",
            });
        }
        if (!data.authConfig?.password || data.authConfig.password.trim() === "") {
            ctx.addIssue({
                code: "custom",
                path: ["authConfig", "password"],
                message: "Le mot de passe est requis",
            });
        }
    }
});

export type DataSourceForm = z.infer<typeof dataSourceSchema>;
