import { generateUUID } from "./uuidGenerator";
import type { WidgetAIResponse } from "../types/aiType";

/**
 * Transforme la réponse brute de l'IA en widgets typés
 */
export function transformAIResponseToWidgets(
    aiResponse: any,
    dataSourceId: string
): WidgetAIResponse[] {
    if (!aiResponse.widgets || !Array.isArray(aiResponse.widgets)) {
        console.error("❌ [Transformer] Réponse AI invalide:", JSON.stringify(aiResponse, null, 2));
        throw new Error("Réponse AI invalide: widgets manquants");
    }

    console.log("🔄 [Transformer] Nombre de widgets à transformer:", aiResponse.widgets.length);

    return aiResponse.widgets.map((w: any, index: number) => {
        console.log(`🔄 [Transformer] Widget ${index + 1} (brut):`, JSON.stringify(w, null, 2));

        // ✅ OpenAI retourne metrics/buckets/etc. DIRECTEMENT, pas dans un objet "config"
        // On reconstruit la structure attendue par le frontend
        const config = w.config ? w.config : {
            metrics: w.metrics || [],
            buckets: w.buckets || [],
            globalFilters: w.globalFilters || [],
            metricStyles: w.metricStyles || [],
            widgetParams: w.widgetParams || {},
        };

        if (!config.metrics || config.metrics.length === 0) {
            console.warn(`⚠️ [Transformer] Widget ${index + 1} sans métriques!`);
        }

        const transformed = {
            id: generateUUID(true, 8),
            name: w.name,
            description: w.description,
            type: w.type,
            config,
            dataSourceId,
            reasoning: w.reasoning || "Généré automatiquement",
            confidence: w.confidence || 0.8,
        };

        console.log(`✅ [Transformer] Widget ${index + 1} transformé:`, JSON.stringify(transformed, null, 2));
        return transformed;
    });
}

/**
 * Valide qu'un widget AI a tous les champs requis
 */
export function validateWidgetConfig(widget: any): boolean {
    if (!widget.config) return false;

    const config = widget.config;

    return (
        Array.isArray(config.metrics) &&
        Array.isArray(config.buckets) &&
        Array.isArray(config.globalFilters) &&
        Array.isArray(config.metricStyles) &&
        typeof config.widgetParams === "object"
    );
}

/**
 * Extrait les suggestions de la réponse AI
 */
export function extractSuggestions(aiResponse: any): string[] {
    return aiResponse.suggestions || [];
}
