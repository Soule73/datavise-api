import axios from "axios";
import type { DataAnalysis } from "../types/aiType";
import { PromptStrategyFactory } from "./promptStrategies";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const AI_MODEL = process.env.AI_MODEL || "gpt-4o-mini";

/**
 * Logger spécialisé pour le service AI
 */
export class AIServiceLogger {
    private static prefix = "🤖 [AI Service]";

    static info(message: string, data?: any): void {
        console.log(`${this.prefix} ${message}`, data || "");
    }

    static error(message: string, error?: any): void {
        console.error(`❌ ${this.prefix} ${message}`, error || "");
    }

    static success(message: string, data?: any): void {
        console.log(`✅ ${this.prefix} ${message}`, data || "");
    }

    static debug(message: string, data?: any): void {
        console.log(`🔍 ${this.prefix} ${message}`, data || "");
    }
}

/**
 * Détermine le type d'une valeur
 */
export function detectColumnType(value: any): "string" | "number" | "date" | "boolean" {
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";
    if (typeof value === "string" && !isNaN(Date.parse(value))) return "date";
    return "string";
}

/**
 * Analyse une colonne de données
 */
export function analyzeColumn(
    key: string,
    data: any[]
): {
    name: string;
    type: "string" | "number" | "date" | "boolean";
    uniqueValues: number;
    sampleValues: any[];
    hasNulls: boolean;
} {
    const values = data.map((row) => row[key]).filter((v) => v != null);
    const sampleValues = values.slice(0, 5);
    const uniqueValues = new Set(values).size;

    const type = values.length > 0 ? detectColumnType(values[0]) : "string";

    return {
        name: key,
        type,
        uniqueValues,
        sampleValues,
        hasNulls: values.length < data.length,
    };
}

/**
 * Catégorise les colonnes par type
 */
export function categorizeColumns(columns: any[]): {
    numericColumns: string[];
    categoricalColumns: string[];
    dateColumns: string[];
} {
    const numericColumns = columns
        .filter((c) => c.type === "number")
        .map((c) => c.name);

    const categoricalColumns = columns
        .filter((c) => c.type === "string" && c.uniqueValues! < 50)
        .map((c) => c.name);

    const dateColumns = columns
        .filter((c) => c.type === "date")
        .map((c) => c.name);

    return { numericColumns, categoricalColumns, dateColumns };
}

/**
 * Génère des métriques suggérées basées sur les colonnes numériques
 */
export function generateSuggestedMetrics(numericColumns: string[]): Array<{
    field: string;
    aggregation: "sum";
    reasoning: string;
}> {
    return numericColumns.map((field) => ({
        field,
        aggregation: "sum" as const,
        reasoning: `Somme totale de ${field}`,
    }));
}

/**
 * Configuration pour l'appel à l'API OpenAI
 */
export interface OpenAIConfig {
    systemPrompt: string;
    userPrompt: string;
    temperature?: number;
    maxTokens?: number;
}

/**
 * Appelle l'API OpenAI avec la configuration fournie
 */
export async function callOpenAI(config: OpenAIConfig): Promise<any> {
    if (!OPENAI_API_KEY) {
        throw new Error("Clé API OpenAI non configurée");
    }

    AIServiceLogger.debug("Appel à l'API OpenAI...");

    const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
            model: AI_MODEL,
            messages: [
                { role: "system", content: config.systemPrompt },
                { role: "user", content: config.userPrompt },
            ],
            temperature: config.temperature || 0.7,
            max_tokens: config.maxTokens || 4000,
            response_format: { type: "json_object" },
        },
        {
            headers: {
                Authorization: `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
        }
    );

    AIServiceLogger.success("Réponse OpenAI reçue");

    return JSON.parse(response.data.choices[0].message.content);
}

/**
 * Formate l'analyse de données pour le prompt utilisateur
 * Utilise le pattern Strategy pour construire le prompt
 */
export function formatAnalysisForPrompt(
    sourceName: string,
    sourceType: string,
    analysis: DataAnalysis,
    userPrompt?: string,
    maxWidgets: number = 5
): string {

    const strategy = PromptStrategyFactory.createGenerationStrategy(
        sourceName,
        sourceType,
        analysis,
        userPrompt,
        maxWidgets
    );

    return strategy.build();
}

/**
 * Valide la présence de la clé API OpenAI
 */
export function validateOpenAIKey(): boolean {
    return !!OPENAI_API_KEY;
}
