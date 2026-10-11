import { normalizeSearch, type Product } from "./catalog";

/**
 * Marques mises en avant (une page « Parfums <Marque> à Cotonou » chacune).
 * La marque n'est pas une colonne en base : on la reconnaît dans le nom ou la description.
 */
export interface Brand {
  slug: string;
  name: string;
  keywords: string[];
  intro: string;
}

export const BRANDS: Brand[] = [
  {
    slug: "lattafa",
    name: "Lattafa",
    keywords: ["lattafa", "latafa"],
    intro:
      "La maison de Dubaï des parfums orientaux : Khamrah, Hayaati, Fakhar, Qaed al Fursan… Flacons authentiques disponibles à Cotonou.",
  },
  {
    slug: "fragrance-world",
    name: "Fragrance World",
    keywords: ["fragrance world"],
    intro:
      "Les créations de Fragrance World, des sillages intenses à prix doux, livrées au Bénin et dans la sous-région.",
  },
  {
    slug: "zara",
    name: "Zara",
    keywords: ["zara"],
    intro: "Les parfums Zara, dont la collection Tobacco, disponibles à Cotonou.",
  },
  {
    slug: "paris-corner",
    name: "Paris Corner",
    keywords: ["paris corner"],
    intro: "Les parfums Paris Corner : Khair, Nouf, Marshmallow Blush… disponibles à Cotonou.",
  },
  {
    slug: "maison-asrar",
    name: "Maison Asrar",
    keywords: ["maison asrar", "asrar"],
    intro: "Vanilla Voyage et les gourmands de Maison Asrar, disponibles à Cotonou.",
  },
  {
    slug: "french-avenue",
    name: "French Avenue",
    keywords: ["french avenue"],
    intro: "Liquid Brun et les créations French Avenue, disponibles à Cotonou.",
  },
];

export function findBrand(slug: string): Brand | undefined {
  return BRANDS.find((b) => b.slug === slug);
}

export function matchesBrand(p: Product, brand: Brand): boolean {
  const text = normalizeSearch(`${p.name} ${p.description}`);
  return brand.keywords.some((k) => text.includes(k));
}
