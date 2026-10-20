import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  Wallet,
  Truck,
  Sparkles,
  Star,
} from "lucide-react";
import {
  getOptimizedImageUrl,
  matchesFamily,
  matchesGenre,
  SCENT_FAMILIES,
  type Category,
  type Genre,
  type Product,
  type ScentFamily,
} from "@/lib/catalog";
import { fetchProofs, fetchTestimonials, fetchVerifiedTestimonialIds } from "@/lib/vitrine";
import { whatsappLink } from "@/lib/products";
import { GUIDES, HOME_FAQ } from "@/lib/guides";
import { ProductCard } from "./product-card";
import { CONSEIL_MESSAGE, GENRES } from "./site-header";
import hero640 from "@/assets/perfume-woman-hero-640.webp";
import hero960 from "@/assets/perfume-woman-hero-960.webp";
import hero1376 from "@/assets/perfume-woman-hero-1376.webp";
import boutiqueImg from "@/assets/boutique.webp";
import femmeImg from "@/assets/product-femme.jpg";
import hommeImg from "@/assets/product-homme.jpg";
import unisexeImg from "@/assets/product-unisexe.jpg";
import oudImg from "@/assets/product-oud.jpg";
import citrusImg from "@/assets/product-citrus.jpg";
import coffretImg from "@/assets/product-coffret.jpg";

const CONTAINER = "mx-auto w-full max-w-[1320px] px-4 lg:px-8";
const H2 = "font-serif text-[28px] font-medium leading-tight text-primary-deep lg:text-4xl";
const EYEBROW = "text-[10.5px] font-semibold uppercase tracking-[0.22em] lg:text-xs";

/* ------------------------------------------------------------------ */
/* Puces catégories (mobile)                                          */
/* ------------------------------------------------------------------ */

const CHIP =
  "shrink-0 rounded-full border border-input px-4 py-2 text-[13px] font-medium text-foreground";

export function CategoryChips() {
  return (
    <nav
      aria-label="Catégories"
      className="scrollbar-none flex gap-2 overflow-x-auto px-4 py-3 lg:hidden"
    >
      <Link
        to="/boutique"
        className={`${CHIP} border-primary-deep bg-primary-deep font-semibold text-primary-foreground`}
      >
        Nouveautés
      </Link>
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
  );
}

/* ------------------------------------------------------------------ */
/* Hero compact                                                       */
/* ------------------------------------------------------------------ */

/* Image LCP : `object-cover` sur 300 px (mobile) / 460 px (desktop) de haut,
   la largeur affichée suit donc la hauteur, d'où des `sizes` fixes.
   React précharge seul cette image (fetchPriority="high") pendant le SSR. */
const HERO_SRCSET = `${hero640} 640w, ${hero960} 960w, ${hero1376} 1376w`;
const HERO_SIZES = "(min-width: 1024px) 830px, 540px";

export function HomeHero({ productCount }: { productCount: number }) {
  return (
    <section className={`${CONTAINER} mt-1 lg:mt-6`}>
      <div className="relative grid overflow-hidden rounded-[18px] bg-[#2D1244] text-white lg:min-h-[460px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:rounded-[20px]">
        <div className="relative h-[300px] lg:order-2 lg:h-auto">
          <img
            src={hero960}
            srcSet={HERO_SRCSET}
            sizes={HERO_SIZES}
            alt="Femme se parfumant — Al Kareem Parfumerie Cotonou"
            width={1376}
            height={768}
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover object-[70%_20%] lg:object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#240c38]/95 via-[#240c38]/35 to-transparent lg:hidden" />
        </div>
        <div className="absolute inset-x-5 bottom-5 flex flex-col gap-2.5 lg:static lg:order-1 lg:justify-center lg:gap-5 lg:px-14 lg:py-16">
          <h1 className={`${EYEBROW} text-gold`}>Al Kareem Parfumerie · Cotonou</h1>
          <p className="font-serif text-[38px] font-medium leading-none lg:text-[64px] lg:leading-[1.02]">
            Sublimez votre aura.
          </p>
          <p className="hidden max-w-[440px] text-base leading-relaxed text-[#E4DAEC] lg:block">
            {productCount > 0
              ? `Plus de ${Math.floor(productCount / 10) * 10} fragrances`
              : "Des fragrances"}{" "}
            authentiques — parfums orientaux, huiles concentrées et coffrets — livrées chez vous,
            payées à la réception.
          </p>
          <div className="mt-1 flex flex-wrap gap-3">
            <Link
              to="/boutique"
              className="inline-flex h-[46px] items-center gap-2 rounded-full bg-gold px-6 text-[14.5px] font-semibold text-[#2A1838] transition-transform hover:-translate-y-0.5 lg:h-[52px] lg:px-7 lg:text-[15px]"
            >
              Découvrir la collection <ArrowRight className="h-[18px] w-[18px]" />
            </Link>
            <a
              href="#quiz"
              className="hidden h-[52px] items-center rounded-full border border-white/45 px-6 text-[15px] font-medium text-white hover:bg-white/10 lg:inline-flex"
            >
              Trouver mon parfum
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Parfumerie à Cotonou : texte de présentation + FAQ (mots clés)     */
/* ------------------------------------------------------------------ */

export function HomeFaq() {
  return (
    <section className={`${CONTAINER} mt-9 lg:mt-[72px]`} aria-labelledby="faq-title">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-14">
        <div>
          <p className={`${EYEBROW} text-gold-ink`}>Votre parfumerie à Cotonou</p>
          <h2 id="faq-title" className={`${H2} mt-2`}>
            Parfums authentiques au Bénin, payés à la livraison
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-foreground/80">
            Al Kareem Parfumerie est une parfumerie de Cotonou spécialisée dans les parfums
            originaux : parfums femme, parfums homme, parfums unisexe et orientaux, huiles
            concentrées, brumes et coffrets cadeaux. Commandez sur le site ou sur WhatsApp, nous
            livrons à Cotonou, dans tout le Bénin et dans la sous-région.
          </p>
          <ul className="mt-5 flex flex-col gap-2 text-[14.5px]">
            {GUIDES.slice(0, 3).map((g) => (
              <li key={g.slug}>
                <Link
                  to="/conseils/$slug"
                  params={{ slug: g.slug }}
                  className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
                >
                  {g.title} <ArrowRight className="h-4 w-4" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="divide-y divide-border border-y border-border">
          {HOME_FAQ.map((f) => (
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
  );
}

/* ------------------------------------------------------------------ */
/* Réassurance                                                        */
/* ------------------------------------------------------------------ */

const PERKS = [
  { icon: ShieldCheck, title: "100 % authentique", desc: "Flacons vérifiés avant vente" },
  { icon: Wallet, title: "Payé à la réception", desc: "Espèces, MTN MoMo, Moov Money" },
  { icon: Truck, title: "Livraison rapide", desc: "Bénin & sous-région" },
  { icon: MessageCircle, title: "Conseil privé", desc: "Un parfumeur sur WhatsApp" },
];

export function PerksStrip() {
  return (
    <section className={`${CONTAINER} mt-7 lg:mt-14`}>
      <ul className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-0 lg:rounded-2xl lg:border lg:border-border lg:bg-card">
        {PERKS.map((p) => (
          <li
            key={p.title}
            className="flex flex-col gap-1 rounded-[14px] border border-border bg-card p-3.5 lg:flex-row lg:items-center lg:gap-3.5 lg:rounded-none lg:border-0 lg:bg-transparent lg:px-6 lg:py-5"
          >
            <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-primary lg:flex">
              <p.icon className="h-5 w-5" />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-[13px] font-semibold lg:text-sm">{p.title}</span>
              <span className="text-[11.5px] leading-snug text-muted-foreground lg:text-[12.5px]">
                {p.desc}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Univers en cercles                                                 */
/* ------------------------------------------------------------------ */

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  "huiles-concentrees": oudImg,
  "brumes-sprays-corporels": citrusImg,
  deodorants: citrusImg,
  "coffrets-cadeaux": coffretImg,
  "diffuseurs-de-parfum": boutiqueImg,
};

const HIDDEN_UNIVERSE_SLUGS = new Set(["parfums", "senteurs-unisexe"]);

export function UniverseCircles({ categories }: { categories: Category[] }) {
  const genreItems = [
    { key: "femme", label: "Femme", img: femmeImg, genre: "femme" as const },
    { key: "homme", label: "Homme", img: hommeImg, genre: "homme" as const },
    { key: "unisexe", label: "Unisexe", img: unisexeImg, genre: "unisexe" as const },
  ];
  const catItems = categories
    .filter((c) => !HIDDEN_UNIVERSE_SLUGS.has(c.slug))
    .map((c) => ({
      key: c.id,
      label: c.name,
      slug: c.slug,
      img: c.image_url
        ? getOptimizedImageUrl(c.image_url, 264, 264, 75)
        : (CATEGORY_FALLBACK_IMAGES[c.slug] ?? boutiqueImg),
    }));

  const circle =
    "block h-[82px] w-[82px] overflow-hidden rounded-full border border-border bg-secondary lg:h-[132px] lg:w-[132px]";
  const label = "text-xs font-semibold text-foreground lg:text-sm";
  const item = "flex w-[82px] shrink-0 flex-col items-center gap-2 text-center lg:w-auto lg:gap-3";

  return (
    <section className="mt-8 lg:mt-14">
      <div className={`${CONTAINER} mb-3.5 flex items-baseline justify-between lg:mb-6`}>
        <h2 className={H2}>Explorer par univers</h2>
        <Link
          to="/boutique"
          className="hidden text-sm font-semibold text-primary-deep hover:text-primary lg:inline"
        >
          Tout voir →
        </Link>
      </div>
      <div
        className={`${CONTAINER} scrollbar-none flex gap-3.5 overflow-x-auto lg:justify-between lg:gap-5 lg:overflow-visible`}
      >
        {genreItems.map((g) => (
          <Link
            key={g.key}
            to="/boutique/genre/$genre"
            params={{ genre: g.genre }}
            className={item}
          >
            <span className={circle}>
              <img
                src={g.img}
                alt=""
                loading="lazy"
                width={132}
                height={132}
                className="h-full w-full object-cover"
              />
            </span>
            <span className={label}>{g.label}</span>
          </Link>
        ))}
        {catItems.map((c) => (
          <Link key={c.key} to="/boutique/$category" params={{ category: c.slug }} className={item}>
            <span className={circle}>
              <img
                src={c.img}
                alt=""
                loading="lazy"
                width={132}
                height={132}
                className="h-full w-full object-cover"
              />
            </span>
            <span className={label}>{c.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Sélection (grille principale)                                      */
/* ------------------------------------------------------------------ */

type GenreTab = "tous" | Genre;

/** Articles d'entretien (désodorisants, diffuseurs) : vendus en boutique, mais pas mis en vitrine. */
const NON_SHOWCASE_SLUGS = new Set(["diffuseurs-de-parfum", "deodorants"]);

function showcaseable(products: Product[]): Product[] {
  const inStock = products.filter((p) => p.inStock);
  const fragrances = inStock.filter((p) => !NON_SHOWCASE_SLUGS.has(p.categorySlug));
  return fragrances.length > 0 ? fragrances : inStock;
}

export function SelectionGrid({ products }: { products: Product[] }) {
  const [tab, setTab] = useState<GenreTab>("tous");
  const shown = useMemo(() => {
    const inStock = showcaseable(products);
    const pool = tab === "tous" ? inStock : inStock.filter((p) => matchesGenre(p, tab));
    return pool.slice(0, 10);
  }, [products, tab]);

  const tabs: { id: GenreTab; label: string }[] = [
    { id: "tous", label: "Tous" },
    ...GENRES.map((g) => ({ id: g.genre, label: g.label })),
  ];

  return (
    <section className={`${CONTAINER} mt-7 lg:mt-16`}>
      <div className="mb-3.5 flex flex-col gap-3 lg:mb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className={H2}>Notre sélection</h2>
            <p className="mt-1.5 hidden text-sm text-muted-foreground lg:block">
              Les fragrances disponibles tout de suite en boutique.
            </p>
          </div>
          <Link to="/boutique" className="text-[13px] font-semibold text-primary-deep lg:hidden">
            Tout voir
          </Link>
        </div>
        <div
          role="tablist"
          aria-label="Filtrer la sélection"
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
                  ? "bg-primary-deep font-semibold text-primary-foreground"
                  : "border border-input font-medium hover:border-primary/40"
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
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Aucun parfum dans cette sélection pour le moment.
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

/* ------------------------------------------------------------------ */
/* Nouveaux arrivages                                                 */
/* ------------------------------------------------------------------ */

export function NewArrivals({ products }: { products: Product[] }) {
  // fetchProducts trie déjà par date d'ajout décroissante.
  const newest = showcaseable(products).slice(0, 3);
  if (newest.length === 0) return null;

  return (
    <section className="mt-9 lg:mt-[72px]">
      <div className={`${CONTAINER} mb-3.5 flex items-baseline justify-between lg:hidden`}>
        <h2 className={H2}>Nouveaux arrivages</h2>
        <Link to="/boutique" className="text-[13px] font-semibold text-primary-deep">
          Tout voir
        </Link>
      </div>
      <div
        className={`${CONTAINER} lg:grid lg:grid-cols-[minmax(0,1.25fr)_repeat(3,minmax(0,1fr))] lg:gap-6`}
      >
        <Link
          to="/boutique"
          className="relative hidden min-h-[400px] overflow-hidden rounded-2xl bg-[#2D1244] text-white lg:block"
        >
          <img
            src={boutiqueImg}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-[#1e0a2d]/90 to-[#1e0a2d]/10" />
          <span className="absolute inset-x-8 bottom-8 flex flex-col gap-2.5">
            <span className={`${EYEBROW} text-gold`}>Nouveaux arrivages</span>
            <span className="font-serif text-[38px] leading-[1.05]">
              Fraîchement arrivés en boutique.
            </span>
            <span className="text-sm font-semibold">Voir toutes les nouveautés →</span>
          </span>
        </Link>
        <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 lg:contents">
          {newest.map((p) => (
            <div key={p.id} className="w-[150px] shrink-0 lg:w-auto">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Quiz « Trouver mon parfum » + Coffrets                             */
/* ------------------------------------------------------------------ */

type QuizGenre = Genre | "peu-importe";

export function ScentQuizAndGifts({ products }: { products: Product[] }) {
  const [step, setStep] = useState<"intro" | "genre" | "family" | "result">("intro");
  const [genre, setGenre] = useState<QuizGenre>("peu-importe");
  const [family, setFamily] = useState<ScentFamily | null>(null);

  const results = useMemo(() => {
    if (step !== "result" || !family) return [];
    const inStock = products.filter((p) => p.inStock);
    const byGenre =
      genre === "peu-importe" ? inStock : inStock.filter((p) => matchesGenre(p, genre));
    const exact = byGenre.filter((p) => matchesFamily(p, family));
    // Si aucun parfum ne correspond exactement, on élargit au genre puis à toute la boutique.
    const pool = exact.length > 0 ? exact : byGenre.length > 0 ? byGenre : inStock;
    return pool.slice(0, 4);
  }, [products, step, genre, family]);

  const choice =
    "rounded-full border border-[#E2D6EC] bg-card px-4 py-2.5 text-[13.5px] font-medium transition-colors hover:border-primary hover:text-primary";

  return (
    <section
      id="quiz"
      className={`${CONTAINER} mt-9 grid scroll-mt-40 gap-4 lg:mt-[72px] lg:grid-cols-2 lg:gap-6`}
    >
      <div className="flex min-h-[260px] flex-col justify-center gap-3 rounded-[18px] bg-accent p-6 lg:min-h-[340px] lg:gap-4 lg:rounded-[20px] lg:p-12">
        <span className={`${EYEBROW} text-primary`}>
          Trouver mon parfum{step === "intro" ? " · 30 secondes" : ""}
        </span>

        {step === "intro" && (
          <>
            <h3 className="font-serif text-[28px] font-medium leading-[1.05] text-primary-deep lg:text-[40px]">
              Vous ne savez pas quoi choisir ?
            </h3>
            <p className="max-w-[420px] text-[15px] leading-relaxed text-foreground/80">
              Deux questions — pour qui, et l'ambiance recherchée — et nous vous proposons les
              fragrances qui vous ressemblent.
            </p>
            <button
              type="button"
              onClick={() => setStep("genre")}
              className="mt-1 self-start rounded-full bg-primary-deep px-6 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary"
            >
              Commencer le quiz
            </button>
          </>
        )}

        {step === "genre" && (
          <>
            <h3 className="font-serif text-[26px] font-medium text-primary-deep lg:text-[34px]">
              1 · C'est pour qui ?
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {[
                ...GENRES.map((g) => ({ id: g.genre as QuizGenre, label: g.label })),
                { id: "peu-importe" as QuizGenre, label: "Peu importe" },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={choice}
                  onClick={() => {
                    setGenre(g.id);
                    setStep("family");
                  }}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </>
        )}

        {step === "family" && (
          <>
            <h3 className="font-serif text-[26px] font-medium text-primary-deep lg:text-[34px]">
              2 · Quelle ambiance ?
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {(Object.keys(SCENT_FAMILIES) as ScentFamily[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  className={choice}
                  onClick={() => {
                    setFamily(f);
                    setStep("result");
                  }}
                >
                  {SCENT_FAMILIES[f].label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStep("genre")}
              className="self-start text-sm font-medium text-primary-deep underline underline-offset-4"
            >
              ← Retour
            </button>
          </>
        )}

        {step === "result" && (
          <>
            <h3 className="font-serif text-[24px] font-medium text-primary-deep lg:text-[30px]">
              Nos suggestions pour vous
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {results.map((p) => (
                <Link
                  key={p.id}
                  to="/parfum/$slug"
                  params={{ slug: p.slug }}
                  className="flex items-center gap-2.5 rounded-xl bg-card p-2 hover:ring-1 hover:ring-primary/30"
                >
                  <img
                    src={p.image}
                    alt=""
                    loading="lazy"
                    width={56}
                    height={56}
                    className="h-14 w-14 shrink-0 rounded-lg object-cover"
                  />
                  <span className="line-clamp-2 font-serif text-[15px] leading-tight">
                    {p.name}
                  </span>
                </Link>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setFamily(null);
                setStep("genre");
              }}
              className="self-start text-sm font-medium text-primary-deep underline underline-offset-4"
            >
              Recommencer
            </button>
          </>
        )}
      </div>

      <Link
        to="/boutique/$category"
        params={{ category: "coffrets-cadeaux" }}
        className="relative block h-[220px] overflow-hidden rounded-[18px] text-white lg:h-auto lg:min-h-[340px] lg:rounded-[20px]"
      >
        <img
          src={coffretImg}
          alt="Coffret cadeau Al Kareem"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-[#1e0a2d]/90 to-[#1e0a2d]/5" />
        <span className="absolute inset-x-5 bottom-5 flex flex-col gap-1.5 lg:inset-x-10 lg:bottom-9 lg:gap-2.5">
          <span className={`${EYEBROW} text-gold`}>Coffrets cadeaux</span>
          <span className="font-serif text-[26px] leading-[1.05] lg:text-[40px]">
            L'attention qui marque les esprits.
          </span>
          <span className="hidden text-sm font-semibold lg:inline">Offrir un coffret →</span>
        </span>
      </Link>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Confiance : preuves d'authenticité + avis                          */
/* ------------------------------------------------------------------ */

export function TrustSection() {
  const { data: proofs = [] } = useQuery({
    queryKey: ["authenticity-proofs"],
    queryFn: fetchProofs,
  });
  const { data: testimonials = [] } = useQuery({
    queryKey: ["testimonials"],
    queryFn: fetchTestimonials,
  });
  const { data: verifiedIds = [] } = useQuery({
    queryKey: ["testimonials-verified"],
    queryFn: fetchVerifiedTestimonialIds,
    enabled: testimonials.length > 0,
  });
  const photos =
    proofs.length > 0
      ? proofs
          .slice(0, 3)
          .map((p) => ({ src: p.image_url, alt: p.caption || "Preuve d'authenticité Al Kareem" }))
      : [{ src: boutiqueImg, alt: "Boutique Al Kareem à Cotonou" }];

  return (
    <section className={`${CONTAINER} mt-9 lg:mt-[72px]`}>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-start lg:gap-12">
        <div className="flex flex-col gap-2 lg:gap-4">
          <span className={`${EYEBROW} text-gold-ink`}>La garantie Al Kareem</span>
          <h2 className={`${H2} lg:text-[40px]`}>
            Authentique, vérifié, photographié en boutique.
          </h2>
          <p className="hidden text-[15px] leading-relaxed text-foreground/80 lg:block">
            Chaque flacon est contrôlé avant la mise en vente. Voici de vraies photos de nos
            arrivages et de nos emballages scellés.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3 lg:gap-4">
          {photos.map((p) => (
            <img
              key={p.src}
              src={p.src}
              alt={p.alt}
              loading="lazy"
              className="aspect-square w-full rounded-xl object-cover lg:aspect-[3/4] lg:rounded-[14px]"
            />
          ))}
        </div>
      </div>
      {testimonials.length > 0 && (
        <div className="mt-8 lg:mt-12">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h3 className="font-serif text-[24px] font-medium text-primary-deep lg:text-[30px]">
              Ce que disent nos clientes
            </h3>
          </div>
          <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-4 lg:px-0">
            {testimonials.slice(0, 6).map((t) => (
              <figure
                key={t.id}
                className="flex w-[285px] shrink-0 flex-col gap-3 rounded-[14px] border border-border bg-card p-5 lg:w-auto"
              >
                {t.rating ? (
                  <span className="flex gap-0.5" role="img" aria-label={`${t.rating} sur 5`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < t.rating! ? "fill-gold text-gold" : "text-border"}`}
                      />
                    ))}
                  </span>
                ) : null}
                <blockquote className="flex-1 font-serif text-lg leading-snug">
                  « {t.message} »
                </blockquote>
                <figcaption className="flex flex-wrap items-center justify-between gap-2 text-[13px]">
                  <span className="font-semibold text-primary-deep">{t.name}</span>
                  {verifiedIds.includes(t.id) && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-primary-deep">
                      <ShieldCheck className="h-3 w-3" /> Achat vérifié
                    </span>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Bandeau WhatsApp                                                   */
/* ------------------------------------------------------------------ */

export function WhatsAppBand() {
  return (
    <section className={`${CONTAINER} mt-9 lg:mt-[72px]`}>
      <div className="flex flex-col gap-5 rounded-[18px] bg-primary-deep p-6 text-white lg:flex-row lg:items-center lg:justify-between lg:rounded-[20px] lg:px-12 lg:py-10">
        <div className="flex flex-col gap-2">
          <Sparkles className="h-5 w-5 text-gold" />
          <span className="font-serif text-[26px] leading-tight lg:text-[34px]">
            Un doute ? Notre parfumeur vous répond.
          </span>
          <span className="text-[15px] text-[#E4DAEC]">
            Conseil gratuit et personnalisé sur WhatsApp.
          </span>
        </div>
        <a
          href={whatsappLink(CONSEIL_MESSAGE)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-[52px] shrink-0 items-center justify-center gap-2.5 rounded-full bg-whatsapp px-7 text-[15px] font-semibold text-whatsapp-foreground hover:brightness-110"
        >
          <MessageCircle className="h-5 w-5" /> Écrire sur WhatsApp
        </a>
      </div>
    </section>
  );
}
