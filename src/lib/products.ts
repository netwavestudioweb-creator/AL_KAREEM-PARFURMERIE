// Public helpers kept here so existing imports continue to work.
export type { Product, Category } from "./catalog";
export {
  fetchProducts,
  fetchProductBySlug,
  fetchCategories,
  slugify,
} from "./catalog";

export function formatFCFA(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

export const WHATSAPP_NUMBER = "2290161888987";

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
