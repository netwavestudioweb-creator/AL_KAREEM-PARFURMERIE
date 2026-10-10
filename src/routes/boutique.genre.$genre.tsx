import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { SiteLayout } from "@/components/layout";
import { ShopListing } from "@/components/shop-listing";
import { matchesGenre, type Genre } from "@/lib/catalog";
import { fetchCategories, fetchProducts } from "@/lib/products";
import { SITE_CONFIG, getCanonicalUrl } from "@/lib/site-config";

const VALID_GENRES = ["femme", "homme", "unisexe"];

export const Route = createFileRoute("/boutique/genre/$genre")({
  loader: async ({ params, context }) => {
    const norm = params.genre.toLowerCase();
    if (!VALID_GENRES.includes(norm)) {
      throw notFound();
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
  head: ({ params }) => {
    const genreCapitalized =
      params.genre.charAt(0).toUpperCase() + params.genre.slice(1).toLowerCase();
    const title = `Parfums ${genreCapitalized} à Cotonou — Al Kareem Parfumerie`;
    const desc = `Sélection exclusive de parfums ${params.genre.toLowerCase()} à Cotonou, Bénin. Flacons 100% authentiques, conseils olfactifs et livraison rapide.`;
    const url = getCanonicalUrl(`/boutique/genre/${params.genre.toLowerCase()}`);

    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:site_name", content: SITE_CONFIG.name },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { property: "og:image", content: SITE_CONFIG.ogImageUrl },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        { name: "twitter:image", content: SITE_CONFIG.ogImageUrl },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: GenrePage,
});

function GenrePage() {
  const { genre } = Route.useParams();
  const normGenre = genre.toLowerCase() as Genre;
  const label = normGenre.charAt(0).toUpperCase() + normGenre.slice(1);

  const { data: products = [], isPending } = useQuery({
    queryKey: ["products"],
    queryFn: () => fetchProducts(),
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const genreProducts = useMemo(
    () => products.filter((p) => matchesGenre(p, normGenre)),
    [products, normGenre],
  );

  return (
    <SiteLayout>
      <ShopListing
        title={`Parfums ${label}`}
        subtitle={normGenre === "unisexe" ? "Pour elle comme pour lui" : `Sélection ${normGenre}`}
        crumbs={[{ label: "Accueil", to: "/" }, { label: "Boutique", to: "/boutique" }, { label }]}
        products={genreProducts}
        categories={categories}
        fixedGenre={normGenre}
        loading={isPending && products.length === 0}
      />
    </SiteLayout>
  );
}
