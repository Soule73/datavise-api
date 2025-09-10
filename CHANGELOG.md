# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Versioning Sémantique](https://semver.org/lang/fr/).

## [Non publié]

### Ajouté
- Support complet des tests automatisés avec Jest
- Tests de services (55 tests) et tests de routes (56 tests)
- Workflow GitHub Actions pour CI/CD automatisé
- Support des rôles et permissions avec initialisation automatique
- Cache des sources de données avec gestion optimisée
- Upload de fichiers avec validation et sécurité
- Mock server pour les tests avec MongoDB Memory Server

### Modifié
- Configuration TypeScript optimisée pour la production
- Amélioration de la gestion des erreurs dans les services
- Optimisation des requêtes de base de données
- Mise à jour des dépendances de sécurité

### Corrigé
- **[2025-09-09]** Correction complète des tests services (55/55 passent maintenant)
- **[2025-09-09]** Ajout de `initPermissionsAndRoles` dans tous les tests services
- **[2025-09-09]** Correction du paramètre `roleName: 'user'` dans `createTestUser`
- **[2025-09-09]** Réactivation des tests services dans le workflow GitHub Actions
- **[2025-09-09]** Résolution des erreurs "Role 'user' not found" dans les tests
- Compatibilité Node.js 18.x résolue (focus sur 20.x et 22.x)
- Gestion des erreurs d'authentification dans les routes
- Validation des données d'entrée renforcée

### Sécurité
- Validation stricte des tokens JWT
- Sanitisation des entrées utilisateur
- Protection contre les injections NoSQL
- Gestion sécurisée des uploads de fichiers

## [1.0.0] - 2025-09-09

### Ajouté
- API complète pour la gestion des tableaux de bord (dashboards)
- Système de gestion des sources de données (DataSources)
- Authentification JWT avec rôles et permissions
- CRUD complet pour les widgets et visualisations
- Support des fichiers CSV et JSON
- Interface RESTful avec documentation complète
- Tests automatisés avec couverture de 97.4%
- Déploiement automatisé sur Vercel

### Technique
- Backend Node.js avec TypeScript
- Base de données MongoDB avec Mongoose
- Framework Express.js
- Tests avec Jest et Supertest
- CI/CD avec GitHub Actions
- Déploiement Vercel optimisé

---

## Légende des Types de Modifications

- **Ajouté** : pour les nouveautés
- **Modifié** : pour les changements de fonctionnalités existantes
- **Déprécié** : pour les fonctionnalités qui seront supprimées
- **Supprimé** : pour les fonctionnalités supprimées
- **Corrigé** : pour les corrections de bugs
- **Sécurité** : pour les corrections de vulnérabilités
