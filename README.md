# Simba Logistics — SPA Vue 3 + Supabase

Application web pour Simba Logistics (consolidation de colis Togo / Chine),
prête à être déployée sur GitHub Pages.

## 1. Structure du projet

```
simba-logistics/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   │   └── main.css          # Design tokens (couleurs, typographies) + styles globaux
│   ├── components/
│   │   ├── AppHeader.vue
│   │   ├── AppFooter.vue
│   │   └── WhatsAppButton.vue # Bouton flottant d'assistance WhatsApp
│   ├── lib/
│   │   └── supabase.js        # Client Supabase (clé anon uniquement)
│   ├── router/
│   │   └── index.js           # Vue Router en mode hash (compatible GitHub Pages)
│   ├── views/
│   │   ├── HomeView.vue       # Landing page
│   │   ├── LoginView.vue
│   │   ├── RegisterView.vue
│   │   └── DashboardView.vue  # Espace client sécurisé
│   ├── App.vue
│   └── main.js
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── .github/workflows/deploy.yml   # Déploiement automatique (optionnel)
```

## 2. Installation locale

```bash
npm install
cp .env.example .env
# puis complétez .env avec votre clé anon Supabase (voir section 4)
npm run dev
```

## 3. Configuration de `vite.config.js`

Le champ `base` doit correspondre exactement au nom de votre dépôt GitHub :

```js
base: '/simba-logistics/'
```

Si le dépôt s'appelle différemment, remplacez `simba-logistics` par le nom réel
du dépôt. Si vous déployez sur un site `votre-compte.github.io` (dépôt racine),
utilisez `base: '/'`.

## 4. Configuration Supabase

### 4.1 Variables d'environnement

Dans le fichier `.env` (jamais commité, il est dans `.gitignore`) :

```
VITE_SUPABASE_URL=https://kmpdvpknxzztgaqxbyvp.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_publique
```

La clé `anon` se trouve dans **Project Settings → API** du tableau de bord
Supabase. C'est une clé **publique**, prévue pour être utilisée côté client :
la sécurité réelle repose sur les règles RLS (voir ci-dessous), jamais sur le
secret de cette clé. **Ne mettez jamais** la clé `service_role` ni le mot de
passe de la base de données dans le code front-end.

### 4.2 Schéma SQL à exécuter dans l'éditeur SQL de Supabase

```sql
-- Table des profils clients (complète la table auth.users native de Supabase)
create table public.clients (
  id uuid primary key references auth.users(id) on delete cascade,
  nom_complet text not null,
  telephone text not null,
  code_adresse text not null unique,
  cree_le timestamptz default now()
);

-- Table des colis
create table public.colis (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  description text,
  statut text not null default 'en_attente' check (statut in ('en_attente', 'recu', 'consolide')),
  photo_url text,
  cree_le timestamptz default now()
);

-- Activation de la sécurité au niveau des lignes (RLS)
alter table public.clients enable row level security;
alter table public.colis enable row level security;

-- Un client ne peut lire/modifier que sa propre fiche
create policy "Un client voit son propre profil"
  on public.clients for select
  using (auth.uid() = id);

create policy "Un client crée son propre profil"
  on public.clients for insert
  with check (auth.uid() = id);

-- Un client ne voit que ses propres colis
create policy "Un client voit ses propres colis"
  on public.colis for select
  using (auth.uid() = client_id);

-- Un client peut mettre à jour le statut de ses propres colis (ex: consolidation)
create policy "Un client met à jour ses propres colis"
  on public.colis for update
  using (auth.uid() = client_id);
```

> La création et la mise à jour des colis (réception, photo) doivent en
> pratique être faites par votre équipe logistique via le tableau de bord
> Supabase ou un panneau d'administration séparé, avec un rôle disposant de
> permissions plus larges que la clé `anon` utilisée ici.

### 4.3 Authentification par email

Dans **Authentication → Providers**, l'authentification par email est activée
par défaut. Selon vos préférences, vous pouvez désactiver la confirmation par
email dans **Authentication → Settings** pour simplifier les tests.

## 5. Build et déploiement sur GitHub Pages

### Option A — commande manuelle

```bash
npm run build
npm run deploy
```

Le script `deploy` (via le paquet `gh-pages`) publie le contenu de `dist/`
sur la branche `gh-pages` du dépôt.

### Option B — déploiement automatique (GitHub Actions)

Le fichier `.github/workflows/deploy.yml` est fourni : à chaque `push` sur
`main`, le site est reconstruit et publié automatiquement.

Pensez à ajouter vos deux secrets dans **Settings → Secrets and variables →
Actions** du dépôt GitHub :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Puis activez GitHub Pages sur la branche `gh-pages` dans
**Settings → Pages**.

## 6. Bouton d'assistance WhatsApp

Le composant `WhatsAppButton.vue` génère un lien `https://wa.me/8613016089281`
avec un message pré-rempli incluant le code d'adresse unique du client
(utilisé comme identifiant). Il est affiché en bouton flottant sur l'espace
client (`DashboardView.vue`).
