# Documentation API v1 - Récapitulatif

## 📊 Couverture de la documentation

**100% des endpoints sont documentés** ✅

- **42 endpoints** au total
- **42 documentés** via Swagger/OpenAPI
- **8 fichiers de routes** couverts

## 🗂️ Structure de la documentation

### Routes principales

#### 1. Auth (12 endpoints)
- `POST /api/v1/auth/register` - Inscription
- `POST /api/v1/auth/login` - Connexion
- `GET /api/v1/auth/profile` - Profil utilisateur
- `POST /api/v1/auth/users` - Créer utilisateur
- `GET /api/v1/auth/users` - Liste utilisateurs (paginé)
- `PUT /api/v1/auth/users/:id` - Mettre à jour utilisateur
- `DELETE /api/v1/auth/users/:id` - Supprimer utilisateur
- `GET /api/v1/auth/roles` - Liste rôles (paginé)
- `POST /api/v1/auth/roles` - Créer rôle
- `PUT /api/v1/auth/roles/:id` - Mettre à jour rôle
- `DELETE /api/v1/auth/roles/:id` - Supprimer rôle
- `GET /api/v1/auth/permissions` - Liste permissions

#### 2. Widgets (5 endpoints)
- `POST /api/v1/widgets` - Créer widget
- `GET /api/v1/widgets` - Liste widgets (paginé, filtres)
- `GET /api/v1/widgets/:id` - Détail widget
- `PATCH /api/v1/widgets/:id` - Mettre à jour widget
- `DELETE /api/v1/widgets/:id` - Supprimer widget

#### 3. Dashboards (8 endpoints)
- `POST /api/v1/dashboards` - Créer dashboard
- `GET /api/v1/dashboards` - Liste dashboards (paginé, filtres)
- `GET /api/v1/dashboards/:id` - Détail dashboard
- `PATCH /api/v1/dashboards/:id` - Mettre à jour dashboard
- `DELETE /api/v1/dashboards/:id` - Supprimer dashboard
- `PATCH /api/v1/dashboards/:id/sharing` - Gérer partage
- `GET /api/v1/dashboards/shared/:shareId` - Dashboard partagé (public)
- `GET /api/v1/dashboards/shared/:shareId/sources` - Sources dashboard partagé (public)

#### 4. Data Sources (7 endpoints)
- `POST /api/v1/data-sources` - Créer source
- `GET /api/v1/data-sources` - Liste sources (paginé, filtres)
- `GET /api/v1/data-sources/:id` - Détail source
- `PATCH /api/v1/data-sources/:id` - Mettre à jour source
- `DELETE /api/v1/data-sources/:id` - Supprimer source
- `GET /api/v1/data-sources/:id/data` - Récupérer données
- `POST /api/v1/data-sources/:id/data` - Récupérer données (POST)

#### 5. AI Generations (1 endpoint)
- `POST /api/v1/ai/generations` - Générer widgets via IA

#### 6. AI Refinements (2 endpoints)
- `POST /api/v1/ai/refinements` - Raffiner widgets (mémoire)
- `POST /api/v1/ai/refinements/database` - Raffiner widgets (base de données)

#### 7. AI Analysis (1 endpoint)
- `POST /api/v1/ai/analysis` - Analyser source de données

#### 8. AI Conversations (6 endpoints)
- `POST /api/v1/ai/conversations` - Créer conversation
- `GET /api/v1/ai/conversations` - Liste conversations (paginé, filtres)
- `GET /api/v1/ai/conversations/:id` - Détail conversation
- `POST /api/v1/ai/conversations/:id/messages` - Ajouter message
- `PATCH /api/v1/ai/conversations/:id` - Mettre à jour conversation
- `DELETE /api/v1/ai/conversations/:id` - Supprimer conversation

## 📖 Accès à la documentation

La documentation Swagger est accessible à l'URL:
```
http://localhost:7000/api-docs
```

Ou en production:
```
https://api.datavise.vercel.app/api-docs
```

## 🔐 Authentification

L'API utilise des tokens JWT Bearer pour l'authentification:

```http
Authorization: Bearer <token>
```

Pour obtenir un token:
1. Créer un compte via `/api/v1/auth/register`
2. Se connecter via `/api/v1/auth/login`
3. Utiliser le token retourné dans l'en-tête `Authorization`

## 📋 Schémas définis

### Schémas de réponse
- `ApiSuccessResponse` - Réponse standard de succès
- `ApiErrorResponse` - Réponse standard d'erreur

### Schémas de données
- `Widget` - Widget de visualisation
- `Dashboard` - Tableau de bord
- `DataSource` - Source de données
- `User` - Utilisateur
- `Role` - Rôle utilisateur
- `Permission` - Permission système
- `AIConversation` - Conversation IA

## 🏷️ Tags Swagger

1. **Auth** - Authentification et gestion des utilisateurs
2. **Widgets** - Gestion des widgets de visualisation
3. **Dashboards** - Gestion des tableaux de bord
4. **Data Sources** - Gestion des sources de données
5. **AI** - Génération de widgets par IA

## ✨ Fonctionnalités de la documentation

- **Pagination standardisée** - Tous les endpoints de liste supportent `page` et `limit`
- **HATEOAS** - Liens de navigation dans les réponses paginées
- **Filtres** - Support des filtres par type, visibilité, etc.
- **Validation Zod** - Tous les endpoints validés en entrée
- **Permissions granulaires** - Contrôle d'accès détaillé
- **Try it out** - Interface Swagger interactive pour tester les endpoints

## 🔄 Format des réponses

### Succès
```json
{
  "success": true,
  "data": { ... },
  "message": "Opération réussie",
  "timestamp": "2025-11-14T22:00:00.000Z"
}
```

### Succès avec pagination
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  },
  "links": {
    "self": "/api/v1/widgets?page=1&limit=20",
    "first": "/api/v1/widgets?page=1&limit=20",
    "last": "/api/v1/widgets?page=5&limit=20",
    "next": "/api/v1/widgets?page=2&limit=20",
    "prev": null
  },
  "timestamp": "2025-11-14T22:00:00.000Z"
}
```

### Erreur
```json
{
  "success": false,
  "error": {
    "message": "Erreur de validation",
    "code": 400,
    "details": [
      {
        "field": "title",
        "message": "Le titre doit contenir au moins 3 caractères",
        "code": "too_small"
      }
    ]
  },
  "timestamp": "2025-11-14T22:00:00.000Z"
}
```

## 📝 Notes importantes

1. **Validation Zod** - Toutes les entrées sont validées via Zod avant traitement
2. **Permissions requises** - Vérifiez les permissions nécessaires dans la documentation de chaque endpoint
3. **Limites de pagination** - Par défaut: 20 éléments, maximum: 100 par page
4. **Types de widgets** - 10 types supportés: kpi, card, kpiGroup, bar, line, pie, table, radar, bubble, scatter
5. **Sources de données** - 3 types supportés: json, csv, elasticsearch

## 🚀 Prochaines étapes

Pour explorer la documentation complète:
1. Démarrer le serveur: `npm start`
2. Ouvrir `http://localhost:7000/api-docs`
3. Cliquer sur "Authorize" pour authentifier
4. Tester les endpoints via l'interface Swagger

## 📊 Statistiques

- **42 endpoints** documentés
- **8 groupes** de routes
- **7 schémas** de données définis
- **5 tags** Swagger
- **100%** de couverture de documentation
