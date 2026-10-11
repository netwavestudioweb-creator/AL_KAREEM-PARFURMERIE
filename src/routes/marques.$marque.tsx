import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { SiteLayout } from "@/components/layout";
import { ShopListing } from "@/components/shop-listing";
import { fetchCategories, fetchProducts } from "@/lib/products";
import { findBrand, matchesBrand } from "@/lib/brands";
import { jsonLd } from "@/lib/json-ld";
import { OG_IMAGE_META, SITE_CONFIG, getCanonicalUrl } from "@/lib/site-config";

export const Route = createFileRoute("/marques/$marque")({
  loader: async ({ params, context }) => {
    const brand = findBrand(params.marque);
    if (!brand) throw notFound();
    await Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: ["products"],
        queryFn: () => fetchProducts(),
      }),
      context.queryClient.ensureQueryData({ queryKey: ["categories"], queryFn: fetchCategories }),
    ]);
    return { name: brand.name, intro: brand.intro };
  },
  head: ({ params, loaderData }) => {
    const name = loaderData?.name ?? params.marque;
    const title = `Parfums ${name} à Cotonou — ${SITE_CONFIG.name}`;
    const desc =
      `${loaderData?.intro ?? ""} Paiement à la livraison, livraison au Bénin et dans la sous-région.`.trim();
    const url = getCanonicalUrl(`/marques/${params.marque}`);
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
        { name: "twitter:image", content: SITE_CONFIG.ogImageUrl },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: jsonLd({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_CONFIG.url },
              {
                "@type": "ListItem",
                position: 2,
                name: "Boutique",
                item: `${SITE_CONFIG.url}/boutique`,
              },
              { "@type": "ListItem", position: 3, name: `Parfums ${name}`, item: url },
            ],
          }),
        },
      ],
    };
  },
  component: BrandPage,
});

function BrandPage() {
  const { marque } = Route.useParams();
  const brand = findBrand(marque)!;
  const { data: products = [], isPending } = useQuery({
    queryKey: ["products"],
    queryFn: () => fetchProducts(),
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
  const brandProducts = useMemo(
    () => products.filter((p) => matchesBrand(p, brand)),
    [products, brand],
  );

  return (
    <SiteLayout>
      <ShopListing
        title={`Parfums ${brand.name} à Cotonou`}
        subtitle={brand.intro}
        crumbs={[
          { label: "Accueil", to: "/" },
          { label: "Boutique", to: "/boutique" },
          { label: brand.name },
        ]}
        products={brandProducts}
        categories={categories}
        loading={isPending && products.length === 0}
      />
    </SiteLayout>
  );
}
