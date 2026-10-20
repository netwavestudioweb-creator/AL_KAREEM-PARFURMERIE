# Plan mots clés : Al Kareem Parfumerie

*20 octobre 2026. Objectif : qu'Al Kareem sorte dès qu'on cherche un parfum à Cotonou ou au Bénin,
et plus seulement quand on tape son nom.*

## 1. Où en est-on sur Google (relevé du 20/10/2026)

Recherches faites sur google.com avec la langue française, le pays « Bénin » (`gl=bj`) et sans
personnalisation, en regardant la première page (environ 8 résultats). Google a bloqué le relevé
automatique après 16 recherches ; les autres mots clés restent à mesurer (voir § 5).

| Recherche | Position d'Al Kareem | Qui est devant |
|---|---|---|
| al kareem cotonou | **1** (À propos) et **2** (accueil) | — |
| al kareem parfumerie | **2**, mais c'est la page *Confidentialité* qui sort | alkarimvision.com (« Al Karim Vision », homonyme) |
| al kareem | absent | pages religieuses (nom divin Al-Karîm) : ne pas viser seul |
| parfumerie cotonou | absent | Instagram Parfumerie La Riviera, Maison Gaïa, supermarché Mont Sinaï |
| parfum cotonou | absent | Maison Gaïa (Instagram), yabourou.net |
| parfum bénin | absent | Misk Parfumerie (Instagram), lynia-shop.com |
| parfumerie bénin | absent | La Riviera, lynia-shop.com, Maison Gaïa |
| boutique parfum cotonou | absent | La Riviera, yabourou.net, coinafrique |
| acheter parfum cotonou | absent | fragrancebyjo (Instagram), yabourou.net |
| parfum original cotonou | absent | Maison Gaïa, yabourou.net, coinafrique |
| parfum authentique bénin | absent | Misk Parfumerie, TikTok, coinafrique |
| parfum femme cotonou | absent | Misk Parfumerie, yabourou.net, lynia-shop.com |
| parfum homme cotonou | absent | coinafrique, yabourou.net, Misk Parfumerie |
| lattafa cotonou | absent | Maison Gaïa, ubuy.bj, coinafrique |
| lattafa bénin | absent | ubuy.bj, jiji.ng (Benin City, Nigeria) |
| huile parfumée cotonou | absent | coinafrique, Misk Parfumerie |

**Ce que ça dit :**
1. Sur le nom, c'est presque gagné. Il reste à éviter qu'une page légale passe devant l'accueil.
2. Sur les recherches génériques, la concurrence est **faible** : surtout des comptes Instagram et TikTok,
   des petites annonces (coinafrique, jiji) et deux boutiques en ligne (yabourou, lynia). Aucune
   n'a de contenu détaillé. Une page bien construite par recherche suffit pour se placer.
3. Le bloc Google Maps (le « pack local ») est réservé aux fiches **Google Business Profile**. Sans fiche,
   Al Kareem ne peut pas y figurer, et c'est lui qui capte la majorité des clics sur « parfumerie cotonou ».

> Être 1er sur le seul mot « parfum » n'est pas réaliste : Sephora, Wikipédia et Nocibé
> l'occupent dans tout le monde francophone. La cible, ce sont les recherches de gens qui veulent
> **acheter** : « parfum + Cotonou/Bénin », marques, familles olfactives, cadeaux.

## 2. Carte mots clés → pages

Une page = un groupe de recherches. Les pages ne se concurrencent pas entre elles.

| Groupe de mots clés | Page qui le porte |
|---|---|
| al kareem, al kareem parfumerie, alkareem cotonou | Accueil `/` |
| parfumerie cotonou, parfumerie bénin, parfum cotonou, parfum bénin | Accueil `/` (titre, texte « Votre parfumerie à Cotonou », FAQ) |
| boutique parfum cotonou, parfum en ligne bénin | `/boutique` |
| parfum femme cotonou | `/boutique/genre/femme` |
| parfum homme cotonou | `/boutique/genre/homme` |
| parfum unisexe cotonou | `/boutique/genre/unisexe` |
| eau de parfum cotonou | `/boutique/parfums` |
| huile parfumée cotonou, huile concentrée, musc | `/boutique/huiles-concentrees` |
| brume corporelle cotonou | `/boutique/brumes-sprays-corporels` |
| coffret parfum cotonou | `/boutique/coffrets-cadeaux` |
| lattafa cotonou / bénin, fragrance world, paris corner… | `/marques/<marque>` |
| acheter parfum cotonou, parfum original, parfum authentique | `/conseils/acheter-parfum-original-cotonou` |
| parfum oriental, parfum arabe, oud, musc, parfum dubaï | `/conseils/parfums-orientaux-oud-musc` |
| tenue parfum, parfum qui tient longtemps, parfum chaleur | `/conseils/faire-tenir-son-parfum-chaleur` |
| cadeau parfum, idée cadeau femme/homme bénin | `/conseils/idees-cadeaux-parfum` |
| huile ou eau de parfum, différence eau de parfum / eau de toilette | `/conseils/huile-parfumee-ou-eau-de-parfum` |
| « nom du parfum » + cotonou (ex. khamrah cotonou) | fiche produit `/parfum/<slug>` (titre « Nom — prix à Cotonou ») |

## 3. Ce qui est fait dans le code (PR « feat(seo): keyword plan »)

- **Rubrique « Conseils parfum »** (`/conseils`) : 5 articles qui répondent aux recherches réelles,
  chacun avec FAQ balisée (FAQPage), fil d'Ariane, données Article, liens vers les rayons qui vendent,
  et bouton WhatsApp. Le contenu est dans `src/lib/guides.ts` : on ajoute un article en ajoutant une entrée.
- **Accueil** : bloc « Votre parfumerie à Cotonou » (texte avec les mots clés) et FAQ de 4 questions,
  balisée en FAQPage.
- **Titres et descriptions des rayons** réécrits autour des recherches (`src/lib/category-seo.ts`) :
  « Parfum femme à Cotonou : parfums originaux », « Huiles parfumées concentrées à Cotonou (musc, oud) »…
  Corrige au passage « Huiles Concentrees » (sans accent) dans le titre Google.
- **Pages légales en `noindex, follow`**, retirées du sitemap : la page *Confidentialité* ne passera plus
  devant l'accueil sur « al kareem parfumerie ».
- **Pied de page** : liens vers les 5 conseils (maillage interne sur toutes les pages).
- **`/llms.txt`** : résumé du site pour ChatGPT, Perplexity et Gemini, généré depuis les données.
- **IndexNow** : `npm run indexnow` prévient Bing (et les moteurs qui s'appuient sur lui) après chaque mise en ligne.
- Sitemap : `/conseils` et les 5 articles ajoutés.

## 4. Ce qui ne peut être fait que par vous (par ordre d'impact)

1. **Google Business Profile** (le plus important pour « parfumerie cotonou ») :
   [business.google.com](https://business.google.com). Nom exact « Al Kareem Parfumerie »,
   catégorie principale **Parfumerie**, catégories secondaires *Magasin de cosmétiques* et *Boutique de cadeaux*,
   adresse ou zone desservie Cotonou, téléphone +229 01 61 88 89 87, site
   `https://www.al-kareemparfurmerie.com`, horaires lun–sam 9 h–20 h, 10 photos minimum (boutique, flacons, logo).
   Dans la description, reprenez les mots clés : « parfumerie à Cotonou, parfums authentiques, parfums orientaux,
   huiles concentrées, coffrets, livraison au Bénin, paiement à la livraison ».
2. **Avis Google** : envoyez le lien d'avis de la fiche aux clients livrés (en plus du système d'avis du site).
   Visez 20 avis au premier mois ; demandez-leur de citer le parfum acheté (ex. « mon Khamrah »).
3. **Google Search Console** : [search.google.com/search-console](https://search.google.com/search-console),
   propriété de domaine `al-kareemparfurmerie.com`. Soumettre `sitemap.xml`, puis « Inspecter l'URL » →
   « Demander l'indexation » pour l'accueil et les 5 pages `/conseils/...`.
   La balise de vérification peut aussi passer par `VITE_GOOGLE_SITE_VERIFICATION` sur Vercel.
4. **Instagram, TikTok, Facebook** : vos concurrents sont classés grâce à leurs comptes. Mettez le lien du
   site en bio, et utilisez les mêmes mots dans le nom du profil : « Al Kareem Parfumerie · Parfums Cotonou ».
   À chaque publication d'un parfum, écrivez « disponible à Cotonou » et le nom de la marque.
5. **Annuaires et petites annonces** (liens vers le site) : coinafrique Bénin, goafricaonline Bénin,
   jiji (rubrique Bénin), Pages Jaunes Afrique. Même nom, même téléphone, même site partout.

## 5. Suivi

- Refaire le relevé du § 1 chaque mois. Le plus fiable est Search Console → « Performances », qui donne la
  position moyenne réelle par recherche, sans blocage.
- Délais habituels : de 2 à 6 semaines pour l'indexation des nouvelles pages, de 2 à 3 mois pour monter
  sur des recherches peu disputées comme « parfum femme cotonou ».
- Mots clés à mesurer au prochain relevé : coffret parfum cotonou, parfum oriental cotonou,
  parfum pas cher cotonou, musc / oud cotonou, parfum arabe / dubaï cotonou, fragrance world cotonou,
  meilleure parfumerie cotonou, eau de parfum bénin.
- Prochains articles possibles : « Parfum pas cher à Cotonou : bien acheter avec un petit budget »,
  « Les parfums Lattafa les plus demandés », « Quel parfum pour un mariage ? ».
