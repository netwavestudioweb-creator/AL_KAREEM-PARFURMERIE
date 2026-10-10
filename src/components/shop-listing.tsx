import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { SlidersHorizontal, X } from "lucide-react";
import { matchesGenre, type Category, type Genre, type Product } from "@/lib/catalog";
import { ProductCard } from "./product-card";
import { ProductSkeleton } from "./ProductSkeleton";
import { GENRES } from "./site-header";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";

const PAGE_SIZE = 24;

type Sort = "nouveaute" | "prix-asc" | "prix-desc";

const SORTS: { value: Sort; label: string }[] = [
  { value: "nouveaute", label: "Nouveautés" },
  { value: "prix-asc", label: "Prix croissant" },
  { value: "prix-desc", label: "Prix décroissant" },
];

export interface ShopListingProps {
  title: string;
  subtitle?: string;
  /** Fil d'Ariane : le dernier élément est la page courante. */
  crumbs: { label: string; to?: "/" | "/boutique" }[];
  /** Produits déjà restreints à la page (catégorie, genre, recherche…). */
  products: Product[];
  categories: Category[];
  activeCategory?: string;
  /** Sur une page genre, le filtre « Pour qui » devient une navigation. */
  fixedGenre?: Genre;
  loading?: boolean;
  initialPromo?: boolean;
  initialSort?: Sort;
  /** Puce supplémentaire affichée dans les filtres actifs (ex. la recherche). */
  extraChip?: { label: string; onRemove: () => void };
  onSortChange?: (sort: Sort) => void;
  onPromoChange?: (promo: boolean) => void;
}

export function ShopListing({
  title,
  subtitle,
  crumbs,
  products,
  categories,
  activeCategory,
  fixedGenre,
  loading,
  initialPromo = false,
  initialSort = "nouveaute",
  extraChip,
  onSortChange,
  onPromoChange,
}: ShopListingProps) {
  const [genres, setGenres] = useState<Set<Genre>>(new Set());
  const [inStockOnly, setInStockOnly] = useState(false);
  const [promoOnly, setPromoOnly] = useState(initialPromo);
  const [sort, setSort] = useState<Sort>(initialSort);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => setPromoOnly(initialPromo), [initialPromo]);
  useEffect(() => setSort(initialSort), [initialSort]);

  const filtered = useMemo(() => {
    let out = products;
    if (genres.size > 0) out = out.filter((p) => [...genres].some((g) => matchesGenre(p, g)));
    if (inStockOnly) out = out.filter((p) => p.inStock);
    if (promoOnly) out = out.filter((p) => p.promo);
    out = out.slice();
    if (sort === "prix-asc") out.sort((a, b) => a.price - b.price);
    else if (sort === "prix-desc") out.sort((a, b) => b.price - a.price);
    else out.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    // Les produits épuisés restent visibles mais passent en fin de liste.
    out.sort((a, b) => Number(b.inStock) - Number(a.inStock));
    return out;
  }, [products, genres, inStockOnly, promoOnly, sort]);

  useEffect(() => setVisible(PAGE_SIZE), [products, genres, inStockOnly, promoOnly, sort]);
  // Changement de page (catégorie, genre, recherche) : on referme le panneau de filtres mobile.
  useEffect(() => setFiltersOpen(false), [products]);

  const shown = filtered.slice(0, visible);
  const activeCount = genres.size + Number(inStockOnly) + Number(promoOnly);

  const toggleGenre = (g: Genre) =>
    setGenres((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next;
    });
  const changeSort = (s: Sort) => {
    setSort(s);
    onSortChange?.(s);
  };
  const changePromo = (v: boolean) => {
    setPromoOnly(v);
    onPromoChange?.(v);
  };
  const clearAll = () => {
    setGenres(new Set());
    setInStockOnly(false);
    changePromo(false);
    extraChip?.onRemove();
  };

  const filters = (
    <FilterPanel
      products={products}
      categories={categories}
      activeCategory={activeCategory}
      fixedGenre={fixedGenre}
      genres={genres}
      toggleGenre={toggleGenre}
      inStockOnly={inStockOnly}
      setInStockOnly={setInStockOnly}
      promoOnly={promoOnly}
      setPromoOnly={changePromo}
    />
  );

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 pb-16 pt-4 lg:px-8 lg:pt-6">
      <nav
        aria-label="Fil d'Ariane"
        className="flex flex-wrap gap-2 text-[13px] text-muted-foreground"
      >
        {crumbs.map((c, i) => (
          <span key={c.label} className="flex items-center gap-2">
            {c.to ? (
              <Link to={c.to} className="hover:text-primary">
                {c.label}
              </Link>
            ) : (
              <span className="text-foreground" aria-current="page">
                {c.label}
              </span>
            )}
            {i < crumbs.length - 1 && <span aria-hidden>/</span>}
          </span>
        ))}
      </nav>

      <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-serif text-[34px] font-medium leading-none text-primary-deep lg:text-5xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {loading
              ? "Chargement des parfums…"
              : `${filtered.length} ${filtered.length > 1 ? "produits" : "produit"}${subtitle ? ` · ${subtitle}` : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-input bg-card px-4 text-sm font-semibold lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtres{activeCount > 0 ? ` (${activeCount})` : ""}
          </button>
          <label className="flex flex-1 items-center gap-2.5 text-[13.5px] lg:flex-none">
            <span className="hidden text-muted-foreground lg:inline">Trier par</span>
            <select
              value={sort}
              onChange={(e) => changeSort(e.target.value as Sort)}
              aria-label="Trier les produits"
              className="h-11 w-full rounded-full border border-input bg-card px-4 text-sm outline-none focus:border-primary lg:w-auto lg:rounded-[10px]"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {(activeCount > 0 || extraChip) && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {extraChip && <Chip onRemove={extraChip.onRemove}>{extraChip.label}</Chip>}
          {[...genres].map((g) => (
            <Chip key={g} onRemove={() => toggleGenre(g)}>
              {GENRES.find((x) => x.genre === g)?.label}
            </Chip>
          ))}
          {inStockOnly && <Chip onRemove={() => setInStockOnly(false)}>En stock</Chip>}
          {promoOnly && <Chip onRemove={() => changePromo(false)}>En promotion</Chip>}
          <button
            type="button"
            onClick={clearAll}
            className="ml-1 text-[13px] font-semibold text-primary-deep hover:text-primary"
          >
            Tout effacer
          </button>
        </div>
      )}

      <div className="mt-6 grid gap-10 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside aria-label="Filtres" className="hidden lg:block">
          {filters}
        </aside>

        <section aria-label="Produits">
          {loading ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 xl:grid-cols-4 lg:gap-x-6 lg:gap-y-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
              <p className="font-serif text-2xl text-primary-deep">Aucun parfum ne correspond.</p>
              <p className="mt-2 text-sm text-muted-foreground">Essayez d'enlever un filtre.</p>
              {(activeCount > 0 || extraChip) && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="mt-5 rounded-full bg-primary-deep px-6 py-3 text-sm font-semibold text-primary-foreground"
                >
                  Effacer les filtres
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 xl:grid-cols-4 lg:gap-x-6 lg:gap-y-8">
                {shown.map((p, i) => (
                  <ProductCard key={p.id} product={p} priority={i < 4} />
                ))}
              </div>
              {filtered.length > PAGE_SIZE && (
                <div className="mt-12 flex flex-col items-center gap-3">
                  <span className="text-[13px] text-muted-foreground">
                    Vous avez vu {shown.length} produits sur {filtered.length}
                  </span>
                  <span
                    className="relative block h-[3px] w-60 overflow-hidden rounded-full bg-border"
                    aria-hidden
                  >
                    <span
                      className="absolute inset-y-0 left-0 block bg-primary"
                      style={{ width: `${(shown.length / filtered.length) * 100}%` }}
                    />
                  </span>
                  {shown.length < filtered.length && (
                    <button
                      type="button"
                      onClick={() => setVisible((v) => v + PAGE_SIZE)}
                      className="mt-1.5 h-12 rounded-full border border-primary-deep px-8 text-sm font-semibold text-primary-deep hover:bg-primary-deep hover:text-primary-foreground"
                    >
                      Afficher plus de produits
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="bottom" className="flex max-h-[85dvh] flex-col gap-0 rounded-t-3xl p-0">
          <div className="border-b border-border px-5 py-4">
            <SheetTitle className="font-serif text-2xl font-normal text-primary-deep">
              Filtres
            </SheetTitle>
            <SheetDescription className="sr-only">Affiner la liste des produits</SheetDescription>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4">{filters}</div>
          <div className="flex gap-3 border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
            <button
              type="button"
              onClick={clearAll}
              className="h-12 rounded-full border border-input px-5 text-sm font-semibold"
            >
              Effacer
            </button>
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="h-12 flex-1 rounded-full bg-primary-deep text-sm font-semibold text-primary-foreground"
            >
              Voir {filtered.length} produit{filtered.length > 1 ? "s" : ""}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Chip({ children, onRemove }: { children: ReactNode; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-[13px] font-medium text-primary-deep hover:bg-accent/70"
    >
      {children}
      <X className="h-3.5 w-3.5" aria-label="Retirer" />
    </button>
  );
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3 border-b border-border pb-6 pt-1 last:border-0">
      <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.16em]">{title}</legend>
      {children}
    </fieldset>
  );
}

function CheckRow({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-2.5 text-sm">
      <span className="flex items-center gap-2.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-[18px] w-[18px] accent-[var(--color-primary)]"
        />
        {label}
      </span>
      {count !== undefined && <span className="text-[12.5px] text-muted-foreground">{count}</span>}
    </label>
  );
}

const NAV_ROW =
  "flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:text-primary";

function FilterPanel(props: {
  products: Product[];
  categories: Category[];
  activeCategory?: string;
  fixedGenre?: Genre;
  genres: Set<Genre>;
  toggleGenre: (g: Genre) => void;
  inStockOnly: boolean;
  setInStockOnly: (v: boolean) => void;
  promoOnly: boolean;
  setPromoOnly: (v: boolean) => void;
}) {
  const { products, categories, activeCategory, fixedGenre } = props;
  const promoCount = products.filter((p) => p.promo).length;

  return (
    <div className="flex flex-col gap-6">
      <FilterGroup title="Pour qui">
        {fixedGenre
          ? GENRES.map((g) => (
              <Link
                key={g.genre}
                to="/boutique/genre/$genre"
                params={{ genre: g.genre }}
                className={`${NAV_ROW} ${g.genre === fixedGenre ? "bg-accent font-semibold text-primary-deep" : ""}`}
              >
                {g.label}
              </Link>
            ))
          : GENRES.map((g) => (
              <CheckRow
                key={g.genre}
                label={g.label}
                count={products.filter((p) => matchesGenre(p, g.genre)).length}
                checked={props.genres.has(g.genre)}
                onChange={() => props.toggleGenre(g.genre)}
              />
            ))}
      </FilterGroup>

      <FilterGroup title="Univers">
        <Link
          to="/boutique"
          className={`${NAV_ROW} ${!activeCategory && !fixedGenre ? "bg-accent font-semibold text-primary-deep" : ""}`}
        >
          Toute la boutique
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            to="/boutique/$category"
            params={{ category: c.slug }}
            className={`${NAV_ROW} ${c.slug === activeCategory ? "bg-accent font-semibold text-primary-deep" : ""}`}
          >
            {c.name}
          </Link>
        ))}
      </FilterGroup>

      <FilterGroup title="Disponibilité">
        <CheckRow
          label="En stock uniquement"
          checked={props.inStockOnly}
          onChange={props.setInStockOnly}
        />
        <CheckRow
          label="En promotion"
          count={promoCount}
          checked={props.promoOnly}
          onChange={props.setPromoOnly}
        />
      </FilterGroup>
    </div>
  );
}
