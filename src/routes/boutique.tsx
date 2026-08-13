import { createFileRoute, useNavigate, stripSearchParams } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/layout";
import { ProductCard } from "@/components/product-card";
import { fetchProducts, fetchCategories } from "@/lib/products";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const searchDefaults = {
  q: "",
  category: "",
  promo: false,
  sort: "nouveaute",
};

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  category: fallback(z.string(), "").default(""),
  promo: fallback(z.boolean(), false).default(false),
  sort: fallback(z.string(), "nouveaute").default("nouveaute"),
});

/** Supprime les paramètres hérités (ex: `max`, ancien filtre prix supprimé). */
const dropLegacyParams = ({ search, next }: { search: Record<string, unknown>; next: (s: Record<string, unknown>) => Record<string, unknown> }) => {
  const { max: _max, ...rest } = search as Record<string, unknown> & { max?: unknown };
  return next(rest);
};




export const Route = createFileRoute("/boutique")({
  validateSearch: zodValidator(searchSchema),
  search: { middlewares: [dropLegacyParams, stripSearchParams(searchDefaults)] },
  head: () => ({
    meta: [
      { title: "Boutique — Al Kareem Parfumerie" },
      { name: "description", content: "Parcourez notre catalogue : parfums, déodorants, huiles concentrées, brumes, diffuseurs et coffrets." },
      { property: "og:title", content: "Boutique — Al Kareem Parfumerie" },
      { property: "og:description", content: "Notre catalogue complet à découvrir." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/boutique" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "/og-alkareem.jpg" },
      { name: "twitter:image", content: "/og-alkareem.jpg" },
    ],
    links: [{ rel: "canonical", href: "/boutique" }],
  }),
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery({ queryKey: ["products"], queryFn: fetchProducts });
    void context.queryClient.prefetchQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  },
  component: BoutiquePage,
});

const PAGE_SIZE = 24;

function BoutiquePage() {
  const { q, category, promo, sort } = Route.useSearch();
  const navigate = useNavigate({ from: "/boutique" });

  const { data: products = [], isLoading } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  const filtered = useMemo(() => {
    let out = products.slice();
    if (category) out = out.filter((p) => p.categorySlug === category);
    if (promo) out = out.filter((p) => p.promo);
    if (q) {
      const s = q.toLowerCase();
      out = out.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          p.category.toLowerCase().includes(s) ||
          p.description.toLowerCase().includes(s),
      );
    }
    if (sort === "prix-asc") out.sort((a, b) => a.price - b.price);
    else if (sort === "prix-desc") out.sort((a, b) => b.price - a.price);
    else if (sort === "nouveaute") out.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return out;
  }, [products, q, category, promo, sort]);

  // Chargement progressif : n'afficher que PAGE_SIZE produits au départ,
  // puis étendre au clic. Le compteur est réinitialisé quand les filtres
  // changent.
  const [visible, setVisible] = useState(PAGE_SIZE);
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [q, category, promo, sort]);
  const visibleProducts = filtered.slice(0, visible);
  const hasMore = filtered.length > visible;

  const setSearch = (upd: Record<string, unknown>) =>
    navigate({ search: (prev: Record<string, unknown>) => ({ ...prev, ...upd }) });

  return (
    <SiteLayout>
      <section className="bg-gradient-hero border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <h1 className="font-serif text-4xl md:text-5xl text-primary-deep">Notre boutique</h1>
          <p className="text-foreground/70 mt-2 max-w-xl">
            Trouvez la fragrance qui vous ressemble.
          </p>
          <div className="mt-6 relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setSearch({ q: e.target.value })}
              placeholder="Rechercher un parfum, une catégorie…"
              className="w-full h-12 rounded-full bg-white border border-border pl-11 pr-11 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {q && (
              <button onClick={() => setSearch({ q: "" })} className="absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full hover:bg-secondary flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="space-y-6">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Catégorie</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSearch({ category: "" })}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    !category ? "bg-primary-deep text-primary-foreground border-primary-deep" : "bg-white border-border hover:border-primary"
                  }`}
                >
                  Toutes
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSearch({ category: c.slug })}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      category === c.slug
                        ? "bg-primary-deep text-primary-foreground border-primary-deep"
                        : "bg-white border-border hover:border-primary"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={promo}
                  onChange={(e) => setSearch({ promo: e.target.checked })}
                  className="h-4 w-4 rounded border-border text-primary"
                />
                Uniquement en promotion
              </label>
            </div>
          </aside>

          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-muted-foreground">
                {isLoading ? "Chargement…" : `${filtered.length} ${filtered.length > 1 ? "produits" : "produit"}`}
              </div>
              <select
                value={sort}
                onChange={(e) => setSearch({ sort: e.target.value })}
                className="h-10 rounded-full border border-border bg-white px-4 text-sm outline-none focus:border-primary"
              >
                <option value="nouveaute">Nouveauté</option>
                <option value="prix-asc">Prix croissant</option>
                <option value="prix-desc">Prix décroissant</option>
              </select>
            </div>
            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-3">
                    <div className="aspect-square w-full rounded-2xl bg-muted/40 animate-pulse" />
                    <div className="h-3 w-1/3 rounded-full bg-muted/40 animate-pulse" />
                    <div className="h-5 w-3/4 rounded-full bg-muted/40 animate-pulse" />
                    <div className="h-4 w-1/4 rounded-full bg-muted/40 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                Aucun produit ne correspond à votre recherche.
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleProducts.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
                {hasMore && (
                  <div className="mt-10 flex justify-center">
                    <button
                      onClick={() => setVisible((v) => v + PAGE_SIZE)}
                      className="inline-flex items-center gap-2 rounded-full border border-primary text-primary-deep px-6 py-3 text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      Voir plus ({filtered.length - visible} restants)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
