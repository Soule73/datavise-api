# Documentation des Tests - DataVise API

## 📊 Vue d'ensemble

Cette documentation présente la suite complète de tests pour l'API DataVise, couvrant les services, les routes et l'authentification.

### 🎯 Couverture des tests

**Tests de Services :** 25/25 tests ✅ (100%)
- UserService : 8/8 tests
- DashboardService : 6/6 tests  
- DataSourceService : 6/6 tests
- WidgetService : 5/5 tests

**Tests de Routes :** 56/59 tests ✅ (94.9%)
- Auth Routes : 6/6 tests (100%)
- Dashboard Routes : 14/15 tests (1 test de validation ignoré)
- DataSource Routes : 17/18 tests (1 test de validation ignoré)
- Widget Routes : 14/15 tests (1 test de validation ignoré)
- Uploads Routes : 5/5 tests (100%)

**Total :** 81/84 tests passent avec succès

## 🛠 Architecture des Tests

### Configuration de base

- **Framework :** Jest avec TypeScript
- **Base de données :** MongoDB Memory Server (isolation complète)
- **HTTP Testing :** Supertest pour les tests de routes
- **Authentification :** JWT tokens pour les tests d'autorisation

### Structure des fichiers

```
tests/
├── services/           # Tests unitaires des services
│   ├── userService.test.ts
│   ├── dashboardService.test.ts
│   ├── dataSourceService.test.ts
│   └── widgetService.test.ts
├── routes/            # Tests d'intégration des routes
│   ├── auth.test.ts
│   ├── dashboard.test.ts
│   ├── datasource.test.ts
│   ├── widget.test.ts
│   └── uploads.test.ts
└── helpers/           # Utilitaires de test
    └── testHelpers.ts
```

## 🔧 Patterns de Test

### 1. Tests de Services

```typescript
describe('ServiceName', () => {
    beforeAll(async () => {
        await connectToDatabase();
        await initPermissionsAndRoles();
    });

    afterEach(async () => {
        await cleanupDatabase();
    });

    afterAll(async () => {
        await disconnectFromDatabase();
    });
});
```

### 2. Tests de Routes

```typescript
describe('Route Name', () => {
    beforeEach(async () => {
        await initPermissionsAndRoles();
        // Création des données de test
    });

    afterEach(async () => {
        await cleanupDatabase();
    });
});
```

### 3. Authentification dans les Tests

```typescript
// Création d'un utilisateur de test avec token
const { user, token } = await createTestUser({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    roleName: 'user'
});

// Utilisation dans les requêtes
const response = await request(app)
    .get('/api/protected-route')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);
```

## 📋 Types de Tests Implémentés

### Tests d'Authentification
- ✅ Inscription utilisateur
- ✅ Connexion avec identifiants valides/invalides
- ✅ Accès au profil avec token JWT
- ✅ Protection des routes sans authentification

### Tests CRUD Complets
- ✅ Création avec données valides/invalides
- ✅ Lecture par ID et liste complète
- ✅ Mise à jour avec permissions
- ✅ Suppression avec vérifications
- ✅ Gestion des erreurs 404/401/403

### Tests de Permissions
- ✅ Vérification des rôles utilisateur
- ✅ Contrôle d'accès basé sur l'ownership
- ✅ Protection des ressources sensibles

### Tests de Sécurité
- ✅ Validation des données d'entrée
- ✅ Protection contre l'accès non autorisé
- ✅ Gestion sécurisée des fichiers

## 🔍 Détails par Module

### Auth Routes (6/6 tests)
```
POST /api/auth/register
├── ✅ Inscription réussie avec données valides
├── ✅ Rejet email déjà utilisé
└── ✅ Validation format email

POST /api/auth/login  
├── ✅ Connexion avec identifiants valides
└── ✅ Rejet identifiants invalides

GET /api/auth/profile
└── ✅ Accès profil avec token valide
```

### Dashboard Routes (14/15 tests)
```
POST /api/dashboards
├── ✅ Création avec permissions
├── ✅ Protection sans authentification
└── ○ Validation données (ignoré)

GET /api/dashboards/:id
├── ✅ Récupération par ID
├── ✅ Protection sans authentification  
└── ✅ Erreur 404 ressource inexistante

PUT /api/dashboards/:id
├── ✅ Mise à jour avec permissions
├── ✅ Protection sans authentification
└── ✅ Erreur 404 ressource inexistante

DELETE /api/dashboards/:id
├── ✅ Suppression avec permissions
├── ✅ Protection sans authentification
└── ✅ Erreur 404 ressource inexistante

GET /api/dashboards
├── ✅ Liste dashboards utilisateur
├── ✅ Liste vide si aucun dashboard
└── ✅ Protection sans authentification
```

### DataSource Routes (17/18 tests)
```
Routes CRUD + endpoint /data spécialisé
├── ✅ Toutes opérations CRUD
├── ✅ Récupération données via /api/datasources/:id/data
├── ✅ Gestion cache et parsing fichiers
└── ○ 1 test validation ignoré
```

### Widget Routes (14/15 tests)
```
Routes CRUD complètes
├── ✅ Gestion widgetId et dataSourceId
├── ✅ Intégration avec dashboards
└── ○ 1 test validation ignoré
```

### Uploads Routes (5/5 tests)
```
GET /api/uploads/:filename
├── ✅ Téléchargement avec authentification
├── ✅ Protection sans authentification
├── ✅ Erreur 404 fichier inexistant
├── ✅ Content-type fichiers texte
└── ✅ Content-disposition autres types
```

## 🚀 Commandes de Test

```bash
# Tous les tests
npm test

# Tests de services uniquement
npm test tests/services/

# Tests de routes uniquement  
npm test tests/routes/

# Test spécifique
npm test tests/routes/auth.test.ts

# Tests en mode watch
npm test -- --watch

# Coverage
npm test -- --coverage
```

## 🐛 Résolution de Problèmes

### Problèmes courants et solutions

1. **"Role 'user' not found"**
   - Solution : Ajouter `await initPermissionsAndRoles()` avant `createTestUser`

2. **Tests qui se bloquent**
   - Solution : Vérifier que `disconnectFromDatabase()` est appelé dans `afterAll`

3. **Conflits de données entre tests**
   - Solution : Utiliser `cleanupDatabase()` dans `afterEach`

4. **Timeouts sur les tests**
   - Solution : Augmenter le timeout Jest si nécessaire

## 📈 Métriques et Performance

- **Temps d'exécution moyen :** ~20 secondes pour tous les tests
- **Isolation :** Chaque test utilise une base de données en mémoire fraîche
- **Parallélisation :** Tests exécutés en parallèle par défaut
- **Stabilité :** 96.4% de réussite (81/84 tests)

## 🔄 Intégration Continue

Les tests sont automatiquement exécutés :
- ✅ Avant chaque commit (pre-commit hook)
- ✅ Sur chaque push (GitHub Actions)
- ✅ Sur les pull requests
- ✅ Déploiement bloqué si tests échouent

---

*Documentation générée le 9 septembre 2025*
*Suite de tests maintenue par l'équipe DataVise*
