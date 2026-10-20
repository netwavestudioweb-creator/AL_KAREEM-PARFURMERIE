/**
 * Titres et descriptions Google des pages catégorie et genre, écrits autour des
 * recherches réelles (« parfum femme cotonou », « huile parfumée cotonou »…).
 * Les catégories absentes d'ici gardent un titre généré à partir du slug.
 */
export interface PageSeo {
  title: string;
  description: string;
}

export const CATEGORY_SEO: Record<string, PageSeo> = {
  parfums: {
    title: "Parfums à Cotonou : eaux de parfum authentiques | Al Kareem",
    description:
      "Eaux de parfum authentiques à Cotonou : Lattafa, Fragrance World, Paris Corner… Commande WhatsApp, paiement à la livraison, livraison partout au Bénin.",
  },
  "huiles-concentrees": {
    title: "Huiles parfumées concentrées à Cotonou (musc, oud) | Al Kareem",
    description:
      "Huiles de parfum concentrées sans alcool, longue tenue sous la chaleur : musc, oud, ambre. À Cotonou, payées à la livraison, livrées dans tout le Bénin.",
  },
  "senteurs-unisexe": {
    title: "Parfums unisexe et orientaux à Cotonou | Al Kareem Parfumerie",
    description:
      "Parfums unisexe et orientaux (oud, ambre, musc) à partager. Flacons authentiques à Cotonou, livraison au Bénin et dans la sous-région.",
  },
  "brumes-sprays-corporels": {
    title: "Brumes et sprays corporels parfumés à Cotonou | Al Kareem",
    description:
      "Brumes corporelles et sprays parfumés pour une fraîcheur toute la journée. Livraison à Cotonou et au Bénin, paiement à la réception.",
  },
  deodorants: {
    title: "Déodorants parfumés à Cotonou | Al Kareem Parfumerie",
    description:
      "Déodorants homme et femme authentiques à Cotonou. Commande sur WhatsApp, paiement à la livraison.",
  },
  "coffrets-cadeaux": {
    title: "Coffrets parfum et idées cadeaux à Cotonou | Al Kareem",
    description:
      "Coffrets parfum prêts à offrir : anniversaire, mariage, fêtes. Parfums authentiques livrés à Cotonou et dans tout le Bénin, payés à la réception.",
  },
};

export const GENRE_SEO: Record<string, PageSeo> = {
  femme: {
    title: "Parfum femme à Cotonou : parfums originaux | Al Kareem",
    description:
      "Parfums femme authentiques à Cotonou : floraux, vanillés, orientaux. Commande WhatsApp, paiement à la livraison, livraison au Bénin et dans la sous-région.",
  },
  homme: {
    title: "Parfum homme à Cotonou : parfums originaux | Al Kareem",
    description:
      "Parfums homme authentiques à Cotonou : boisés, épicés, oud. Commande WhatsApp, paiement à la livraison, livraison au Bénin et dans la sous-région.",
  },
  unisexe: {
    title: "Parfum unisexe à Cotonou : parfums originaux | Al Kareem",
    description:
      "Parfums unisexe authentiques à Cotonou, pour elle comme pour lui. Paiement à la livraison, livraison au Bénin et dans la sous-région.",
  },
};
