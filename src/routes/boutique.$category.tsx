import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/layout";
import { ProductCard } from "@/components/product-card";
import { fetchProducts, fetchCategories } from "@/lib/products";
import { SITE_CONFIG, getCanonicalUrl } from "@/lib/site-config";

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
    const title = `${readable} à Cotonou — Al Kareem Parfumerie`;
    const desc = `Découvrez notre collection d'exception de ${readable.toLowerCase()} à Cotonou, Bénin. Produits 100% authentiques et livraison rapide.`;
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
        { property: "og:image", content: SITE_CONFIG.ogImageUrl },
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

  const filtered = products.filter((p) => p.categorySlug === category);

  return (
    <SiteLayout>
      <section className="bg-gradient-hero border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
            <Link to="/boutique" className="hover:underline">
              Boutique
            </Link>{" "}
            / Catégorie
          </div>
          <h1 className="font-serif text-3xl md:text-5xl text-primary-deep">{catName} à Cotonou</h1>
          <p className="text-foreground/70 mt-2 max-w-xl text-sm sm:text-base">
            Collection exclusive de {catName.toLowerCase()} disponibles en boutique à Cotonou et en
            livraison dans tout le Bénin.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-muted-foreground">
            {filtered.length} {filtered.length > 1 ? "produits disponibles" : "produit disponible"}
          </div>
          <Link to="/boutique" className="text-xs font-semibold text-primary hover:underline">
            ← Voir tout le catalogue
          </Link>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground bg-secondary/30 rounded-2xl">
            Aucun produit actuellement disponible dans la catégorie {catName}.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
