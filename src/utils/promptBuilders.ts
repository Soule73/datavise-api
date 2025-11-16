import type { DataAnalysis, WidgetAIResponse } from "../types/aiType";

interface ColumnSection {
    title: string;
    columns: string[];
    emptyMessage: string;
}

interface PromptSection {
    title: string;
    content: string;
}

/**
 * Builder pour construire des prompts structurés
 * Principe: Single Responsibility - Gère uniquement la construction de prompts
 */
export class PromptBuilder {
    private sections: PromptSection[] = [];
    private readonly separator = "═══════════════════════════════════════════════════════════════";

    addSection(title: string, content: string): this {
        this.sections.push({ title, content });
        return this;
    }

    addSeparator(): this {
        this.sections.push({ title: "", content: this.separator });
        return this;
    }

    build(): string {
        return this.sections
            .map(section => {
                if (!section.title) return section.content;
                return `${this.separator}\n${section.title}\n${this.separator}\n\n${section.content}`;
            })
            .join('\n\n');
    }

    reset(): this {
        this.sections = [];
        return this;
    }
}

/**
 * Formate les colonnes avec titre et comptage
 */
export class ColumnFormatter {
    static formatColumnSection(section: ColumnSection): string {
        const count = section.columns.length;
        const title = `**${section.title} (${count}):**`;

        if (count === 0) {
            return `${title}\n  ${section.emptyMessage}`;
        }

        return `${title}\n${section.columns.map(col => `  - ${col}`).join('\n')}`;
    }

    static formatAllColumns(analysis: DataAnalysis): string {
        const sections: ColumnSection[] = [
            {
                title: "Colonnes numériques disponibles",
                columns: analysis.numericColumns,
                emptyMessage: "(Aucune colonne numérique)"
            },
            {
                title: "Colonnes catégorielles disponibles",
                columns: analysis.categoricalColumns,
                emptyMessage: "(Aucune colonne catégorielle)"
            },
            {
                title: "Colonnes temporelles disponibles",
                columns: analysis.dateColumns,
                emptyMessage: "(Aucune colonne temporelle)"
            }
        ];

        return sections
            .map(section => this.formatColumnSection(section))
            .join('\n\n');
    }
}

/**
 * Formate les informations de la source de données
 */
export class DataSourceInfoFormatter {
    static format(sourceName: string, sourceType: string, rowCount: number): string {
        return `**Nom de la source:** ${sourceName}
**Type de source:** ${sourceType}
**Nombre total de lignes:** ${rowCount}`;
    }
}

/**
 * Formate les widgets pour l'affichage dans les prompts
 */
export class WidgetFormatter {
    static formatWidget(widget: WidgetAIResponse, index: number): string {
        return `
**Widget ${index + 1}: ${widget.name}**
Type: ${widget.type}
Description: ${widget.description || 'Aucune description'}
Configuration actuelle:
${JSON.stringify({
            metrics: widget.config.metrics,
            buckets: widget.config.buckets,
            metricStyles: widget.config.metricStyles,
            widgetParams: widget.config.widgetParams
        }, null, 2)}`;
    }

    static formatWidgetForDatabase(widget: any, index: number): string {
        return `
**Widget ${index + 1} (ID: ${widget.id})**
Nom: ${widget.name}
Type: ${widget.type}
Description: ${widget.description || 'Aucune description'}
Configuration actuelle:
${JSON.stringify(widget.config, null, 2)}`;
    }

    static formatAllWidgets(widgets: WidgetAIResponse[]): string {
        return widgets.map((widget, index) => this.formatWidget(widget, index)).join('\n');
    }

    static formatAllDatabaseWidgets(widgets: any[]): string {
        return widgets.map((widget, index) => this.formatWidgetForDatabase(widget, index)).join('\n');
    }
}

/**
 * Gère les instructions utilisateur dans les prompts
 */
export class UserInstructionFormatter {
    static formatGeneration(userPrompt?: string): string {
        const hasInstructions = userPrompt && userPrompt.trim().length > 0;

        if (hasInstructions) {
            return `L'utilisateur a des besoins spécifiques:

"${userPrompt}"

🎯 Analyse cette demande attentivement et:
1. Identifie les types de visualisations demandés (explicites ou implicites)
2. Détermine quelles colonnes utiliser pour répondre au mieux
3. Crée des widgets pertinents qui correspondent exactement à la demande
4. Si la demande est vague, propose des visualisations qui explorent différents aspects des données
5. Explique dans le "reasoning" pourquoi chaque widget répond à la demande`;
        }

        return `Aucune instruction spécifique fournie.

🎯 Génère automatiquement des visualisations pertinentes qui:
1. Explorent les aspects les plus intéressants des données
2. Utilisent différents types de widgets pour offrir des perspectives variées
3. Mettent en évidence les tendances, comparaisons et distributions importantes
4. Sont prêtes à l'emploi sans configuration supplémentaire`;
    }

    static formatRefinement(refinementPrompt: string): string {
        return refinementPrompt;
    }
}

/**
 * Formate les objectifs de génération
 */
export class GenerationObjectivesFormatter {
    static format(maxWidgets: number): string {
        return `**Nombre de widgets à générer:** ${maxWidgets} visualisations

**Critères de qualité:**
✓ Chaque widget doit avoir un objectif clair et distinct
✓ Utilise UNIQUEMENT les colonnes listées ci-dessus
✓ Varie les types de widgets (KPI, graphiques, tableaux)
✓ Assure-toi que les configurations sont valides et complètes
✓ Fournis des "reasoning" détaillés pour chaque choix
✓ Ajoute des suggestions pour des analyses complémentaires

**IMPORTANT:** Respecte STRICTEMENT le format des exemples fournis dans le système.
Toutes les configurations doivent être complètes et prêtes à l'emploi.`;
    }
}

/**
 * Instructions pour le raffinement
 */
export class RefinementInstructionsFormatter {
    static formatStandard(): string {
        return `1. Analyse attentivement la demande de l'utilisateur
2. Identifie quels widgets sont concernés (tous, certains, ou nouveaux)
3. Applique les modifications demandées de manière cohérente
4. Si la demande est ambiguë, fais une interprétation raisonnable et explique dans le "reasoning"
5. Retourne TOUS les widgets (modifiés + non modifiés) pour maintenir la cohérence
6. Ajoute des suggestions pertinentes basées sur les modifications effectuées

Améliore les widgets selon les instructions. Garde le format exact défini dans le système.`;
    }

    static formatDatabase(): string {
        return `1. Ces widgets sont DÉJÀ SAUVEGARDÉS dans la base de données
2. CONSERVE les IDs existants pour que je puisse mettre à jour les bons widgets
3. Applique les modifications demandées de manière cohérente
4. Si la demande est ambiguë, fais une interprétation raisonnable et explique dans le "reasoning"
5. Retourne TOUS les widgets (modifiés + non modifiés)
6. Ajoute des suggestions pertinentes pour continuer la conversation

Améliore les configurations selon les instructions. Garde le format exact.`;
    }
}
