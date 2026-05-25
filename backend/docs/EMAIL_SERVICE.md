# Service Email - Configuration SMTP

Ce document explique comment configurer le service d'envoi d'emails avec **Nodemailer et SMTP**.

## 📋 Architecture

```
routes/email.ts
    ↓
services/mailer.service.ts (Nodemailer SMTP)
    ↓
SMTP Server (Gmail, SendGrid, etc.)
```

## 🚀 Configuration

### 1. Variables d'environnement (.env)

Copier le fichier `.env.example` vers `.env` et configurer:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@crochyll.com
SMTP_FROM_NAME=Crochyll
SUPPORT_EMAIL=support@crochyll.com
```

### 2. Options de serveur SMTP

#### Gmail (recommandé pour développement)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=votre-mot-de-passe-application
```

⚠️ **Important**: Gmail requiert un [mot de passe d'application](https://support.google.com/accounts/answer/185833), pas votre mot de passe Google.

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxxxxxxxxxx
```

#### AWS SES
```env
SMTP_HOST=email-smtp.region.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-smtp-username
SMTP_PASSWORD=votre-smtp-password
```

#### Autre serveur personnel/d'entreprise
```env
SMTP_HOST=mail.votre-domaine.com
SMTP_PORT=587 (ou 465)
SMTP_SECURE=false (true si port 465)
SMTP_USER=votre-email@votre-domaine.com
SMTP_PASSWORD=votre-mot-de-passe
```

## 🔒 Sécurité

### Bonnes pratiques:
1. **Ne jamais** commiter le fichier `.env` en production
2. Utiliser un **mot de passe d'application** au lieu du mot de passe principal
3. Utiliser **SMTP avec TLS (port 587)** plutôt que telnet (port 25)
4. Les données sensibles sont **automatiquement échappées** contre les injections XSS
5. Le service **valide les adresses email** avant envoi

### Variables sécurisées:
- Les identifiants sont lus uniquement depuis `.env`
- Aucun log ne contient les mots de passe
- Les emails sont validés côté serveur

## 📧 API Endpoints

### 1. Envoyer un email simple

**POST** `/api/email/send`

```json
{
  "to": "utilisateur@email.com",
  "subject": "Mon sujet",
  "message": "<h1>Bonjour</h1><p>Contenu HTML</p>"
}
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "messageId": "message-id-unique"
  },
  "timestamp": "2026-05-24T10:30:00Z"
}
```

### 2. Formulaire de contact

**POST** `/api/email/contact`

```json
{
  "name": "Jean Dupont",
  "email": "jean@email.com",
  "subject": "Question sur ma commande",
  "message": "Bonjour, j'aimerais savoir..."
}
```

L'email est envoyé à `SUPPORT_EMAIL` avec la réponse vers l'email du client.

### 3. Confirmation de commande

**POST** `/api/email/order-confirmation`

```json
{
  "to": "client@email.com",
  "orderData": {
    "orderId": "ORD-12345",
    "customerName": "Marie Dupont",
    "items": [
      {
        "name": "Amigurumi Ours",
        "quantity": 1,
        "price": 25.99
      }
    ],
    "total": 25.99,
    "shippingAddress": "123 Rue de Paris\n75001 Paris\nFrance"
  }
}
```

## 🛠️ Utilisation dans le code

```typescript
import { mailerService } from '../services/mailer.service';

// Envoyer un email
const result = await mailerService.sendEmail(
  'destinataire@email.com',
  'Mon sujet',
  '<h1>Contenu HTML</h1>'
);

// Envoyer un formulaire de contact
const result = await mailerService.sendContactEmail(
  'Jean Dupont',
  'jean@email.com',
  'Demande de renseignements',
  'Mon message...'
);

// Envoyer une confirmation de commande
const result = await mailerService.sendOrderConfirmation(
  'client@email.com',
  {
    orderId: 'ORD-123',
    customerName: 'Jean Dupont',
    items: [...],
    total: 50.00,
    shippingAddress: '...'
  }
);
```

## ✅ Tester la configuration

### 1. Vérifier la connexion SMTP

```typescript
import { mailerService } from './services/mailer.service';

await mailerService.verifyConnection();
```

### 2. Envoyer un email de test

```bash
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@email.com",
    "subject": "Test",
    "message": "Test email"
  }'
```

## 📊 Avantages de cette solution

| Aspect | Nodemailer + SMTP |
|--------|-------------------|
| **Coût** | Gratuit ou peu cher |
| **Contrôle** | Complet (direct SMTP) |
| **Sécurité** | Excellente (TLS/SSL) |
| **Fiabilité** | Haute (retry automatique) |
| **Limitations** | Peu nombreuses |

## 🐛 Troubleshooting

### Email non envoyé
1. Vérifier les logs du serveur
2. Vérifier la configuration SMTP dans `.env`
3. Tester avec `mailerService.verifyConnection()`

### Erreur d'authentification
1. Vérifier `SMTP_USER` et `SMTP_PASSWORD`
2. Pour Gmail: utiliser un mot de passe d'application
3. Vérifier que le compte n'est pas bloqué

### Emails en spam
1. Configurer les enregistrements **SPF**, **DKIM**, **DMARC**
2. Vérifier l'adresse `From`
3. Ajouter un lien de désinscription pour les emails de marketing

## 📚 Ressources

- [Nodemailer Documentation](https://nodemailer.com/)
- [SMTP Configuration](https://nodemailer.com/smtp/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [SendGrid SMTP Setup](https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api)
