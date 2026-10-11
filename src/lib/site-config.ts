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
  // Nom de fichier versionné : changer d'image oblige Facebook/WhatsApp à rafraîchir leur cache.
  ogImageUrl: `${SITE_URL}/og-alkareem-2026.jpg`,
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

/**
 * Balises de l'aperçu de partage (WhatsApp, Facebook, X, LinkedIn…) pour l'image de marque.
 * Les dimensions déclarées permettent l'affichage immédiat du grand aperçu au premier partage.
 */
export const OG_IMAGE_META = [
  { property: "og:image", content: SITE_CONFIG.ogImageUrl },
  { property: "og:image:secure_url", content: SITE_CONFIG.ogImageUrl },
  { property: "og:image:type", content: "image/jpeg" },
  { property: "og:image:width", content: "1200" },
  { property: "og:image:height", content: "630" },
  {
    property: "og:image:alt",
    content: "Al Kareem Parfumerie — Sublimez votre aura. Parfums authentiques à Cotonou.",
  },
];
