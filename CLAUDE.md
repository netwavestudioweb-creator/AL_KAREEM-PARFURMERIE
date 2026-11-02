# Al Kareem Parfumerie — mémo du projet

Boutique en ligne d'une parfumerie de Cotonou (Bénin). Les clients composent leur panier sur le site
puis la commande part sur WhatsApp ; l'équipe la traite depuis le panneau `/admin`.
Livraison au Bénin et dans la sous-région. Paiement : carte bancaire, MTN MoMo, Moov Money,
espèces à la livraison (pas de paiement en ligne sur le site lui-même).

- Site : https://www.al-kareemparfurmerie.com (orthographe « parfurmerie » volontaire, c'est le domaine)
- Dépôt : `netwavestudioweb-creator/AL_KAREEM-PARFURMERIE` (public), branche `main`
- Hébergement : Vercel (déploiement automatique à chaque merge sur `main`)

## Stack et commandes

TanStack Start (React 19, SSR) + TanStack Router (routes par fichiers) + React Query, Tailwind v4,
Supabase (Postgres, Auth, Storage), Vitest.

```bash
npm run dev        # http://localhost:3001
npm run build      # régénère aussi src/routeTree.gen.ts
npm run typecheck && npm run lint && npm test   # ce que vérifie la CI
npm run keepalive  # ping manuel des bases Supabase
```

## Organisation du code

- `src/routes/` : une route par fichier. `boutique.index.tsx` (et non `boutique.tsx`) sinon les pages
  catégorie/genre s'imbriquent sans `<Outlet>` et affichent tout le catalogue.
  `src/routeTree.gen.ts` est généré : ne pas l'éditer à la main, le régénérer avec `vite build`.
- `src/routes/admin/` : panneau admin (produits, catégories, commandes, messages, vitrine).
  `/admin/avis` redirige vers `/admin/vitrine#avis`.
- `src/lib/` : logique métier (`catalog`, `cart`, `reviews`, `vitrine`, `json-ld`, `phone`, `consent`, `site-config`).
- `src/integrations/supabase/` : client paresseux `getSupabase()` (`lazy.ts`) et types (`types.ts`, complétés à la main).
- `src/server.ts` : en-têtes de sécurité (CSP complète) et cache CDN
  (`s-maxage=60, stale-while-revalidate=600`, sauf `/admin`, `/reset-password`, `/avis`, `/_serverFn`, `/api`).
- `src/router.tsx` : `setupRouterSsrQueryIntegration` (données SSR hydratées, pas de double requête).
  `@tanstack/react-query` est figé en `~5.103.3` avec un `override` de `@tanstack/query-core` dans `package.json`.
- `supabase/migrations/` : historique SQL (les fichiers à UUID viennent de Lovable).

Charte : fond ivoire, violet `#3F1A5E` / `#241034`, or `#E9C46A` (texte or : `#8A6420`),
polices Inter + Cormorant Garamond (hébergées localement). `overflow-x: clip` (pas `hidden`) sur html/body,
sinon l'en-tête collant casse.

## Bases de données & Redondance (important)

Le projet utilise une architecture résiliente avec une hiérarchie stricte à 3 niveaux :

| Priorité               | Plateforme / Projet                             | Rôle                                         | Description                                                                                                                                                                              |
| ---------------------- | ----------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1er (Principal)**    | **Supabase Principal** (`dnakohzxqxpnqfopxtni`) | **Base primaire de production**              | Compte personnel de la marque. Source de vérité contenant les 96 produits, 7 catégories, avis clients, preuves d'authenticité et comptes admin. Requêtée en priorité absolue par Vercel. |
| **2ème (Secours N°1)** | **Neon** (`neon.tech`)                          | **1ère base de secours & Miroir PostgreSQL** | Base PostgreSQL indépendante hors de l'écosystème Supabase. Miroir complet du catalogue synchronisé automatiquement (chaque nuit et sur demande).                                        |
| **3ème (Secours N°2)** | **Supabase Lovable** (`zoagwbhgpaslyjjsdnnv`)   | **Secours d'urgence (Failover)**             | Deuxième base de secours de réserve en cas de rupture des deux premières. Le client (`client.ts`) peut basculer dessus de façon transparente.                                            |

- RLS partout ; rôle admin via `private.has_role(auth.uid(), 'admin'::public.app_role)`.
  Inscriptions publiques désactivées. Le bucket `product-images` est public/signé.
- Ne jamais coller de clé `service_role` ni de mot de passe dans le chat ou le code : seulement dans `.env`.
  Les clés `sb_publishable_…` sont publiques par nature.
- Le client Supabase (`src/integrations/supabase/client.ts`) intègre un mécanisme de failover résilient : en cas de timeout ou d'erreur réseau sur la base principale, la requête est rejouée de façon transparente sur la base de secours.

### Anti-pause (plan gratuit, pause après 7 jours d'inactivité)

`.github/workflows/supabase-keepalive.yml` lance `scripts/keep-supabase-alive.mjs` le lundi et le jeudi
à 08:00 UTC (et à la demande depuis l'onglet Actions). Il interroge les deux bases Supabase et échoue s'il n'obtient
pas HTTP 200 (GitHub envoie alors un e-mail). Secrets GitHub : `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`,
`SUPABASE_URL_2`, `SUPABASE_PUBLISHABLE_KEY_2`. Il réactive aussi le workflow à chaque passage
(GitHub coupe les tâches planifiées d'un dépôt public après 60 jours sans activité).

### Synchronisation continue des bases (Mises à jour des données)

Au fur et à mesure que la base principale évolue (nouveaux parfums, changement de prix, ajustement des stocks) :

1. **Option 1 (Automatisée via GitHub Actions — Recommandée)** :
   - Un workflow planifié (ex. quotidien à 02:00 UTC ou déclenché manuellement depuis l'onglet Actions) interroge l'API de la base principale `dnakohzxqxpnqfopxtni`.
   - Il compare et applique les `INSERT` / `UPDATE` sur la base de secours Supabase (`zoagwbhgpaslyjjsdnnv`) et sur la base Neon via `scripts/push-to-neon.mjs`.
   - Secret GitHub requis : `NEON_DATABASE_URL` (chaîne de connexion `postgresql://...`).

2. **Option 2 (Double écriture dans le panneau `/admin`)** :
   - Dans le formulaire produit (`src/components/admin/product-form.tsx`), la validation d'un enregistrement écrit d'abord sur la base principale puis réplique la mutation sur la base de secours.
   - Avantage : synchronisation instantanée dès qu'un administrateur sauvegarde un produit sur le site.

3. **Option 3 (Supabase Database Webhooks)** :
   - Déclencheur webhook natif Supabase sur les tables `products`, `categories` qui notifie une fonction serverless Vercel ou Edge Function répercutant l'événement sur Neon.

4. **Synchronisation ponctuelle / manuelle vers Neon** :
   - Script Node.js prêt à l'emploi :
     ```bash
     node scripts/push-to-neon.mjs "postgresql://neondb_owner:xxxx@ep-xyz.neon.tech/neondb?sslmode=require"
     ```
   - Ou via les lots SQL découpés dans le dossier `neon/` (exécutables directement dans le SQL Editor Neon sans risque de dépassement de limite de texte).

## Fonctionnalités notables

- **Panier → WhatsApp** : prix revérifié en direct avant l'envoi ; numéros normalisés par `src/lib/phone.ts`
  (`whatsappNumberFromOrderPhone` ajoute 229 sauf si le numéro commence par `+`).
- **Avis clients** (migration `20261014120000_avis_clients.sql`) : sur une commande livrée, l'admin clique
  « Demander un avis » → lien personnel `/avis/<token>` envoyé par WhatsApp → formulaire (étoiles, 3 questions
  Oui/Moyen/Non, message, consentement) → modération dans `/admin/vitrine` : publier (crée un témoignage
  « Achat vérifié »), garder en interne ou archiver. RPC publiques : `get_review_request`, `submit_review`,
  `verified_testimonial_ids`. `/avis/` est en noindex et exclu de robots.txt.
- **SEO** : JSON-LD Organization/Store/WebSite avec les variantes du nom (homonymes), pages `/marques/$marque`,
  `sitemap.xml`, image de partage `/og-alkareem-2026.jpg` (changer le nom du fichier pour forcer
  Facebook/WhatsApp à rafraîchir). Vérifications Google/Bing facultatives : `VITE_GOOGLE_SITE_VERIFICATION`,
  `VITE_BING_SITE_VERIFICATION`.
- **Mesure d'audience** : bannière de consentement (`alk_consent_v1`), rien n'est chargé avant acceptation ;
  Vercel Web Analytics ajouté le 18/10/2026.
- **Admin** : verrouillage après plusieurs échecs de connexion, déconnexion après 1 h d'inactivité.

## Façon de travailler

- Branche de fonctionnalité → PR → CI verte → merge (`gh pr merge --merge`) → Vercel déploie.
  Le propriétaire a autorisé Claude à fusionner lui-même.
- Vérifier un déploiement via les statuts GitHub deployments ou Vercel (les URL de preview renvoient 302 : SSO).
- Messages de commit en anglais, conventionnels (`feat:`, `fix:`…). Interface et textes du site en français.
- Aucune modification de base sans accord explicite.

## Historique

1. **Octobre 2026** : Audit, puis refonte complète validée sur maquettes (boutique d'abord, inspiration e-commerce US) :
   en-tête, barre d'onglets mobile, listing avec filtres, fiche produit, panier en une étape, admin.
2. Sécurité et vitesse : CSP, JSON-LD échappé, consentement, cache CDN, Supabase chargé à la demande.
   Bugs corrigés : filtres catégorie, en-tête collant, double chargement, prix WhatsApp périmé, liens produits,
   inscription admin publique, numéro WhatsApp admin sans 229.
3. Pages À propos, Contact, CGV et légales refaites ; livraison sous-région.
4. Plan SEO « premier sur le nom de la marque » exécuté ; nouvel aperçu de partage.
5. Système d'avis clients après livraison, puis déplacé dans la page Vitrine.
6. Keepalive Supabase fiabilisé (PR #8) et étendu à la seconde base.
7. Marketing (hors dépôt) : affiche unique 4:5, storyboard + déroulé de la pub V9,
   vidéo `AlKareem_Pub_V9_40s_sans-musique.mp4` (40 s, 9:16, dans Téléchargements, sans son).
8. **Novembre 2026** : Migration complète vers la base Supabase personnelle `dnakohzxqxpnqfopxtni` (96 produits, 7 catégories, preuves, témoignages). Architecture résiliente avec failover automatique vers Lovable (`zoagwbhgpaslyjjsdnnv`) et loaders SSR protégés contre les erreurs 500. Création d'un miroir PostgreSQL externe sur Neon (`neon.tech`) avec script d'export et d'injection automatique `scripts/push-to-neon.mjs`. Variables Vercel de production mises à jour et validées.

## Reste à faire / idées

- Automatisation continue : mettre en place un workflow GitHub Actions de synchronisation quotidienne vers Neon et Lovable (nécessite le secret `NEON_DATABASE_URL`).
- Pub V9 : ajouter musique/voix off ; remplacer la scène « avis » par un vrai avis publié ; offre du moment,
  compte Instagram de la marque ; versions 15 s, 6 s et 4:5.
- Google Business Profile + Search Console ; acheter `alkareemparfumerie.com` (orthographe correcte) en redirection.
- Règle de limitation de débit dans le pare-feu Vercel ; déconnecter GitHub dans Lovable.
