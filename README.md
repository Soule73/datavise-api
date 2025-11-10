# DataVise API

Une API REST moderne pour la visualisation et la gestion de données, construite avec Node.js, Express et TypeScript.

## Fonctionnalités

- **Authentification sécurisée** avec JWT
- **Gestion des utilisateurs et rôles** avec système de permissions
- **Upload de fichiers** CSV et JSON
- **Sources de données multiples** (fichiers, APIs, Elasticsearch)
- **Tableaux de bord personnalisables** avec widgets
- **Cache intelligent** pour optimiser les performances
- **Déploiement cloud** prêt (Vercel)

## Technologies

- **Backend**: Node.js, Express.js, TypeScript
- **Base de données**: MongoDB avec Mongoose
- **Authentification**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **Upload de fichiers**: Multer
- **Cache**: Node-cache
- **Intégration**: Elasticsearch
- **Déploiement**: Vercel

## Prérequis

- Node.js >= 18.x
- MongoDB (local ou Atlas)
- npm ou yarn

## Installation

1. **Cloner le repository**
```bash
git clone https://github.com/Soule73/datavise-api.git
cd datavise-api
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration des variables d'environnement**
```bash
cp .env.example .env
```

Variables requises dans `.env` :
```env
# Base de données
MONGODB_URI=mongodb://localhost:27017/datavise

# JWT Configuration
JWT_SECRET=votre_secret_jwt_tres_securise
JWT_EXPIRATION=24h

# CORS
CORS_ORIGIN=http://localhost:3000

# Port
PORT=3000

# Elasticsearch (optionnel)
ELASTICSEARCH_URL=http://localhost:9200
```

4. **Compiler le TypeScript**
```bash
npm run build
```

## Démarrage

### Développement
```bash
npm start
```

### Production
```bash
npm run start:prod
```

L'API sera accessible à l'adresse : `http://localhost:3000`

## Structure du projet

```
src/
├── config/           # Configuration base de données
├── controllers/      # Logique métier des routes
├── middleware/       # Middlewares Express (auth, permissions)
├── models/           # Modèles Mongoose
├── routes/          # Définition des routes API
├── services/        # Services métier
├── types/           # Types TypeScript
├── utils/           # Utilitaires
├── validation/      # Schémas de validation Zod
└── index.ts        # Point d'entrée de l'application
```

## 🛠 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription utilisateur
- `POST /api/auth/login` - Connexion utilisateur
- `GET /api/auth/profile` - Profil utilisateur (authentifié)

### Sources de données
- `GET /api/datasource` - Liste des sources de données
- `POST /api/datasource` - Créer une source de données
- `PUT /api/datasource/:id` - Modifier une source de données
- `DELETE /api/datasource/:id` - Supprimer une source de données

### Tableaux de bord
- `GET /api/dashboard` - Liste des tableaux de bord
- `POST /api/dashboard` - Créer un tableau de bord
- `PUT /api/dashboard/:id` - Modifier un tableau de bord
- `DELETE /api/dashboard/:id` - Supprimer un tableau de bord

### Widgets
- `GET /api/widget` - Liste des widgets
- `POST /api/widget` - Créer un widget
- `PUT /api/widget/:id` - Modifier un widget
- `DELETE /api/widget/:id` - Supprimer un widget

### Upload de fichiers
- `POST /api/uploads` - Upload d'un fichier CSV/JSON
- `GET /api/uploads/:filename` - Télécharger un fichier

## Système d'authentification

L'API utilise JWT pour l'authentification. Incluez le token dans l'en-tête Authorization :

```bash
Authorization: Bearer votre_token_jwt
```

## Déploiement

### Vercel (Recommandé)

1. **Installation de Vercel CLI**
```bash
npm install -g vercel
```

2. **Déploiement**
```bash
npm run vercel:deploy
```

### Variables d'environnement Vercel

Configurez les variables d'environnement dans le dashboard Vercel :
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRATION`
- `CORS_ORIGIN`

## Scripts disponibles

- `npm start` - Démarre le serveur en mode développement
- `npm run build` - Compile TypeScript vers JavaScript
- `npm run start:prod` - Démarre le serveur en mode production
- `npm run vercel:deploy` - Déploie sur Vercel

## 📝 Validation des données

Le projet utilise Zod pour la validation des données :

```typescript
// Exemple de schéma de validation
const userSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6)
});
```

## Gestion des erreurs

L'API retourne des erreurs au format JSON standardisé :

```json
{
  "success": false,
  "message": "Description de l'erreur",
  "error": "CODE_ERREUR"
}
```

## Contribution

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commitez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Pushez sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## Licence

Ce projet est sous licence ISC. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Liens utiles

- [Documentation MongoDB](https://docs.mongodb.com/)
- [Documentation Express.js](https://expressjs.com/)
- [Documentation TypeScript](https://www.typescriptlang.org/)
- [Documentation Vercel](https://vercel.com/docs)

## Support

Pour toute question ou problème, n'hésitez pas à ouvrir une issue sur GitHub.

---

Développé avec ❤️ par [Soule73](https://github.com/Soule73)