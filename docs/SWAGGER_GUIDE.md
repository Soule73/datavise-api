# Guide de la documentation API Swagger

## Accès à la documentation

Une fois le serveur démarré, la documentation interactive Swagger est disponible à :

**Interface Swagger UI** : http://localhost:7000/api-docs  
**Spécification OpenAPI JSON** : http://localhost:7000/api-docs.json

## Fonctionnalités

### 1. Documentation interactive
- Explore tous les endpoints v1 avec leurs paramètres
- Teste les requêtes directement depuis l'interface
- Visualise les schémas de réponse (success/error/paginated)

### 2. Authentification JWT
1. Obtenir un token via `POST /api/auth/login`
2. Cliquer sur "Authorize" dans Swagger UI
3. Entrer le token au format : `Bearer <votre_token>`
4. Le token sera inclus automatiquement dans toutes les requêtes

### 3. Routes documentées

#### Widgets v1 (`/api/v1/widgets`)
- `POST /` - Créer un widget (authentification requise)
- `GET /` - Lister avec pagination et filtres
- `GET /:id` - Récupérer un widget
- `PATCH /:id` - Mettre à jour
- `DELETE /:id` - Supprimer

### 4. Schémas de réponse

**ApiSuccessResponse**
```json
{
  "success": true,
  "data": {...},
  "message": "Opération réussie",
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "totalPages": 5
    }
  },
  "links": {
    "self": "http://localhost:7000/api/v1/widgets?page=1",
    "first": "http://localhost:7000/api/v1/widgets?page=1",
    "last": "http://localhost:7000/api/v1/widgets?page=5",
    "next": "http://localhost:7000/api/v1/widgets?page=2",
    "prev": null
  },
  "timestamp": "2025-11-14T10:30:00.000Z"
}
```

**ApiErrorResponse**
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
  "timestamp": "2025-11-14T10:30:00.000Z"
}
```

## Ajouter de la documentation pour de nouvelles routes

### Exemple complet
```typescript
/**
 * @swagger
 * /api/v1/dashboards:
 *   post:
 *     summary: Créer un nouveau dashboard
 *     tags: [Dashboards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - layout
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 example: "Dashboard des ventes"
 *               description:
 *                 type: string
 *                 example: "Analyse des ventes par région"
 *               layout:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Dashboard créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 *       400:
 *         description: Erreur de validation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Permission refusée
 */
router.post(
  "/",
  requireAuth,
  requirePermission("dashboard:canCreate"),
  validateBody(createDashboardSchema),
  createDashboard
);
```

## Configuration

La configuration Swagger se trouve dans `src/config/swagger.ts` :
- **Serveurs** : localhost (dev) + production
- **Schémas réutilisables** : ApiSuccessResponse, ApiErrorResponse, Widget
- **Tags** : Auth, Widgets, Dashboards, Data Sources, AI
- **Sécurité** : JWT Bearer tokens

## Génération automatique

Les annotations JSDoc `@swagger` dans les fichiers de routes sont scannées automatiquement par swagger-jsdoc. Pas besoin de fichier YAML séparé.

## Export de la documentation

La spécification OpenAPI complète est disponible en JSON à `/api-docs.json` pour :
- Import dans Postman/Insomnia
- Génération de clients API (TypeScript, Python, etc.)
- Tests automatisés avec des outils comme Dredd
