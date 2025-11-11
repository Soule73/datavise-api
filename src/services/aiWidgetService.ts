import type {
    AIGenerateRequest,
    AIGenerateResponse,
    AIGeneratedWidget,
    DataAnalysis,
} from "../types/aiType";
import type { ApiResponse } from "../types/api";
import { toApiSuccess, toApiError } from "../utils/api";
import DataSource from "../models/DataSource";
import { readCsvFile } from "../utils/cvsUtils";
import { fetchRemoteJson } from "../utils/jsonUtils";
import {
    AIServiceLogger,
    analyzeColumn,
    categorizeColumns,
    generateSuggestedMetrics,
    callOpenAI,
    formatAnalysisForPrompt,
    validateOpenAIKey,
} from "../utils/aiServiceUtils";
import {
    WIDGET_GENERATION_SYSTEM_PROMPT,
    WIDGET_REFINEMENT_SYSTEM_PROMPT,
} from "../utils/aiPrompts";
import {
    transformAIResponseToWidgets,
    extractSuggestions,
} from "../utils/aiWidgetTransformer";
import * as path from "path";
import * as fs from "fs";

/**
 * Charge les données d'une source de manière simplifiée pour l'analyse
 */
async function loadDataForAnalysis(source: any): Promise<any[]> {
    try {
        if (source.type === "csv" && source.filePath) {
            return await readCsvFile(source.filePath);
        } else if (source.type === "json") {
            if (source.endpoint) {
                if (source.endpoint.includes('ventes-exemple')) {
                    const filePath = path.join(__dirname, "../data/ventes-exemple.json");
                    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                    return Array.isArray(data) ? data : [data];
                }
                return await fetchRemoteJson(
                    source.endpoint,
                    source.httpMethod || "GET",
                    source.authType || "none",
                    source.authConfig || {},
                    source.body
                );
            }
        }
        return [];
    } catch (error) {
        AIServiceLogger.error("Erreur chargement données:", error);
        return [];
    }
}

/**
 * Service pour générer des widgets intelligemment via IA
 */
const aiWidgetService = {
    /**
     * Analyse les données d'une source pour déterminer les types de colonnes
     */
    async analyzeDataSource(dataSourceId: string): Promise<DataAnalysis> {
        AIServiceLogger.debug("Début de l'analyse de la source:", dataSourceId);

        const source = await DataSource.findById(dataSourceId);
        if (!source) {
            AIServiceLogger.error("Source de données introuvable:", dataSourceId);
            throw new Error("Source de données introuvable");
        }

        AIServiceLogger.success("Source trouvée:", {
            name: source.name,
            type: source.type,
            id: source._id,
        });

        const rawData = await loadDataForAnalysis(source.toObject());
        const data = Array.isArray(rawData) ? rawData : [];

        AIServiceLogger.info("Données chargées:", {
            rowCount: data.length,
            sampleRow: data[0],
        });

        if (data.length === 0) {
            AIServiceLogger.error("La source de données est vide");
            throw new Error("La source de données est vide");
        }

        const sample = data[0];
        const columns = Object.keys(sample).map((key) => analyzeColumn(key, data));

        const { numericColumns, categoricalColumns, dateColumns } = categorizeColumns(columns);

        AIServiceLogger.success("Analyse des colonnes terminée:", {
            totalColumns: columns.length,
            numericColumns,
            categoricalColumns,
            dateColumns,
        });

        const suggestedMetrics = generateSuggestedMetrics(numericColumns);

        return {
            columns,
            rowCount: data.length,
            numericColumns,
            categoricalColumns,
            dateColumns,
            suggestedMetrics,
            suggestedBuckets: [...categoricalColumns, ...dateColumns],
        };
    },

    /**
     * Génère des widgets via OpenAI en fonction de l'analyse des données
     */
    async generateWidgets(
        request: AIGenerateRequest
    ): Promise<ApiResponse<AIGenerateResponse>> {
        AIServiceLogger.info("Début de la génération de widgets:", request);

        try {
            if (!validateOpenAIKey()) {
                AIServiceLogger.error("Clé OpenAI manquante");
                return toApiError(
                    "Clé API OpenAI non configurée. Définissez OPENAI_API_KEY dans les variables d'environnement.",
                    500
                );
            }

            AIServiceLogger.debug("Analyse de la source de données...");
            const analysis = await aiWidgetService.analyzeDataSource(
                request.dataSourceId
            );
            AIServiceLogger.success("Analyse terminée");

            const source = await DataSource.findById(request.dataSourceId);

            if (!source) {
                AIServiceLogger.error("Source de données introuvable");
                return toApiError("Source de données introuvable", 404);
            }

            AIServiceLogger.info("Construction du prompt...");

            const userPrompt = formatAnalysisForPrompt(
                source.name,
                source.type,
                analysis,
                request.userPrompt,
                request.maxWidgets
            );

            const aiResponse = await callOpenAI({
                systemPrompt: WIDGET_GENERATION_SYSTEM_PROMPT,
                userPrompt,
            });

            AIServiceLogger.info("Réponse OpenAI complète:", JSON.stringify(aiResponse, null, 2));
            AIServiceLogger.info("Widgets générés:", aiResponse.widgets?.length);

            if (aiResponse.widgets && aiResponse.widgets.length > 0) {
                AIServiceLogger.info("Premier widget:", JSON.stringify(aiResponse.widgets[0], null, 2));
            }

            const widgets = transformAIResponseToWidgets(
                aiResponse,
                request.dataSourceId
            );

            AIServiceLogger.success("Transformation terminée:", widgets.length);

            return toApiSuccess({
                widgets,
                totalGenerated: widgets.length,
                dataSourceSummary: {
                    name: source.name,
                    type: source.type,
                    rowCount: analysis.rowCount,
                    columns: analysis.columns.map((c) => c.name),
                },
                suggestions: extractSuggestions(aiResponse),
            });
        } catch (error: any) {
            AIServiceLogger.error("Erreur:", error.message);
            return toApiError(
                error.response?.data?.error?.message ||
                error.message ||
                "Erreur lors de la génération",
                500
            );
        }
    },

    /**
     * Raffine les widgets existants selon les instructions utilisateur
     */
    async refineWidgets(
        dataSourceId: string,
        currentWidgets: AIGeneratedWidget[],
        refinementPrompt: string
    ): Promise<ApiResponse<AIGenerateResponse>> {
        AIServiceLogger.info("Raffinement des widgets");

        try {
            if (!validateOpenAIKey()) {
                return toApiError("Clé API OpenAI non configurée", 500);
            }

            const analysis = await aiWidgetService.analyzeDataSource(dataSourceId);
            const source = await DataSource.findById(dataSourceId);

            if (!source) {
                return toApiError("Source introuvable", 404);
            }

            const userPrompt = `Source: ${source.name}
Colonnes numériques: ${analysis.numericColumns.join(", ")}
Colonnes catégorielles: ${analysis.categoricalColumns.join(", ")}

Widgets actuels:
${JSON.stringify(currentWidgets, null, 2)}

Instructions de raffinement: ${refinementPrompt}

Améliore les widgets selon les instructions. Garde le format exact.`;

            const aiResponse = await callOpenAI({
                systemPrompt: WIDGET_REFINEMENT_SYSTEM_PROMPT,
                userPrompt,
            });

            const widgets = transformAIResponseToWidgets(aiResponse, dataSourceId);

            return toApiSuccess({
                widgets,
                totalGenerated: widgets.length,
                dataSourceSummary: {
                    name: source.name,
                    type: source.type,
                    rowCount: analysis.rowCount,
                    columns: analysis.columns.map((c) => c.name),
                },
                suggestions: extractSuggestions(aiResponse),
            });
        } catch (error: any) {
            AIServiceLogger.error("Erreur raffinement:", error.message);
            return toApiError(
                error.message || "Erreur lors du raffinement",
                500
            );
        }
    },
};

export default aiWidgetService;
