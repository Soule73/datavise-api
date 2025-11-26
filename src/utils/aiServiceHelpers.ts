import type { DataAnalysis } from "../types/aiType";
import { PromptStrategyFactory } from "./promptStrategies";

/**
 * Service pour créer des prompts utilisateur
 * Principe: Single Responsibility - Se concentre uniquement sur la création de prompts
 */
export class PromptService {
    /**
     * Crée un prompt pour le raffinement de widgets
     */
    static createRefinementPrompt(
        sourceName: string,
        sourceType: string,
        analysis: DataAnalysis,
        currentWidgets: any[],
        refinementPrompt: string
    ): string {
        const strategy = PromptStrategyFactory.createRefinementStrategy(
            sourceName,
            sourceType,
            analysis,
            currentWidgets,
            refinementPrompt
        );

        return strategy.build();
    }

    /**
     * Crée un prompt pour le raffinement de widgets en base de données
     */
    static createDatabaseRefinementPrompt(
        sourceName: string,
        sourceType: string,
        analysis: DataAnalysis,
        widgetsForPrompt: any[],
        refinementPrompt: string
    ): string {
        const strategy = PromptStrategyFactory.createDatabaseRefinementStrategy(
            sourceName,
            sourceType,
            analysis,
            widgetsForPrompt,
            refinementPrompt
        );

        return strategy.build();
    }
}

/**
 * Service pour créer des résumés de sources de données
 * Principe: Single Responsibility
 */
export class DataSourceSummaryBuilder {
    static build(source: any, analysis: DataAnalysis) {
        return {
            name: source.name,
            type: source.type,
            rowCount: analysis.rowCount,
            columns: analysis.columns.map((c) => ({
                name: c.name,
                type: c.type,
                uniqueValues: c.uniqueValues,
                sampleValues: c.sampleValues,
            })),
        };
    }
}

/**
 * Service pour gérer les validations communes
 * Principe: Single Responsibility
 */
export class ValidationService {
    static validateOpenAIKey(key?: string): { valid: boolean; error?: string } {
        if (!key) {
            return {
                valid: false,
                error: "Clé API OpenAI non configurée"
            };
        }
        return { valid: true };
    }

    static validateSource(source: any): { valid: boolean; error?: string } {
        if (!source) {
            return {
                valid: false,
                error: "Source de données introuvable"
            };
        }
        return { valid: true };
    }

    static validateWidgets(widgets: any[]): { valid: boolean; error?: string } {
        if (widgets.length === 0) {
            return {
                valid: false,
                error: "Aucun widget trouvé avec ces IDs"
            };
        }
        return { valid: true };
    }
}
