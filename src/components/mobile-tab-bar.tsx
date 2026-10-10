import { Link, useRouterState } from "@tanstack/react-router";
import { Home, LayoutGrid, MessageCircle, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import { whatsappLink } from "@/lib/products";
import { CONSEIL_MESSAGE } from "./site-header";

const TAB =
  "flex flex-col items-center justify-center gap-1 text-[10.5px] font-semibold text-foreground";

/**
 * Barre d'onglets mobile (style application). Masquée sur la fiche produit et le panier,
 * qui ont leur propre barre d'action collée en bas.
 */
export function MobileTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { count } = useCart();
  if (pathname.startsWith("/parfum/") || pathname === "/panier") return null;

  return (
    <nav
      aria-label="Navigation rapide"
      className="fixed inset-x-0 bottom-0 z-40 grid h-[calc(64px+env(safe-area-inset-bottom,0px))] grid-cols-4 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-md lg:hidden"
    >
      <Link
        to="/"
        className={TAB}
        activeOptions={{ exact: true }}
        activeProps={{ className: "!text-primary" }}
      >
        <Home className="h-5 w-5" />
        Accueil
      </Link>
      <Link
        to="/boutique"
        className={TAB}
        activeOptions={{ includeSearch: false }}
        activeProps={{ className: "!text-primary" }}
      >
        <LayoutGrid className="h-5 w-5" />
        Boutique
      </Link>
      <a
        href={whatsappLink(CONSEIL_MESSAGE)}
        target="_blank"
        rel="noopener noreferrer"
        className={`${TAB} !text-whatsapp`}
      >
        <MessageCircle className="h-5 w-5" />
        WhatsApp
      </a>
      <Link to="/panier" className={TAB} activeProps={{ className: "!text-primary" }}>
        <ShoppingBag className="h-5 w-5" />
        Panier{count > 0 ? ` (${count > 99 ? "99+" : count})` : ""}
      </Link>
    </nav>
  );
}
