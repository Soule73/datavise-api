# AI Service Utilities - Guide d'Utilisation

## 📋 Vue d'Ensemble

Ensemble de classes et services utilitaires pour la construction de prompts AI, suivant les principes SOLID et DRY.

---

## 📁 Structure des Fichiers

```
utils/
├── promptBuilders.ts       # Composants de construction de prompts
├── promptStrategies.ts     # Stratégies de construction (Strategy Pattern)
└── aiServiceHelpers.ts     # Services utilitaires (Validation, Résumés)
```

---

## 🔧 promptBuilders.ts

### Classes Disponibles

#### 1. **PromptBuilder**

Builder pour construire des prompts structurés avec sections.

```typescript
import { PromptBuilder } from './promptBuilders';

const builder = new PromptBuilder();

const prompt = builder
    .addSection("TITRE SECTION 1", "Contenu de la section 1")
    .addSection("TITRE SECTION 2", "Contenu de la section 2")
    .build();

// Résultat:
// ═══════════════════════════════════════════════════════════════
// TITRE SECTION 1
// ═══════════════════════════════════════════════════════════════
//
// Contenu de la section 1
//
// ═══════════════════════════════════════════════════════════════
// TITRE SECTION 2
// ═══════════════════════════════════════════════════════════════
//
// Contenu de la section 2
```

**Méthodes:**
- `addSection(title, content)` - Ajoute une section
- `addSeparator()` - Ajoute un séparateur seul
- `build()` - Construit le prompt final
- `reset()` - Réinitialise le builder

#### 2. **ColumnFormatter**

Formate les informations sur les colonnes de données.

```typescript
import { ColumnFormatter } from './promptBuilders';

// Formater une section de colonnes
const formatted = ColumnFormatter.formatColumnSection({
    title: "Colonnes numériques disponibles",
    columns: ["sales", "profit", "quantity"],
    emptyMessage: "(Aucune colonne numérique)"
});

// Résultat:
// **Colonnes numériques disponibles (3):**
//   - sales
//   - profit
//   - quantity

// Formater toutes les colonnes d'une analyse
const allColumns = ColumnFormatter.formatAllColumns(analysis);
```

#### 3. **DataSourceInfoFormatter**

Formate les informations de base sur une source de données.

```typescript
import { DataSourceInfoFormatter } from './promptBuilders';

const info = DataSourceInfoFormatter.format(
    "Ventes 2024",
    "csv",
    1500
);

// Résultat:
// **Nom de la source:** Ventes 2024
// **Type de source:** csv
// **Nombre total de lignes:** 1500
```

#### 4. **WidgetFormatter**

Formate les widgets pour affichage dans les prompts.

```typescript
import { WidgetFormatter } from './promptBuilders';

// Formater un widget unique
const formatted = WidgetFormatter.formatWidget(widget, 0);

// Formater tous les widgets
const allWidgets = WidgetFormatter.formatAllWidgets(widgetArray);

// Formater des widgets de base de données
const dbWidgets = WidgetFormatter.formatAllDatabaseWidgets(dbWidgetArray);
```

#### 5. **UserInstructionFormatter**

Formate les instructions utilisateur avec contexte approprié.

```typescript
import { UserInstructionFormatter } from './promptBuilders';

// Pour génération
const generationInstructions = UserInstructionFormatter.formatGeneration(
    "Crée des graphiques de ventes"
);

// Pour raffinement
const refinementInstructions = UserInstructionFormatter.formatRefinement(
    "Change les couleurs en bleu"
);
```

#### 6. **GenerationObjectivesFormatter**

Formate les objectifs de génération de widgets.

```typescript
import { GenerationObjectivesFormatter } from './promptBuilders';

const objectives = GenerationObjectivesFormatter.format(5);

// Résultat inclut:
// - Nombre de widgets à générer
// - Critères de qualité
// - Instructions importantes
```

#### 7. **RefinementInstructionsFormatter**

Formate les instructions de raffinement.

```typescript
import { RefinementInstructionsFormatter } from './promptBuilders';

// Instructions standard
const standard = RefinementInstructionsFormatter.formatStandard();

// Instructions pour base de données
const database = RefinementInstructionsFormatter.formatDatabase();
```

---

## 🎯 promptStrategies.ts

### Pattern Strategy

Implémente le pattern Strategy pour construire différents types de prompts.

#### Interface **PromptStrategy**

```typescript
interface PromptStrategy {
    build(): string;
}
```

Toute stratégie doit implémenter cette interface.

#### 1. **GenerationPromptStrategy**

Stratégie pour générer des widgets initialement.

```typescript
import { GenerationPromptStrategy } from './promptStrategies';

const strategy = new GenerationPromptStrategy(
    sourceName,      // "Ventes 2024"
    sourceType,      // "csv"
    analysis,        // DataAnalysis object
    userPrompt,      // "Crée des KPIs de ventes" (optionnel)
    maxWidgets       // 5 (défaut)
);

const prompt = strategy.build();
```

**Structure du prompt:**
1. Contexte de la source de données
2. Demande spécifique ou génération automatique
3. Objectifs de génération

#### 2. **RefinementPromptStrategy**

Stratégie pour raffiner des widgets existants.

```typescript
import { RefinementPromptStrategy } from './promptStrategies';

const strategy = new RefinementPromptStrategy(
    sourceName,
    sourceType,
    analysis,
    currentWidgets,      // Array of widgets
    refinementPrompt     // "Change les couleurs"
);

const prompt = strategy.build();
```

**Structure du prompt:**
1. Contexte de la conversation
2. Widgets actuels
3. Demande de l'utilisateur
4. Instructions de raffinement

#### 3. **DatabaseRefinementPromptStrategy**

Stratégie pour raffiner des widgets sauvegardés en base de données.

```typescript
import { DatabaseRefinementPromptStrategy } from './promptStrategies';

const strategy = new DatabaseRefinementPromptStrategy(
    sourceName,
    sourceType,
    analysis,
    widgetsForPrompt,    // Array with MongoDB IDs
    refinementPrompt
);

const prompt = strategy.build();
```

**Différence:** Inclut les IDs MongoDB et instructions spécifiques pour conservation.

#### **PromptStrategyFactory**

Factory pour créer les stratégies facilement.

```typescript
import { PromptStrategyFactory } from './promptStrategies';

// Créer une stratégie de génération
const genStrategy = PromptStrategyFactory.createGenerationStrategy(
    sourceName, sourceType, analysis, userPrompt, maxWidgets
);

// Créer une stratégie de raffinement
const refStrategy = PromptStrategyFactory.createRefinementStrategy(
    sourceName, sourceType, analysis, currentWidgets, refinementPrompt
);

// Créer une stratégie de raffinement DB
const dbRefStrategy = PromptStrategyFactory.createDatabaseRefinementStrategy(
    sourceName, sourceType, analysis, widgetsForPrompt, refinementPrompt
);

// Utiliser la stratégie
const prompt = genStrategy.build();
```

**Avantage:** Point d'entrée unique pour créer toutes les stratégies.

---

## 🛠️ aiServiceHelpers.ts

### Services Utilitaires

#### 1. **PromptService**

Façade simple pour créer des prompts de raffinement.

```typescript
import { PromptService } from './aiServiceHelpers';

// Créer un prompt de raffinement standard
const prompt = PromptService.createRefinementPrompt(
    source.name,
    source.type,
    analysis,
    currentWidgets,
    "Change les couleurs en bleu"
);

// Créer un prompt de raffinement pour base de données
const dbPrompt = PromptService.createDatabaseRefinementPrompt(
    source.name,
    source.type,
    analysis,
    widgetsForPrompt,
    "Ajoute une métrique"
);
```

**Utilisation:** Interface simple pour le code client, cache la complexité des stratégies.

#### 2. **DataSourceSummaryBuilder**

Construit des résumés de sources de données de manière uniforme.

```typescript
import { DataSourceSummaryBuilder } from './aiServiceHelpers';

const summary = DataSourceSummaryBuilder.build(source, analysis);

// Résultat:
// {
//     name: "Ventes 2024",
//     type: "csv",
//     rowCount: 1500,
//     columns: [
//         {
//             name: "sales",
//             type: "number",
//             uniqueValues: 150,
//             sampleValues: [100, 200, 150]
//         },
//         ...
//     ]
// }
```

**Avantage:** Garantit un format uniforme utilisé partout dans le code.

#### 3. **ValidationService**

Service de validation avec messages d'erreur cohérents.

```typescript
import { ValidationService } from './aiServiceHelpers';

// Valider la clé OpenAI
const keyValidation = ValidationService.validateOpenAIKey(process.env.OPENAI_API_KEY);
if (!keyValidation.valid) {
    return toApiError(keyValidation.error!, 500);
}

// Valider la source de données
const sourceValidation = ValidationService.validateSource(source);
if (!sourceValidation.valid) {
    return toApiError(sourceValidation.error!, 404);
}

// Valider les widgets
const widgetsValidation = ValidationService.validateWidgets(widgets);
if (!widgetsValidation.valid) {
    return toApiError(widgetsValidation.error!, 404);
}
```

**Format de retour:**
```typescript
{
    valid: boolean;
    error?: string;
}
```

**Avantages:**
- Messages d'erreur centralisés
- Validations cohérentes
- Facilite les tests unitaires

---

## 🎓 Exemples Complets

### Exemple 1: Génération de Widgets

```typescript
import { formatAnalysisForPrompt } from './aiServiceUtils';

// L'ancienne fonction utilise maintenant les stratégies en interne
const userPrompt = formatAnalysisForPrompt(
    "Ventes 2024",
    "csv",
    analysis,
    "Crée des graphiques de ventes par région",
    5
);

// Utilisation dans le service
const aiResponse = await callOpenAI({
    systemPrompt: WIDGET_GENERATION_SYSTEM_PROMPT,
    userPrompt
});
```

### Exemple 2: Raffinement de Widgets

```typescript
import { PromptService, ValidationService, DataSourceSummaryBuilder } from './aiServiceHelpers';

// Valider la source
const sourceValidation = ValidationService.validateSource(source);
if (!sourceValidation.valid) {
    return toApiError(sourceValidation.error!, 404);
}

// Créer le prompt
const userPrompt = PromptService.createRefinementPrompt(
    source!.name,
    source!.type,
    analysis,
    currentWidgets,
    "Change les couleurs en bleu"
);

// Appeler l'IA
const aiResponse = await callOpenAI({
    systemPrompt: WIDGET_REFINEMENT_SYSTEM_PROMPT,
    userPrompt
});

// Construire le résumé
const dataSourceSummary = DataSourceSummaryBuilder.build(source!, analysis);
```

### Exemple 3: Création d'une Nouvelle Stratégie

```typescript
import { PromptStrategy } from './promptStrategies';
import { PromptBuilder } from './promptBuilders';

class CustomPromptStrategy implements PromptStrategy {
    constructor(private customData: any) {}

    build(): string {
        const builder = new PromptBuilder();
        
        return builder
            .addSection("MA SECTION CUSTOM", this.formatCustomData())
            .addSection("AUTRE SECTION", "Contenu...")
            .build();
    }

    private formatCustomData(): string {
        return `Data: ${JSON.stringify(this.customData)}`;
    }
}

// Utilisation
const strategy = new CustomPromptStrategy({ foo: "bar" });
const prompt = strategy.build();
```

---

## 🧪 Tests

### Test PromptBuilder

```typescript
describe('PromptBuilder', () => {
    it('should build prompt with sections', () => {
        const builder = new PromptBuilder();
        const result = builder
            .addSection("SECTION 1", "Content 1")
            .addSection("SECTION 2", "Content 2")
            .build();
        
        expect(result).toContain("SECTION 1");
        expect(result).toContain("Content 1");
        expect(result).toContain("SECTION 2");
        expect(result).toContain("Content 2");
    });

    it('should support method chaining', () => {
        const builder = new PromptBuilder();
        const result = builder
            .addSection("A", "1")
            .addSection("B", "2")
            .reset()
            .addSection("C", "3")
            .build();
        
        expect(result).not.toContain("A");
        expect(result).toContain("C");
    });
});
```

### Test ValidationService

```typescript
describe('ValidationService', () => {
    it('should validate OpenAI key', () => {
        const result = ValidationService.validateOpenAIKey(undefined);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
    });

    it('should validate source', () => {
        const result = ValidationService.validateSource(null);
        expect(result.valid).toBe(false);
        expect(result.error).toBe("Source de données introuvable");
    });
});
```

---

## 📚 Principes Appliqués

### SOLID

- **S**ingle Responsibility: Chaque classe a une responsabilité unique
- **O**pen/Closed: Ouvert à l'extension (nouvelles stratégies) sans modification
- **L**iskov Substitution: Toutes les stratégies peuvent être substituées
- **I**nterface Segregation: Interfaces spécifiques et ciblées
- **D**ependency Inversion: Code dépend des abstractions (PromptStrategy)

### DRY

- Zéro duplication de construction de prompts
- Formatages centralisés et réutilisables
- Validations uniformes

---

## 🚀 Migration depuis l'Ancien Code

### Avant

```typescript
// Construction manuelle du prompt (dupliqué 3 fois)
const userPrompt = `
═══════════════════════════════════════════════════════════════
📊 CONTEXTE
═══════════════════════════════════════════════════════════════

**Source:** ${source.name}
**Type:** ${source.type}
// ... 50+ lignes
`;

// Construction manuelle du résumé (dupliqué 3 fois)
const dataSourceSummary = {
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
```

### Après

```typescript
// Construction via service
const userPrompt = PromptService.createRefinementPrompt(
    source.name, source.type, analysis, currentWidgets, refinementPrompt
);

// Construction via builder
const dataSourceSummary = DataSourceSummaryBuilder.build(source, analysis);
```

**Résultat:** Même fonctionnalité, 95% moins de code, zéro duplication.

---

## 📖 Documentation API

Voir `REFACTORING_SOLID_DRY.md` pour:
- Architecture détaillée
- Métriques de réduction de code
- Exemples de tests
- Guide de migration complet

---

## ✅ Checklist d'Utilisation

Lors de l'ajout de nouvelles fonctionnalités:

- [ ] Besoin d'un nouveau type de prompt? → Créer nouvelle stratégie
- [ ] Besoin d'un nouveau format? → Ajouter méthode dans formatter approprié
- [ ] Besoin d'une nouvelle validation? → Ajouter méthode dans ValidationService
- [ ] Code dupliqué? → Extraire dans un service/formatter
- [ ] Prompt complexe? → Utiliser PromptBuilder

---

**Maintenu par:** L'équipe DataVise
**Dernière mise à jour:** 12 novembre 2025
