# Projet Alkareem Scents Connect

Ce document sert de guide et de résumé de l'application pour les futurs agents IA ou développeurs intervenant sur le projet.

## 1. Ce que fait l'application
C'est une plateforme e-commerce (B2C) pour "ALKAREEM PARFUMERIE", une parfumerie située à Cotonou au Bénin.
Elle permet aux utilisateurs de parcourir un catalogue d'environ 500 références de parfums (Hommes, Femmes, Mixtes, Coffrets).
L'application est pensée pour le marché local : elle propose de finaliser les achats directement via WhatsApp, un canal très utilisé et très ancré dans les habitudes, et prépare le terrain pour une future intégration potentielle du paiement en ligne via Mobile Money local.

## 2. Fonctionnalités implémentées
* **Côté Client (Vitrine)** :
  * Page d'accueil avec sections (Hero, nouveautés, etc.).
  * Catalogue de produits (`/boutique`) avec filtres et recherche.
  * Page détail produit (`/produit/$slug`) avec bouton "Commander via WhatsApp".
  * Panier d'achat stocké localement (`/panier`).
  * Processus de commande redirigeant vers WhatsApp avec un message pré-rempli contenant le récapitulatif du panier, les coordonnées et le choix de livraison.
  * Pages d'informations (À propos, Contact, Mentions légales, CGV).
  * Bouton flottant WhatsApp persistant.
* **Côté Administration (`/admin`)** :
  * Tableau de bord protégé.
  * Formulaire de gestion de produits (Ajout/Modification de produits, prix, stock, descriptions) `product-form.tsx`.
* **Backend (Supabase)** :
  * Base de données pour les produits, catégories, etc.
  * Authentification pour l'accès administrateur.

## 3. Structure des fichiers
Le projet suit une architecture basée sur TanStack Start et React.
* `src/` : Code source principal.
  * `components/` : Composants UI réutilisables (shadcn/ui dans `ui/`, `product-card.tsx`, layout, etc.).
  * `components/admin/` : Composants spécifiques à l'interface d'administration.
  * `hooks/` : Hooks personnalisés (ex: utilisation du panier, requêtes API).
  * `integrations/supabase/` : Configuration et clients Supabase.
  * `lib/` : Utilitaires (ex: `utils.ts` pour la fusion de classes Tailwind).
  * `routes/` : Définition des pages et du routage via TanStack Router. Chaque fichier ou dossier représente une route.
    * `__root.tsx` : Layout principal.
    * `index.tsx` : Page d'accueil.
    * `admin/` : Routes de l'interface d'administration.
  * `styles.css` : Fichier de style global (incluant les variables CSS Tailwind).
* `supabase/` : Fichiers de configuration et migrations de la base de données Supabase.
* `public/` : Fichiers statiques (images, polices).
* `vite.config.ts`, `package.json`, `tsconfig.json` : Fichiers de configuration du projet.

## 4. Technologies utilisées
* **Framework Fullstack** : [TanStack Start](https://tanstack.com/start) avec React.
* **Routage** : [TanStack Router](https://tanstack.com/router) (Routage basé sur les fichiers, asynchrone et typé).
* **Gestion d'état serveur** : [TanStack Query](https://tanstack.com/query) (React Query).
* **Styling** : [Tailwind CSS v4](https://tailwindcss.com/) avec animations.
* **Composants UI** : [shadcn/ui](https://ui.shadcn.com/) (construit sur Radix UI).
* **Backend as a Service** : [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage).
* **Icônes** : [Lucide React](https://lucide.dev/).
* **Package manager / Runtime** : Bun.

## 5. Décisions de design et d'architecture
* **Mobile-First** : L'interface est conçue en priorité pour les smartphones, qui représentent l'immense majorité du trafic web au Bénin.
* **Checkout via WhatsApp** : Décision clé pour s'adapter aux habitudes locales. Plutôt qu'un tunnel de paiement classique complexe qui pourrait freiner la conversion, le panier génère un message WhatsApp pré-formaté pour finaliser la transaction humainement avec le vendeur, facilitant le paiement à la livraison ou par Mobile Money manuel.
* **TanStack Start & Router** : Choisi pour bénéficier d'un typage fort de bout en bout (types-safe API), d'une excellente gestion du cache et des données, et de bonnes performances.
* **Shadcn/ui** : Permet d'avoir des composants accessibles et facilement personnalisables sans être bloqué par une bibliothèque de composants tierce rigide. Les couleurs ont été adaptées à la charte graphique de la marque (teintes de violet profond et élégant).

## 6. Instructions pour un futur modèle IA
* **Contextualisation** : Toujours garder à l'esprit la cible (utilisateurs mobiles au Bénin, réseau parfois lent, préférence pour WhatsApp). Ne proposez pas de flux de paiements complexes par carte de crédit sans vérifier la compatibilité avec les agrégateurs locaux (FedaPay, KkiaPay, etc.). Garder un design épuré, luxueux mais accessible.
* **TanStack Router** : Lors de la création de nouvelles pages, utilisez les conventions de nommage de fichiers de TanStack Router (par exemple, `nom-de-la-route.tsx`, `$parametre.tsx`). Le fichier `routeTree.gen.ts` est généré automatiquement, **ne le modifiez pas manuellement**.
* **Supabase** : Pour de nouvelles fonctionnalités de données, vérifiez d'abord la structure existante. Si de nouvelles tables sont nécessaires, mettez à jour les migrations SQL dans le dossier `supabase/migrations/` et régénérez les types TypeScript si applicable.
* **Composants UI** : Avant de créer un composant complexe à partir de zéro, vérifiez si un équivalent existe dans `src/components/ui/` (shadcn/ui). Pour ajouter un nouveau composant, il faut généralement utiliser le CLI shadcn.
* **Style** : Utilisez les classes utilitaires Tailwind et la fonction `cn()` exportée dans `src/lib/utils.ts` pour fusionner conditionnellement des classes. Respectez le thème défini dans `src/styles.css` (utilisation de variables CSS HSL).
