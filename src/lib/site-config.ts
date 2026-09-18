export const SITE_CONFIG = {
  name: "Al Kareem Parfumerie",
  tagline: "Sublimez votre aura",
  description:
    "Parfumerie de référence à Cotonou, Bénin. Parfums femme, homme, unisexe, huiles concentrées, brumes et coffrets d'exception. Commande WhatsApp et livraison rapide au Bénin.",
  url: "https://al-kareem-parfurmerie.vercel.app",
  logoUrl: "https://al-kareem-parfurmerie.vercel.app/alkareem-logo.jpg",
  ogImageUrl: "https://al-kareem-parfurmerie.vercel.app/og-alkareem.jpg",
  phone: "+2290161888987",
  whatsapp: "+2290161888987",
  address: {
    streetAddress: "Avenue du Parfum",
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
