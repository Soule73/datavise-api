/**
 * Configuration Swagger/OpenAPI pour la documentation de l'API
 */

import swaggerJsdoc from "swagger-jsdoc";

const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "DataVise API",
        version: "1.0.0",
        description:
            "API REST pour la plateforme DataVise - Création et gestion de dashboards avec visualisations de données",
        contact: {
            name: "Équipe DataVise",
            url: "https://github.com/Soule73/datavise",
        },
        license: {
            name: "MIT",
            url: "https://opensource.org/licenses/MIT",
        },
    },
    servers: [
        {
            url: "http://localhost:7000",
            description: "Serveur de développement",
        },
        {
            url: "https://api.datavise.vercel.app",
            description: "Serveur de production",
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
                description: "Token JWT obtenu via /api/auth/login",
            },
        },
        schemas: {
            ApiSuccessResponse: {
                type: "object",
                properties: {
                    success: {
                        type: "boolean",
                        example: true,
                    },
                    data: {
                        type: "object",
                        description: "Données de la réponse",
                    },
                    message: {
                        type: "string",
                        example: "Opération réussie",
                    },
                    meta: {
                        type: "object",
                        properties: {
                            pagination: {
                                type: "object",
                                properties: {
                                    page: { type: "integer" },
                                    limit: { type: "integer" },
                                    total: { type: "integer" },
                                    totalPages: { type: "integer" },
                                },
                            },
                        },
                    },
                    links: {
                        type: "object",
                        properties: {
                            self: { type: "string" },
                            first: { type: "string" },
                            last: { type: "string" },
                            next: { type: "string", nullable: true },
                            prev: { type: "string", nullable: true },
                        },
                    },
                    timestamp: {
                        type: "string",
                        format: "date-time",
                    },
                },
            },
            ApiErrorResponse: {
                type: "object",
                properties: {
                    success: {
                        type: "boolean",
                        example: false,
                    },
                    error: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string",
                                example: "Erreur de validation",
                            },
                            code: {
                                type: "integer",
                                example: 400,
                            },
                            details: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        field: { type: "string" },
                                        message: { type: "string" },
                                        code: { type: "string" },
                                    },
                                },
                            },
                        },
                    },
                    timestamp: {
                        type: "string",
                        format: "date-time",
                    },
                },
            },
            Widget: {
                type: "object",
                properties: {
                    _id: {
                        type: "string",
                        example: "507f1f77bcf86cd799439011",
                    },
                    widgetId: {
                        type: "string",
                        example: "widget-abc123",
                    },
                    title: {
                        type: "string",
                        example: "Ventes mensuelles",
                    },
                    type: {
                        type: "string",
                        enum: [
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
                        ],
                        example: "bar",
                    },
                    dataSourceId: {
                        type: "string",
                        example: "507f1f77bcf86cd799439011",
                    },
                    config: {
                        type: "object",
                        example: {
                            metrics: [{ field: "montant", aggregation: "sum" }],
                            buckets: [{ field: "mois" }],
                        },
                    },
                    ownerId: {
                        type: "string",
                        example: "507f1f77bcf86cd799439011",
                    },
                    visibility: {
                        type: "string",
                        enum: ["public", "private"],
                        default: "private",
                    },
                    isGeneratedByAI: {
                        type: "boolean",
                        default: false,
                    },
                    isDraft: {
                        type: "boolean",
                        default: false,
                    },
                    description: {
                        type: "string",
                        example: "Analyse des ventes par mois",
                    },
                    createdAt: {
                        type: "string",
                        format: "date-time",
                    },
                    updatedAt: {
                        type: "string",
                        format: "date-time",
                    },
                },
            },
            Dashboard: {
                type: "object",
                properties: {
                    _id: {
                        type: "string",
                        example: "507f1f77bcf86cd799439011",
                    },
                    title: {
                        type: "string",
                        example: "Dashboard Ventes Q1",
                    },
                    description: {
                        type: "string",
                        example: "Analyse des ventes du premier trimestre",
                    },
                    layout: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                widgetId: { type: "string" },
                                x: { type: "integer" },
                                y: { type: "integer" },
                                w: { type: "integer" },
                                h: { type: "integer" },
                            },
                        },
                    },
                    ownerId: {
                        type: "string",
                        example: "507f1f77bcf86cd799439011",
                    },
                    visibility: {
                        type: "string",
                        enum: ["public", "private"],
                        default: "private",
                    },
                    isShared: {
                        type: "boolean",
                        default: false,
                    },
                    shareId: {
                        type: "string",
                        nullable: true,
                    },
                    createdAt: {
                        type: "string",
                        format: "date-time",
                    },
                    updatedAt: {
                        type: "string",
                        format: "date-time",
                    },
                },
            },
            DataSource: {
                type: "object",
                properties: {
                    _id: {
                        type: "string",
                        example: "507f1f77bcf86cd799439011",
                    },
                    name: {
                        type: "string",
                        example: "API Ventes",
                    },
                    type: {
                        type: "string",
                        enum: ["json", "csv", "elasticsearch"],
                        example: "json",
                    },
                    endpoint: {
                        type: "string",
                        example: "https://api.example.com/sales",
                    },
                    filePath: {
                        type: "string",
                        nullable: true,
                    },
                    ownerId: {
                        type: "string",
                        example: "507f1f77bcf86cd799439011",
                    },
                    visibility: {
                        type: "string",
                        enum: ["public", "private"],
                        default: "private",
                    },
                    httpMethod: {
                        type: "string",
                        enum: ["GET", "POST"],
                        default: "GET",
                    },
                    authType: {
                        type: "string",
                        enum: ["none", "bearer", "apiKey"],
                        default: "none",
                    },
                    createdAt: {
                        type: "string",
                        format: "date-time",
                    },
                    updatedAt: {
                        type: "string",
                        format: "date-time",
                    },
                },
            },
            User: {
                type: "object",
                properties: {
                    _id: {
                        type: "string",
                        example: "507f1f77bcf86cd799439011",
                    },
                    username: {
                        type: "string",
                        example: "johndoe",
                    },
                    email: {
                        type: "string",
                        format: "email",
                        example: "john@example.com",
                    },
                    roleId: {
                        type: "string",
                        example: "507f1f77bcf86cd799439011",
                    },
                    createdAt: {
                        type: "string",
                        format: "date-time",
                    },
                    updatedAt: {
                        type: "string",
                        format: "date-time",
                    },
                },
            },
            Role: {
                type: "object",
                properties: {
                    _id: {
                        type: "string",
                        example: "507f1f77bcf86cd799439011",
                    },
                    name: {
                        type: "string",
                        example: "admin",
                    },
                    description: {
                        type: "string",
                        example: "Administrateur du système",
                    },
                    permissions: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                    },
                    canDelete: {
                        type: "boolean",
                        description: "Indique si le rôle peut être supprimé",
                    },
                },
            },
            Permission: {
                type: "object",
                properties: {
                    _id: {
                        type: "string",
                        example: "507f1f77bcf86cd799439011",
                    },
                    name: {
                        type: "string",
                        example: "dashboard:canView",
                    },
                    description: {
                        type: "string",
                        example: "Voir les dashboards",
                    },
                },
            },
            AIConversation: {
                type: "object",
                properties: {
                    _id: {
                        type: "string",
                        example: "507f1f77bcf86cd799439011",
                    },
                    userId: {
                        type: "string",
                        example: "507f1f77bcf86cd799439011",
                    },
                    dataSourceId: {
                        type: "string",
                        example: "507f1f77bcf86cd799439011",
                    },
                    title: {
                        type: "string",
                        example: "Analyse des ventes",
                    },
                    messages: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                role: {
                                    type: "string",
                                    enum: ["user", "assistant"],
                                },
                                content: {
                                    type: "string",
                                },
                                timestamp: {
                                    type: "string",
                                    format: "date-time",
                                },
                                widgetsGenerated: {
                                    type: "integer",
                                    minimum: 0,
                                },
                            },
                        },
                    },
                    widgetIds: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                    },
                    createdAt: {
                        type: "string",
                        format: "date-time",
                    },
                    updatedAt: {
                        type: "string",
                        format: "date-time",
                    },
                },
            },
        },
    },
    tags: [
        {
            name: "Auth",
            description: "Authentification et gestion des utilisateurs",
        },
        {
            name: "Widgets",
            description: "Gestion des widgets de visualisation",
        },
        {
            name: "Dashboards",
            description: "Gestion des tableaux de bord",
        },
        {
            name: "Data Sources",
            description: "Gestion des sources de données",
        },
        {
            name: "AI",
            description: "Génération de widgets par IA",
        },
    ],
};

const options: swaggerJsdoc.Options = {
    swaggerDefinition,
    apis: [
        "./src/v1/routes/*.ts",
        "./src/v1/routes/**/*.ts",
        "./src/routes/*.ts",
    ],
};

export const swaggerSpec = swaggerJsdoc(options);
