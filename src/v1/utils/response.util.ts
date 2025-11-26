/**
 * Utilitaires pour formater les réponses API de manière standardisée
 * Conforme aux standards REST
 */

export interface ApiSuccessResponse<T> {
    success: true;
    data: T;
    message?: string;
    meta?: {
        pagination?: PaginationMeta;
        [key: string]: any;
    };
    links?: {
        self: string;
        first?: string;
        last?: string;
        next?: string | null;
        prev?: string | null;
    };
    timestamp: string;
}

export interface ApiErrorResponse {
    success: false;
    error: {
        message: string;
        code?: number;
        details?: any;
    };
    timestamp: string;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export class ApiResponseBuilder {
    /**
     * Crée une réponse de succès standardisée
     */
    static success<T>(
        data: T,
        message?: string,
        meta?: any
    ): ApiSuccessResponse<T> {
        return {
            success: true,
            data,
            message,
            meta,
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Crée une réponse d'erreur standardisée
     */
    static error(
        message: string,
        details?: any,
        statusCode?: number
    ): ApiErrorResponse {
        return {
            success: false,
            error: {
                message,
                details,
                code: statusCode,
            },
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Crée une réponse paginée standardisée avec liens HATEOAS
     */
    static paginated<T>(
        data: T[],
        page: number,
        limit: number,
        total: number,
        baseUrl: string,
        queryParams?: Record<string, string>
    ): ApiSuccessResponse<T[]> {
        const totalPages = Math.ceil(total / limit);

        const buildUrl = (pageNum: number) => {
            const params = new URLSearchParams({
                page: pageNum.toString(),
                limit: limit.toString(),
                ...queryParams,
            });
            return `${baseUrl}?${params.toString()}`;
        };

        return {
            success: true,
            data,
            meta: {
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                },
            },
            links: {
                self: buildUrl(page),
                first: buildUrl(1),
                last: buildUrl(totalPages),
                next: page < totalPages ? buildUrl(page + 1) : null,
                prev: page > 1 ? buildUrl(page - 1) : null,
            },
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Crée une réponse de création de ressource (201)
     */
    static created<T>(
        data: T,
        resourceUrl: string,
        message?: string
    ): ApiSuccessResponse<T> {
        return {
            success: true,
            data,
            message: message || "Ressource créée avec succès",
            links: {
                self: resourceUrl,
            },
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Crée une réponse de suppression (204 No Content représentée en JSON)
     */
    static deleted(message?: string): ApiSuccessResponse<null> {
        return {
            success: true,
            data: null,
            message: message || "Ressource supprimée avec succès",
            timestamp: new Date().toISOString(),
        };
    }
}
