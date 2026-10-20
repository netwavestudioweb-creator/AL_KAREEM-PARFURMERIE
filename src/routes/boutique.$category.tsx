import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { SiteLayout } from "@/components/layout";
import { ShopListing } from "@/components/shop-listing";
import { fetchProducts, fetchCategories } from "@/lib/products";
import { CATEGORY_SEO } from "@/lib/category-seo";
import { OG_IMAGE_META, SITE_CONFIG, getCanonicalUrl } from "@/lib/site-config";

const KNOWN_CATEGORY_SLUGS = [
  "parfums",
  "huiles-concentrees",
  "senteurs-unisexe",
  "brumes-sprays-corporels",
  "deodorants",
  "coffrets-cadeaux",
];

export const Route = createFileRoute("/boutique/$category")({
  loader: async ({ params, context }) => {
    const categories = await context.queryClient.ensureQueryData({
      queryKey: ["categories"],
      queryFn: fetchCategories,
    });
    const exists =
      KNOWN_CATEGORY_SLUGS.includes(params.category) ||
      categories.some((c) => c.slug === params.category);
    if (!exists) {
      throw notFound();
    }

    await context.queryClient.ensureQueryData({
      queryKey: ["products"],
      queryFn: () => fetchProducts(),
    });
  },
  head: ({ params }) => {
    const readable = params.category
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    const seo = CATEGORY_SEO[params.category];
    const title = seo?.title ?? `${readable} à Cotonou — Al Kareem Parfumerie`;
    const desc =
      seo?.description ??
      `Découvrez notre collection de ${readable.toLowerCase()} à Cotonou, Bénin. Produits 100 % authentiques, paiement à la livraison.`;
    const url = getCanonicalUrl(`/boutique/${params.category}`);

    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:site_name", content: SITE_CONFIG.name },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        ...OG_IMAGE_META,
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        { name: "twitter:image", content: SITE_CONFIG.ogImageUrl },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useParams();
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => fetchProducts(),
  });

  const catObj = categories.find((c) => c.slug === category);
  const catName =
    catObj?.name ||
    category
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const { isPending } = useQuery({ queryKey: ["products"], queryFn: () => fetchProducts() });
  const filtered = useMemo(
    () => products.filter((p) => p.categorySlug === category),
    [products, category],
  );

  return (
    <SiteLayout>
      <ShopListing
        title={catName}
        subtitle="Livraison au Bénin et dans la sous-région"
        crumbs={[
          { label: "Accueil", to: "/" },
          { label: "Boutique", to: "/boutique" },
          { label: catName },
        ]}
        products={filtered}
        categories={categories}
        activeCategory={category}
        loading={isPending && products.length === 0}
      />
    </SiteLayout>
  );
}
