import type { DataAnalysis, WidgetAIResponse } from "../types/aiType";
import {
    PromptBuilder,
    ColumnFormatter,
    DataSourceInfoFormatter,
    WidgetFormatter,
    UserInstructionFormatter,
    GenerationObjectivesFormatter,
    RefinementInstructionsFormatter
} from "./promptBuilders";

/**
 * Interface pour les stratégies de construction de prompts
 * Principe: Strategy Pattern - Définit une interface commune
 */
export interface PromptStrategy {
    build(): string;
}

/**
 * Stratégie pour le prompt de génération initiale
 */
export class GenerationPromptStrategy implements PromptStrategy {
    private builder: PromptBuilder;

    constructor(
        private sourceName: string,
        private sourceType: string,
        private analysis: DataAnalysis,
        private userPrompt?: string,
        private maxWidgets: number = 5
    ) {
        this.builder = new PromptBuilder();
    }

    build(): string {
        const hasUserInstructions = this.userPrompt && this.userPrompt.trim().length > 0;

        return this.builder
            .addSection(
                "📊 CONTEXTE DE LA SOURCE DE DONNÉES",
                this.buildDataSourceContext()
            )
            .addSection(
                `💬 ${hasUserInstructions ? 'DEMANDE SPÉCIFIQUE DE L\'UTILISATEUR' : 'GÉNÉRATION AUTOMATIQUE'}`,
                UserInstructionFormatter.formatGeneration(this.userPrompt)
            )
            .addSection(
                "📈 OBJECTIFS DE GÉNÉRATION",
                GenerationObjectivesFormatter.format(this.maxWidgets)
            )
            .build();
    }

    private buildDataSourceContext(): string {
        const sourceInfo = DataSourceInfoFormatter.format(
            this.sourceName,
            this.sourceType,
            this.analysis.rowCount
        );

        const columnsInfo = ColumnFormatter.formatAllColumns(this.analysis);

        return `${sourceInfo}\n\n${columnsInfo}`;
    }
}

/**
 * Stratégie pour le prompt de raffinement
 */
export class RefinementPromptStrategy implements PromptStrategy {
    private builder: PromptBuilder;

    constructor(
        private sourceName: string,
        private sourceType: string,
        private analysis: DataAnalysis,
        private currentWidgets: WidgetAIResponse[],
        private refinementPrompt: string
    ) {
        this.builder = new PromptBuilder();
    }

    build(): string {
        return this.builder
            .addSection(
                "📊 CONTEXTE DE LA CONVERSATION",
                this.buildConversationContext()
            )
            .addSection(
                `🎨 WIDGETS ACTUELS (${this.currentWidgets.length} widget${this.currentWidgets.length > 1 ? 's' : ''})`,
                WidgetFormatter.formatAllWidgets(this.currentWidgets)
            )
            .addSection(
                "💬 DEMANDE DE L'UTILISATEUR",
                UserInstructionFormatter.formatRefinement(this.refinementPrompt)
            )
            .addSection(
                "🎯 INSTRUCTIONS",
                RefinementInstructionsFormatter.formatStandard()
            )
            .build();
    }

    private buildConversationContext(): string {
        const sourceInfo = DataSourceInfoFormatter.format(
            this.sourceName,
            this.sourceType,
            this.analysis.rowCount
        );

        const columnsInfo = ColumnFormatter.formatAllColumns(this.analysis);

        return `${sourceInfo}\n\n${columnsInfo}`;
    }
}

/**
 * Stratégie pour le prompt de raffinement en base de données
 */
export class DatabaseRefinementPromptStrategy implements PromptStrategy {
    private builder: PromptBuilder;

    constructor(
        private sourceName: string,
        private sourceType: string,
        private analysis: DataAnalysis,
        private widgetsForPrompt: any[],
        private refinementPrompt: string
    ) {
        this.builder = new PromptBuilder();
    }

    build(): string {
        return this.builder
            .addSection(
                "📊 CONTEXTE DE LA CONVERSATION",
                this.buildConversationContext()
            )
            .addSection(
                "🎨 WIDGETS ACTUELS (Sauvegardés en base de données)",
                WidgetFormatter.formatAllDatabaseWidgets(this.widgetsForPrompt)
            )
            .addSection(
                "💬 DEMANDE DE L'UTILISATEUR",
                UserInstructionFormatter.formatRefinement(this.refinementPrompt)
            )
            .addSection(
                "🎯 INSTRUCTIONS IMPORTANTES",
                RefinementInstructionsFormatter.formatDatabase()
            )
            .build();
    }

    private buildConversationContext(): string {
        const sourceInfo = DataSourceInfoFormatter.format(
            this.sourceName,
            this.sourceType,
            this.analysis.rowCount
        );

        const columnsInfo = ColumnFormatter.formatAllColumns(this.analysis);

        return `${sourceInfo}\n\n${columnsInfo}`;
    }
}

/**
 * Factory pour créer les stratégies de prompts
 * Principe: Factory Pattern - Centralise la création des stratégies
 */
export class PromptStrategyFactory {
    static createGenerationStrategy(
        sourceName: string,
        sourceType: string,
        analysis: DataAnalysis,
        userPrompt?: string,
        maxWidgets: number = 5
    ): PromptStrategy {
        return new GenerationPromptStrategy(
            sourceName,
            sourceType,
            analysis,
            userPrompt,
            maxWidgets
        );
    }

    static createRefinementStrategy(
        sourceName: string,
        sourceType: string,
        analysis: DataAnalysis,
        currentWidgets: WidgetAIResponse[],
        refinementPrompt: string
    ): PromptStrategy {
        return new RefinementPromptStrategy(
            sourceName,
            sourceType,
            analysis,
            currentWidgets,
            refinementPrompt
        );
    }

    static createDatabaseRefinementStrategy(
        sourceName: string,
        sourceType: string,
        analysis: DataAnalysis,
        widgetsForPrompt: any[],
        refinementPrompt: string
    ): PromptStrategy {
        return new DatabaseRefinementPromptStrategy(
            sourceName,
            sourceType,
            analysis,
            widgetsForPrompt,
            refinementPrompt
        );
    }
}
