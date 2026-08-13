import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/layout";
import { ProductCard } from "@/components/product-card";
import { RotatingSelection, TrustSection } from "@/components/home-sections";
import { fetchProofs, fetchTestimonials } from "@/lib/vitrine";
import { fetchProducts, fetchCategories, whatsappLink } from "@/lib/products";
import { Truck, Smartphone, MessageCircle, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import hero from "@/assets/hero-perfumes.jpg";
import boutiqueImg from "@/assets/boutique.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Al Kareem Parfumerie — Parfums à Cotonou, Bénin" },
      { name: "description", content: "Découvrez la parfumerie Al Kareem : parfums, déodorants, huiles concentrées, brumes et coffrets. Livraison Cotonou, paiement Mobile Money." },
      { property: "og:title", content: "Al Kareem Parfumerie — Sublimez votre aura" },
      { property: "og:description", content: "L'amour se porte en parfum. Parfumerie d'exception à Cotonou." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "/og-alkareem.jpg" },
      { name: "twitter:image", content: "/og-alkareem.jpg" },
    ],
    links: [
      { rel: "canonical", href: "/" },
      { rel: "preload", as: "image", href: hero, fetchPriority: "high" } as unknown as { rel: string; href: string },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Store",
          name: "Al Kareem Parfumerie",
          description: "Parfumerie à Cotonou, Bénin. Commande via WhatsApp, paiement à la livraison ou Mobile Money.",
          url: "https://alkareem-parfumerie.bj/",
          telephone: "+2290161888987",
          currenciesAccepted: "XOF",
          paymentAccepted: "Espèces, MTN MoMo, Moov Money",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Cotonou",
            addressCountry: "BJ",
          },
          areaServed: "Bénin",
          sameAs: ["https://instagram.com/khadisidibehassan"],
        }),
      },
    ],
  }),
  loader: ({ context }) => {
    // Amorce le cache pour que la boutique/le produit ne re-fetchent pas.
    void context.queryClient.prefetchQuery({ queryKey: ["products"], queryFn: fetchProducts });
    void context.queryClient.prefetchQuery({ queryKey: ["categories"], queryFn: fetchCategories });
    void context.queryClient.prefetchQuery({ queryKey: ["authenticity-proofs"], queryFn: fetchProofs });
    void context.queryClient.prefetchQuery({ queryKey: ["testimonials"], queryFn: fetchTestimonials });
  },
  component: HomePage,
});

function HomePage() {
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  const promos = products.filter((p) => p.promo).slice(0, 4);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-24 grid gap-10 md:grid-cols-2 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-xs uppercase tracking-widest text-primary-deep">
              <Sparkles className="h-3.5 w-3.5" /> Parfumerie · Cotonou, Bénin
            </div>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-primary-deep leading-[1.05]">
              Sublimez<br />votre aura
            </h1>
            <p className="text-lg text-foreground/70 max-w-md leading-relaxed">
              L'amour se porte en parfum. Une collection soigneusement choisie de fragrances d'exception, à porter et à offrir.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/boutique"
                className="inline-flex items-center gap-2 rounded-full bg-primary-deep text-primary-foreground px-7 py-3.5 text-sm font-medium hover:bg-primary transition-colors shadow-elegant"
              >
                Découvrir la boutique <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={whatsappLink("Bonjour Al Kareem, je souhaite un conseil parfum 🌸")}
                target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-whatsapp text-whatsapp-foreground px-7 py-3.5 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <MessageCircle className="h-4 w-4" /> Commander sur WhatsApp
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-white/40 rounded-3xl blur-2xl" />
            <img
              src={hero}
              alt="Sélection de parfums Al Kareem"
              width={1600} height={1000}
              fetchPriority="high"
              decoding="async"
              className="relative rounded-3xl shadow-elegant object-cover w-full aspect-[4/3]"
            />
          </div>
        </div>
      </section>

      {/* REASSURANCE */}
      <section className="border-y border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: MessageCircle, title: "Commande facile via WhatsApp", desc: "Écrivez-nous, on confirme tout ensemble" },
            { icon: Smartphone, title: "Paiement à la livraison", desc: "En espèces, MTN MoMo ou Moov Money" },
            { icon: Truck, title: "Livraison rapide", desc: "Cotonou · Abomey-Calavi · tout le Bénin" },
            { icon: ShieldCheck, title: "Produits authentiques", desc: "Sélection contrôlée en boutique" },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-full bg-accent flex items-center justify-center text-primary-deep shrink-0">
                <f.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium text-sm">{f.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <TrustSection />

      {/* CATEGORIES */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="text-xs uppercase tracking-widest text-primary mb-2">Nos univers</div>
              <h2 className="font-serif text-3xl md:text-4xl text-primary-deep">Explorer par catégorie</h2>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.slice(0, 8).map((c) => (
              <Link
                key={c.id}
                to="/boutique"
                search={{ category: c.slug }}
                className="group relative rounded-2xl overflow-hidden bg-gradient-primary text-primary-foreground aspect-[4/5] p-5 sm:p-6 flex flex-col justify-end hover:shadow-elegant transition-shadow"
              >
                {c.image_url ? (
                  <>
                    <img
                      src={c.image_url}
                      alt={c.name}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-deep/85 via-primary-deep/30 to-transparent" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_60%)]" />
                )}
                <div className="relative">
                  <div className="font-serif text-xl sm:text-2xl md:text-3xl">{c.name}</div>
                  <div className="mt-3 sm:mt-4 inline-flex items-center gap-1 text-xs uppercase tracking-wider opacity-90 group-hover:translate-x-1 transition-transform">
                    Voir <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>

            ))}
          </div>
        </section>
      )}

      <RotatingSelection products={products} categories={categories} />

      {/* ABOUT PREVIEW */}
      <section className="bg-secondary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid gap-10 md:grid-cols-2 items-center">
          <img src={boutiqueImg} alt="Boutique Al Kareem" width={1200} height={800} loading="lazy" className="rounded-3xl shadow-elegant object-cover w-full aspect-[4/3]" />
          <div>
            <div className="text-xs uppercase tracking-widest text-primary mb-2">À propos</div>
            <h2 className="font-serif text-3xl md:text-4xl text-primary-deep mb-5">Une maison de parfum née à Cotonou</h2>
            <p className="text-foreground/75 leading-relaxed mb-4">
              Al Kareem Parfumerie, c'est une sélection soignée de parfums, huiles, brumes et coffrets, pour révéler la personnalité de chacun(e).
            </p>
            <p className="text-foreground/75 leading-relaxed mb-6">
              Notre engagement : le conseil personnalisé, la qualité, et l'attention portée à chaque client(e) comme s'il ou elle était unique. Parce qu'il ou elle l'est.
            </p>
            <Link to="/a-propos" className="inline-flex items-center gap-2 rounded-full border border-primary text-primary-deep px-6 py-3 text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors">
              Notre histoire <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* PROMOS */}
      {promos.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="text-xs uppercase tracking-widest text-primary mb-2">Bons plans</div>
              <h2 className="font-serif text-3xl md:text-4xl text-primary-deep">En promotion</h2>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {promos.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
