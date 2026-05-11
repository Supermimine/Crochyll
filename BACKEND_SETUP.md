# Guide de configuration - Backend Crochyll

## ✅ Étapes complétées

### Phase 1 : Structure et installation
- ✅ Créé le dossier `/backend` avec structure complète
- ✅ Initialisé `npm` et installé toutes les dépendances
- ✅ Configuré TypeScript avec `tsconfig.json`

### Phase 2 : Configuration et environnement
- ✅ Créé `.env` pour les variables d'environnement
- ✅ Créé `.gitignore` pour exclure les dossiers sensibles
- ✅ Configuré CORS pour communiquer avec le frontend (port 5173)

### Phase 3 : Backend de base
- ✅ Créé `src/server.ts` - Point d'entrée principal
- ✅ Créé `src/types.ts` - Types TypeScript partagés
- ✅ Créé `src/routes/health.ts` - Vérification de santé
- ✅ Créé `src/routes/products.ts` - Gestion des produits
- ✅ Créé `src/routes/email.ts` - Gestion des emails

### Phase 4 : Service frontend
- ✅ Créé `src/service/api.ts` - Service pour communiquer avec le backend
- ✅ Créé `.env` (racine du projet) - Configuration API frontend

---

## 🚀 Comment démarrer

### Option 1 : Frontend + Backend séparé

**Terminal 1 - Backend :**
```bash
cd backend
npm run dev
```
✅ Serveur démarrera sur `http://localhost:3000`

**Terminal 2 - Frontend :**
```bash
npm run dev
```
✅ App démarrera sur `http://localhost:5173`

### Option 2 : Build pour production
```bash
# Backend
cd backend
npm run build
npm start

# Frontend (dans un autre terminal ou onglet)
npm run build
npm run preview
```

---

## 🧪 Tester la communication

### Via le terminal (curl)

1. **Test health check du backend**
```bash
curl http://localhost:3000/api/health
```
Résultat attendu :
```json
{
  "success": true,
  "status": "Backend is running",
  "timestamp": "2026-05-10T..."
}
```

2. **Test produits (vide pour le moment)**
```bash
curl http://localhost:3000/api/products
```
Résultat attendu :
```json
{
  "success": true,
  "data": [],
  "timestamp": "2026-05-10T..."
}
```

### Via le frontend (JavaScript)

Dans la console du navigateur (F12) :

```javascript
// Test 1 : Vérifier la connexion
import { api } from '/src/service/api.ts'
await api.healthCheck()  // Devrait retourner true

// Test 2 : Récupérer les produits
const products = await api.getProducts()
console.log(products)

// Test 3 : Envoyer un email test
await api.sendEmail({
  to: 'test@example.com',
  subject: 'Test',
  message: 'Message test'
})
```

---

## 📝 Prochaines étapes

### 1. **Intégrer vos données produits**
Fichier : `backend/src/routes/products.ts`

Remplacer la fonction `getProducts()` pour :
- Importer vos données depuis `shopData.ts`
- Ou charger depuis une base de données
- Ou lire depuis un fichier JSON

**Exemple simple :**
```typescript
const getProducts = (): Product[] => {
  return [
    {
      id: '1',
      name: 'Mon produit',
      price: 29.99,
      category: 'amigurumi',
      measure: '10x10x10cm',
      weight: 100
    }
  ];
};
```

### 2. **Implémenter l'envoi d'emails**
Fichier : `backend/src/routes/email.ts`

Options d'implémentation :
- **Option A** : Nodemailer (simple, gratuit)
- **Option B** : EmailJS (plus simple)
- **Option C** : SendGrid, Mailgun (professionnel)

**Exemple avec Nodemailer :**
```bash
npm install nodemailer
npm install -D @types/nodemailer
```

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Dans la route
await transporter.sendMail({
  from: process.env.SMTP_FROM,
  to: emailData.to,
  subject: emailData.subject,
  text: emailData.message
});
```

### 3. **Activer les routes commentées**
Fichier : `backend/src/server.ts`

Décommenter les lignes pour activer les routes :
```typescript
import healthRoutes from './routes/health';
import productRoutes from './routes/products';
import emailRoutes from './routes/email';
app.use('/api', healthRoutes);
app.use('/api', productRoutes);
app.use('/api', emailRoutes);
```

### 4. **Ajouter une base de données (optionnel)**
- MongoDB : `npm install mongoose`
- PostgreSQL : `npm install pg`
- SQLite : `npm install sqlite3`

### 5. **Déployer le backend**
- **Vercel** : Upload du repo GitHub → Détection auto Node.js
- **Railway** : Upload du repo GitHub → Config simple
- **Render** : Upload du repo GitHub → Config simple
- **Fly.io** : Build Docker → Upload

---

## 📂 Structure créée

```
Crochyll/
├── backend/                    # ✅ NOUVEAU
│   ├── src/
│   │   ├── server.ts          # Point d'entrée
│   │   ├── types.ts           # Types TypeScript
│   │   ├── routes/
│   │   │   ├── health.ts      # GET /api/health
│   │   │   ├── products.ts    # GET /api/products, etc.
│   │   │   └── email.ts       # POST /api/email/send, etc.
│   │   └── controllers/       # (Futur)
│   ├── dist/                  # Compilé (auto-généré)
│   ├── .env                   # Variables d'environnement
│   ├── .gitignore            # Git ignore
│   ├── tsconfig.json         # Configuration TypeScript
│   ├── package.json          # Scripts et dépendances
│   └── README.md             # Documentation backend
│
├── src/                        # ✅ MODIFIÉ
│   ├── service/
│   │   ├── api.ts            # ✅ NOUVEAU - Service API
│   │   └── ...
│   └── ...
│
├── .env                        # ✅ NOUVEAU - Config frontend
├── package.json              # (Existant)
└── README.md                 # (Existant)
```

---

## ⚙️ Variables d'environnement

### Backend (`backend/.env`)
```env
PORT=3000                              # Port du serveur
NODE_ENV=development                   # Mode développement
FRONTEND_URL=http://localhost:5173     # URL frontend pour CORS
EMAILJS_SERVICE_ID=                    # À remplir si emails
EMAILJS_TEMPLATE_ID=                   # À remplir si emails
EMAILJS_PUBLIC_KEY=                    # À remplir si emails
```

### Frontend (`root/.env`)
```env
VITE_API_URL=http://localhost:3000     # URL backend
```

---

## 🔧 Commandes utiles

### Backend
```bash
npm run dev      # Développement avec rechargement auto
npm run build    # Compiler TypeScript → dist/
npm start        # Démarrer le serveur compilé
```

### Frontend
```bash
npm run dev      # Développement
npm run build    # Build production
npm run preview  # Preview du build
```

---

## ✨ État actuel

| Composant | État | Notes |
|-----------|------|-------|
| Backend de base | ✅ OK | Démarre sans erreurs |
| Service API | ✅ OK | Prêt à utiliser |
| CORS | ✅ OK | Configuré pour localhost:5173 |
| Routes produits | ✅ OK | Template vide (à remplir) |
| Routes emails | ✅ OK | Template vide (à implémenter) |
| Base de données | ⏳ Optionnel | À ajouter si besoin |
| Authentification | ⏳ Optionnel | À ajouter si besoin |

---

## ❓ FAQ

**Q: Je dois redémarrer le backend à chaque modification ?**
A: Non ! `npm run dev` utilise nodemon + tsx qui recharge automatiquement.

**Q: Je peux utiliser React/Angular au lieu de Vue ?**
A: Oui ! Le backend est complètement indépendant du framework frontend.

**Q: Comment déboguer le backend ?**
A: Ajouter des `console.log()` - les logs s'affichent dans le terminal.

**Q: Je dois avoir deux terminaux ouverts ?**
A: Oui, un pour le backend et un pour le frontend. Ou utiliser un outil comme `concurrently`.

**Q: Puis-je déployer sur le même serveur ?**
A: Oui ! Utiliser Vercel, Railway, ou Render qui supportent Node.js + Frontend.

---

## 📞 Besoin d'aide ?

1. Vérifier que le backend démarre : `npm run dev` dans `/backend`
2. Vérifier CORS : Ouvrir l'inspecteur (F12) et chercher les erreurs CORS
3. Vérifier l'API endpoint : Utiliser curl ou Postman
4. Vérifier les logs : Regarder la console du navigateur et du terminal

---

**Status : ✅ Setup complété ! Vous êtes prêt à développer.**
