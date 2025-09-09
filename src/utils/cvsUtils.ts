import path from "path";
import fs from "fs/promises";
import csv from "csvtojson";
import axios from "axios";
import { AuthConfig, AuthType, HttpMethod } from "../types/sourceType";
import { buildFetchOptionsFromConfig } from "../utils/dataSourceUtils";

/**
 * Retourne le chemin absolu d'un fichier, en le normalisant si nécessaire
 * @param {string} filePath - Le chemin du fichier
 * @returns {string} - Le chemin absolu normalisé
 */
export function getAbsolutePath(filePath: string): string {
    return path.isAbsolute(filePath)
        ? filePath
        : path.join(process.cwd(), filePath);
}

/**
 * Récupère les données d'une source JSON distante
 * @param {string} endpoint - L'URL de la source JSON
 * @param {string} httpMethod - La méthode HTTP (GET ou POST)
 * @param {string} authType - Le type d'authentification
 * @param {object} authConfig - La configuration d'authentification
 * @param {any} body - Le corps de la requête pour POST
 * @returns {Promise<any[]>} - Un tableau d'objets représentant les données JSON
 */
export async function fetchRemoteCsv(
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

        const axiosConfig = {
            method: httpMethod.toLowerCase() as any,
            url: endpoint,
            headers: options.headers as any,
            data: options.body
        };

        const response = await axios(axiosConfig);
        const text = response.data;

        return csv().fromString(text);
    } catch (err) {
        console.error(`[fetchRemoteCsv] Erreur fetch CSV ${endpoint}:`, err);

        throw new Error(`Erreur fetch CSV: ${endpoint}`);
    }
}


/**
 * Lit un fichier CSV et le convertit en tableau d'objets
 * @param {string} filePath - Le chemin du fichier CSV
 * @returns {Promise<any[]>} - Un tableau d'objets représentant les lignes du CSV
 */
export async function readCsvFile(filePath: string): Promise<any[]> {
    try {
        const absPath = getAbsolutePath(filePath);

        const text = await fs.readFile(absPath, "utf-8");

        return csv().fromString(text);
    } catch (err) {
        console.error(`[readCsvFile] Erreur lecture CSV ${filePath}:`, err);

        throw new Error(`Erreur lecture CSV: ${filePath}`);
    }
}

