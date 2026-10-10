import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag, Menu, Search, MessageCircle, ChevronRight } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { useCart } from "@/lib/cart";
import { fetchCategories, whatsappLink } from "@/lib/products";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";

export const GENRES = [
  { genre: "femme", label: "Femme" },
  { genre: "homme", label: "Homme" },
  { genre: "unisexe", label: "Unisexe" },
] as const;

/**
 * Catégories absentes de la barre desktop : déjà couvertes par « Pour qui » (parfums, unisexe)
 * ou articles d'entretien (déodorants, diffuseurs), accessibles via le menu et la boutique.
 */
const NAV_HIDDEN_SLUGS = new Set([
  "parfums",
  "senteurs-unisexe",
  "deodorants",
  "diffuseurs-de-parfum",
]);

export const CONSEIL_MESSAGE = "Bonjour Al Kareem, j'aimerais un conseil pour choisir mon parfum.";

const NAV_LINK =
  "whitespace-nowrap text-[12px] font-semibold uppercase tracking-[0.12em] text-foreground/80 transition-colors hover:text-primary";

function AnnouncementBar() {
  return (
    <div className="bg-primary-deep text-[11.5px] text-primary-foreground/90 sm:text-[12.5px]">
      <div className="mx-auto flex h-8 max-w-[1320px] items-center justify-center gap-3 px-4 sm:h-[38px] lg:justify-between lg:px-8">
        <span className="hidden lg:inline">
          Livraison rapide à Cotonou, Calavi &amp; Porto-Novo
        </span>
        <span className="flex items-center gap-2 font-medium">
          <span>Paiement à la livraison</span>
          <span aria-hidden className="text-gold">
            ✦
          </span>
          <span>100 % authentique</span>
        </span>
        <a
          href={whatsappLink(CONSEIL_MESSAGE)}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden text-gold hover:underline lg:inline"
        >
          Conseil privé sur WhatsApp →
        </a>
      </div>
    </div>
  );
}

function SearchForm({ id, className }: { id: string; className?: string }) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const q = inputRef.current?.value.trim() ?? "";
        navigate({ to: "/boutique", search: { q } });
        inputRef.current?.blur();
      }}
      className={`relative w-full ${className ?? ""}`}
    >
      <label htmlFor={id} className="sr-only">
        Rechercher un parfum
      </label>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
      <input
        ref={inputRef}
        id={id}
        type="search"
        name="q"
        enterKeyHint="search"
        placeholder="Rechercher un parfum, une marque, une note…"
        maxLength={80}
        className="h-[46px] w-full rounded-full border border-input bg-card pl-11 pr-4 text-[15px] outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15 lg:h-12 lg:text-sm"
      />
    </form>
  );
}

function CartButton({ variant }: { variant: "icon" | "pill" }) {
  const { count } = useCart();
  const label = count > 0 ? `Panier, ${count} article${count > 1 ? "s" : ""}` : "Panier";
  if (variant === "pill") {
    return (
      <Link
        to="/panier"
        aria-label={label}
        className="inline-flex h-11 items-center gap-2 rounded-full bg-primary-deep px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary"
      >
        <ShoppingBag className="h-[18px] w-[18px]" />
        Panier{count > 0 ? ` · ${count > 99 ? "99+" : count}` : ""}
      </Link>
    );
  }
  return (
    <Link
      to="/panier"
      aria-label={label}
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-secondary"
    >
      <ShoppingBag className="h-[22px] w-[22px]" />
      {count > 0 && (
        <span className="absolute right-0.5 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60_000,
  });
  const navCategories = categories.filter((c) => !NAV_HIDDEN_SLUGS.has(c.slug));
  const close = () => setMenuOpen(false);

  return (
    <>
      <AnnouncementBar />
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 pt-[env(safe-area-inset-top,0px)] backdrop-blur-md">
        {/* Ligne principale */}
        <div className="mx-auto max-w-[1320px] px-2 lg:px-8">
          <div className="grid h-[60px] grid-cols-[1fr_auto_1fr] items-center lg:h-[84px] lg:grid-cols-[260px_minmax(0,1fr)_260px] lg:gap-8">
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-secondary"
                onClick={() => setMenuOpen(true)}
                aria-label="Ouvrir le menu"
              >
                <Menu className="h-[22px] w-[22px]" />
              </button>
            </div>

            <Link
              to="/"
              className="flex items-center gap-2 lg:gap-3"
              aria-label="Al Kareem — Accueil"
            >
              <img
                src="/alkareem-logo.webp"
                alt=""
                width={105}
                height={140}
                className="h-9 w-auto object-contain lg:h-12"
              />
              <span className="leading-none">
                <span className="block font-serif text-[23px] text-primary-deep lg:text-[28px]">
                  Al Kareem
                </span>
                <span className="mt-1 hidden text-[9.5px] uppercase tracking-[0.32em] text-muted-foreground lg:block">
                  Parfumerie
                </span>
              </span>
            </Link>

            <SearchForm id="search-desktop" className="hidden lg:block" />

            <div className="flex items-center justify-end gap-1 lg:gap-2">
              <a
                href={whatsappLink(CONSEIL_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden h-11 items-center gap-2 rounded-full px-3.5 text-sm font-medium text-primary-deep hover:bg-secondary lg:inline-flex"
              >
                <MessageCircle className="h-5 w-5" /> Conseil
              </a>
              <span className="lg:hidden">
                <CartButton variant="icon" />
              </span>
              <span className="hidden lg:inline-flex">
                <CartButton variant="pill" />
              </span>
            </div>
          </div>

          {/* Recherche mobile, toujours visible */}
          <SearchForm id="search-mobile" className="px-2 pb-3 lg:hidden" />
        </div>

        {/* Navigation catégories (desktop) */}
        <nav aria-label="Catégories" className="hidden border-t border-border/70 lg:block">
          <div className="scrollbar-none mx-auto flex h-[50px] max-w-[1320px] items-center gap-7 justify-center-safe overflow-x-auto px-8">
            <Link
              to="/boutique"
              className={NAV_LINK}
              activeOptions={{ exact: true, includeSearch: false }}
              activeProps={{ className: "!text-primary" }}
            >
              Nouveautés
            </Link>
            {GENRES.map((g) => (
              <Link
                key={g.genre}
                to="/boutique/genre/$genre"
                params={{ genre: g.genre }}
                className={NAV_LINK}
                activeProps={{ className: "!text-primary" }}
              >
                {g.label}
              </Link>
            ))}
            {navCategories.map((c) => (
              <Link
                key={c.id}
                to="/boutique/$category"
                params={{ category: c.slug }}
                className={NAV_LINK}
                activeProps={{ className: "!text-primary" }}
              >
                {c.name}
              </Link>
            ))}
            <Link to="/boutique" search={{ promo: true }} className={`${NAV_LINK} !text-gold-ink`}>
              Offres
            </Link>
          </div>
        </nav>
      </header>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="flex w-[86vw] max-w-sm flex-col gap-0 p-0">
          <div className="border-b border-border px-5 py-4">
            <SheetTitle className="font-serif text-2xl font-normal text-primary-deep">
              Al Kareem
            </SheetTitle>
            <SheetDescription className="text-xs">
              Parfumerie d'exception à Cotonou
            </SheetDescription>
          </div>
          <nav aria-label="Navigation mobile" className="flex-1 overflow-y-auto px-2 py-3">
            <MobileLink to="/" onNavigate={close}>
              Accueil
            </MobileLink>
            <MobileLink to="/boutique" onNavigate={close}>
              Toute la boutique
            </MobileLink>
            <SectionLabel>Pour qui ?</SectionLabel>
            {GENRES.map((g) => (
              <Link
                key={g.genre}
                to="/boutique/genre/$genre"
                params={{ genre: g.genre }}
                onClick={close}
                className={MOBILE_ROW}
              >
                {g.label} <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
            {categories.length > 0 && (
              <>
                <SectionLabel>Univers</SectionLabel>
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    to="/boutique/$category"
                    params={{ category: c.slug }}
                    onClick={close}
                    className={MOBILE_ROW}
                  >
                    {c.name} <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </>
            )}
            <div className="mt-4 border-t border-border pt-3">
              <MobileLink to="/a-propos" onNavigate={close}>
                La Maison
              </MobileLink>
              <MobileLink to="/contact" onNavigate={close}>
                Contact
              </MobileLink>
            </div>
          </nav>
          <div className="border-t border-border p-4">
            <a
              href={whatsappLink(CONSEIL_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-whatsapp text-sm font-semibold text-whatsapp-foreground"
            >
              <MessageCircle className="h-4 w-4" /> Conseil sur WhatsApp
            </a>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

const MOBILE_ROW =
  "flex items-center justify-between rounded-lg px-3 py-3 text-[15px] hover:bg-secondary";

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </div>
  );
}

function MobileLink({
  to,
  onNavigate,
  children,
}: {
  to: "/" | "/boutique" | "/a-propos" | "/contact";
  onNavigate: () => void;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      activeOptions={{ exact: true, includeSearch: false }}
      className="block rounded-lg px-3 py-3 text-[15px] font-medium hover:bg-secondary"
      activeProps={{ className: "bg-secondary text-primary" }}
    >
      {children}
    </Link>
  );
}
