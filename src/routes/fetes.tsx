import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/layout";
import { fetchProducts, fetchCategories, whatsappLink } from "@/lib/products";
import { fetchProofs, fetchTestimonials } from "@/lib/vitrine";
import { ProductCard } from "@/components/product-card";
import {
  TrustSection,
  UniverseCircles,
  NewArrivals,
  ScentQuizAndGifts,
  WhatsAppBand,
} from "@/components/home-sections";
import { GENRES } from "@/components/site-header";
import { matchesGenre, type Genre, type Product } from "@/lib/catalog";
import { Sparkles, ArrowRight, ShieldCheck, Truck, MessageCircle, Gift } from "lucide-react";
import hero640 from "@/assets/perfume-woman-hero-640.webp";
import hero960 from "@/assets/perfume-woman-hero-960.webp";
import hero1376 from "@/assets/perfume-woman-hero-1376.webp";

export const Route = createFileRoute("/fetes")({
  head: () => ({
    meta: [
      { title: "Al Kareem Parfumerie — Ambiance Féerique de Noël & Réveillon" },
      {
        name: "description",
        content:
          "Célébrez la magie de Noël avec Al Kareem Parfumerie à Cotonou : nos fragrances d'exception pour vos soirées de réveillon, livraison soignée et paiement à la réception.",
      },
    ],
  }),
  loader: async ({ context }) => {
    try {
      await Promise.all([
        context.queryClient.ensureQueryData({
          queryKey: ["products"],
          queryFn: () => fetchProducts(),
        }),
        context.queryClient.ensureQueryData({
          queryKey: ["categories"],
          queryFn: fetchCategories,
        }),
        context.queryClient.ensureQueryData({
          queryKey: ["authenticity-proofs"],
          queryFn: fetchProofs,
        }),
        context.queryClient.ensureQueryData({
          queryKey: ["testimonials"],
          queryFn: fetchTestimonials,
        }),
      ]);
    } catch (err) {
      console.error("[Fetes] Failed to prefetch data:", err);
    }
  },
  component: FetesWebPage,
});

const CONTAINER = "mx-auto w-full max-w-[1320px] px-4 lg:px-8";
const H2 = "font-serif text-[28px] font-medium leading-tight text-primary-deep lg:text-4xl";
const EYEBROW = "text-[10.5px] font-semibold uppercase tracking-[0.22em] lg:text-xs";
const CHIP =
  "shrink-0 rounded-full border border-input px-4 py-2 text-[13px] font-medium text-foreground";

const HERO_SRCSET = `${hero640} 640w, ${hero960} 960w, ${hero1376} 1376w`;
const HERO_SIZES = "(min-width: 1024px) 830px, 540px";

const CHRISTMAS_PERKS = [
  {
    icon: Truck,
    title: "Livré avant le Réveillon",
    desc: "Service continu à Cotonou & Calavi jusqu'au 24 et 31 décembre",
  },
  {
    icon: ShieldCheck,
    title: "100 % Authentique",
    desc: "Flacons d'exception certifiés et scellés",
  },
  {
    icon: Gift,
    title: "Écrin & Emballage Soigné",
    desc: "Présentation raffinée pour sublimer vos fêtes",
  },
  {
    icon: MessageCircle,
    title: "Conseil Parfumeur Noël",
    desc: "Accompagnement privé sur WhatsApp pour votre sillage",
  },
];

const CHRISTMAS_FAQ = [
  {
    q: "Puis-je être livré(e) à temps pour le Réveillon de Noël ou du 31 décembre ?",
    a: "Oui, absolument ! Nos livreurs sillonnent Cotonou et Calavi en continu tout au long du mois de décembre, y compris les 24 et 31 décembre jusqu'en fin d'après-midi. Passez simplement votre commande sur le site ou sur WhatsApp.",
  },
  {
    q: "Comment fonctionne le paiement à la livraison pendant les fêtes ?",
    a: "Vous réglez votre commande directement au livreur une fois votre flacon entre les mains. Vous pouvez payer en espèces ou via Mobile Money local (MTN MoMo, Moov Money) en toute sécurité.",
  },
  {
    q: "Les parfums sont-ils des originaux garantis pour les grandes occasions ?",
    a: "Tous nos parfums, huiles et coffrets sont 100 % originaux et certifiés, provenant directement des distributeurs officiels. Ils offrent la tenue et le sillage nécessaires pour vos dîners et soirées de fête.",
  },
  {
    q: "Puis-je demander conseil sur WhatsApp pour trouver mon parfum de soirée ?",
    a: "Avec grand plaisir ! Cliquez sur le bouton WhatsApp et partagez vos préférences (notes ambrées, vanillées, boisées ou florales). Notre parfumeur vous orientera immédiatement vers la fragrance idéale.",
  },
];

export function FetesWebPage() {
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => fetchProducts(),
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  return (
    <SiteLayout>
      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. BANDEAU FESTIF DE NOËL AU SOMMET DU SITE               */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1E092F] via-[#3C1458] to-[#1E092F] px-4 py-2.5 text-center text-xs text-white shadow-inner">
        <div className="mx-auto flex max-w-[1320px] items-center justify-center gap-2">
          <Sparkles className="h-3.5 w-3.5 animate-pulse text-[#E9C46A]" />
          <p className="font-light tracking-wide">
            <span className="font-serif italic font-medium text-[#E9C46A]">Féerie de Noël :</span>{" "}
            Que la magie des fêtes illumine votre sillage · Livraison garantie à Cotonou & au Bénin.
          </p>
          <Sparkles className="h-3.5 w-3.5 animate-pulse text-[#E9C46A]" />
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. PUCES CATÉGORIES (AVEC TOUCHE FESTIVE)                  */}
      {/* ────────────────────────────────────────────────────────── */}
      <nav
        aria-label="Catégories"
        className="scrollbar-none flex gap-2 overflow-x-auto px-4 py-3 lg:hidden"
      >
        <span
          className={`${CHIP} border-[#E9C46A] bg-[#241034] font-semibold text-[#E9C46A] shadow-sm`}
        >
          🎄 Sélection de Noël
        </span>
        {GENRES.map((g) => (
          <Link
            key={g.genre}
            to="/boutique/genre/$genre"
            params={{ genre: g.genre }}
            className={CHIP}
          >
            {g.label}
          </Link>
        ))}
        <Link to="/boutique/$category" params={{ category: "huiles-concentrees" }} className={CHIP}>
          Huiles
        </Link>
        <Link to="/boutique/$category" params={{ category: "coffrets-cadeaux" }} className={CHIP}>
          Coffrets
        </Link>
        <Link to="/boutique" search={{ promo: true }} className={CHIP}>
          Offres
        </Link>
      </nav>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. HERO SPÉCIAL AMBIANCE DE NOËL                           */}
      {/* ────────────────────────────────────────────────────────── */}
      <section className={`${CONTAINER} mt-1 lg:mt-6`}>
        <div className="relative grid overflow-hidden rounded-[20px] bg-gradient-to-br from-[#1A072B] via-[#2D1244] to-[#140422] text-white shadow-xl lg:min-h-[480px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          {/* Halos de lumière de fête (Bokeh) */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-[#E9C46A]/20 blur-3xl animate-pulse" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-[#8A38B8]/25 blur-3xl" />

          {/* Particules dorées légères */}
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "radial-gradient(#E9C46A 1.5px, transparent 1.5px), radial-gradient(#F3D89A 1px, transparent 1px)",
              backgroundSize: "38px 38px, 56px 56px",
              backgroundPosition: "0 0, 19px 19px",
            }}
          />

          {/* Étoiles décoratives délicates */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden text-xs text-[#E9C46A]/30">
            <span className="absolute left-[8%] top-[12%] text-sm">✦</span>
            <span className="absolute left-[38%] top-[80%] text-xs">✧</span>
            <span className="absolute left-[70%] top-[20%] text-base">✦</span>
            <span className="absolute left-[90%] top-[70%] text-sm">✧</span>
          </div>

          {/* Visuel du Hero */}
          <div className="relative h-[300px] lg:order-2 lg:h-auto">
            <img
              src={hero960}
              srcSet={HERO_SRCSET}
              sizes={HERO_SIZES}
              alt="Femme se parfumant pour les fêtes — Al Kareem Parfumerie Cotonou"
              width={1376}
              height={768}
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover object-[70%_20%] lg:object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A072B]/95 via-[#1A072B]/40 to-transparent lg:hidden" />
          </div>

          {/* Textes et ambiance du Hero */}
          <div className="relative z-10 flex flex-col gap-3 px-5 py-6 lg:order-1 lg:justify-center lg:gap-5 lg:px-14 lg:py-16">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#E9C46A]/40 bg-[#E9C46A]/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#E9C46A] backdrop-blur-sm">
              <Sparkles className="h-3 w-3" /> Ambiance Féerique de Noël
            </div>

            <h1 className="font-serif text-[38px] font-medium leading-[1.05] lg:text-[62px]">
              Sublimez la <br className="hidden lg:block" />
              <span className="italic text-[#E9C46A]">Magie de Noël</span>.
            </h1>

            <p className="max-w-[480px] text-sm leading-relaxed text-[#E5D7F0] lg:text-base">
              Pour Noël et les nuits de réveillon, faites rayonner votre présence avec nos plus
              nobles fragrances orientales et occidentales. Livrées chez vous à Cotonou et payées à
              la réception.
            </p>

            <div className="mt-2 flex flex-wrap gap-3">
              <a
                href="#selection-noel"
                className="inline-flex h-[48px] items-center gap-2 rounded-full bg-gradient-to-r from-[#E9C46A] to-[#F3D89A] px-7 text-sm font-semibold text-[#241034] shadow-md transition-transform hover:-translate-y-0.5 lg:h-[52px]"
              >
                Découvrir la sélection de Noël <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href={whatsappLink(
                  "Bonjour Al Kareem, je souhaite un conseil pour mon parfum de fête.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-[48px] items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/20 lg:h-[52px]"
              >
                <MessageCircle className="h-4 w-4 text-[#25D366]" />
                Conseil Parfumeur WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 4. UNIVERS EN CERCLES (DESKTOP)                            */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="hidden lg:block">
        <UniverseCircles categories={categories} />
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 5. ENGAGEMENTS DE NOËL (RÉASSURANCE SPÉCIALE FÊTES)        */}
      {/* ────────────────────────────────────────────────────────── */}
      <section className={`${CONTAINER} mt-7 lg:mt-14`}>
        <ul className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-0 lg:rounded-2xl lg:border lg:border-[#E9C46A]/30 lg:bg-card lg:shadow-sm">
          {CHRISTMAS_PERKS.map((p) => {
            const Icon = p.icon;
            return (
              <li
                key={p.title}
                className="flex flex-col gap-1 rounded-[14px] border border-border bg-card p-3.5 lg:flex-row lg:items-center lg:gap-3.5 lg:rounded-none lg:border-0 lg:bg-transparent lg:px-6 lg:py-5"
              >
                <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#241034] text-[#E9C46A] lg:flex">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-semibold text-[#241034] lg:text-sm">
                    {p.title}
                  </span>
                  <span className="text-[11.5px] leading-snug text-muted-foreground lg:text-[12.5px]">
                    {p.desc}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 6. LA SÉLECTION DE NOËL (GRILLE DE PRODUITS)               */}
      {/* ────────────────────────────────────────────────────────── */}
      <ChristmasSelectionGrid products={products} />

      {/* Univers mobile */}
      <div className="lg:hidden">
        <UniverseCircles categories={categories} />
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 7. NOUVEAUTÉS DE FIN D'ANNÉE                              */}
      {/* ────────────────────────────────────────────────────────── */}
      <NewArrivals products={products} />

      {/* ────────────────────────────────────────────────────────── */}
      {/* 8. QUIZ PARFUM DU RÉVEILLON                                */}
      {/* ────────────────────────────────────────────────────────── */}
      <ScentQuizAndGifts products={products} />

      {/* ────────────────────────────────────────────────────────── */}
      {/* 9. PREUVES DE CONFIANCE & AVIS CLIENTS                     */}
      {/* ────────────────────────────────────────────────────────── */}
      <TrustSection />

      {/* ────────────────────────────────────────────────────────── */}
      {/* 10. FAQ DE NOËL (RÉASSURANCE LIVRAISON & PAIEMENT)         */}
      {/* ────────────────────────────────────────────────────────── */}
      <section className={`${CONTAINER} mt-9 lg:mt-[72px]`} aria-labelledby="faq-noel-title">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-14">
          <div>
            <p className={`${EYEBROW} text-gold-ink`}>La Parfumerie des Fêtes à Cotonou</p>
            <h2 id="faq-noel-title" className={`${H2} mt-2`}>
              Tout pour réussir vos fêtes avec Al Kareem
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-foreground/80">
              Pour Noël et le Nouvel An, Al Kareem Parfumerie met à votre disposition son catalogue
              complet de parfums authentiques, huiles pures et coffrets d'exception, avec une
              organisation logistique dédiée pour vous livrer en toute sérénité à Cotonou et dans
              tout le Bénin.
            </p>
            <div className="mt-6">
              <a
                href={whatsappLink(
                  "Bonjour Al Kareem, j'ai une question sur ma livraison pour les fêtes.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#241034] px-6 py-3 text-xs font-semibold text-[#E9C46A] shadow hover:bg-[#34184c]"
              >
                <MessageCircle className="h-4 w-4 text-[#25D366]" />
                Poser une question sur WhatsApp
              </a>
            </div>
          </div>
          <div className="divide-y divide-border border-y border-border">
            {CHRISTMAS_FAQ.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="cursor-pointer list-none font-semibold text-foreground marker:hidden">
                  {f.q}
                </summary>
                <p className="mt-2 text-[15px] leading-relaxed text-foreground/80">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 11. BANDEAU DE CONTACT WHATSAPP SPÉCIAL FÊTES              */}
      {/* ────────────────────────────────────────────────────────── */}
      <WhatsAppBand />

      <div className="h-12 lg:h-20" />
    </SiteLayout>
  );
}

/* ────────────────────────────────────────────────────────────────── */
/* Grille de sélection spéciale Noël avec badge festif                */
/* ────────────────────────────────────────────────────────────────── */

type GenreTab = "tous" | Genre;

function ChristmasSelectionGrid({ products }: { products: Product[] }) {
  const [tab, setTab] = useState<GenreTab>("tous");

  const shown = useMemo(() => {
    const inStock = products.filter((p) => p.inStock);
    const pool = tab === "tous" ? inStock : inStock.filter((p) => matchesGenre(p, tab));
    return pool.slice(0, 10);
  }, [products, tab]);

  const tabs: { id: GenreTab; label: string }[] = [
    { id: "tous", label: "✨ Toute la Sélection de Noël" },
    ...GENRES.map((g) => ({ id: g.genre, label: g.label })),
  ];

  return (
    <section id="selection-noel" className={`${CONTAINER} mt-7 lg:mt-16`}>
      <div className="mb-3.5 flex flex-col gap-3 lg:mb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-baseline justify-between">
          <div>
            <span className={`${EYEBROW} text-gold-ink`}>Sélection de Noël</span>
            <h2 className={`${H2} mt-1`}>Les Fragrances de Célébration</h2>
            <p className="mt-1.5 hidden text-sm text-muted-foreground lg:block">
              Disponibles immédiatement pour illuminer vos soirées de fête.
            </p>
          </div>
          <Link to="/boutique" className="text-[13px] font-semibold text-primary-deep lg:hidden">
            Tout voir
          </Link>
        </div>
        <div
          role="tablist"
          aria-label="Filtrer la sélection de Noël"
          className="scrollbar-none flex gap-2 overflow-x-auto"
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-[13px] transition-colors ${
                tab === t.id
                  ? "bg-[#241034] font-semibold text-[#E9C46A] shadow"
                  : "border border-input font-medium hover:border-[#E9C46A]/50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {shown.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-5 lg:gap-6">
          {shown.map((p) => (
            <div key={p.id} className="relative">
              <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-[#241034] px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-[#E9C46A] shadow border border-[#E9C46A]/30">
                Noël ✦
              </span>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Chargement de la sélection de Noël…
        </p>
      )}

      <div className="mt-6 hidden justify-center lg:flex">
        <Link
          to="/boutique"
          className="inline-flex h-12 items-center gap-2 rounded-full border border-primary-deep px-8 text-sm font-semibold text-primary-deep hover:bg-primary-deep hover:text-primary-foreground"
        >
          Voir toute la boutique <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
