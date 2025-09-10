import { ApiData, ApiError, ApiResponse, ApiSuccess } from "../types/api";
import { Response } from "express";

/**
 * Gère la réponse d'un service API en fonction du résultat.
 * Si le résultat contient une erreur, renvoie un statut d'erreur avec le message.
 * Sinon, renvoie les données avec un statut de succès.
 *
 * @param {Response} res - La réponse Express.
 * @param {ApiResponse<T>} result - Le résultat du service API.
 * @param {number} [successStatus=200] - Le statut de succès à renvoyer (par défaut 200).
 * @returns {Response} La réponse Express avec les données ou l'erreur.
 */
export function handleServiceResult<T>(
  res: Response,
  result: ApiResponse<T>,
  successStatus: number = 200
): Response {
  if (!result.success) {
    return res.status(result.status || 400).json(result);
  }
  return res.status(successStatus).json(result);
}

/**
 * Convertit des données en format API de succès.
 * @template T - Le type des données à convertir.
 * @param {T} data - Les données à convertir.
 * @param {string} [message] - Message de succès optionnel.
 * @return {ApiSuccess<T>} - Les données converties au format API de succès.
 */
export function toApiSuccess<T>(data: T, message?: string): ApiSuccess<T> {
  return {
    success: true,
    data: data,
    ...(message && { message })
  };
}

/**
 * Convertit des données en format API (legacy).
 * @template T - Le type des données à convertir.
 * @param {T} data - Les données à convertir.
 * @return {ApiData<T>} - Les données converties au format API.
 */
export function toApiData<T>(data: T): ApiData<T> {
  return { data: data };
}

/**
 * Convertit un message d'erreur en format API.
 * @param {string} message - Le message d'erreur à convertir.
 * @param {number} [status=400] - Le statut HTTP de l'erreur (par défaut 400).
 * @param {Record<string, string>} [errors] - Un objet d'erreurs clé/valeur.
 * @return {ApiError} - L'erreur convertie au format API.
 */
export function toApiError(message: string, status: number = 400, errors?: Record<string, string>): ApiError {
  return {
    success: false,
    message: message,
    errors: errors || {},
    status: status
  };
}
