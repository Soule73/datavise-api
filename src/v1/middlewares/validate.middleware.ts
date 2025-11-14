/**
 * Utilitaires pour la validation des requêtes avec Zod
 */

import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ApiResponseBuilder } from "../utils/response.util";

/**
 * Formate les erreurs de validation Zod pour l'API
 */
const formatZodError = (error: ZodError) => {
    return error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
        code: err.code,
    }));
};

/**
 * Middleware de validation du corps de la requête
 */
export const validateBody = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = await schema.parseAsync(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = formatZodError(error);
                return res.status(400).json(
                    ApiResponseBuilder.error(
                        "Erreur de validation",
                        formattedErrors,
                        400
                    )
                );
            }
            next(error);
        }
    };
};

/**
 * Middleware de validation des paramètres de requête (query string)
 */
export const validateQuery = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = await schema.parseAsync(req.query);
            req.query = validated as any;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = formatZodError(error);
                return res.status(400).json(
                    ApiResponseBuilder.error(
                        "Erreur de validation des paramètres",
                        formattedErrors,
                        400
                    )
                );
            }
            next(error);
        }
    };
};

/**
 * Middleware de validation des paramètres de route (params)
 */
export const validateParams = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = await schema.parseAsync(req.params);
            req.params = validated as any;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = formatZodError(error);
                return res.status(400).json(
                    ApiResponseBuilder.error(
                        "Erreur de validation des paramètres de route",
                        formattedErrors,
                        400
                    )
                );
            }
            next(error);
        }
    };
};
