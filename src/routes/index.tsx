import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/layout";
import { ProductCard } from "@/components/product-card";
import { RotatingSelection, TrustSection } from "@/components/home-sections";
import { fetchProofs, fetchTestimonials } from "@/lib/vitrine";
import { fetchProducts, fetchCategories, whatsappLink } from "@/lib/products";
import {
  Truck,
  Smartphone,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
} from "lucide-react";
import hero from "@/assets/hero-perfumes.jpg";
import boutiqueImg from "@/assets/boutique.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Al Kareem Parfumerie — Parfums d'Exception à Cotonou, Bénin" },
      {
        name: "description",
        content:
          "Découvrez 100 parfums, huiles concentrées, brumes et coffrets chez Al Kareem Parfumerie à Cotonou. Flacons 100% authentiques, commande en ligne et livraison express Bénin.",
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
      { rel: "preload", as: "image", href: hero, fetchPriority: "high" } as unknown as {
        rel: string;
        href: string;
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Store",
          name: "Al Kareem Parfumerie",
          description:
            "Parfumerie d'exception à Cotonou, Bénin. 100 références de parfums disponibles en boutique, commande via WhatsApp, paiement à la livraison ou Mobile Money.",
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

  const promos = products.filter((p) => p.promo).slice(0, 4);
  const totalCount = 100;

  return (
    <SiteLayout>
      {/* 1. HERO SECTION : HAUTE PARFUMERIE & INCITATION FORTE À LA BOUTIQUE */}
      <section className="relative overflow-hidden bg-gradient-hero border-b border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-24 grid gap-10 md:grid-cols-2 items-center relative z-10">
          {/* Colonne Gauche : Accroche Prestige & CTAs Boutique */}
          <div className="space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-md px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-deep border border-gold/30 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-gold" /> Haute Parfumerie · Cotonou, Bénin
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-primary-deep leading-[1.08] tracking-tight">
              Sublimez
              <br />
              votre aura.
              <span className="block mt-2 font-serif italic text-2xl sm:text-3xl md:text-4xl text-primary font-normal">
                L'amour se porte en parfum
              </span>
            </h1>

            <p className="text-base sm:text-lg text-foreground/80 max-w-xl mx-auto md:mx-0 leading-relaxed font-normal">
              Explorez notre univers de <strong>{totalCount} fragrances d'exception</strong> :
              grandes créations de maisons renommées (Lattafa, Ahmed Al Maghribi, Nusuk...), huiles
              pures et coffrets, disponibles immédiatement en boutique avec livraison rapide à
              Cotonou et au Bénin.
            </p>

            {/* CTA principal : Pousser directement vers la Boutique */}
            <div className="pt-2 flex justify-center md:justify-start">
              <Link
                to="/boutique"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-primary-deep text-primary-foreground px-8 py-4 text-sm sm:text-base font-semibold hover:bg-primary transition-all shadow-elegant hover:scale-105 active:scale-95 group whitespace-nowrap"
              >
                <ShoppingBag className="h-4 w-4 text-gold" />
                <span className="hidden sm:inline">Explorer la boutique (100 parfums)</span>
                <span className="sm:hidden">Boutique (100 parfums)</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Indicateurs de rassurance sous les boutons */}
            <div className="pt-4 flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-xs text-muted-foreground font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>100 Parfums en stock</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Flacons 100% Authentiques</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Paiement à la livraison</span>
              </div>
            </div>
          </div>

          {/* Colonne Droite : L'image originale du Hero conservée intacte */}
          <div className="relative">
            <div className="absolute -inset-4 bg-white/40 rounded-3xl blur-2xl pointer-events-none" />
            <img
              src={hero}
              alt="Sélection de parfums d'exception Al Kareem Parfumerie"
              width={1600}
              height={1000}
              fetchPriority="high"
              decoding="async"
              className="relative rounded-3xl shadow-elegant object-cover w-full aspect-[4/3]"
            />
          </div>
        </div>
      </section>

      {/* 2. REASSURANCE : LES 4 PILIERS DE CONFIANCE */}
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: ShoppingBag,
              title: "Commande Simple & Rapide",
              desc: "Parcourez la boutique et commandez en 1 clic",
            },
            {
              icon: Smartphone,
              title: "Paiement à la Réception",
              desc: "En espèces, MTN MoMo ou Moov Money",
            },
            {
              icon: Truck,
              title: "Livraison 24h Garantie",
              desc: "Cotonou · Calavi · Porto-Novo · Tout le Bénin",
            },
            {
              icon: ShieldCheck,
              title: "Flacons 100% Authentiques",
              desc: "Sélection contrôlée et testée en boutique",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-secondary/30 border border-primary/5 hover:border-gold/30 hover:bg-white hover:shadow-soft transition-all"
            >
              <div className="h-11 w-11 rounded-full bg-white flex items-center justify-center text-primary-deep shadow-sm shrink-0 border border-border">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-sm text-foreground">{f.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. LE CARROUSEL DES VRAIS PRODUITS QUI DÉFILENT DIRECTEMENT */}
      <RotatingSelection products={products} categories={categories} />

      {/* 4. NOS UNIVERS OLFACTIFS (CATÉGORIES DE LA BOUTIQUE) */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24 border-t border-border">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 md:mb-14">
            <div>
              <div className="text-xs uppercase tracking-widest text-gold font-semibold mb-2">
                Collection Complète
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-primary-deep tracking-tight">
                Explorer par Catégorie
              </h2>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-xl">
                Choisissez votre univers pour découvrir tous les flacons disponibles en boutique.
              </p>
            </div>
            <Link
              to="/boutique"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-deep self-start sm:self-end group"
            >
              <span>Voir toute la boutique</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.slice(0, 8).map((c) => (
              <Link
                key={c.id}
                to="/boutique"
                search={{ category: c.slug }}
                className="group relative rounded-2xl overflow-hidden bg-gradient-primary text-primary-foreground aspect-[4/5] p-5 sm:p-6 flex flex-col justify-end hover:shadow-elegant transition-all hover:-translate-y-1"
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
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-deep/90 via-primary-deep/40 to-transparent" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_60%)]" />
                )}
                <div className="relative z-10">
                  <span className="text-[10px] uppercase tracking-widest text-gold font-medium block mb-1">
                    Univers Al Kareem
                  </span>
                  <div className="font-serif text-xl sm:text-2xl md:text-3xl text-white">
                    {c.name}
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold opacity-90 group-hover:translate-x-1.5 transition-transform text-white">
                    <span>Explorer le rayon</span>
                    <ArrowRight className="h-3.5 w-3.5 text-gold" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 5. BONS PLANS & OFFRES SPÉCIALES DE LA BOUTIQUE */}
      {promos.length > 0 && (
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {promos.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

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
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-gold font-semibold bg-gold/10 px-3 py-1 rounded-full border border-gold/20">
              <Sparkles className="h-3.5 w-3.5" /> Maison Fondée à Cotonou
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-primary-deep leading-tight">
              Une Maison de Parfum Née à Cotonou
            </h2>
            <p className="text-foreground/80 leading-relaxed text-sm sm:text-base">
              Al Kareem Parfumerie, c'est une sélection soignée de {totalCount} parfums,
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
            Parcourez dès aujourd'hui notre collection complète de {totalCount} références.
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
