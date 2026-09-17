import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/layout";
import {
  RotatingSelection,
  ScentFinderSection,
  CategoryShowcaseSection,
  TrustSection,
} from "@/components/home-sections";
import { fetchProofs, fetchTestimonials } from "@/lib/vitrine";
import { fetchProducts, fetchCategories } from "@/lib/products";
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Award,
} from "lucide-react";
import boutiqueImg from "@/assets/boutique.jpg";
import womanHeroImg from "@/assets/perfume-woman-hero.jpg";

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
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  return (
    <SiteLayout hideFooter>
      {/* 1. HERO PRESTIGE DOUBLE COLONNE : VISUEL ÉCLATANT SANS MASQUE ET TEXTE ÉLÉGANT */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-deep via-[#3A1657] to-primary-deep text-white border-b border-border/60 py-12 sm:py-16 md:py-20">
        {/* Cercles de lumière dorée & violette subtiles */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/15 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/20 blur-3xl rounded-full pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
            
            {/* Colonne Gauche : Accroche & Boutons d'accès direct */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-gold/40 text-xs font-semibold uppercase tracking-widest text-gold shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-gold" />
                <span>Parfumerie d'Exception à Cotonou</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white leading-tight tracking-tight font-medium">
                Sublimez votre aura.
                <span className="block mt-2 font-serif italic text-2xl sm:text-4xl text-gold font-normal">
                  L'amour se porte en parfum
                </span>
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-xl leading-relaxed font-light">
                Laissez votre sillage révéler l'élégance qui est en vous. Explorez notre sélection de 
                <strong className="text-gold font-semibold"> plus de 100 fragrances d'exception</strong>, 
                huiles pures concentrées et coffrets de prestige disponibles à Cotonou.
              </p>

              {/* Bouton CTA */}
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/boutique"
                  className="inline-flex items-center gap-2 rounded-full bg-gold text-primary-deep px-8 py-4 text-sm sm:text-base font-bold hover:bg-white transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>Accéder à la boutique</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Badges de confiance */}
              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-white/15">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-xs font-medium text-white">
                  <CheckCircle2 className="h-3.5 w-3.5 text-gold" />
                  <span>Flacons 100% Authentiques</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-xs font-medium text-white">
                  <ShieldCheck className="h-3.5 w-3.5 text-gold" />
                  <span>Paiement MoMo / Espèces</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-xs font-medium text-white">
                  <Award className="h-3.5 w-3.5 text-gold" />
                  <span>Conseil Olfactif Privé</span>
                </div>
              </div>
            </div>

            {/* Colonne Droite : Image de la Femme se parfumant 100% Nette et Lumineuse */}
            <div className="lg:col-span-5 relative group">
              {/* Cadre de prestige avec lueur dorée */}
              <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-tr from-gold via-primary-soft to-gold opacity-75 blur-md group-hover:opacity-100 transition-opacity" />
              
              <div className="relative overflow-hidden rounded-3xl border-2 border-gold/50 shadow-2xl bg-black">
                <img
                  src={womanHeroImg}
                  alt="Femme élégante se parfumant — Al Kareem Parfumerie"
                  width={800}
                  height={1000}
                  priority="true"
                  className="w-full h-auto max-h-[520px] object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Petit bandeau subtil en bas de la photo */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 sm:p-5 flex items-center justify-between text-white">
                  <span className="text-xs uppercase tracking-widest text-gold font-semibold">
                    Signature Al Kareem
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-white/90">
                    <Sparkles className="h-3.5 w-3.5 text-gold" /> L'Art du Parfum
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. CARROUSEL DES COUPS DE CŒUR EN BOUTIQUE */}
      <section className="py-12 bg-white border-b border-border">
        <RotatingSelection products={products} categories={categories} />
      </section>

      {/* 3. DIAGNOSTIC OLFACTIF INTERACTIF AVEC LES 4 FLACONS RECOMMANDÉS */}
      <ScentFinderSection products={products} />

      {/* 4. NOS UNIVERS OLFACTIFS MAJEURS & CATÉGORIES (LIENS DIRECTS VERS LA BOUTIQUE) */}
      <CategoryShowcaseSection categories={categories} />

      {/* 5. NARRATIVE & STORYTELLING : UNE MAISON NÉE À COTONOU */}
      <section className="bg-secondary/70 border-t border-border py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-12 md:grid-cols-2 items-center">
          <div className="relative group">
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-gold/30 via-primary/20 to-primary-deep/30 blur-xl opacity-70 group-hover:opacity-100 transition-opacity" />
            <img
              src={boutiqueImg}
              alt="Intérieur de la boutique Al Kareem Parfumerie à Cotonou"
              width={1200}
              height={800}
              loading="lazy"
              className="relative rounded-3xl shadow-elegant object-cover w-full aspect-[4/3] border border-white/80"
            />
          </div>
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gold/30 text-xs font-semibold uppercase tracking-widest text-gold shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Savoir-Faire & Passion</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-primary-deep leading-tight">
              Une Maison de Parfum Née à Cotonou
            </h2>

            <p className="text-foreground/85 leading-relaxed text-sm sm:text-base">
              Al Kareem Parfumerie est née d'un amour profond pour la parfumerie et les essences rares.
              Nous sélectionnons avec une rigueur absolue plus de 100 parfums, huiles concentrées sans alcool
              et coffrets pour permettre à chacun(e) d'affirmer sa personnalité unique.
            </p>

            <p className="text-foreground/85 leading-relaxed text-sm sm:text-base">
              Chaque client(e) bénéficie en boutique comme à distance d'un conseil personnalisé et attentif.
              Nos flacons sont garantis 100% originaux et scellés.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/boutique"
                className="inline-flex items-center gap-2 rounded-full bg-primary-deep text-primary-foreground px-6 py-3.5 text-sm font-semibold hover:bg-primary transition-all shadow-md hover:scale-105"
              >
                <span>Explorer la boutique en ligne</span>
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

      {/* 6. GARANTIES, AVIS CLIENTS & PREUVES D'AUTHENTICITÉ */}
      <TrustSection />
    </SiteLayout>
  );
}
