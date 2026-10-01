import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/layout";
import { ProductCard } from "@/components/product-card";
import { fetchProducts } from "@/lib/products";
import { SITE_CONFIG, getCanonicalUrl } from "@/lib/site-config";

const VALID_GENRES = ["femme", "homme", "unisexe"];

export const Route = createFileRoute("/boutique/genre/$genre")({
  loader: async ({ params, context }) => {
    const norm = params.genre.toLowerCase();
    if (!VALID_GENRES.includes(norm)) {
      throw notFound();
    }

    await context.queryClient.ensureQueryData({
      queryKey: ["products"],
      queryFn: () => fetchProducts(),
    });
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
  const normGenre = genre.toLowerCase();
  const genreCapitalized = normGenre.charAt(0).toUpperCase() + normGenre.slice(1);

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => fetchProducts(),
  });

  const filtered = products.filter((p) => {
    const nameLower = p.name.toLowerCase();
    const descLower = p.description.toLowerCase();
    const catLower = p.category.toLowerCase();
    return (
      nameLower.includes(normGenre) || descLower.includes(normGenre) || catLower.includes(normGenre)
    );
  });

  return (
    <SiteLayout>
      <section className="bg-gradient-hero border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
            <Link to="/boutique" className="hover:underline">
              Boutique
            </Link>{" "}
            / Genre
          </div>
          <h1 className="font-serif text-3xl md:text-5xl text-primary-deep">
            Parfums {genreCapitalized} à Cotonou
          </h1>
          <p className="text-foreground/70 mt-2 max-w-xl text-sm sm:text-base">
            Découvrez nos essences et fragrances spécialement sélectionnées pour{" "}
            {normGenre === "femme"
              ? "femme"
              : normGenre === "homme"
                ? "homme"
                : "homme et femme (unisexe)"}
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-muted-foreground">
            {filtered.length} {filtered.length > 1 ? "parfums trouvés" : "parfum trouvé"}
          </div>
          <Link to="/boutique" className="text-xs font-semibold text-primary hover:underline">
            ← Voir tout le catalogue
          </Link>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground bg-secondary/30 rounded-2xl">
            Aucun parfum trouvé pour ce genre.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {filtered.map((p, idx) => (
              <ProductCard key={p.id} product={p} priority={idx < 6} />
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
