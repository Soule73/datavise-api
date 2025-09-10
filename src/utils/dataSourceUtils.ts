// RequestInit type removed - now using AxiosRequestConfig when needed
import {
  AuthConfig, AuthType, CacheParams,
  DetectParams, FetchOptions, HttpMethod, IDataSource
} from "../types/sourceType";
import DataSource from "../models/DataSource";
import { toApiError } from "../utils/api";
import { getSourceCacheKey, sourceCache } from "../utils/sourceCache";
import Dashboard from "../models/Dashboard";
import { DashboardLayoutItem } from "../types/dashboardType";
import Widget from "../models/Widget";
import { fetchRemoteJson } from "../utils/jsonUtils";
import { fetchRemoteCsv, readCsvFile } from "../utils/cvsUtils";

// Map pour suivre les chargements en cours (anti-stampede)
const inflightLoads = new Map<string, Promise<any[]>>();

/**
 * Infère les types de colonnes à partir des données
 * @param {Record<string, any>[]} rows – Les lignes de données
 * @param {string[]} columns – Les noms des colonnes
 * @returns {Record<string, string>} – Un objet avec les types inférés pour chaque colonne
 */
export function inferColumnTypes(
  rows: Record<string, any>[],
  columns: string[]
): Record<string, string> {
  const types: Record<string, string> = {}

  // Helpers pour tester chaque valeur
  const isISODate = (val: any) =>
    typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)

  const isISODateTime = (val: any) =>
    typeof val === 'string' &&
    (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?$/.test(val) ||
      (!isISODate(val) && !isNaN(Date.parse(val))))

  const isBooleanString = (val: any) =>
    val === 'true' || val === 'false'

  const isNumberish = (val: any) =>
    val !== '' && !Array.isArray(val) && !isNaN(Number(val))

  for (const col of columns) {
    // Récupère toutes les valeurs non nulles/nondéfinies/vide
    const values = rows
      .map(row => row[col])
      .filter(v => v !== undefined && v !== null && v !== '')

    // Si pas de données, on ne sait pas ; on marque inconnu
    if (values.length === 0) {
      types[col] = 'inconnu'
      continue
    }

    // Détection d'objet pur (Map, POJO, etc.)
    if (values.every(v => typeof v === 'object' && !Array.isArray(v))) {
      types[col] = 'object'
      continue
    }

    // Détection tableau
    if (values.every(v => Array.isArray(v))) {
      types[col] = 'array'
      continue
    }

    // Date ISO (AAAA-MM-JJ)
    if (values.every(isISODate)) {
      types[col] = 'date'
      continue
    }

    // DateTime ISO (AAAA-MM-JJThh:mm:ss.sZ ou autres formats parseables)
    if (values.every(isISODateTime)) {
      types[col] = 'datetime'
      continue
    }

    // Booléen (true/false natif ou string)
    if (
      values.every(v => typeof v === 'boolean' || isBooleanString(v))
    ) {
      types[col] = 'boolean'
      continue
    }

    // Numérique (entier ou flottant)
    if (values.every(isNumberish)) {
      // Détecte si ce sont tous des entiers
      const allInt = values.every(v => Number(v) % 1 === 0)
      types[col] = allInt ? 'integer' : 'number'
      continue
    }

    // Par défaut, on considère du texte
    types[col] = 'string'
  }

  return types
}


/**
 * Nettoie un objet de plage temporelle pour l'utiliser dans des requêtes
 * @param {any} timeRange - L'objet de plage temporelle à nettoyer
 * @returns {Record<string, any>} - Un objet nettoyé avec les propriétés `from`, `to`, `intervalValue` et `intervalUnit`
 */
export function cleanTimeRange(timeRange: any): Record<string, any> {
  if (!timeRange) return {};

  if (timeRange.intervalValue && timeRange.intervalUnit) {
    return {
      intervalValue: timeRange.intervalValue,
      intervalUnit: timeRange.intervalUnit,
    };
  }
  const cleaned: any = {};
  if (timeRange.from) {
    cleaned.from =
      typeof timeRange.from === "string"
        ? new Date(timeRange.from)
        : timeRange.from;
  }
  if (timeRange.to) {
    cleaned.to =
      typeof timeRange.to === "string" ? new Date(timeRange.to) : timeRange.to;
  }

  return cleaned;
}


/**
 * Lit un fichier JSON et le convertit en tableau d'objets
 * @param {HttpMethod} httpMethod - La méthode HTTP à utiliser
 * @param {AuthType} authType - Le type d'authentification à utiliser
 * @param {AuthConfig} authConfig - La configuration d'authentification
 * @returns {Promise<any[]>} - Un tableau d'objets représentant les données du JSON
 */
export function buildFetchOptionsFromConfig(
  httpMethod: HttpMethod = "GET",
  authType: AuthType = "none",
  authConfig: AuthConfig = {},
  body?: any
): { headers: Record<string, string>; body?: any } {
  const headers: Record<string, string> = {};

  let finalBody: any = undefined;

  if (authType === "bearer" && authConfig.token) {
    headers["Authorization"] = `Bearer ${authConfig.token}`;
  } else if (authType === "apiKey" && authConfig.apiKey) {
    const headerName = authConfig.headerName || "x-api-key";

    headers[headerName] = authConfig.apiKey;
  } else if (
    authType === "basic" &&
    authConfig.username &&
    authConfig.password
  ) {
    const encoded = Buffer.from(
      `${authConfig.username}:${authConfig.password}`
    ).toString("base64");

    headers["Authorization"] = `Basic ${encoded}`;
  }

  if (httpMethod === "POST" && body) {
    if (typeof body === "string") {
      finalBody = body;
    } else {
      finalBody = JSON.stringify(body);

      headers["Content-Type"] = "application/json";
    }
  }

  return {
    headers,
    ...(finalBody ? { body: finalBody } : {}),
  };
}


/**
 * Filtre les données par un champ de timestamp
 * @param {any[]} data - Les données à filtrer
 * @param {string} field - Le nom du champ de timestamp
 * @param {string} [from] - La date de début du filtre
 * @param {string} [to] - La date de fin du filtre
 * @returns {any[]} - Les données filtrées
 */
export function filterByTimestamp(
  data: any[],
  field: string,
  from?: string,
  to?: string
): any[] {
  return data.filter((row) => {
    const ts = row[field];

    if (!ts) {
      return false;
    }

    let date: Date | null = null;

    if (typeof ts === "string" && !isNaN(Date.parse(ts))) {
      date = new Date(ts);
    } else if (typeof ts === "number") {
      date = new Date(ts);
    } else if (ts instanceof Date) {
      date = ts;
    } else {
      return false;
    }

    if (!date || isNaN(date.getTime())) {
      return false;
    }

    if (from && date < new Date(from)) {
      return false;
    }

    if (to && date > new Date(to)) {
      return false;
    }

    return true;
  });
}


/**
 * Vérifie si une source de données est autorisée pour un dashboard partagé
 * @param {string} sourceId - L'ID de la source de données
 * @param {string} shareId - L'ID du partage du dashboard
 * @returns {Promise<null | { error: ReturnType<typeof toApiError> }>} - Null si autorisé, sinon une erreur
 */
export async function verifyShareAccess(
  sourceId: string,
  shareId: string
): Promise<null | { error: ReturnType<typeof toApiError> }> {
  const dashboard = await Dashboard.findOne({
    shareId,
    shareEnabled: true
  })
  if (!dashboard) {
    return { error: toApiError("Dashboard partagé non trouvé ou désactivé.", 404) }
  }

  const widgetIds = dashboard.layout.map(
    (item: DashboardLayoutItem) => item.widgetId
  )
  const widgets = await Widget.find({ widgetId: { $in: widgetIds } }).lean()
  const dsIdSet = new Set<string>(
    widgets
      .map((w) => w.dataSourceId)
      .filter(Boolean)
      .map((id) => id.toString())
  )

  if (!dsIdSet.has(sourceId)) {
    return { error: toApiError("Source non autorisée pour ce dashboard partagé.", 403) }
  }

  return null
}


/**
 * Récupère une source de données ou renvoie une erreur
 * @param {string} sourceId - L'ID de la source de données
 * @returns {Promise<IDataSource | { error: ReturnType<typeof toApiError> }>} - La source de données ou une erreur
 */
export async function getDataSourceOrError(
  sourceId: string
): Promise<IDataSource | { error: ReturnType<typeof toApiError> }> {
  const source = await DataSource.findById(sourceId)
  if (!source) {
    return { error: toApiError("Source non trouvée.", 404) }
  }
  return source
}


/**
 * Normalise la fenêtre temporelle pour une source de données
 * @param source - La source de données
 * @param opts - Les options de récupération
 * @returns Les paramètres normalisés de la fenêtre temporelle
 */
export function normalizeTimeWindow(
  source: IDataSource,
  opts: FetchOptions
): { hasTimestamp: boolean; from?: string; to?: string } {
  const hasTimestamp = !!source.timestampField
  const from = hasTimestamp && opts.from ? opts.from : undefined
  const to = hasTimestamp && opts.to ? opts.to : undefined
  return { hasTimestamp, from, to }
}


/**
 * Calcule les paramètres de cache pour une source de données
 * @param sourceId - L'ID de la source de données
 * @param hasTimestamp - Indique si la source a un champ de timestamp
 * @param from - La date de début du cache (optionnel)
 * @param to - La date de fin du cache (optionnel)
 * @returns Les paramètres de cache avec clé et TTL
 */
export function computeCacheParams(
  sourceId: string,
  hasTimestamp: boolean,
  from?: string,
  to?: string
): CacheParams {
  const key = getSourceCacheKey(sourceId, from, to)
  let ttl = 3600
  if (hasTimestamp && from && to) {
    ttl = 60
  } else if (hasTimestamp && !from && !to) {
    ttl = 1800
  }
  return { key, ttl }
}


/**
 * Charge les lignes d'une source de données avec gestion du cache
 * @param source - La source de données à charger
 * @param cacheKey - La clé de cache pour cette source
 * @param ttl - Le temps de vie du cache en secondes
 * @param from - La date de début pour le filtrage (optionnel)
 * @param to - La date de fin pour le filtrage (optionnel)
 * @returns Les lignes chargées, soit depuis le cache, soit depuis la source
 */
export async function loadRows(
  source: IDataSource,
  cacheKey: string,
  ttl: number,
  from?: string,
  to?: string
): Promise<any[]> {
  const cached = sourceCache.get(cacheKey)
  if (cached) {
    console.log(`[CACHE] Hit ${cacheKey}`)
    return cached as any[]
  }

  if (!inflightLoads.has(cacheKey)) {
    inflightLoads.set(
      cacheKey,
      (async () => {
        try {
          let rows: any[] = []
          if (source.type === "json" && source.endpoint) {
            // Vérification spéciale pour les données de démonstration
            if (source.endpoint.includes('/api/sources/demo/ventes') ||
              source.endpoint.endsWith('/demo/ventes')) {
              console.log('[DEMO] Chargement direct des données de démonstration');
              // Charger directement les données de démonstration sans appel HTTP
              rows = require("../data/ventes-exemple.json");
            } else {
              rows = await fetchRemoteJson(
                source.endpoint,
                source.httpMethod || "GET",
                source.authType,
                source.authConfig
              )
            }
          } else if (
            source.type === "csv" &&
            (source.endpoint || source.filePath)
          ) {
            // Vérification spéciale pour les données de démonstration CSV
            if (source.endpoint && (source.endpoint.includes('/api/sources/demo/') ||
              source.endpoint.endsWith('/demo/ventes'))) {
              console.log('[DEMO] Chargement direct des données de démonstration CSV');
              // Pour les démos CSV, on peut utiliser les mêmes données JSON
              rows = require("../data/ventes-exemple.json");
            } else {
              rows = source.filePath
                ? await readCsvFile(source.filePath)
                : await fetchRemoteCsv(
                  source.endpoint!,
                  source.httpMethod!,
                  source.authType!,
                  source.authConfig
                )
            }
          }

          if (hasTimestampField(source) && source.timestampField && (from || to)) {
            rows = filterByTimestamp(
              rows,
              source.timestampField,
              from,
              to
            )
          }

          sourceCache.set(cacheKey, rows, ttl)
          return rows
        } catch (e: any) {
          throw toApiError(
            e instanceof Error ? e.message : "Erreur récupération source",
            500
          )
        } finally {
          inflightLoads.delete(cacheKey)
        }
      })()
    )
  }

  console.log(`[CACHE] Chargement en cours pour ${cacheKey}`)
  const result = (await inflightLoads.get(cacheKey)) as any[]
  console.log(`[CACHE] Chargé ${cacheKey}`)
  return result
}


/**
 * Vérifie si une source de données a un champ de timestamp
  * @param source - La source de données
  * @returns {boolean} - True si la source a un champ de timestamp, sinon false
 */
function hasTimestampField(source: IDataSource): boolean {
  return Boolean(source.timestampField)
}


/**
 * Sélectionne les champs spécifiés dans une liste de champs pour chaque ligne de données
 * @param rows - Les lignes de données
 * @param fieldList - La liste des champs à sélectionner (sous forme de chaîne, séparés par des virgules)
 * @returns Les lignes de données avec uniquement les champs sélectionnés
 */
export function selectFields(rows: any[], fieldList?: string): any[] {
  if (!fieldList) return rows
  const keys = fieldList
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean)
  return rows.map((r) =>
    Object.fromEntries(Object.entries(r).filter(([k]) => keys.includes(k)))
  )
}


/**
 * Calcule les paramètres de pagination pour une liste de lignes
 * @param rows - Les lignes de données
 * @param page - Le numéro de la page (optionnel)
 * @param pageSize - Le nombre de lignes par page (optionnel)
 * @returns Les lignes paginées et le nombre total de lignes
 */
export function paginateRows(
  rows: any[],
  page?: number,
  pageSize?: number
): { data: any[]; total?: number } {
  if (page && pageSize) {
    const total = rows.length
    const start = (page - 1) * pageSize
    return {
      data: rows.slice(start, start + pageSize),
      total
    }
  }
  return { data: rows }
}


/**
 * Récupère la configuration finale pour la détection de colonnes
 * en surchargeant avec l'entité DataSource si on passe sourceId.
 * 
 * @param {DetectParams} params - Les paramètres de détection
 * @returns {Promise<IDataSource | { error: ReturnType<typeof toApiError> }>} - La configuration résolue ou une erreur
 */
export async function resolveDetectConfig(
  params: DetectParams
): Promise<DetectParams | { error: ReturnType<typeof toApiError> }> {
  let {
    // sourceId,
    endpoint,
    filePath } = params

  if (
    // sourceId && 
    !endpoint && !filePath) {
    return { error: toApiError("Source ID fourni sans endpoint ni filePath.", 400) }
  }
  // const dataSource = await DataSource.findById(sourceId)
  // if (!dataSource) {
  //   return { error: toApiError("Source non trouvée pour la détection de colonnes.", 404) }
  // }

  return params;
}


/**
 * Lit les premières lignes d'une source CSV ou JSON distante ou locale.
 * 
 * @param {IDataSource} dataSource - La source de données à lire
 * @returns {Promise<Record<string, unknown>[]>} - Un tableau d'objets
 */
export async function fetchRowsFromSource(dataSource: DetectParams): Promise<Record<string, unknown>[]> {
  const {
    type,
    endpoint,
    filePath,
    httpMethod,
    authType,
    authConfig
  } = dataSource

  if (type === "csv") {
    if (filePath) {
      return readCsvFile(filePath)
    }
    if (endpoint) {
      return fetchRemoteCsv(endpoint, httpMethod!, authType!, authConfig)
    }
  }

  if (type === "json" && endpoint) {
    return fetchRemoteJson(endpoint, httpMethod!, authType!, authConfig)
  }

  return []
}


/**
 * Construit le résultat columns / preview / types à partir des rows
 * 
 * @param {Record<string, unknown>[]} rows - Les lignes de données
 * @returns {{ columns: string[]; preview: any[]; types: Record<string, string> }}
 *  - Un objet contenant les colonnes, la preview et les types
 */
export function buildColumnsResult(
  rows: Record<string, unknown>[]
): { columns: string[]; preview: any[]; types: Record<string, string>; } {
  const columns = rows[0] ? Object.keys(rows[0]) : []
  const preview = rows.slice(0, 5)
  const types = inferColumnTypes(preview, columns)
  return { columns, preview, types }
}