/**
 * Configuration pour la génération de widgets par IA
 */
export interface AIGenerateRequest {
    dataSourceId: string;
    userPrompt?: string;
    maxWidgets?: number;
    preferredTypes?: string[];
}

/**
 * Widget généré par l'IA avec métadonnées
 */
export interface AIGeneratedWidget {
    id: string; // ID temporaire pour le frontend
    name: string;
    description: string;
    type: string;
    config: Record<string, any>; // Configuration du widget
    dataSourceId: string;
    reasoning: string; // Pourquoi l'IA a choisi ce widget
    confidence: number; // Score de confiance (0-1)
}

/**
 * Réponse de génération de widgets par IA
 */
export interface AIGenerateResponse {
    widgets: AIGeneratedWidget[];
    totalGenerated: number;
    dataSourceSummary: {
        name: string;
        type: string;
        rowCount: number;
        columns: string[];
    };
    suggestions?: string[]; // Suggestions supplémentaires
}

/**
 * Requête pour raffiner les widgets générés
 */
export interface AIRefineRequest {
    dataSourceId: string;
    currentWidgets: AIGeneratedWidget[];
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
