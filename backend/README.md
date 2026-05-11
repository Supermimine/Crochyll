# Backend - Crochyll

Backend Node.js + Express pour l'application Crochyll (Vue3 + Vuetify).

## 🚀 Démarrage rapide

### Installation

```bash
cd backend
npm install
```

### Développement

```bash
npm run dev
```

Le serveur démarrera sur `http://localhost:3000`

### Build & Production

```bash
npm run build
npm start
```

## 📋 Configuration

Créer un fichier `.env` à la racine du backend :

```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# À remplir selon votre service email
EMAILJS_SERVICE_ID=
EMAILJS_TEMPLATE_ID=
EMAILJS_PUBLIC_KEY=
```

## 🔌 API Endpoints

### Health Check
- **GET** `/api/health` - Vérifier que le backend fonctionne

### Produits
- **GET** `/api/products` - Récupérer tous les produits
- **GET** `/api/products/:id` - Récupérer un produit par ID
- **GET** `/api/products/category/:category` - Récupérer les produits d'une catégorie

### Emails
- **POST** `/api/email/send` - Envoyer un email générique
  ```json
  {
    "to": "email@example.com",
    "subject": "Sujet",
    "message": "Message"
  }
  ```
- **POST** `/api/email/contact` - Envoyer un formulaire de contact
  ```json
  {
    "name": "Nom",
    "email": "email@example.com",
    "subject": "Sujet",
    "message": "Message"
  }
  ```

## 📦 Dépendances principales

- **express** - Framework web
- **cors** - Gestion du CORS
- **dotenv** - Variables d'environnement
- **axios** - HTTP client
- **typescript** - Language
- **ts-node** - Exécution directe de TypeScript
- **nodemon** - Rechargement automatique

## 🔧 TODO - À implémenter

1. **Données produits** - Remplacer `getProducts()` dans `src/routes/products.ts`
2. **Envoi d'emails** - Implémenter la logique dans `src/routes/email.ts`
3. **Base de données** - Si nécessaire, ajouter une connexion DB
4. **Authentification** - Implémenter si besoin
5. **Validation** - Ajouter une validation plus robuste des données

## 🌐 Communication Frontend-Backend

Le frontend peut utiliser le service API préconfiguré :

```typescript
import { api } from '@/service/api';

// Vérifier la connexion
await api.healthCheck();

// Récupérer les produits
const response = await api.getProducts();

// Envoyer un email
await api.sendEmail({
  to: 'example@mail.com',
  subject: 'Test',
  message: 'Message test'
});
```

## 🚢 Déploiement

### Vercel
1. Créer un compte Vercel
2. Importer le projet GitHub
3. Configurer les variables d'environnement
4. Déployer

### Railway
1. Créer un compte Railway
2. Connecter le repo GitHub
3. Railway détecte automatiquement Node.js
4. Configurer les variables d'environnement
5. Déployer

### Render
1. Créer un compte Render
2. Créer un nouveau "Web Service"
3. Connecter GitHub
4. Configurer build command: `npm run build`
5. Configurer start command: `npm start`
6. Ajouter variables d'environnement
7. Déployer

## 📝 Structure du projet

```
backend/
├── src/
│   ├── server.ts           # Point d'entrée
│   ├── types.ts            # Types TypeScript partagés
│   ├── routes/
│   │   ├── health.ts       # Routes santé
│   │   ├── products.ts     # Routes produits
│   │   └── email.ts        # Routes emails
│   └── controllers/        # Controllers (futur)
├── dist/                   # Fichiers compilés (auto-généré)
├── .env                    # Variables d'environnement
├── .gitignore              # Git ignore
├── tsconfig.json           # Configuration TypeScript
├── package.json            # Dépendances et scripts
└── README.md              # Ce fichier
```

## ❓ Questions fréquentes

**Q: Comment ajouter une nouvelle route ?**
A: Créer un fichier dans `src/routes/`, puis importer et utiliser dans `src/server.ts`.

**Q: Comment gérer les erreurs ?**
A: Utiliser les structures `ApiResponse` définies dans `types.ts`.

**Q: Puis-je utiliser une base de données ?**
A: Oui ! Installer un driver (MongoDB, PostgreSQL, etc.) et l'intégrer aux routes.

## 📞 Support

Pour toute question, consultez la documentation officielle :
- Express.js: https://expressjs.com/
- TypeScript: https://www.typescriptlang.org/
- Vue 3 + Vite: https://vitejs.dev/
