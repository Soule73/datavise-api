# DataVise API

API REST moderne et scalable pour la visualisation et la gestion de données avec intelligence artificielle, construite avec Node.js, Express et TypeScript.

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#%EF%B8%8F-configuration)
- [Démarrage](#-démarrage)
- [Architecture](#-architecture)
- [API Endpoints](#-api-endpoints)
- [Authentification & Permissions](#-authentification--permissions)
- [Tests](#-tests)
- [Documentation API](#-documentation-api)
- [Déploiement](#-déploiement)
- [Contribution](#-contribution)
- [Licence](#-licence)

## ✨ Fonctionnalités

### Core Features
- **Authentification JWT sécurisée** avec gestion de sessions
- **Système de permissions granulaire** (RBAC - Role Based Access Control)
- **Gestion multi-utilisateurs** avec rôles personnalisables
- **Sources de données multiples** : CSV, JSON, API REST, Elasticsearch
- **Tableaux de bord interactifs** avec 10+ types de widgets
- **Upload et parsing de fichiers** avec validation
- **Cache intelligent** pour optimiser les performances
- **API RESTful versionnée** (v1) avec pagination

### AI Features (Nouveauté)
- **Génération automatique de widgets** par IA (OpenAI GPT)
- **Analyse intelligente des sources de données**
- **Suggestions contextuelles** basées sur le type de données
- **Conversations AI** pour créer des visualisations en langage naturel
- **Raffinement itératif** des widgets générés

### Sécurité & Performance
- **Validation robuste** avec Zod
- **Sanitization** des entrées utilisateur
- **Rate limiting** (à implémenter)
- **Gestion d'erreurs centralisée**
- **Cache multi-niveaux** (Node-cache)
- **Optimisation des requêtes MongoDB**

## 🛠 Technologies

### Backend Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Langage**: TypeScript 5.x
- **Base de données**: MongoDB 8.x avec Mongoose
- **Authentification**: JWT (jsonwebtoken)
- **Validation**: Zod 4.x
- **Upload**: Multer 2.x
- **AI**: OpenAI GPT-4o-mini

### Outils & Infrastructure
- **Testing**: Jest + Supertest + MongoDB Memory Server
- **Documentation**: Swagger/OpenAPI 3.0
- **Déploiement**: Vercel (serverless)
- **CI/CD**: GitHub Actions
- **Intégration**: Elasticsearch 9.x
- **Cache**: node-cache 5.x

## 📦 Prérequis

```bash
Node.js >= 18.0.0
MongoDB >= 6.0 (local ou Atlas)
npm >= 9.0.0 ou yarn >= 1.22.0
```

**Optionnel** :
- Elasticsearch >= 8.0 (pour l'intégration)
- Compte OpenAI (pour les features IA)

## 🚀 Installation

### 1. Cloner le repository

```bash
git clone https://github.com/Soule73/datavise.git
cd datavise-api
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration (voir section suivante)

### 4. Compiler TypeScript

```bash
npm run build
```

## ⚙️ Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine :

```bash
cp .env.example .env
```

#### Configuration complète

```env
# ========================================
# BASE DE DONNÉES
# ========================================
MONGODB_URI=mongodb://localhost:27017/datavise
# Ou MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/datavise

# ========================================
# JWT & SÉCURITÉ
# ========================================
JWT_SECRET=votre_secret_jwt_ultra_securise_min_32_caracteres
JWT_EXPIRATION=7d

# ========================================
# SERVEUR
# ========================================
PORT=7000
NODE_ENV=development

# ========================================
# CORS
# ========================================
# Origines autorisées séparées par des virgules
CORS_ALLOW_ORIGINS=http://localhost:5173,http://localhost:3000
# Ou origine unique (ancienne méthode):
CORS_ORIGIN=http://localhost:5173

# ========================================
# ELASTICSEARCH (OPTIONNEL)
# ========================================
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=changeme

# ========================================
# OPENAI (FEATURES IA)
# ========================================
OPENAI_API_KEY=sk-proj-...votre-clé-api
AI_MODEL=gpt-4o-mini
# Modèles disponibles: gpt-4o, gpt-4o-mini, gpt-4-turbo

# ========================================
# UPLOADS
# ========================================
MAX_FILE_SIZE=10485760
# 10MB = 10 * 1024 * 1024

# ========================================
# CACHE
# ========================================
CACHE_TTL=300
# TTL en secondes (300s = 5min)
```

### Configuration MongoDB Atlas (Production)

1. Créez un cluster sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un utilisateur avec rôle `readWrite`
3. Autorisez l'IP de votre serveur (ou `0.0.0.0/0` pour tous)
4. Récupérez la connection string :

```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/datavise?retryWrites=true&w=majority
```

## 🎯 Démarrage

### Mode Développement (avec hot-reload)

```bash
npm start
```

L'API démarre sur : `http://localhost:7000`

### Mode Production

```bash
npm run build
npm run start:prod
```

### Vérification de santé

```bash
curl http://localhost:7000/health
```

Réponse attendue :
```json
{
  "message": "Application Running, Mongo Status: 1"
}
```

## 🏗 Architecture

### Structure du projet

```
datavise-api/
├── src/
│   ├── config/              # Configuration (DB, Swagger)
│   │   ├── database.ts
│   │   └── swagger.ts
│   ├── controllers/         # Contrôleurs anciens (à migrer)
│   │   ├── dashboardController.ts
│   │   ├── dataSourceController.ts
│   │   ├── userController.ts
│   │   └── widgetController.ts
│   ├── data/                # Données de seed
│   │   ├── initPermissions.ts
│   │   ├── ventes-exemple.csv
│   │   └── ventes-exemple.json
│   ├── middleware/          # Middlewares globaux
│   │   ├── auth.ts
│   │   └── requirePermission.ts
│   ├── models/              # Modèles Mongoose
│   │   ├── AIConversation.ts
│   │   ├── Dashboard.ts
│   │   ├── DataSource.ts
│   │   ├── Permission.ts
│   │   ├── Role.ts
│   │   ├── User.ts
│   │   └── Widget.ts
│   ├── services/            # Logique métier
│   │   ├── aiConversationService.ts
│   │   ├── aiWidgetService.ts
│   │   ├── dashboardService.ts
│   │   ├── dataSourceService.ts
│   │   ├── userService.ts
│   │   └── widgetService.ts
│   ├── types/               # Définitions TypeScript
│   │   ├── aiType.ts
│   │   ├── api.ts
│   │   ├── authType.ts
│   │   ├── dashboardType.ts
│   │   ├── sourceType.ts
│   │   └── widgetType.ts
│   ├── utils/               # Utilitaires
│   │   ├── aiPrompts.ts
│   │   ├── aiServiceHelpers.ts
│   │   ├── api.ts
│   │   ├── banner.ts
│   │   ├── cvsUtils.ts
│   │   ├── dataSourceUtils.ts
│   │   ├── validation.ts
│   │   └── ...
│   ├── v1/                  # API v1 (nouvelle architecture)
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── dashboards.controller.ts
│   │   │   ├── data-sources.controller.ts
│   │   │   ├── widgets.controller.ts
│   │   │   ├── ai-generations.controller.ts
│   │   │   └── ai-conversations.controller.ts
│   │   ├── middlewares/
│   │   │   ├── validate.middleware.ts
│   │   │   └── paginate.middleware.ts
│   │   ├── routes/
│   │   │   ├── index.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── dashboards.routes.ts
│   │   │   ├── data-sources.routes.ts
│   │   │   ├── widgets.routes.ts
│   │   │   └── ai/
│   │   │       ├── index.ts
│   │   │       ├── generations.routes.ts
│   │   │       └── conversations.routes.ts
│   │   ├── validators/      # Schémas Zod
│   │   │   ├── auth.schema.ts
│   │   │   ├── dashboard.schema.ts
│   │   │   ├── data-source.schema.ts
│   │   │   ├── widget.schema.ts
│   │   │   └── ai.schema.ts
│   │   └── utils/
│   │       └── response.util.ts
│   ├── validation/          # Anciennes validations Zod
│   │   ├── dataSource.ts
│   │   ├── role.ts
│   │   └── user.ts
│   └── index.ts            # Point d'entrée
├── tests/                   # Tests Jest
│   ├── setup.ts
│   ├── helpers/
│   ├── models/
│   ├── routes/
│   │   └── v1/
│   └── services/
├── uploads/                 # Fichiers uploadés (gitignored)
├── .env.example
├── jest.config.js
├── package.json
├── tsconfig.json
├── vercel.json
└── README.md
```

### Pattern Architectural

**API v1** suit l'architecture en couches :

```
Routes (v1/routes/)
    ↓ validation middleware
Controllers (v1/controllers/)
    ↓ business logic
Services (services/)
    ↓ data access
Models (models/)
    ↓ database
MongoDB
```

### Modèles de données

#### User
```typescript
{
  _id: ObjectId
  username: string
  email: string (unique)
  password: string (hashed)
  roleId: ObjectId → Role
  passwordChangedAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

#### Role
```typescript
{
  _id: ObjectId
  name: string (unique)
  description?: string
  permissions: ObjectId[] → Permission
  createdAt: Date
}
```

#### Permission
```typescript
{
  _id: ObjectId
  name: string (unique, format: "resource:action")
  description?: string
}
```

#### DataSource
```typescript
{
  _id: ObjectId
  name: string
  type: 'json' | 'csv' | 'elasticsearch'
  // Type JSON
  endpoint?: string
  method?: 'GET' | 'POST'
  headers?: Record<string, string>
  body?: any
  // Type CSV/File
  filePath?: string
  fileName?: string
  delimiter?: string
  // Type Elasticsearch
  elasticsearchConfig?: {
    index: string
    query?: any
  }
  // Métadonnées
  ownerId: ObjectId → User
  visibility: 'public' | 'private'
  sharedWith: ObjectId[] → User
  createdAt: Date
  updatedAt: Date
}
```

#### Widget
```typescript
{
  _id: ObjectId
  name: string
  type: 'bar' | 'line' | 'pie' | 'kpi' | 'card' | ...
  dataSourceId: ObjectId → DataSource
  config: {
    metrics: Array<{
      field: string
      aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max'
      label?: string
    }>
    buckets?: Array<{
      field: string
      limit?: number
    }>
    globalFilters?: Array<{
      field: string
      operator: string
      value: any
    }>
    styles?: Record<string, any>
  }
  ownerId: ObjectId → User
  visibility: 'public' | 'private'
  sharedWith: ObjectId[] → User
  createdAt: Date
  updatedAt: Date
}
```

#### Dashboard
```typescript
{
  _id: ObjectId
  name: string
  description?: string
  layout: Array<{
    widgetId: ObjectId → Widget
    x: number
    y: number
    w: number
    h: number
  }>
  ownerId: ObjectId → User
  visibility: 'public' | 'private'
  sharedWith: ObjectId[] → User
  createdAt: Date
  updatedAt: Date
}
```

#### AIConversation
```typescript
{
  _id: ObjectId
  userId: ObjectId → User
  dataSourceId: ObjectId → DataSource
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
  }>
  generatedWidgets: Array<{
    widgetId?: ObjectId → Widget
    config: any
    saved: boolean
  }>
  metadata: {
    sourceAnalysis?: any
    lastPrompt?: string
  }
  createdAt: Date
  updatedAt: Date
}
```

## 📡 API Endpoints

### Base URL

```
Development: http://localhost:7000/api/v1
Production: https://your-domain.vercel.app/api/v1
```

### 🔐 Authentification

#### POST `/v1/auth/register`
Inscription d'un nouvel utilisateur

**Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecureP@ss123"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "john_doe",
      "email": "john@example.com",
      "roleId": {
        "_id": "507f...",
        "name": "User"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Utilisateur créé avec succès"
}
```

#### POST `/v1/auth/login`
Connexion utilisateur

**Body:**
```json
{
  "email": "john@example.com",
  "password": "SecureP@ss123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": { ...user object },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Connexion réussie"
}
```

#### GET `/v1/auth/profile`
Récupérer le profil de l'utilisateur connecté

**Headers:** `Authorization: Bearer {token}`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f...",
    "username": "john_doe",
    "email": "john@example.com",
    "roleId": {
      "_id": "507f...",
      "name": "User",
      "permissions": [...]
    }
  }
}
```

### 👥 Gestion des utilisateurs

#### GET `/v1/auth/users`
Liste paginée des utilisateurs

**Permissions:** `user:canView`

**Query params:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `roleId` (string, optional)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [...users],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### GET `/v1/auth/users/:id`
Détails d'un utilisateur

**Permissions:** `user:canView`

#### POST `/v1/auth/users`
Créer un utilisateur (admin)

**Permissions:** `user:canCreate`

**Body:**
```json
{
  "username": "new_user",
  "email": "user@example.com",
  "password": "Password123!",
  "roleId": "507f1f77bcf86cd799439011"
}
```

#### PUT `/v1/auth/users/:id`
Mettre à jour un utilisateur

**Permissions:** `user:canUpdate` (ou propriétaire)

**Body:**
```json
{
  "username": "updated_name",
  "email": "newemail@example.com",
  "password": "NewPassword123!",
  "roleId": "507f..."
}
```

#### DELETE `/v1/auth/users/:id`
Supprimer un utilisateur

**Permissions:** `user:canDelete`

### 🎭 Gestion des rôles

#### GET `/v1/auth/roles`
Liste des rôles

**Permissions:** `role:canView`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f...",
      "name": "Admin",
      "description": "Administrateur système",
      "permissions": [...],
      "canDelete": false
    }
  ],
  "pagination": {...}
}
```

#### POST `/v1/auth/roles`
Créer un rôle

**Permissions:** `role:canCreate`

**Body:**
```json
{
  "name": "Manager",
  "description": "Gestionnaire de contenu",
  "permissions": ["507f...", "507f..."]
}
```

#### PUT `/v1/auth/roles/:id`
Mettre à jour un rôle

**Permissions:** `role:canUpdate`

#### DELETE `/v1/auth/roles/:id`
Supprimer un rôle

**Permissions:** `role:canDelete`

#### GET `/v1/auth/permissions`
Liste de toutes les permissions disponibles

**Permissions:** `role:canView`

### 📊 Sources de données

#### GET `/v1/data-sources`
Liste des sources de données

**Permissions:** `datasource:canView`

**Query params:**
- `page`, `limit` (pagination)
- `type` (json|csv|elasticsearch)
- `visibility` (public|private)

#### POST `/v1/data-sources`
Créer une source de données

**Permissions:** `datasource:canCreate`

**Body (JSON API):**
```json
{
  "name": "API Utilisateurs",
  "type": "json",
  "endpoint": "https://api.example.com/users",
  "method": "GET",
  "headers": {
    "Authorization": "Bearer token"
  },
  "visibility": "private"
}
```

**Body (CSV):**
```json
{
  "name": "Ventes 2024",
  "type": "csv",
  "filePath": "/uploads/ventes.csv",
  "fileName": "ventes.csv",
  "delimiter": ",",
  "visibility": "public"
}
```

**Body (Elasticsearch):**
```json
{
  "name": "Logs serveur",
  "type": "elasticsearch",
  "elasticsearchConfig": {
    "index": "logs-*",
    "query": {
      "match_all": {}
    }
  }
}
```

#### GET `/v1/data-sources/:id`
Détails d'une source

#### GET `/v1/data-sources/:id/preview`
Prévisualiser les données d'une source (100 premiers records)

**Response:**
```json
{
  "success": true,
  "data": {
    "records": [...],
    "count": 100,
    "columns": ["id", "name", "email", ...],
    "types": {
      "id": "number",
      "name": "string",
      "email": "string"
    }
  }
}
```

#### PUT `/v1/data-sources/:id`
Mettre à jour une source

**Permissions:** `datasource:canUpdate` (ou propriétaire)

#### DELETE `/v1/data-sources/:id`
Supprimer une source

**Permissions:** `datasource:canDelete` (ou propriétaire)

### 📈 Widgets

#### GET `/v1/widgets`
Liste des widgets

**Permissions:** `widget:canView`

**Query params:**
- `page`, `limit`
- `type` (bar|line|pie|kpi|card|...)
- `dataSourceId` (filtrer par source)

#### POST `/v1/widgets`
Créer un widget

**Permissions:** `widget:canCreate`

**Body (Widget KPI):**
```json
{
  "name": "Total des ventes",
  "type": "kpi",
  "dataSourceId": "507f...",
  "config": {
    "metrics": [
      {
        "field": "amount",
        "aggregation": "sum",
        "label": "Total"
      }
    ],
    "globalFilters": [
      {
        "field": "status",
        "operator": "equals",
        "value": "completed"
      }
    ]
  },
  "visibility": "private"
}
```

**Body (Widget Bar Chart):**
```json
{
  "name": "Ventes par catégorie",
  "type": "bar",
  "dataSourceId": "507f...",
  "config": {
    "metrics": [
      {
        "field": "amount",
        "aggregation": "sum",
        "label": "Montant"
      }
    ],
    "buckets": [
      {
        "field": "category",
        "limit": 10
      }
    ],
    "styles": {
      "backgroundColor": "rgba(75, 192, 192, 0.2)",
      "borderColor": "rgba(75, 192, 192, 1)"
    }
  }
}
```

#### GET `/v1/widgets/:id`
Détails d'un widget

#### GET `/v1/widgets/:id/data`
Récupérer les données calculées d'un widget

**Response:**
```json
{
  "success": true,
  "data": {
    "labels": ["Cat A", "Cat B", "Cat C"],
    "datasets": [
      {
        "label": "Montant",
        "data": [1500, 2300, 1800]
      }
    ]
  }
}
```

#### PUT `/v1/widgets/:id`
Mettre à jour un widget

**Permissions:** `widget:canUpdate` (ou propriétaire)

#### DELETE `/v1/widgets/:id`
Supprimer un widget

**Permissions:** `widget:canDelete` (ou propriétaire)

### 🎨 Tableaux de bord

#### GET `/v1/dashboards`
Liste des tableaux de bord

**Permissions:** `dashboard:canView`

#### POST `/v1/dashboards`
Créer un tableau de bord

**Permissions:** `dashboard:canCreate`

**Body:**
```json
{
  "name": "Dashboard Commercial",
  "description": "Vue d'ensemble des ventes",
  "layout": [
    {
      "widgetId": "507f...",
      "x": 0,
      "y": 0,
      "w": 6,
      "h": 3
    },
    {
      "widgetId": "507f...",
      "x": 6,
      "y": 0,
      "w": 6,
      "h": 3
    }
  ],
  "visibility": "public"
}
```

#### GET `/v1/dashboards/:id`
Détails d'un tableau de bord (avec widgets hydratés)

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f...",
    "name": "Dashboard Commercial",
    "layout": [
      {
        "widgetId": "507f...",
        "widget": {
          "_id": "507f...",
          "name": "Total ventes",
          "type": "kpi",
          "config": {...}
        },
        "x": 0,
        "y": 0,
        "w": 6,
        "h": 3
      }
    ],
    "ownerId": {...},
    "visibility": "public"
  }
}
```

#### PUT `/v1/dashboards/:id`
Mettre à jour un tableau de bord

**Permissions:** `dashboard:canUpdate` (ou propriétaire)

#### DELETE `/v1/dashboards/:id`
Supprimer un tableau de bord

**Permissions:** `dashboard:canDelete` (ou propriétaire)

### 🤖 AI - Génération de widgets

#### POST `/v1/ai/analyze`
Analyser une source de données avec IA

**Permissions:** `widget:canCreate`

**Body:**
```json
{
  "dataSourceId": "507f..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "columnAnalysis": [
      {
        "name": "amount",
        "type": "numeric",
        "uniqueCount": 1520,
        "samples": [150.5, 220.3, 89.99],
        "stats": {
          "min": 10.0,
          "max": 5000.0,
          "avg": 350.5
        }
      }
    ],
    "recommendations": {
      "suggestedWidgets": ["kpi", "bar", "line"],
      "insights": [...]
    }
  }
}
```

#### POST `/v1/ai/generate-widgets`
Générer automatiquement des widgets pour une source

**Permissions:** `widget:canCreate`

**Body:**
```json
{
  "dataSourceId": "507f...",
  "prompt": "Crée des visualisations pour analyser les ventes par région et produit"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "widgets": [
      {
        "name": "Ventes par région",
        "type": "bar",
        "config": {...},
        "reasoning": "Un graphique en barres permet de comparer facilement les ventes entre régions",
        "confidence": 0.92
      },
      {
        "name": "Top 10 produits",
        "type": "pie",
        "config": {...},
        "reasoning": "Un camembert montre la répartition des ventes par produit",
        "confidence": 0.88
      }
    ],
    "metadata": {
      "model": "gpt-4o-mini",
      "tokensUsed": 1250
    }
  }
}
```

#### POST `/v1/ai/refine-widgets`
Raffiner des widgets générés avec un nouveau prompt

**Body:**
```json
{
  "widgets": [...existing widgets configs],
  "prompt": "Ajoute une comparaison avec l'année précédente",
  "dataSourceId": "507f..."
}
```

### 💬 AI - Conversations

#### POST `/v1/ai-conversations`
Démarrer une conversation IA

**Body:**
```json
{
  "dataSourceId": "507f...",
  "message": "Je veux voir l'évolution des ventes sur les 6 derniers mois"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversationId": "507f...",
    "response": "J'ai analysé vos données de ventes. Voici 3 widgets pour visualiser l'évolution sur 6 mois...",
    "generatedWidgets": [...]
  }
}
```

#### POST `/v1/ai-conversations/:id/messages`
Continuer une conversation

**Body:**
```json
{
  "message": "Peux-tu ajouter un filtre par catégorie de produit ?"
}
```

#### GET `/v1/ai-conversations/:id`
Récupérer une conversation complète

#### POST `/v1/ai-conversations/:id/widgets/:widgetIndex/save`
Sauvegarder un widget généré depuis une conversation

### 📤 Upload de fichiers

#### POST `/api/uploads`
Upload d'un fichier CSV ou JSON

**Content-Type:** `multipart/form-data`

**Body:**
- `file` (File): Fichier CSV ou JSON

**Response:**
```json
{
  "success": true,
  "data": {
    "fileName": "ventes-2024.csv",
    "filePath": "/uploads/1234567890-ventes-2024.csv",
    "size": 524288,
    "mimetype": "text/csv"
  },
  "message": "Fichier uploadé avec succès"
}
```

#### GET `/api/uploads/:filename`
Télécharger un fichier uploadé

## 🔐 Authentification & Permissions

### Système JWT

Tous les endpoints protégés nécessitent un token JWT dans l'header :

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token JWT contient :
```json
{
  "id": "507f1f77bcf86cd799439011",
  "role": "Admin",
  "iat": 1698765432,
  "exp": 1699370232
}
```

### Permissions disponibles

#### Utilisateurs
- `user:canView` - Voir les utilisateurs
- `user:canCreate` - Créer des utilisateurs
- `user:canUpdate` - Modifier des utilisateurs
- `user:canDelete` - Supprimer des utilisateurs

#### Rôles
- `role:canView` - Voir les rôles
- `role:canCreate` - Créer des rôles
- `role:canUpdate` - Modifier des rôles
- `role:canDelete` - Supprimer des rôles

#### Sources de données
- `datasource:canView` - Voir les sources
- `datasource:canCreate` - Créer des sources
- `datasource:canUpdate` - Modifier des sources
- `datasource:canDelete` - Supprimer des sources

#### Widgets
- `widget:canView` - Voir les widgets
- `widget:canCreate` - Créer des widgets
- `widget:canUpdate` - Modifier des widgets
- `widget:canDelete` - Supprimer des widgets

#### Dashboards
- `dashboard:canView` - Voir les dashboards
- `dashboard:canCreate` - Créer des dashboards
- `dashboard:canUpdate` - Modifier des dashboards
- `dashboard:canDelete` - Supprimer des dashboards

### Rôles par défaut

#### Admin
- Toutes les permissions

#### User
- Lecture : datasource, widget, dashboard
- Création/Modification/Suppression de ses propres ressources

### Middleware de permissions

```typescript
// Exemple d'utilisation
router.post(
  "/widgets",
  requireAuth,
  requirePermission("widget:canCreate"),
  createWidget
);

// Permission conditionnelle (propriétaire OU permission)
router.put(
  "/widgets/:id",
  requireAuth,
  requirePermission("widget:canUpdate", true),
  updateWidget
);
```

## 🧪 Tests

### Stack de tests

- **Framework**: Jest 29
- **HTTP Testing**: Supertest
- **Database**: MongoDB Memory Server (tests isolés)
- **Coverage**: 96.4% (81/84 tests passants)

### Lancer les tests

```bash
# Tous les tests
npm test

# Tests avec watch mode
npm run test:watch

# Tests avec coverage
npm run test:coverage

# Tests spécifiques
npm run test:services    # Tests services uniquement
npm run test:routes      # Tests routes uniquement
npm run test:auth        # Tests auth uniquement

# CI mode (GitHub Actions)
npm run test:ci
```

### Structure des tests

```
tests/
├── setup.ts                      # Configuration globale Jest
├── helpers/
│   ├── auth.ts                   # Helpers auth (createTestUser, getAuthToken)
│   └── testHelpers.ts            # Helpers généraux
├── models/
│   └── User.test.ts              # Tests modèles Mongoose
├── routes/
│   └── v1/
│       ├── auth.test.ts          # Tests routes auth
│       ├── dashboards.test.ts
│       ├── data-sources.test.ts
│       └── widgets.test.ts
└── services/
    ├── userService.test.ts       # Tests services métier
    ├── dashboardService.test.ts
    ├── dataSourceService.test.ts
    └── widgetService.test.ts
```

### Exemple de test

```typescript
describe('POST /api/v1/widgets', () => {
  it('should create a widget with valid data', async () => {
    const token = await getAuthToken({ 
      permissions: ['widget:canCreate'] 
    });
    
    const response = await request(app)
      .post('/api/v1/widgets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Widget',
        type: 'kpi',
        dataSourceId: testDataSourceId,
        config: { metrics: [...] }
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('Test Widget');
  });
});
```

### Coverage actuel

```
Statements   : 85.2%
Branches     : 78.4%
Functions    : 82.1%
Lines        : 85.7%
```

## 📚 Documentation API

### Swagger/OpenAPI

La documentation interactive est disponible à :

```
http://localhost:7000/api-docs
```

Features :
- **Interface interactive** pour tester les endpoints
- **Schémas de données** complets
- **Exemples de requêtes/réponses**
- **Authentification JWT** intégrée (bouton "Authorize")

### Exporter la spec OpenAPI

```bash
curl http://localhost:7000/api-docs.json > openapi.json
```

### Génération de code client

Utilisez [OpenAPI Generator](https://openapi-generator.tech/) :

```bash
openapi-generator-cli generate \
  -i http://localhost:7000/api-docs.json \
  -g typescript-axios \
  -o ./client
```

## 🚢 Déploiement

### Vercel (Recommandé pour production)

#### 1. Installation Vercel CLI

```bash
npm install -g vercel
```

#### 2. Configuration Vercel

Le fichier `vercel.json` est déjà configuré :

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### 3. Déploiement

```bash
# Premier déploiement (configuration interactive)
vercel

# Déploiement production
npm run vercel:deploy
```

#### 4. Variables d'environnement Vercel

Configurez dans le dashboard Vercel ou via CLI :

```bash
vercel env add MONGODB_URI production
vercel env add JWT_SECRET production
vercel env add OPENAI_API_KEY production
vercel env add CORS_ALLOW_ORIGINS production
```

**Variables requises en production** :
- `MONGODB_URI` (MongoDB Atlas)
- `JWT_SECRET`
- `CORS_ALLOW_ORIGINS`
- `OPENAI_API_KEY` (si features IA activées)
- `ELASTICSEARCH_URL` (si Elasticsearch utilisé)

### Docker (Alternative)

#### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 7000

CMD ["npm", "run", "start:prod"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "7000:7000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/datavise
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
    depends_on:
      - mongo
  
  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

#### Déploiement Docker

```bash
docker-compose up -d
```

### VPS (Ubuntu/Debian)

#### Installation Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Installation MongoDB

```bash
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Déploiement de l'API

```bash
# Cloner et installer
git clone https://github.com/Soule73/datavise-api.git
cd datavise-api
npm install
npm run build

# PM2 pour garder l'app en vie
npm install -g pm2
pm2 start dist/index.js --name datavise-api
pm2 save
pm2 startup
```

#### Nginx reverse proxy

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:7000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🤝 Contribution

### Workflow de contribution

1. **Fork** le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. **Committez** vos changements (`git commit -m 'Add AmazingFeature'`)
4. **Pushez** vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une **Pull Request**

### Standards de code

#### TypeScript
- Utilisez des types explicites (évitez `any`)
- Préférez les interfaces aux types pour les objets
- Documentez les fonctions publiques avec JSDoc

#### Commits
Format : `type(scope): message`

Types :
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `test`: Tests
- `refactor`: Refactoring
- `chore`: Tâches de maintenance

Exemple :
```bash
git commit -m "feat(ai): add widget generation with refinement"
git commit -m "fix(auth): resolve JWT expiration issue"
```

#### Tests
- Écrivez des tests pour toute nouvelle fonctionnalité
- Maintenez un coverage > 80%
- Testez les cas limites et erreurs

#### Pull Requests
- Décrivez clairement les changements
- Incluez des screenshots si changements UI
- Liez les issues concernées (#123)
- Assurez-vous que tous les tests passent

### Setup environnement de développement

```bash
# Installation
git clone https://github.com/Soule73/datavise-api.git
cd datavise-api
npm install

# Configuration
cp .env.example .env
# Éditez .env avec vos valeurs

# Lancer en dev
npm start

# Lancer les tests en watch
npm run test:watch
```

## 🐛 Debugging

### Logs

Les logs sont affichés dans la console :

```bash
# Développement (verbeux)
NODE_ENV=development npm start

# Production (minimal)
NODE_ENV=production npm run start:prod
```

### Erreurs courantes

#### `MongoDB connection failed`
- Vérifiez `MONGODB_URI` dans `.env`
- Assurez-vous que MongoDB est démarré
- Testez la connexion : `mongosh "mongodb://localhost:27017/datavise"`

#### `JWT secret not configured`
- Définissez `JWT_SECRET` dans `.env`
- Générez un secret sécurisé : `openssl rand -base64 32`

#### `CORS error`
- Vérifiez `CORS_ALLOW_ORIGINS` dans `.env`
- Format : `http://localhost:5173,https://app.domain.com`

#### `File upload failed`
- Vérifiez les permissions du dossier `uploads/`
- `chmod 755 uploads/`

### Debug mode

Utilisez VS Code launch configuration :

`.vscode/launch.json` :
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug API",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["start"],
      "console": "integratedTerminal",
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

## 📋 TODO / Roadmap

### Court terme (v1.1)
- [ ] Rate limiting (express-rate-limit)
- [ ] Logs structurés (Winston/Pino)
- [ ] Healthcheck avancé (/health détaillé)
- [ ] Métriques Prometheus
- [ ] Webhooks pour événements

### Moyen terme (v1.2)
- [ ] WebSocket pour real-time
- [ ] Export PDF/Excel des dashboards
- [ ] Notifications email
- [ ] Audit logs
- [ ] 2FA (Two-Factor Authentication)

### Long terme (v2.0)
- [ ] GraphQL API en parallèle de REST
- [ ] Microservices architecture
- [ ] Event sourcing
- [ ] Multi-tenancy
- [ ] Plugin system

## 📄 Licence

Ce projet est sous licence **ISC**.

```
Copyright (c) 2024 Soule73

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.
```

Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- [Express.js](https://expressjs.com/) pour le framework web
- [Mongoose](https://mongoosejs.com/) pour l'ODM MongoDB
- [Zod](https://zod.dev/) pour la validation
- [OpenAI](https://openai.com/) pour les features IA
- Toute la communauté open-source

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/Soule73/datavise/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Soule73/datavise/discussions)
- **Email**: soule@example.com
- **Documentation**: [Swagger Docs](http://localhost:7000/api-docs)

## 🔗 Liens utiles

### Documentation externe
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [JWT.io](https://jwt.io/) - Decoder JWT
- [Vercel Documentation](https://vercel.com/docs)
- [OpenAPI Specification](https://swagger.io/specification/)

### Outils recommandés
- [Postman](https://www.postman.com/) - Tester l'API
- [MongoDB Compass](https://www.mongodb.com/products/compass) - GUI MongoDB
- [Insomnia](https://insomnia.rest/) - Alternative à Postman
- [Robo 3T](https://robomongo.org/) - Client MongoDB léger

### Projets liés
- [DataVise Frontend](https://github.com/Soule73/datavise) - Application React
- [DataVise Docs](https://github.com/Soule73/datavise-docs) - Documentation complète

---

**Développé avec ❤️ par [Soule73](https://github.com/Soule73)**

*Dernière mise à jour : 27 novembre 2024*