# 🌸 Alkareem Parfumerie — E-Commerce & WhatsApp-First

> Boutique e-commerce moderne et ultra-rapide conçue pour **Alkareem Parfumerie** (Cotonou, Bénin), combinant la puissance d'un catalogue de ~500 références et la fluidité d'un tunnel de commande WhatsApp-First adapté aux usages locaux.

[![Live Demo](https://img.shields.io/badge/Demo-En%20Ligne-success?style=for-the-badge&logo=vercel&logoColor=white)](https://al-kareem-parfurmerie.vercel.app/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TanStack Router](https://img.shields.io/badge/TanStack-Router_%26_Start-FF4154?style=for-the-badge&logo=react-query&logoColor=white)](https://tanstack.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database_%26_Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

---

### 🔗 **[Voir la démo en ligne](https://al-kareem-parfurmerie.vercel.app/)** : https://al-kareem-parfurmerie.vercel.app/

<p align="center">
  <img src="./docs/preview-1.png" alt="Alkareem Parfumerie - Showcase 1" width="49%" />
  <img src="./docs/preview-2.png" alt="Alkareem Parfumerie - Showcase 2" width="49%" />
</p>

---

## 🌟 Fonctionnalités clés

- 🛍️ **Catalogue optimisé de ~500 références** : Navigation fluide par catégories (Homme, Femme, Unisexe, Coffrets, Déodorants, Brumes) avec badges promotionnels et gestion des ruptures de stock en temps réel.
- ⚡ **Recherche temps réel & filtrage instantané** : Recherche instantanée par nom, description ou fragrance, filtres dynamiques combinables et tri intelligent (nouveautés, prix croissant/décroissant).
- 📲 **Tunnel de commande WhatsApp-First** : Processus d'achat sans friction. Le panier client génère un récapitulatif complet et structuré avec coordonnées de livraison, transmis en un clic au vendeur sur WhatsApp pour convenir du paiement Mobile Money (MTN MoMo / Moov Money) ou à la livraison.
- 🛡️ **Espace Administration sécurisé (`/admin`)** : Tableau de bord protégé par authentification Supabase pour la gestion CRUD des produits, la mise à jour des prix/promotions, la gestion des catégories et la consultation des commandes et messages clients.
- 🚀 **Architecture haute performance mobile** : Conçue spécialement pour les connexions mobiles 3G/4G avec prefetching prédictif des routes, mise en cache SWR, lazy-loading des médias et sécurité renforcée (Row Level Security Supabase, CSP stricte, triggers anti-fraude).

---

## 🛠️ Stack technique

| Couche | Technologies |
| :--- | :--- |
| **Frontend** | [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/) |
| **Routage & SSR** | [TanStack Start](https://tanstack.com/start), [TanStack Router](https://tanstack.com/router) (type-safe file-based routing) |
| **État serveur & Cache** | [TanStack Query v5](https://tanstack.com/query) |
| **Composants UI** | [shadcn/ui](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/), [Sonner](https://sonner.emilkowal.ski/) |
| **Backend as a Service** | [Supabase](https://supabase.com/) (PostgreSQL avec Row Level Security, Auth, Storage) |
| **Messagerie / Vente** | [WhatsApp Business API / wa.me deep links](https://wa.me/) |
| **Bundler & Serveur** | [Vite 8](https://vitejs.dev/), [Nitro Engine](https://nitro.unjs.io/) |
| **Déploiement** | [Vercel](https://vercel.com/) |

---

## ⚙️ Installation & Lancement en local

### Prérequis
- [Node.js](https://nodejs.org/) (v20+) ou [Bun](https://bun.sh/)
- Un projet [Supabase](https://supabase.com/) configuré (ou les clés d'accès fournies)

### 1. Cloner le dépôt
```bash
git clone https://github.com/netwavestudioweb-creator/AL_KAREEM-PARFURMERIE.git
cd AL_KAREEM-PARFURMERIE
```

### 2. Installer les dépendances
Avec **Bun** (recommandé) :
```bash
bun install
```
Ou avec **npm** :
```bash
npm install
```

### 3. Configurer les variables d'environnement
Créez un fichier `.env` à la racine :
```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_publique
```

### 4. Démarrer le serveur de développement
```bash
bun run dev
# ou
npm run dev
```
L'application est disponible sur `http://localhost:3000`.

### 5. Compiler pour la production
```bash
bun run build
# ou
npm run build
```

---

## ⚡ Défi technique rencontré & Optimisation de la performance (TTFB 3G)

### Problématique
Au lancement, le premier affichage sur réseau mobile **3G** présentait une latence initiale importante (TTFB et temps de premier rendu oscillant entre **3 et 6 secondes**), principalement due aux requêtes bloquantes côté client, au chargement d'images non optimisées et aux allers-retours réseau répétés sur un catalogue de 500 produits.

### Solutions concrètes implémentées dans le code
1. **Élimination du délai d'amorce au SSR / Hydratation** :
   - Mise en place d'un rendu direct avec prefetching asynchrone des données (`fetchProducts` et `fetchCategories`) dès le loader TanStack Router.
   - Intégration d'un loader ultra-léger sans dépendance externe bloquante.
2. **Stratégie de Cache SWR & TanStack Query** :
   - Configuration d'un `staleTime` de **5 minutes** et d'un `gcTime` de **30 minutes** sur le `QueryClient` pour supprimer les rechargements réseau redondants lors de la navigation entre les pages.
3. **Préchargement prédictif des routes (`defaultPreload: "intent"`)** :
   - Déclenchement automatique du prefetch de la page ciblée dès le survol de la souris ou dès l'événement tactile `touchstart` (avec un délai optimisé de 50ms), rendant les transitions instantanées.
4. **Optimisation des médias & chargement progressif** :
   - Format WebP et mise en cache immuable sur le Storage.
   - Chargement différé natif (`loading="lazy"`, `decoding="async"`) et attributs `sizes` réactifs pour ne télécharger que la résolution strictement nécessaire sur smartphone.
   - Découpage par pagination progressive (`PAGE_SIZE = 24`) avec affichage instantané de squelettes animés (*shimmer*) pendant la récupération des données.

### Résultat mesuré
> 📉 **Réduction du TTFB sur réseau 3G de 3-6s à ~1s (gain de performance de ~75%)**, offrant une navigation instantanée même sur connexion mobile bridée.

---

## 📄 Documentation complémentaire

Pour une analyse détaillée des choix d'architecture, des enjeux business, des mécanismes de sécurité (RLS, validation anti-fraude) et des métriques :
👉 **Consultez l'[Étude de cas détaillée (RAPPORT_ETUDE_DE_CAS.md)](./RAPPORT_ETUDE_DE_CAS.md)**.
