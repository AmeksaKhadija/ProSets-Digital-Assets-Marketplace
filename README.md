# ProSets - Marketplace d'Actifs Numériques

Une plateforme marketplace pour la vente d'actifs numériques (modèles 3D, code snippets, templates Notion) avec livraison sécurisée via liens temporaires.

## Stack Technique

| Composant | Technologie |
|-----------|-------------|
| Frontend | Next.js 14 (App Router) |
| Backend | NestJS |
| Base de données | PostgreSQL + Prisma |
| Authentification | Auth0 |
| Stockage | AWS S3 |
| Paiements | Stripe |
| Styling | Tailwind CSS + Shadcn/ui |

## Prérequis

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **Docker** et **Docker Compose** (pour PostgreSQL)
- Comptes sur :
  - [Auth0](https://auth0.com)
  - [AWS](https://aws.amazon.com) (pour S3)
  - [Stripe](https://stripe.com)

---

## Guide d'Installation

### 1. Cloner et Installer les Dépendances

```bash
# Cloner le projet
git clone <repository-url>
cd prosets

# Installer pnpm si nécessaire
npm install -g pnpm

# Installer les dépendances
pnpm install
```

### 2. Démarrer PostgreSQL avec Docker

```bash
# Démarrer le conteneur PostgreSQL
docker-compose up -d

# Vérifier que le conteneur est actif
docker ps
```

La base de données sera accessible sur `localhost:5432` avec :
- Utilisateur : `prosets`
- Mot de passe : `prosets_dev`
- Base : `prosets`

### 3. Configurer Auth0

#### 3.1 Créer une Application Auth0

1. Connectez-vous à [Auth0 Dashboard](https://manage.auth0.com)
2. Créez une nouvelle application de type **Regular Web Application**
3. Dans les paramètres, configurez :
   - **Allowed Callback URLs** : `http://localhost:3000/api/auth/callback`
   - **Allowed Logout URLs** : `http://localhost:3000`
   - **Allowed Web Origins** : `http://localhost:3000`

#### 3.2 Créer une API Auth0

1. Allez dans **Applications > APIs**
2. Créez une nouvelle API avec :
   - **Name** : `ProSets API`
   - **Identifier** : `https://api.prosets.com` (ou votre choix)
3. Activez **RBAC** et **Add Permissions in the Access Token**

#### 3.3 Activer les Social Connections

1. Allez dans **Authentication > Social**
2. Activez **Google** et **GitHub**
3. Configurez les credentials OAuth pour chaque provider

### 4. Configurer AWS S3

#### 4.1 Créer les Buckets S3

Créez deux buckets dans la même région (ex: `eu-west-3`) :

1. **prosets-private** - pour les fichiers sources (non public)
2. **prosets-public** - pour les previews (public)

#### 4.2 Configurer le Bucket Public

Pour `prosets-public`, ajoutez cette politique de bucket :

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::prosets-public/*"
    }
  ]
}
```

#### 4.3 Créer un Utilisateur IAM

1. Créez un utilisateur IAM avec accès programmatique
2. Attachez cette politique :

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::prosets-private/*",
        "arn:aws:s3:::prosets-public/*"
      ]
    }
  ]
}
```

3. Notez l'**Access Key ID** et le **Secret Access Key**

### 5. Configurer Stripe

#### 5.1 Obtenir les Clés API

1. Connectez-vous à [Stripe Dashboard](https://dashboard.stripe.com)
2. Allez dans **Developers > API Keys**
3. Copiez la **Publishable key** et la **Secret key**

#### 5.2 Configurer le Webhook

1. Allez dans **Developers > Webhooks**
2. Ajoutez un endpoint : `http://localhost:3001/api/stripe/webhook`
3. Sélectionnez les événements :
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
4. Copiez le **Webhook signing secret**

> **Note** : Pour le développement local, utilisez [Stripe CLI](https://stripe.com/docs/stripe-cli) pour forward les webhooks.

### 6. Configurer les Variables d'Environnement

#### Backend (`apps/backend/.env`)

```env
# Database
DATABASE_URL=postgresql://prosets:prosets_dev@localhost:5432/prosets

# Auth0
AUTH0_DOMAIN=votre-tenant.auth0.com
AUTH0_AUDIENCE=https://api.prosets.com
AUTH0_CLIENT_ID=votre-client-id
AUTH0_CLIENT_SECRET=votre-client-secret

# AWS S3
AWS_REGION=eu-west-3
AWS_ACCESS_KEY_ID=votre-access-key
AWS_SECRET_ACCESS_KEY=votre-secret-key
AWS_S3_PRIVATE_BUCKET=prosets-private
AWS_S3_PUBLIC_BUCKET=prosets-public

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PLATFORM_FEE_PERCENT=15

# App
PORT=3001
FRONTEND_URL=http://localhost:3000
```

#### Frontend (`apps/frontend/.env.local`)

```env
# Auth0
AUTH0_SECRET=générez-une-clé-secrète-32-caractères
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://votre-tenant.auth0.com
AUTH0_CLIENT_ID=votre-client-id
AUTH0_CLIENT_SECRET=votre-client-secret
AUTH0_AUDIENCE=https://api.prosets.com

# API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

> **Générer AUTH0_SECRET** : `openssl rand -hex 32`

### 7. Initialiser la Base de Données

```bash
# Générer le client Prisma
pnpm db:generate

# Appliquer le schéma à la base de données
pnpm db:push

# (Optionnel) Ouvrir Prisma Studio pour visualiser les données
pnpm db:studio
```

### 8. Démarrer l'Application

```bash
# Démarrer frontend + backend en parallèle
pnpm dev
```

L'application sera accessible sur :
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:3001
- **Prisma Studio** : http://localhost:5555 (si lancé)

---

## Scripts Disponibles

| Script | Description |
|--------|-------------|
| `pnpm dev` | Démarre le frontend et backend en mode développement |
| `pnpm build` | Build de production |
| `pnpm start` | Démarre en mode production |
| `pnpm lint` | Vérifie le code avec ESLint |
| `pnpm db:generate` | Génère le client Prisma |
| `pnpm db:push` | Synchronise le schéma avec la DB |
| `pnpm db:migrate` | Crée une migration |
| `pnpm db:studio` | Ouvre Prisma Studio |

---

## Structure du Projet

```
prosets/
├── apps/
│   ├── backend/                 # API NestJS
│   │   ├── src/
│   │   │   ├── modules/         # Modules métier
│   │   │   │   ├── auth/        # Authentification Auth0
│   │   │   │   ├── users/       # Gestion utilisateurs
│   │   │   │   ├── assets/      # Gestion des actifs
│   │   │   │   ├── orders/      # Commandes
│   │   │   │   ├── downloads/   # Téléchargements sécurisés
│   │   │   │   ├── storage/     # Service S3
│   │   │   │   ├── stripe/      # Intégration Stripe
│   │   │   │   └── admin/       # Administration
│   │   │   ├── common/          # Guards, decorators, filters
│   │   │   └── prisma/          # Service Prisma
│   │   └── prisma/
│   │       └── schema.prisma    # Schéma de base de données
│   │
│   └── frontend/                # Application Next.js
│       ├── app/                 # Pages (App Router)
│       │   ├── page.tsx         # Page d'accueil
│       │   ├── catalog/         # Catalogue
│       │   ├── dashboard/       # Tableaux de bord
│       │   └── api/auth/        # Routes Auth0
│       ├── components/          # Composants React
│       │   ├── ui/              # Composants UI (Shadcn)
│       │   ├── layout/          # Header, Footer
│       │   └── assets/          # Composants métier
│       └── lib/                 # Utilitaires
│
├── packages/
│   └── shared/                  # Types et constantes partagés
│
├── docker-compose.yml           # PostgreSQL
├── turbo.json                   # Configuration Turborepo
└── pnpm-workspace.yaml          # Configuration workspace
```

---

## Fonctionnalités

### Client (Acheteur)
- Parcourir le catalogue avec filtres et recherche
- Visualiser les previews des actifs
- Acheter via Stripe Checkout
- Télécharger les fichiers achetés (liens sécurisés 5 min)
- Historique des achats

### Vendeur (Créateur)
- Upload des actifs (fichier source + previews)
- Gestion de l'inventaire (CRUD)
- Suivi des ventes et revenus
- Dashboard analytique

### Administrateur
- Modération des actifs (approuver/rejeter)
- Gestion des utilisateurs
- Vue d'ensemble des commandes
- Analytics de la plateforme

---

## Sécurité

- **Authentification** : JWT validé via Auth0 JWKS
- **Stockage** : Fichiers sources dans un bucket S3 privé
- **Téléchargements** : URLs pré-signées avec expiration de 5 minutes
- **Paiements** : Webhooks Stripe vérifiés par signature
- **RBAC** : Contrôle d'accès basé sur les rôles (BUYER, SELLER, ADMIN)

---

## Dépannage

### Erreur de connexion à la base de données
```bash
# Vérifier que PostgreSQL est démarré
docker-compose ps

# Redémarrer si nécessaire
docker-compose restart
```

### Erreur Auth0 "Invalid token"
- Vérifiez que `AUTH0_DOMAIN` et `AUTH0_AUDIENCE` sont corrects
- Assurez-vous que l'API Auth0 est configurée avec RBAC activé

### Les webhooks Stripe ne fonctionnent pas
```bash
# Installer Stripe CLI
brew install stripe/stripe-cli/stripe

# Forward les webhooks vers localhost
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

### Erreur de CORS
Vérifiez que `FRONTEND_URL` dans le backend correspond à l'URL du frontend.

---

## Licence

Ce projet est développé dans le cadre d'un projet de formation.
# ProSets-Digital-Assets-Marketplace
