import { ApiResponse, ApiData, ApiError, ApiSuccess } from '../../src/types/api';

/**
 * Vérifie si une réponse API est un succès (contient success: true)
 */
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccess<T> {
    return (response as ApiSuccess<T>).success === true;
}

/**
 * Vérifie si une réponse API est une erreur (contient success: false)
 */
export function isApiError<T>(response: ApiResponse<T>): response is ApiError {
    return (response as ApiError).success === false;
}

/**
 * Helper pour extraire les données d'une réponse API en succès
 */
export function getApiData<T>(response: ApiResponse<T>): T | null {
    if (isApiSuccess(response)) {
        return response.data;
    }
    return null;
}

/**
 * Helper pour extraire le message d'erreur d'une réponse API
 */
export function getApiError<T>(response: ApiResponse<T>): string | null {
    if (isApiError(response)) {
        return response.message || 'Erreur inconnue';
    }
    return null;
}
