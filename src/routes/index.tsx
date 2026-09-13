import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/layout";
import { ProductCard } from "@/components/product-card";
import { ProductSkeleton } from "@/components/ProductSkeleton";
import { RotatingSelection, TrustSection } from "@/components/home-sections";
import { fetchProofs, fetchTestimonials } from "@/lib/vitrine";
import { fetchProducts, fetchCategories, whatsappLink } from "@/lib/products";
import {
  MessageCircle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import boutiqueImg from "@/assets/boutique.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Al Kareem Parfumerie — Parfums d'Exception à Cotonou, Bénin" },
      {
        name: "description",
        content:
          "Découvrez plus de 100 parfums, huiles concentrées, brumes et coffrets chez Al Kareem Parfumerie à Cotonou. Flacons 100% authentiques, commande en ligne et livraison express Bénin.",
      },
      { property: "og:title", content: "Al Kareem Parfumerie — Sublimez votre aura" },
      {
        property: "og:description",
        content: "L'amour se porte en parfum. Parfumerie d'exception à Cotonou, Bénin.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://al-kareem-parfurmerie.vercel.app/og-alkareem.jpg" },
      {
        name: "twitter:image",
        content: "https://al-kareem-parfurmerie.vercel.app/og-alkareem.jpg",
      },
    ],
    links: [
      { rel: "canonical", href: "/" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Store",
          name: "Al Kareem Parfumerie",
          description:
            "Parfumerie d'exception à Cotonou, Bénin. Plus de 100 références de parfums disponibles en boutique, commande via WhatsApp, paiement à la livraison ou Mobile Money.",
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
    void context.queryClient.prefetchQuery({ queryKey: ["products"], queryFn: fetchProducts });
    void context.queryClient.prefetchQuery({ queryKey: ["categories"], queryFn: fetchCategories });
    void context.queryClient.prefetchQuery({
      queryKey: ["authenticity-proofs"],
      queryFn: fetchProofs,
    });
    void context.queryClient.prefetchQuery({
      queryKey: ["testimonials"],
      queryFn: fetchTestimonials,
    });
  },
  component: HomePage,
});

function HomePage() {
  const {
    data: products = [],
    isLoading,
    isPending,
  } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const isQueryLoading = isLoading || isPending;
  const promos = products.filter((p) => p.promo).slice(0, 4);

  return (
    <SiteLayout hideFooter>
      {/* 1. HERO & VITRINE PRESTIGE : SUBLIMEZ VOTRE AURA & COUPS DE CŒUR */}
      <section className="relative overflow-hidden bg-gradient-hero border-b border-border/60 pt-8 sm:pt-14 pb-12 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Accroche Prestige */}
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 space-y-4">
            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-primary-deep leading-tight tracking-tight">
              Sublimez votre aura.
              <span className="block mt-1 sm:mt-2 font-serif italic text-xl sm:text-3xl md:text-4xl text-primary font-normal">
                L'amour se porte en parfum
              </span>
            </h1>

            <p className="text-xs sm:text-base text-foreground/80 max-w-xl mx-auto leading-relaxed font-normal">
              Explorez notre sélection de <strong>plus de 100 fragrances d'exception</strong> :
              grandes créations de maisons renommées, huiles pures et coffrets, disponibles
              immédiatement en boutique avec livraison rapide à Cotonou et au Bénin.
            </p>

            {/* Indicateurs de rassurance prestigieux */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-gold/30 text-xs font-medium text-primary-deep shadow-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                <span>Flacons 100% Authentiques</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-gold/30 text-xs font-medium text-primary-deep shadow-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                <span>Paiement à la réception</span>
              </div>
            </div>
          </div>

          {/* 2. LE CARROUSEL DES COUPS DE CŒUR DE LA BOUTIQUE */}
          <RotatingSelection products={products} categories={categories} />
        </div>
      </section>

      {/* 5. BONS PLANS & OFFRES SPÉCIALES DE LA BOUTIQUE */}
      {isQueryLoading ? (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24 border-t border-border">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 md:mb-12">
            <div>
              <div className="text-xs uppercase tracking-widest text-gold font-semibold mb-2">
                Opportunités du Moment
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-primary-deep">
                Offres Spéciales en Boutique
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Chargement des offres du moment…
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        </section>
      ) : promos.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24 border-t border-border">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 md:mb-12">
            <div>
              <div className="text-xs uppercase tracking-widest text-gold font-semibold mb-2">
                Opportunités du Moment
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-primary-deep">
                Offres Spéciales en Boutique
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Profitez de tarifs réduits sur une sélection de nos parfums réputés.
              </p>
            </div>
            <Link
              to="/boutique"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-deep"
            >
              <span>Toutes les promotions</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {promos.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      {/* 6. HISTOIRE & STORYTELLING : UNE MAISON NÉE À COTONOU */}
      <section className="bg-secondary/70 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid gap-10 md:grid-cols-2 items-center">
          <div className="relative group">
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-gold/30 to-primary/20 blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />
            <img
              src={boutiqueImg}
              alt="Intérieur de la boutique Al Kareem Parfumerie à Cotonou"
              width={1200}
              height={800}
              loading="lazy"
              className="relative rounded-3xl shadow-elegant object-cover w-full aspect-[4/3] border border-white/80"
            />
          </div>
          <div className="space-y-5">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-primary-deep leading-tight">
              Une Maison de Parfum Née à Cotonou
            </h2>
            <p className="text-foreground/80 leading-relaxed text-sm sm:text-base">
              Al Kareem Parfumerie, c'est une sélection soignée de plus de 100 parfums,
              huiles, brumes et coffrets pour révéler la personnalité de chacun(e).
            </p>
            <p className="text-foreground/80 leading-relaxed text-sm sm:text-base">
              Notre engagement : le conseil personnalisé, la qualité certifiée, et l'attention
              portée à chaque client(e).
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/boutique"
                className="inline-flex items-center gap-2 rounded-full bg-primary-deep text-primary-foreground px-6 py-3.5 text-sm font-semibold hover:bg-primary transition-all shadow-md hover:scale-105"
              >
                <span>Visiter la boutique en ligne</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/a-propos"
                className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-white text-primary-deep px-6 py-3.5 text-sm font-medium hover:bg-primary hover:text-white transition-colors"
              >
                <span>Notre histoire</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SECTION DE CONFIANCE, PREUVES D'AUTHENTICITÉ & AVIS */}
      <TrustSection />

      {/* 8. BANDEAU DE CONVERSION FINAL : INCITATION FORTE AVANT LE FOOTER */}
      <section className="bg-gradient-primary text-primary-foreground py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(229,184,66,0.15),transparent_70%)] pointer-events-none" />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold border border-gold/30">
            <Sparkles className="h-3.5 w-3.5" /> Votre Signature Olfactive Vous Attend
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white tracking-tight">
            Prêt(e) à révéler votre présence en parfum ?
          </h2>
          <p className="text-base sm:text-lg text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed">
            Parcourez dès aujourd'hui notre collection complète de plus de 100 parfums d'exception.
            Commandez en toute simplicité et recevez votre flacon chez vous à Cotonou avec paiement
            à la livraison.
          </p>
          <div className="pt-3 flex flex-wrap justify-center gap-4">
            <Link
              to="/boutique"
              className="inline-flex items-center gap-2 rounded-full bg-white text-primary-deep px-8 py-4 text-base font-bold hover:bg-accent transition-all shadow-xl hover:scale-105 active:scale-95"
            >
              <span>Accéder à la boutique maintenant</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={whatsappLink("Bonjour Al Kareem, je souhaite passer commande sur WhatsApp 🌸")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-whatsapp text-whatsapp-foreground px-7 py-4 text-base font-semibold hover:opacity-90 transition-all shadow-lg hover:scale-105 active:scale-95"
            >
              <MessageCircle className="h-5 w-5" />
              <span>Commander sur WhatsApp</span>
            </a>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
