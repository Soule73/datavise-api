import { DetectParams, EsConfig, FetchOptions, IDataSource }
    from "../types/sourceType";
import { Client } from "@elastic/elasticsearch";


/**
 * Crée et configure un client Elasticsearch
 * 
 * @param {EsConfig} config - Configuration du client Elasticsearch
 * @returns {Client} - Instance du client Elasticsearch configurée
 */
export function buildEsClient({
    endpoint,
    authType = "none",
    authConfig = {}
}: EsConfig): Client {
    const clientOptions: Record<string, any> = { node: endpoint }

    switch (authType) {
        case "basic":
            if (!authConfig.username || !authConfig.password) {
                throw new Error("Basic auth requires username and password.")
            }
            clientOptions.auth = {
                username: authConfig.username,
                password: authConfig.password
            }
            break

        case "bearer":
            if (!authConfig.token) {
                throw new Error("Bearer auth requires a token.")
            }
            clientOptions.auth = { bearer: authConfig.token }
            break

        case "apiKey":
            if (!authConfig.apiKey) {
                throw new Error("API Key auth requires an apiKey.")
            }
            clientOptions.auth = { apiKey: authConfig.apiKey }
            break

        case "none":
        case undefined:
            // no authentication
            break

        default:
            throw new Error(`Unsupported authType: ${authType}`)
    }

    return new Client(clientOptions)
}

/**
 * Construit la partie "query" en appliquant
 * - un match_all ou un query existant
 * - un filtre de plage sur un champ timestamp
 */
export function buildEsQuery(
    baseQuery: any,
    timestampField?: string,
    from?: string,
    to?: string
): any {
    const must: any[] = [];

    // Query principale
    if (baseQuery && Object.keys(baseQuery).length > 0 && !baseQuery.match_all) {
        must.push(baseQuery);
    }

    // Filtre de plage
    if (timestampField && (from || to)) {
        const range: any = {};
        if (from) range.gte = from;
        if (to) range.lte = to;
        must.push({ range: { [timestampField]: range } });
    }

    // Si aucun critère, on garde match_all
    if (must.length === 0) {
        return { match_all: {} };
    }

    return { bool: { must } };
}

/**
 * Construit les paramètres de recherche ES
 * 
 * @param {Object} options - Options de recherche
 * @param {string} options.index - Index Elasticsearch
 */
export function buildSearchParams(options: {
    index: string | undefined;
    query: any;
    page?: number;
    pageSize?: number;
    fields?: string;
}): Record<string, any> {
    const page = options.page ?? 1;
    const size = options.pageSize ?? 5000;
    const from = (page - 1) * size;

    const params: Record<string, any> = {
        index: options.index,
        body: { query: options.query },
        from,
        size,
    };

    if (options.fields) {
        const fieldsArr = options.fields
            .split(",")
            .map((f) => f.trim())
            .filter(Boolean);
        if (fieldsArr.length) {
            params._source = fieldsArr;
        }
    }

    return params;
}


/**
 * Détecte les colonnes d'une source Elasticsearch
 * 
 * @param {DetectParams} params - Paramètres de détection
 * @returns {Promise<{ columns: string[]; preview: object[] }>} - Colonnes détectées et un aperçu des données
 */
export async function detectColumnsElasticsearch(params: DetectParams): Promise<{ columns: string[]; preview: object[] }> {
    const client = buildEsClient({
        endpoint: params.endpoint,
        authType: params.authType,
        authConfig: params.authConfig,
    });

    const query = params.esQuery ?? { match_all: {} };
    const searchParams = buildSearchParams({
        index: params.esIndex,
        query,
        page: 1,
        pageSize: 5,
    });

    const result = await client.search(searchParams);
    const hits = (result as any).body.hits.hits || [];
    const rows = hits.map((h: any) => h._source || {});

    const columns = rows[0] ? Object.keys(rows[0]) : [];
    const preview = rows;

    return { columns, preview };
}

/**
 * Récupère les données d'une source Elasticsearch
 * 
 * @param {IDataSource} source - Source de données Elasticsearch
 * @param {FetchOptions} options - Options de récupération des données
 * @returns {Promise<{ data: Record<string, any>[]; total: number }>} - Données récupérées et le nombre total de résultats
 */
export async function fetchElasticsearchData(source: Partial<IDataSource>, options: FetchOptions): Promise<{
    data: Record<string, any>[];
    total: number;
}> {
    const client = buildEsClient({
        endpoint: source.endpoint,
        authType: source.authType,
        authConfig: source.authConfig,
    });

    const query = buildEsQuery(
        source.esQuery ?? { match_all: {} },
        source.timestampField,
        options.from,
        options.to
    );

    const params = buildSearchParams({
        index: source.esIndex,
        query,
        page: options.page,
        pageSize: options.pageSize,
        fields: options.fields,
    });

    const result = await client.search(params);
    const body = (result as any).body;
    const hits = body.hits.hits || [];
    const data = hits.map((h: any) => h._source);

    const totalRaw = body.hits.total;

    const total =
        typeof totalRaw === "object" ? totalRaw.value : totalRaw || data.length;

    return { data, total };
}
