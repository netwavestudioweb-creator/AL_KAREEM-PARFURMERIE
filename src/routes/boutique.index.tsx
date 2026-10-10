import {
  createFileRoute,
  useNavigate,
  stripSearchParams,
  redirect,
  Link,
} from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/layout";
import { ShopListing } from "@/components/shop-listing";
import { fetchProducts, fetchCategories } from "@/lib/products";
import { useMemo } from "react";
import { SITE_CONFIG, getCanonicalUrl } from "@/lib/site-config";

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

const dropLegacyParams = ({
  search,
  next,
}: {
  search: Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  next: (s: any) => any;
}) => {
  const { max: _max, ...rest } = search as Record<string, unknown> & { max?: unknown };
  return next(rest);
};

export const Route = createFileRoute("/boutique/")({
  validateSearch: zodValidator(searchSchema),
  search: { middlewares: [dropLegacyParams, stripSearchParams(searchDefaults)] },
  head: () => ({
    meta: [
      { title: "Boutique de parfums à Cotonou — Femme, Homme, Huiles | Al Kareem" },
      {
        name: "description",
        content:
          "Parcourez notre catalogue complet d'exception : parfums femme, homme, unisexe, huiles concentrées, brumes et coffrets chez Al Kareem Parfumerie Cotonou.",
      },
      { property: "og:site_name", content: SITE_CONFIG.name },
      { property: "og:title", content: "Boutique de parfums à Cotonou — Al Kareem" },
      {
        property: "og:description",
        content: "Parfums d'exception, huiles et coffrets à Cotonou et au Bénin.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: getCanonicalUrl("/boutique") },
      { property: "og:image", content: SITE_CONFIG.ogImageUrl },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Boutique de parfums à Cotonou — Al Kareem" },
      { name: "twitter:image", content: SITE_CONFIG.ogImageUrl },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/boutique") }],
  }),
  loader: async ({ context, location }) => {
    const searchParams = new URLSearchParams(location.search);
    const legacyCategory = searchParams.get("category");
    const legacyGenre = searchParams.get("genre");

    if (legacyCategory) {
      throw redirect({
        to: "/boutique/$category",
        params: { category: legacyCategory },
        statusCode: 301,
      });
    }

    if (legacyGenre) {
      throw redirect({
        to: "/boutique/genre/$genre",
        params: { genre: legacyGenre },
        statusCode: 301,
      });
    }

    await Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: ["products"],
        queryFn: () => fetchProducts(),
      }),
      context.queryClient.ensureQueryData({
        queryKey: ["categories"],
        queryFn: fetchCategories,
      }),
    ]);
  },
  component: BoutiquePage,
});

function BoutiquePage() {
  const { q, promo, sort } = Route.useSearch();
  const navigate = useNavigate({ from: "/boutique/" });

  const { data: products = [], isPending } = useQuery({
    queryKey: ["products"],
    queryFn: () => fetchProducts(),
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const matching = useMemo(() => {
    if (!q) return products;
    const needle = normalize(q);
    return products.filter((p) =>
      normalize(`${p.name} ${p.category} ${p.description}`).includes(needle),
    );
  }, [products, q]);

  const setSearch = (upd: Record<string, unknown>) =>
    navigate({ search: (prev: Record<string, unknown>) => ({ ...prev, ...upd }), replace: true });

  return (
    <SiteLayout>
      <ShopListing
        title={q ? `Résultats pour « ${q} »` : promo ? "Offres du moment" : "Toute la boutique"}
        crumbs={[{ label: "Accueil", to: "/" }, { label: "Boutique" }]}
        products={matching}
        categories={categories}
        loading={isPending && products.length === 0}
        initialPromo={promo}
        initialSort={sort === "prix-asc" || sort === "prix-desc" ? sort : "nouveaute"}
        extraChip={
          q ? { label: `Recherche : ${q}`, onRemove: () => setSearch({ q: "" }) } : undefined
        }
        onSortChange={(s) => setSearch({ sort: s })}
        onPromoChange={(v) => setSearch({ promo: v })}
      />
    </SiteLayout>
  );
}

/** Recherche insensible à la casse et aux accents (« creme » trouve « Crème »). */
function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}
