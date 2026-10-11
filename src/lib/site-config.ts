export const SITE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SITE_URL) ||
  (typeof process !== "undefined" && process.env?.SITE_URL) ||
  "https://www.al-kareemparfurmerie.com";

export const SITE_CONFIG = {
  name: "Al Kareem Parfumerie",
  tagline: "Sublimez votre aura",
  description:
    "Parfumerie de référence à Cotonou, Bénin. Parfums femme, homme, unisexe, huiles concentrées, brumes et coffrets d'exception. Commande WhatsApp, livraison au Bénin et dans la sous-région.",
  url: SITE_URL,
  logoUrl: `${SITE_URL}/alkareem-logo.jpg`,
  ogImageUrl: `${SITE_URL}/og-alkareem.jpg`,
  phone: "+2290161888987",
  whatsapp: "+2290161888987",
  address: {
    addressLocality: "Cotonou",
    addressCountry: "BJ",
  },
  currency: "XOF",
  priceRange: "FCFA",
};

export function getCanonicalUrl(path: string = ""): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_CONFIG.url}${cleanPath}`;
}
