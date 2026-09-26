/**
 * Module Analytics / GA4 pour Al Kareem Parfumerie.
 * Pour activer Google Analytics 4, définissez la variable d'environnement VITE_GA_ID dans votre fichier .env (ex: VITE_GA_ID=G-XXXXXXXXXX).
 * Le script gtag.js est injecté automatiquement dans le <head> par src/routes/__root.tsx quand VITE_GA_ID est configuré.
 */

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag?: (...args: any[]) => void;
  }
}

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }
}

export function trackProductView(product: {
  id: string;
  name: string;
  price: number;
  category?: string;
}) {
  trackEvent("view_item", {
    currency: "XOF",
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
      },
    ],
  });
}

export function trackAddToCart(
  product: { id: string; name: string; price: number; category?: string },
  quantity = 1,
) {
  trackEvent("add_to_cart", {
    currency: "XOF",
    value: product.price * quantity,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
        quantity,
      },
    ],
  });
}

export function trackWhatsAppClick(source: string, totalAmount?: number) {
  trackEvent("click_whatsapp", {
    source,
    value: totalAmount,
    currency: "XOF",
  });
}
