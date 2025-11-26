/**
 * Configuration pour la génération de widgets par IA
 */
export interface AIGenerateRequest {
    dataSourceId: string;
    userId: string;
    conversationId: string;
    userPrompt?: string;
    maxWidgets?: number;
    preferredTypes?: string[];
}

/**
 * Widget généré par l'IA (utilise le modèle Widget existant)
 */
export interface WidgetAIResponse {
    id: string;
    _id?: string;
    name: string;
    description?: string;
    type: string;
    config: Record<string, any>;
    dataSourceId: string;
    reasoning?: string;
    confidence?: number;
}

/**
 * Réponse de génération de widgets par IA
 */
export interface AIGenerateResponse {
    conversationTitle?: string;
    aiMessage?: string;
    widgets: WidgetAIResponse[];
    totalGenerated: number;
    dataSourceSummary: {
        name: string;
        type: string;
        rowCount: number;
        columns: Array<{
            name: string;
            type: string;
            uniqueValues?: number;
            sampleValues?: any[];
        }>;
    };
    suggestions?: string[];
}

/**
 * Requête pour raffiner les widgets générés
 */
export interface AIRefineRequest {
    dataSourceId: string;
    currentWidgets: WidgetAIResponse[];
    refinementPrompt: string;
}

/**
 * Paramètres d'analyse des données
 */
export interface DataAnalysis {
    columns: Array<{
        name: string;
        type: "string" | "number" | "date" | "boolean";
        uniqueValues?: number;
        sampleValues: any[];
        hasNulls: boolean;
    }>;
    rowCount: number;
    numericColumns: string[];
    categoricalColumns: string[];
    dateColumns: string[];
    suggestedMetrics: Array<{
        field: string;
        aggregation: "sum" | "avg" | "count" | "min" | "max";
        reasoning: string;
    }>;
    suggestedBuckets: string[];
}
