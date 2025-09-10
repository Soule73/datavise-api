# Guide des Tests - DataVise API

## 🚀 Démarrage Rapide

```bash
# Installer les dépendances
npm install

# Lancer tous les tests
npm test

# Tests en mode watch (développement)
npm run test:watch

# Couverture de code
npm run test:coverage
```

## 📋 Scripts de Test Disponibles

| Script | Description |
|--------|-------------|
| `npm test` | Lance tous les tests |
| `npm run test:services` | Tests des services uniquement |
| `npm run test:routes` | Tests des routes uniquement |
| `npm run test:auth` | Tests d'authentification uniquement |
| `npm run test:watch` | Mode watch pour développement |
| `npm run test:coverage` | Génère le rapport de couverture |
| `npm run test:ci` | Tests pour l'intégration continue |

## 🎯 Couverture Actuelle

### ✅ Tests de Services (25/25)
- UserService : 8/8 tests
- DashboardService : 6/6 tests
- DataSourceService : 6/6 tests
- WidgetService : 5/5 tests

### ✅ Tests de Routes (56/59)
- Auth : 6/6 tests (100%)
- Dashboard : 14/15 tests
- DataSource : 17/18 tests
- Widget : 14/15 tests
- Uploads : 5/5 tests (100%)

**Total : 81/84 tests passent (96.4%)**

## 🔧 Configuration

### Variables d'environnement de test
```bash
NODE_ENV=test
```

### Base de données
- Utilise MongoDB Memory Server
- Isolation complète entre les tests
- Nettoyage automatique après chaque test

## 🐛 Dépannage

### Tests qui échouent
1. Vérifier que MongoDB Memory Server démarre correctement
2. S'assurer que les permissions sont initialisées
3. Vérifier les tokens JWT dans les tests d'auth

### Performance lente
- Les tests prennent ~20 secondes (normal)
- MongoDB Memory Server nécessite du temps de démarrage

### Erreurs courantes
- **"Role 'user' not found"** : Ajouter `initPermissionsAndRoles()`
- **Tests qui se bloquent** : Vérifier `disconnectFromDatabase()`

## 📊 CI/CD

Les tests sont automatiquement exécutés :
- ✅ Sur chaque push vers `main`/`develop`
- ✅ Sur les pull requests
- ✅ Matrice Node.js 18.x et 20.x
- ✅ Rapport de couverture automatique

## 📖 Documentation Complète

Voir [docs/TESTS.md](./docs/TESTS.md) pour la documentation détaillée.
