import DataSource from "../models/DataSource";
import Widget from "../models/Widget";
import {
  buildColumnsResult,
  computeCacheParams,
  fetchRowsFromSource,
  getDataSourceOrError,
  inferColumnTypes,
  loadRows,
  normalizeTimeWindow,
  paginateRows,
  resolveDetectConfig,
  selectFields,
  verifyShareAccess,
} from "../utils/dataSourceUtils";
import fs from "fs/promises";
import type {
  DataSourceCreatePayload,
  DataSourceUpdatePayload,
  DetectParams,
  FetchOptions,
  IDataSource,
} from "../types/sourceType";
import type { ApiResponse } from "../types/api";
import { sourceCache } from "../utils/sourceCache";
import { toApiError, toApiSuccess } from "../utils/api";
import { dataSourceSchema } from "../validation/dataSource";
import { buildErrorObject } from "../utils/validationUtils";
import {
  detectColumnsElasticsearch,
  fetchElasticsearchData
} from "../utils/elasticsearchuUtils";
import { getAbsolutePath } from "../utils/cvsUtils";

/**
 * Service de gestion des sources de données (DataSource).
 * Fournit les opérations CRUD, la détection de colonnes et la récupération de données avec gestion du cache et accès public via shareId.
 */
const dataSourceService = {
  /**
   * Liste toutes les sources de données avec indication d'utilisation par au moins un widget.
   * Chaque source est enrichie d'un champ `isUsed` indiquant si elle est utilisée par au moins un widget.
   * @return {Promise<ApiResponse<(DataSource & { isUsed: boolean })[]>>} - La liste des sources de données avec leur état d'utilisation.
   * @return {ApiError} - Si une erreur se produit lors de la récupération des sources de données.
   * @description Cette méthode récupère toutes les sources de données depuis la base de données,
   */
  async list(): Promise<ApiResponse<(IDataSource & { isUsed: boolean })[]>> {
    const sources = await DataSource.find();

    const sourcesWithUsage = await Promise.all(
      sources.map(async (ds) => {
        const count = await Widget.countDocuments({ dataSourceId: ds._id });
        return { ...ds.toObject(), isUsed: count > 0 };
      })
    );

    return toApiSuccess(sourcesWithUsage, "Sources récupérées avec succès");
  },


  /**
   * Crée une nouvelle source de données.
   * @param {DataSourceCreatePayload} payload - Les données de la source à créer.
   * @return {Promise<ApiResponse<object>>} - La réponse contenant la source créée ou
   * une erreur si la création échoue.
   * @throws {ApiError} - Si des champs requis sont manquants ou si
   * la source ne peut pas être créée.
   * @description Cette méthode crée une nouvelle source de données dans la base de données.
   */
  async create(
    payload: DataSourceCreatePayload
  ): Promise<ApiResponse<IDataSource>> {
    const parseResult = dataSourceSchema.safeParse(payload);
    if (!parseResult.success) {
      const errorObj: Record<string, string> = buildErrorObject(parseResult.error.issues);
      return toApiError("Erreur de validation", 400, errorObj);
    }

    const source = await DataSource.create(
      parseResult.data,
    );

    return toApiSuccess(source);
  },


  /**
   * Récupère une source de données par son identifiant.
   * @param {string} id - L'identifiant de la source à récupérer.
   * @return {Promise<ApiResponse<IDataSource & { isUsed: boolean }>>} - La réponse contenant la source trouvée
   * ou une erreur si la source n'existe pas.
    * @throws {ApiError} - Si la source n'est pas trouvée.
    */
  async getById(
    id: string
  ): Promise<ApiResponse<IDataSource & { isUsed: boolean }>> {
    const source = await DataSource.findById(id);

    if (!source) {
      return toApiError("Source non trouvée.", 404);
    }

    const count = await Widget.countDocuments({ dataSourceId: source._id });

    return toApiSuccess({ ...source.toObject(), isUsed: count > 0 });
  },


  /**
   * Met à jour une source de données existante.
   * @param {string} id - L'identifiant de la source à mettre à jour.
   * @param {DataSourceUpdatePayload} payload - Les données de mise à jour de
   * la source.
   * @return {Promise<ApiResponse<DataSource>>} - La réponse contenant la source mise à jour
   * ou une erreur si la mise à jour échoue.
   * @throws {ApiError} - Si la source n'est pas trouvée ou si des champs requis sont manquants.
   * @description Cette méthode met à jour une source de données existante dans la base de
   * données. Elle prend en compte les champs suivants :
   */
  async update(
    id: string,
    payload: DataSourceUpdatePayload
  ): Promise<ApiResponse<IDataSource>> {
    const {
      name,
      type,
      endpoint,
      filePath,
      config,
      httpMethod,
      authType,
      authConfig,
      visibility,
      timestampField,
      esIndex,
      esQuery,
    } = payload;

    const oldSource = await DataSource.findById(id);

    if (!oldSource) {
      return toApiError("Source non trouvée", 404);
    }

    const oldFilePath = oldSource?.filePath;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (endpoint !== undefined) updateData.endpoint = endpoint;
    if (filePath !== undefined) updateData.filePath = filePath;
    if (config !== undefined) updateData.config = config;
    if (httpMethod !== undefined) updateData.httpMethod = httpMethod;
    if (authType !== undefined) updateData.authType = authType;
    if (authConfig !== undefined) updateData.authConfig = authConfig;
    if (visibility !== undefined) updateData.visibility = visibility;
    if (timestampField !== undefined) updateData.timestampField = timestampField;
    if (esIndex !== undefined) updateData.esIndex = esIndex;
    if (esQuery !== undefined) updateData.esQuery = esQuery;

    const source = await DataSource.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!source) {
      return toApiError("Source non trouvée", 404);
    }

    if (oldFilePath && filePath && oldFilePath !== filePath) {
      await fs.unlink(oldFilePath);
    }

    return toApiSuccess(source);
  },


  /**
   * Supprime une source de données si elle n'est pas utilisée par un widget.
   * @param {string} id - L'identifiant de la source à supprimer.
   * @return {Promise<ApiResponse<{ message: string }>>} - La réponse indiquant le succès de la suppression
   * ou une erreur si la source est utilisée par un widget ou si elle n'existe pas.
   * @throws {ApiError} - Si la source est utilisée par un widget ou si elle n'existe pas.
   * @description Cette méthode supprime une source de données de la base de données.
   */
  async remove(id: string): Promise<ApiResponse<{ message: string }>> {
    const count = await Widget.countDocuments({ dataSourceId: id });

    if (count > 0) {
      return toApiError(
        "Impossible de supprimer une source utilisée par au moins un widget.",
        400
      );
    }

    const source = await DataSource.findByIdAndDelete(id);

    if (!source) {
      return toApiError("Source non trouvée.", 404);
    }

    if (source.filePath) {
      try {
        const absPath = getAbsolutePath(source.filePath);
        await fs.unlink(absPath);
      } catch (e) { }
    }

    return toApiSuccess({ message: "Source supprimée." });
  },


  /**
   * Détecte les colonnes d'une source de données.
   * Cette méthode peut être utilisée pour détecter les colonnes d'un fichier CSV local ou distant,
   * ou d'une API JSON distante. Elle peut également être utilisée pour détecter les colonnes
   * d'une source de données existante en fournissant son ID.
   *
   * @param {DetectParams} params - Les paramètres de détection des colonnes.
   * @return {Promise<ApiResponse<{ columns: string[]; preview: object[]; types: Record<string, string> }>>} - La réponse contenant les colonnes détectées.
   * @throws {ApiError} - Si une erreur se produit lors de la détection des colonnes.
   */
  async detectColumns(params: DetectParams): Promise<ApiResponse<{
    columns: string[]
    preview: object[]
    types: Record<string, string>
  }>> {
    try {
      const dataSourceOrErr = await resolveDetectConfig(params)
      if ("error" in dataSourceOrErr) {
        return dataSourceOrErr.error
      }
      const dataSource = dataSourceOrErr

      // Cas Elasticsearch
      if (dataSource.type === "elasticsearch") {
        if (!dataSource.endpoint || !dataSource.esIndex) {
          return toApiError("Elasticsearch mal configuré pour la détection.", 400)
        }
        const { columns, preview } = await detectColumnsElasticsearch(dataSource)
        const types = inferColumnTypes(preview, columns)
        // return { data: { columns, preview, types } }
        return toApiSuccess({ columns, preview, types })
      }

      // Cas CSV/JSON
      const rows = await fetchRowsFromSource(dataSource)
      if (rows.length === 0) {
        return toApiError("Impossible de lire la source pour détecter les colonnes.", 400)
      }

      const result = buildColumnsResult(rows)
      return toApiSuccess(result, "Colonnes détectées avec succès")
    } catch (e: unknown) {
      return toApiError(
        e instanceof Error ? e.message : "Erreur lors de la détection des colonnes.",
        500
      )
    }
  },



  /**
   * Récupère les données d'une source de données avec gestion du cache et pagination.
   * @param {string} sourceId - L'identifiant de la source de données.
   * @param {FetchOptions} options - Les options de récupération des données (pagination, filtrage, etc.).
   * @return {Promise<ApiResponse<Record<string, any>[]> & { total?: number }>} - La réponse contenant les données récupérées.
   * @throws {ApiError} - Si la source n'est pas trouvée ou si une erreur se produit lors de la récupération des données.
   */
  async fetchData(
    sourceId: string,
    options: FetchOptions = {}
  ): Promise<ApiResponse<Record<string, any>[]> & { total?: number }> {
    try {
      // Logs de débogage pour Vercel
      console.log(`[FETCH_DATA] Début - sourceId: ${sourceId}`);
      console.log(`[FETCH_DATA] Options:`, JSON.stringify(options));
      console.log(`[FETCH_DATA] Environnement: ${process.env.NODE_ENV || 'undefined'}`);
      console.log(`[FETCH_DATA] VERCEL: ${process.env.VERCEL || 'undefined'}`);

      // 1. Vérification du partage
      if (options.shareId) {
        console.log(`[FETCH_DATA] Vérification partage pour shareId: ${options.shareId}`);
        const shareCheck = await verifyShareAccess(sourceId, options.shareId)
        if (shareCheck?.error) {
          console.log(`[FETCH_DATA] Erreur partage:`, shareCheck.error);
          return shareCheck.error;
        }
      }

      // 2. Chargement de la source
      console.log(`[FETCH_DATA] Chargement source: ${sourceId}`);
      const srcOrError = await getDataSourceOrError(sourceId)
      if ("error" in srcOrError) {
        console.log(`[FETCH_DATA] Erreur chargement source:`, srcOrError.error);
        return srcOrError.error;
      }
      const source = srcOrError as IDataSource
      console.log(`[FETCH_DATA] Source trouvée - type: ${source.type}, endpoint: ${source.endpoint}`);
      console.log(`[FETCH_DATA] Source filePath: ${source.filePath}`);
      console.log(`[FETCH_DATA] Source ownerId: ${source.ownerId}`);

      // 3. Traitement direct Elasticsearch
      if (
        source.type === "elasticsearch" &&
        source.endpoint &&
        source.esIndex
      ) {
        try {
          const res = await fetchElasticsearchData(source, {
            from: options.from,
            to: options.to,
            page: options.page,
            pageSize: options.pageSize,
            fields: options.fields
          })
          const result = toApiSuccess(res.data, "Données récupérées avec succès")
          if (res.total !== undefined) {
            (result as any).total = res.total
          }
          return result
        } catch (e: any) {
          return toApiError(
            e instanceof Error ? e.message : "Erreur récupération ES",
            500
          )
        }
      }

      // 4. Préparation du cache (JSON/CSV)
      const { hasTimestamp, from, to } = normalizeTimeWindow(source, options)
      const { key: cacheKey, ttl } = computeCacheParams(
        sourceId,
        hasTimestamp,
        from,
        to
      )

      if (options.forceRefresh) {
        sourceCache.del(cacheKey)
        console.log(`[CACHE] Invalidation pour ${cacheKey}`)
      }

      // 5. Chargement des données (cache ou source)
      const rows = await loadRows(source, cacheKey, ttl, from, to)

      // 6. Filtrage des champs
      const selected = selectFields(rows, options.fields)

      // 7. Pagination
      const paginatedResult = paginateRows(selected, options.page, options.pageSize)

      const result = toApiSuccess(paginatedResult.data, "Données récupérées avec succès")
      if (paginatedResult.total !== undefined) {
        (result as any).total = paginatedResult.total
      }
      return result
    } catch (e: any) {
      return toApiError(
        e instanceof Error ? e.message : "Erreur lors de la récupération des données",
        500
      )
    }
  }


};

export default dataSourceService;


