import axios, { AxiosRequestConfig } from "axios";
import { buildFetchOptionsFromConfig } from "../utils/dataSourceUtils";
import { AuthConfig, AuthType, HttpMethod } from "../types/sourceType";

/**
 * Récupère les données d'une source JSON distante
 * @param {string} endpoint - L'URL de la source JSON
 * @param {string} httpMethod - La méthode HTTP (GET ou POST)
 * @param {string} authType - Le type d'authentification
 * @param {object} authConfig - La configuration d'authentification
 * @param {any} body - Le corps de la requête pour POST
 * @returns {Promise<any[]>} - Un tableau d'objets représentant les données JSON
 */
export async function fetchRemoteJson(
    endpoint: string,
    httpMethod: HttpMethod = "GET",
    authType: AuthType = "none",
    authConfig: AuthConfig = {},
    body?: any
): Promise<any[]> {
    try {
        const options = buildFetchOptionsFromConfig(
            httpMethod,
            authType,
            authConfig,
            body
        );

        const axiosConfig: AxiosRequestConfig = {
            method: httpMethod.toLowerCase() as any,
            url: endpoint,
            headers: options.headers as any,
            data: options.body
        };

        const response = await axios(axiosConfig);
        const data = response.data;

        return Array.isArray(data) ? data : [data];
    } catch (err) {
        console.error(`[fetchRemoteJson] Erreur fetch JSON ${endpoint}:`, err);

        throw new Error(`Erreur fetch JSON: ${endpoint}`);
    }
}