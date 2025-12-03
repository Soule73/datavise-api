# DataVise API

> Backend REST API pour la plateforme de visualisation de données DataVise

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0+-green.svg)](https://www.mongodb.com/)

## Table des matières

- [À propos](#à-propos)
- [Fonctionnalités](#fonctionnalités)
- [Technologies](#technologies)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [API Documentation](#api-documentation)
- [Tests](#tests)
- [Déploiement](#déploiement)
- [Contribution](#contribution)
- [Licence](#licence)

## À propos

DataVise API est une API REST moderne permettant de créer et gérer des tableaux de bord interactifs avec visualisations de données. Elle offre des fonctionnalités d'import de données multi-sources, de création de widgets personnalisables, et de génération automatique de visualisations via intelligence artificielle.

## Fonctionnalités

- **Authentification & Autorisation** : JWT, RBAC (Role-Based Access Control)
- **Sources de données** : CSV, JSON, API REST, Elasticsearch
- **Widgets** : 10+ types (KPI, bar, line, pie, table, radar, bubble, scatter)
- **Dashboards** : Création et organisation en grille responsive
- **IA** : Génération automatique de visualisations via OpenAI GPT
- **Conversations IA** : Interface conversationnelle pour créer des widgets
- **Multi-utilisateurs** : Gestion de rôles et permissions
- **Partage** : Ressources publiques/privées avec partage sélectif
- **Upload** : Import sécurisé de fichiers CSV/JSON

## Technologies

### Stack principale

- **Runtime** : Node.js 18+
- **Framework** : Express.js 4
- **Langage** : TypeScript 5
- **Base de données** : MongoDB 8
- **ODM** : Mongoose 8
- **Authentification** : JWT (jsonwebtoken)
- **Validation** : Zod
- **Upload** : Multer
- **IA** : OpenAI API (GPT-4o-mini)
- **Tests** : Jest + Supertest
- **Documentation** : Swagger (OpenAPI 3.0)

## Prérequis

- Node.js ≥ 18.0.0
- MongoDB ≥ 8.0.0 (local ou Atlas)
- npm ≥ 9.0.0

**Optionnel :**
- Compte OpenAI (fonctionnalités IA)
- Elasticsearch (connexion sources Elasticsearch)

## Installation

### Cloner le repository

```bash
git clone https://github.com/Soule73/datavise.git
cd datavise-api
```

### Installer les dépendances

```bash
npm install
```

### Configurer l'environnement

```bash
cp .env.example .env
```

Éditez le fichier `.env` avec vos paramètres (voir [Configuration](#configuration))

### Compiler le projet

```bash
npm run build
```

### Démarrer le serveur

**Développement :**
```bash
npm start
```

**Production :**
```bash
npm run start:prod
```

Le serveur démarre sur `http://localhost:7000`

### Vérifier l'installation

```bash
curl http://localhost:7000/health
```

Réponse attendue :
```json
{
  "message": "Application Running, Mongo Status: 1"
}
```

## Configuration

### Variables d'environnement complètes

Copiez ce modèle dans votre `.env` :

```env
// BASE DE DONNÉES
MONGODB_URI=mongodb://localhost:27017/datavise

// SÉCURITÉ
JWT_SECRET=changez_moi_par_une_chaine_ultra_securisee
JWT_EXPIRATION=7d

// SERVEUR
PORT=7000
NODE_ENV=development

// CORS (origines autorisées)
CORS_ALLOW_ORIGINS=http://localhost:5173,http://localhost:3000

// INTELLIGENCE ARTIFICIELLE (optionnel)
OPENAI_API_KEY=sk-proj-votre_cle_api_openai
AI_MODEL=gpt-4o-mini

```

### Explication des variables importantes

| Variable | Description | Exemple |
|----------|-------------|---------|
| `MONGODB_URI` | Connexion à votre base MongoDB | `mongodb://localhost:27017/datavise` |
| `JWT_SECRET` | Clé secrète pour signer les tokens JWT (changez-la !) | `mon_super_secret_2024` |
| `JWT_EXPIRATION` | Durée de validité des tokens | `7d` (7 jours) |
| `PORT` | Port du serveur | `7000` |
| `CORS_ALLOW_ORIGINS` | Sites autorisés à appeler l'API (séparés par `,`) | `http://localhost:5173` |
| `OPENAI_API_KEY` | Clé API OpenAI pour l'IA (optionnel) | `sk-proj-...` |
| `ELASTICSEARCH_URL` | URL Elasticsearch si utilisé | `http://localhost:9200` |

### Générer un JWT_SECRET sécurisé

**Linux/Mac :**
```bash
openssl rand -base64 32
```

**Windows PowerShell :**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**En ligne :**
- Utilisez [RandomKeygen.com](https://randomkeygen.com/)

### Configuration MongoDB Atlas (Cloud)

1. Créez un compte gratuit sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un cluster (bouton "Build a Database")
3. Créez un utilisateur de base de données
4. Ajoutez votre IP à la whitelist (ou `0.0.0.0/0` pour autoriser toutes les IPs)
5. Récupérez la connection string :
   ```
   mongodb+srv://username:password@cluster.mongodb.net/datavise
   ```
6. Collez-la dans `MONGODB_URI`

## Utilisation

### Workflow de base

1. S'inscrire/Se connecter → Obtenir un token JWT
2. Créer une source de données (CSV, JSON, API)
3. Créer des widgets (manuellement ou avec l'IA)
4. Organiser les widgets dans un dashboard
5. Partager le dashboard (public/privé/utilisateurs spécifiques)

## API Documentation

### Documentation interactive

Accédez à la documentation Swagger :

```
http://localhost:7000/api-docs
```

### Endpoints principaux

| Catégorie | Base URL | Authentification |
|-----------|----------|------------------|
| **Auth** | `/api/v1/auth` | Public |
| **Users** | `/api/v1/auth/users` | JWT + Permission |
| **Roles** | `/api/v1/auth/roles` | JWT + Permission |
| **Data Sources** | `/api/v1/data-sources` | JWT + Permission |
| **Widgets** | `/api/v1/widgets` | JWT + Permission |
| **Dashboards** | `/api/v1/dashboards` | JWT + Permission |
| **AI Generation** | `/api/v1/ai` | JWT + Permission |
| **AI Conversations** | `/api/v1/ai-conversations` | JWT + Permission |
| **Uploads** | `/api/uploads` | JWT |

### Authentification

Tous les endpoints protégés nécessitent un header :

```http
Authorization: Bearer <JWT_TOKEN>
```

Obtenez un token via :
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`

### Permissions RBAC

Format : `{resource}:{action}`

| Ressource | Actions |
|-----------|---------|
| `user` | `canView`, `canCreate`, `canUpdate`, `canDelete` |
| `role` | `canView`, `canCreate`, `canUpdate`, `canDelete` |
| `datasource` | `canView`, `canCreate`, `canUpdate`, `canDelete` |
| `widget` | `canView`, `canCreate`, `canUpdate`, `canDelete` |
| `dashboard` | `canView`, `canCreate`, `canUpdate`, `canDelete` |

## Tests

### Lancer les tests

```bash
# Tous les tests
npm test

# Mode watch
npm run test:watch

# Avec couverture
npm run test:coverage

# Par catégorie
npm run test:services
npm run test:routes
npm run test:auth
```

### Couverture

```
Test Suites: 15 passed, 15 total
Tests:       81 passed, 81 total
Coverage:    96.4%
```

Voir [TESTING.md](TESTING.md) pour plus de détails.

## Déploiement

### Vercel (Recommandé)

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Déployer
npm run vercel:deploy
```

Configurer les variables d'environnement dans le dashboard Vercel.

### Docker

```bash
# Build
docker build -t datavise-api .

# Run
docker run -p 7000:7000 \
  -e MONGODB_URI=your_mongodb_uri \
  -e JWT_SECRET=your_secret \
  datavise-api
```

### Docker Compose

```bash
docker-compose up -d
```

### VPS

```bash
# Cloner et installer
git clone https://github.com/Soule73/datavise-api.git
cd datavise-api
npm install
npm run build

# Utiliser PM2
npm install -g pm2
pm2 start dist/index.js --name datavise-api
pm2 save
pm2 startup
```

## Contribution

Les contributions sont les bienvenues !

### Workflow

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

### Standards

- Suivre le style de code existant
- Ajouter des tests pour les nouvelles fonctionnalités
- Mettre à jour la documentation si nécessaire
- Vérifier que tous les tests passent (`npm test`)

### Structure des commits

```
type(scope): description

[corps optionnel]

[footer optionnel]
```

Types : `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Ressources

- [Documentation API (Swagger)](http://localhost:7000/api-docs)
- [Frontend DataVise](https://github.com/Soule73/datavise)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js](https://expressjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [OpenAI API](https://platform.openai.com/docs)

## Support

- **Issues** : [GitHub Issues](https://github.com/Soule73/datavise/issues)
- **Discussions** : [GitHub Discussions](https://github.com/Soule73/datavise/discussions)

## Licence

[ISC](LICENSE) © [Soule73](https://github.com/Soule73)

---

**Version 1.0.0** - Novembre 2024
