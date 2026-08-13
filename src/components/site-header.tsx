import { Link } from "@tanstack/react-router";
import { ShoppingBag, Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Accueil" },
  { to: "/boutique", label: "Boutique" },
  { to: "/a-propos", label: "À propos" },
  { to: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 shrink-0" onClick={() => setOpen(false)}>
            <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-soft border border-border overflow-hidden">
              <img src="/alkareem-logo.jpg" alt="Al Kareem" className="h-10 w-10 object-contain" />
            </div>
            <div className="leading-tight">
              <div className="font-serif text-xl text-primary-deep">Al Kareem</div>
              <div className="text-[10px] tracking-[0.25em] text-muted-foreground uppercase">Parfumerie</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors relative"
                activeProps={{ className: "text-primary" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/boutique"
              className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary transition-colors"
              aria-label="Rechercher"
            >
              <Search className="h-5 w-5" />
            </Link>
            <Link
              to="/panier"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary transition-colors"
              aria-label="Panier"
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
            <button
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary"
              onClick={() => setOpen((o) => !o)}
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className={cn("md:hidden overflow-hidden transition-all", open ? "max-h-64 pb-4" : "max-h-0")}>
          <nav className="flex flex-col gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="px-3 py-3 rounded-lg text-sm font-medium hover:bg-secondary"
                activeProps={{ className: "bg-secondary text-primary" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
