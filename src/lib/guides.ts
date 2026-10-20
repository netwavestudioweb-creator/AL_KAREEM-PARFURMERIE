/**
 * Rubrique « Conseils parfum » : articles qui répondent aux recherches Google réelles
 * autour du parfum à Cotonou et au Bénin (voir docs/plan-mots-cles.md).
 * Chaque article vise un groupe de mots clés et renvoie vers les pages boutique qui vendent.
 * Liens internes : chemins du site (« /boutique/... »), rendus en <a>.
 */

export type GuideBlock =
  { type: "h2"; text: string } | { type: "p"; text: string } | { type: "ul"; items: string[] };

export interface GuideLink {
  label: string;
  href: string;
}

export interface Guide {
  slug: string;
  /** Balise <title> : mot clé principal en tête, moins de 65 caractères avec la marque. */
  title: string;
  /** Titre visible (H1). */
  h1: string;
  description: string;
  /** Mots clés visés, pour mémoire (non affichés). */
  keywords: string[];
  updated: string;
  intro: string;
  body: GuideBlock[];
  links: GuideLink[];
  faq: { q: string; a: string }[];
}

export const GUIDES: Guide[] = [
  {
    slug: "acheter-parfum-original-cotonou",
    title: "Où acheter un parfum original à Cotonou ?",
    h1: "Où acheter un parfum original à Cotonou (et éviter les contrefaçons)",
    description:
      "Parfum original ou copie ? Nos conseils pour acheter un parfum authentique à Cotonou et au Bénin : flacon, code de lot, prix, et où commander en confiance.",
    keywords: [
      "acheter parfum cotonou",
      "parfum original cotonou",
      "parfum authentique bénin",
      "boutique parfum cotonou",
      "parfumerie cotonou",
    ],
    updated: "2026-10-20",
    intro:
      "À Cotonou, on trouve des parfums partout : au marché, sur Instagram, dans les boutiques de quartier. Le problème, c'est qu'un flacon qui ressemble à l'original ne sent pas toujours comme l'original, et ne tient pas aussi longtemps. Voici comment faire la différence avant de payer.",
    body: [
      { type: "h2", text: "Les 5 vérifications avant d'acheter un parfum" },
      {
        type: "ul",
        items: [
          "Le code de lot : il est gravé ou imprimé sous le flacon et doit être identique à celui de la boîte.",
          "La boîte : cellophane bien tendu, impression nette, sans faute d'orthographe sur le nom de la maison.",
          "Le flacon : verre épais et régulier, bouchon lourd qui s'emboîte sans jeu, vaporisateur qui diffuse un brouillard fin.",
          "Le jus : sa couleur doit correspondre à l'original, sans dépôt ni trouble.",
          "Le prix : un parfum vendu très en dessous de son prix habituel est presque toujours une copie.",
        ],
      },
      { type: "h2", text: "Pourquoi un parfum authentique tient mieux sous la chaleur" },
      {
        type: "p",
        text: "Avec la chaleur et l'humidité de Cotonou, un parfum s'évapore plus vite. Les copies utilisent souvent plus d'alcool et moins de concentré : elles sentent fort pendant une heure, puis disparaissent. Un parfum original, et en particulier une eau de parfum ou un extrait, garde son sillage plusieurs heures.",
      },
      { type: "h2", text: "Commander chez Al Kareem Parfumerie" },
      {
        type: "p",
        text: "Al Kareem Parfumerie est une parfumerie de Cotonou qui vend uniquement des flacons authentiques, vérifiés avant la vente. Vous composez votre panier sur le site, la commande part sur WhatsApp, et vous payez à la réception : en espèces, MTN MoMo ou Moov Money. Vous voyez donc le flacon avant de payer. Nous livrons à Cotonou, partout au Bénin et dans la sous-région.",
      },
    ],
    links: [
      { label: "Voir tous nos parfums à Cotonou", href: "/boutique" },
      { label: "Parfums femme", href: "/boutique/genre/femme" },
      { label: "Parfums homme", href: "/boutique/genre/homme" },
    ],
    faq: [
      {
        q: "Comment savoir si un parfum est original ?",
        a: "Vérifiez que le code de lot sous le flacon correspond à celui de la boîte, que l'emballage est net, et méfiez-vous d'un prix très bas. Chez Al Kareem, vous payez à la livraison, après avoir vu le flacon.",
      },
      {
        q: "Où acheter un parfum authentique à Cotonou ?",
        a: "Al Kareem Parfumerie vend des parfums 100 % authentiques à Cotonou, avec commande sur WhatsApp et paiement à la réception.",
      },
    ],
  },
  {
    slug: "parfums-orientaux-oud-musc",
    title: "Parfums orientaux, oud et musc : le guide",
    h1: "Parfums orientaux, oud et musc : bien choisir à Cotonou",
    description:
      "Oud, musc, ambre, parfums arabes de Dubaï (Lattafa, Fragrance World…) : comprendre les parfums orientaux et choisir le vôtre, disponibles à Cotonou.",
    keywords: [
      "parfum oriental cotonou",
      "parfum arabe cotonou",
      "oud cotonou",
      "musc cotonou",
      "parfum dubai cotonou",
      "lattafa cotonou",
    ],
    updated: "2026-10-20",
    intro:
      "Les parfums orientaux sont les plus demandés au Bénin : ils sont chaleureux, généreux et tiennent longtemps. Mais entre oud, musc, ambre et encens, il n'est pas toujours facile de s'y retrouver.",
    body: [
      { type: "h2", text: "Les grandes familles orientales" },
      {
        type: "ul",
        items: [
          "Oud (bois d'agar) : boisé, profond, un peu fumé. La note signature des parfums arabes.",
          "Musc : doux, propre, « peau ». Idéal au quotidien et au bureau.",
          "Ambre et vanille : chaud et sucré, parfait pour le soir et les cérémonies.",
          "Encens et épices (safran, cardamome) : intense, élégant, très remarqué.",
        ],
      },
      { type: "h2", text: "Les maisons de Dubaï à connaître" },
      {
        type: "p",
        text: "Lattafa (Khamrah, Hayaati, Fakhar, Qaed al Fursan…), Fragrance World, Paris Corner, Maison Asrar ou French Avenue proposent des parfums orientaux puissants à des prix accessibles. Ce sont aujourd'hui les marques les plus recherchées à Cotonou.",
      },
      { type: "h2", text: "Eau de parfum ou huile ?" },
      {
        type: "p",
        text: "Les huiles concentrées (sans alcool) se posent directement sur la peau et durent toute la journée ; l'eau de parfum diffuse un sillage plus large. Beaucoup de nos clients combinent les deux : une huile musc en base, un vaporisateur oud par-dessus.",
      },
    ],
    links: [
      { label: "Parfums Lattafa à Cotonou", href: "/marques/lattafa" },
      { label: "Parfums Fragrance World", href: "/marques/fragrance-world" },
      { label: "Huiles concentrées", href: "/boutique/huiles-concentrees" },
      { label: "Senteurs unisexe", href: "/boutique/senteurs-unisexe" },
    ],
    faq: [
      {
        q: "Quel parfum oriental choisir pour commencer ?",
        a: "Un musc ou un ambre vanillé est facile à porter. Si vous aimez les parfums intenses, essayez un oud : demandez-nous conseil sur WhatsApp.",
      },
      {
        q: "Où trouver des parfums Lattafa à Cotonou ?",
        a: "Al Kareem Parfumerie propose des parfums Lattafa authentiques à Cotonou, livrés au Bénin et dans la sous-région, payés à la réception.",
      },
    ],
  },
  {
    slug: "faire-tenir-son-parfum-chaleur",
    title: "Faire tenir son parfum toute la journée sous la chaleur",
    h1: "Comment faire tenir son parfum toute la journée, même sous la chaleur",
    description:
      "Chaleur et humidité font s'évaporer le parfum. 7 gestes simples pour une meilleure tenue du parfum à Cotonou, et les parfums qui tiennent le plus longtemps.",
    keywords: [
      "tenue parfum",
      "parfum qui tient longtemps",
      "faire tenir son parfum",
      "parfum chaleur",
      "parfum longue tenue bénin",
    ],
    updated: "2026-10-20",
    intro:
      "Vous vous parfumez le matin et à midi, plus rien ? Avec la chaleur de Cotonou, c'est normal : la chaleur accélère l'évaporation. La bonne nouvelle, c'est que quelques gestes changent tout.",
    body: [
      { type: "h2", text: "7 gestes pour une meilleure tenue" },
      {
        type: "ul",
        items: [
          "Appliquez le parfum sur une peau propre et hydratée : une crème neutre retient les notes plus longtemps.",
          "Visez les points chauds : poignets, cou, derrière les oreilles, creux des coudes.",
          "Ne frottez pas les poignets : cela casse les notes de tête.",
          "Vaporisez aussi sur les vêtements et les cheveux, qui gardent l'odeur plus longtemps que la peau.",
          "Superposez : une huile parfumée ou une brume corporelle en base, puis l'eau de parfum.",
          "Gardez vos flacons à l'abri du soleil et de la chaleur, jamais dans la voiture.",
          "Choisissez la bonne concentration : un extrait ou une eau de parfum tient bien plus qu'une eau de toilette.",
        ],
      },
      { type: "h2", text: "Les parfums qui tiennent le plus longtemps" },
      {
        type: "p",
        text: "Les notes de fond lourdes (oud, ambre, vanille, musc, bois) tiennent le mieux. C'est pour cela que les parfums orientaux sont si appréciés au Bénin. Les parfums frais et agrumes sont agréables mais s'évaporent plus vite : pensez à garder un petit flacon dans votre sac.",
      },
    ],
    links: [
      { label: "Huiles concentrées longue tenue", href: "/boutique/huiles-concentrees" },
      { label: "Brumes et sprays corporels", href: "/boutique/brumes-sprays-corporels" },
      { label: "Guide des parfums orientaux", href: "/conseils/parfums-orientaux-oud-musc" },
    ],
    faq: [
      {
        q: "Pourquoi mon parfum ne tient pas ?",
        a: "La chaleur, une peau sèche et une faible concentration (eau de toilette) réduisent la tenue. Hydratez la peau et choisissez une eau de parfum ou une huile.",
      },
      {
        q: "Quel type de parfum tient le plus longtemps ?",
        a: "Les huiles concentrées et les eaux de parfum aux notes orientales (oud, ambre, musc, vanille).",
      },
    ],
  },
  {
    slug: "idees-cadeaux-parfum",
    title: "Idées cadeaux parfum et coffrets à Cotonou",
    h1: "Offrir un parfum : idées cadeaux et coffrets à Cotonou",
    description:
      "Anniversaire, mariage, fête des mères, Tabaski, Noël : comment choisir un parfum à offrir, et nos coffrets cadeaux livrés à Cotonou et au Bénin.",
    keywords: [
      "coffret parfum cotonou",
      "cadeau parfum cotonou",
      "idée cadeau femme bénin",
      "idée cadeau homme bénin",
      "coffret cadeau bénin",
    ],
    updated: "2026-10-20",
    intro:
      "Un parfum est l'un des cadeaux les plus appréciés, à condition de bien le choisir. Voici comment viser juste, même sans connaître les goûts de la personne.",
    body: [
      { type: "h2", text: "Choisir selon la personne" },
      {
        type: "ul",
        items: [
          "Elle aime ce qui est doux : un parfum floral, musqué ou vanillé.",
          "Il aime ce qui se remarque : un oud, un boisé épicé ou un ambré.",
          "Vous hésitez : un parfum unisexe ou un coffret qui permet de varier.",
          "Petit budget : une brume corporelle ou une huile concentrée, très appréciées.",
        ],
      },
      { type: "h2", text: "Les occasions" },
      {
        type: "p",
        text: "Anniversaire, mariage, fête des mères et des pères, Saint-Valentin, Tabaski, Noël, remerciements… Les coffrets sont prêts à offrir. Commandez sur WhatsApp, nous livrons à Cotonou et dans tout le Bénin, et vous payez à la réception.",
      },
    ],
    links: [
      { label: "Coffrets cadeaux", href: "/boutique/coffrets-cadeaux" },
      { label: "Parfums femme", href: "/boutique/genre/femme" },
      { label: "Parfums homme", href: "/boutique/genre/homme" },
      { label: "Parfums unisexe", href: "/boutique/genre/unisexe" },
    ],
    faq: [
      {
        q: "Quel parfum offrir à une femme ?",
        a: "Un floral ou un musc vanillé plaît à la plupart des femmes. En cas de doute, un coffret permet de varier les senteurs.",
      },
      {
        q: "Livrez-vous les cadeaux à Cotonou ?",
        a: "Oui, à Cotonou, dans tout le Bénin et dans la sous-région, avec paiement à la réception.",
      },
    ],
  },
  {
    slug: "huile-parfumee-ou-eau-de-parfum",
    title: "Huile parfumée ou eau de parfum : que choisir ?",
    h1: "Huile parfumée ou eau de parfum : que choisir ?",
    description:
      "Huile concentrée, eau de parfum, eau de toilette, brume : les différences de concentration, de tenue et de prix pour bien choisir son parfum au Bénin.",
    keywords: [
      "huile parfumée cotonou",
      "huile concentrée parfum",
      "eau de parfum bénin",
      "différence eau de parfum eau de toilette",
      "brume corporelle cotonou",
    ],
    updated: "2026-10-20",
    intro:
      "Même senteur, résultat très différent : tout dépend de la concentration. Voici ce qui distingue les formats que l'on trouve en parfumerie.",
    body: [
      { type: "h2", text: "Les concentrations, du plus léger au plus intense" },
      {
        type: "ul",
        items: [
          "Brume ou spray corporel : léger et rafraîchissant, à renouveler dans la journée.",
          "Eau de toilette : fraîche, idéale le matin ou au sport.",
          "Eau de parfum : le meilleur équilibre entre sillage et tenue, le format le plus vendu.",
          "Extrait et huile concentrée : très concentrés, sans alcool pour les huiles, ils tiennent toute la journée.",
        ],
      },
      { type: "h2", text: "Notre conseil" },
      {
        type: "p",
        text: "Pour la chaleur de Cotonou, l'eau de parfum et l'huile concentrée sont les plus efficaces. L'huile convient aussi aux peaux sensibles à l'alcool. Pour un sillage maximal, appliquez l'huile puis vaporisez l'eau de parfum.",
      },
    ],
    links: [
      { label: "Huiles concentrées", href: "/boutique/huiles-concentrees" },
      { label: "Tous les parfums", href: "/boutique/parfums" },
      { label: "Brumes et sprays corporels", href: "/boutique/brumes-sprays-corporels" },
    ],
    faq: [
      {
        q: "Quelle est la différence entre eau de parfum et eau de toilette ?",
        a: "L'eau de parfum est plus concentrée : elle tient plus longtemps et laisse un sillage plus marqué que l'eau de toilette.",
      },
      {
        q: "L'huile parfumée tient-elle plus longtemps ?",
        a: "Oui, une huile concentrée sans alcool tient généralement toute la journée, même sous la chaleur.",
      },
    ],
  },
];

export function findGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

/** Questions fréquentes de l'accueil (affichées et balisées en FAQPage). */
export const HOME_FAQ: { q: string; a: string }[] = [
  {
    q: "Où acheter un parfum original à Cotonou ?",
    a: "Chez Al Kareem Parfumerie, parfumerie de Cotonou : tous nos parfums sont authentiques et vérifiés avant la vente. Vous commandez sur le site ou sur WhatsApp et vous payez à la réception.",
  },
  {
    q: "Livrez-vous partout au Bénin ?",
    a: "Oui. Nous livrons à Cotonou, à Abomey-Calavi, à Porto-Novo et dans tout le Bénin, ainsi que dans la sous-région (Togo, Nigeria, Niger, Burkina Faso, Côte d'Ivoire, Ghana).",
  },
  {
    q: "Comment payer ma commande de parfum ?",
    a: "À la réception : en espèces, par MTN MoMo ou Moov Money. Le paiement par carte bancaire est aussi possible.",
  },
  {
    q: "Quelles marques de parfum vendez-vous ?",
    a: "Des parfums femme, homme et unisexe, des huiles concentrées, des brumes et des coffrets, notamment des maisons Lattafa, Fragrance World, Paris Corner, Maison Asrar, French Avenue et Zara.",
  },
];
