import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { Category, Product } from "@/lib/catalog";
import { fetchProofs, fetchTestimonials } from "@/lib/vitrine";
import { formatFCFA, whatsappLink } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  Sparkles,
  HeartHandshake,
  Star,
  Quote,
  Flame,
  ShieldCheck,
  Truck,
  MessageCircle,
  ShoppingBag,
  CheckCircle2,
  Crown,
  Compass,
} from "lucide-react";

/** Vrai si l'utilisateur a demandé moins d'animations au niveau système. */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

const AUTOPLAY_MS = 4500;

/**
 * 1. CARROUSEL ÉLITE DES COUPS DE CŒUR (Inspiration Creed & Kilian Paris)
 */
export function RotatingSelection({
  products,
}: {
  products: Product[];
  categories: Category[];
}) {
  const { addItem } = useCart();
  const reduced = usePrefersReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const featuredItems = useMemo(() => {
    if (!products || products.length === 0) return [];
    const withRealImages = products.filter(
      (p) => p.inStock && p.image && !p.image.includes("data:image/svg"),
    );
    return withRealImages.length >= 4 ? withRealImages.slice(0, 6) : products.slice(0, 4);
  }, [products]);

  const totalSlides = featuredItems.length;

  useEffect(() => {
    if (reduced || isPaused || totalSlides <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalSlides);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [reduced, isPaused, totalSlides]);

  if (totalSlides === 0) {
    return (
      <div className="rounded-3xl bg-gradient-to-br from-white/95 via-secondary/40 to-white/95 p-8 border border-gold/20 shadow-elegant min-h-[350px] flex items-center justify-center">
        <div className="font-serif text-lg text-primary-deep/60 animate-pulse">
          Chargement de la sélection Al Kareem...
        </div>
      </div>
    );
  }

  const currentProduct = featuredItems[activeIndex] ?? featuredItems[0];

  const goToPrev = () => {
    setActiveIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % totalSlides);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) goToNext();
      else goToPrev();
    }
    setTouchStartX(null);
  };

  return (
    <div
      className="relative mx-auto max-w-7xl overflow-hidden pt-2"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6 md:mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-gold font-semibold mb-1">
            <Crown className="h-3.5 w-3.5" />
            <span>Sélection d'Exception à Cotonou</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-primary-deep tracking-tight">
            Les Incontournables de la Maison
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-xl">
            Flacons authentiques en stock immédiatement en boutique à Cotonou.
          </p>
        </div>

        <Link
          to="/boutique"
          className="hidden sm:inline-flex items-center gap-2 self-start md:self-end rounded-full bg-primary-deep text-primary-foreground px-5 py-2.5 text-xs sm:text-sm font-semibold hover:bg-primary transition-all shadow-md hover:scale-105 whitespace-nowrap"
        >
          <span>Parcourir toute la boutique</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div
        className="relative rounded-3xl bg-gradient-to-br from-white via-secondary/30 to-white p-4 sm:p-6 lg:p-8 border border-gold/30 shadow-elegant"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="grid gap-6 lg:grid-cols-12 items-center min-h-[380px] sm:min-h-[420px]">
          <div className="lg:col-span-5 relative group overflow-hidden rounded-2xl aspect-square bg-muted/20 border border-gold/20 shadow-soft">
            <img
              src={currentProduct.image}
              alt={currentProduct.name}
              width={600}
              height={600}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent pointer-events-none" />

            <button
              type="button"
              onClick={goToPrev}
              aria-label="Article précédent"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/20 flex items-center justify-center shadow-lg hover:bg-black/75 hover:scale-110 active:scale-90 transition-all cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              aria-label="Article suivant"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/20 flex items-center justify-center shadow-lg hover:bg-black/75 hover:scale-110 active:scale-90 transition-all cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 pointer-events-none z-10">
              {currentProduct.promo ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-destructive text-white text-xs font-semibold shadow-sm">
                  <Flame className="h-3 w-3" /> Offre Spéciale
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-deep/90 backdrop-blur-md text-white text-xs font-medium border border-gold/40 shadow-sm">
                  <Sparkles className="h-3 w-3 text-gold" /> Flacon Authentique
                </span>
              )}
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white pointer-events-none z-10">
              <span className="text-xs uppercase tracking-widest text-white/80 font-medium">
                {currentProduct.volume ? currentProduct.volume : "Prix boutique"}
              </span>
              <div className="flex items-baseline gap-2 bg-black/60 px-3.5 py-1.5 rounded-full backdrop-blur-md border border-white/20 shadow-md">
                <span className="text-base sm:text-lg font-bold text-white">
                  {formatFCFA(currentProduct.price)}
                </span>
                {currentProduct.oldPrice && (
                  <span className="text-xs text-white/70 line-through">
                    {formatFCFA(currentProduct.oldPrice)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-center px-1 sm:px-6 space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-primary font-semibold">
              <span>{currentProduct.category || "Parfumerie d'Exception"}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              <span className="text-muted-foreground">Disponible à Cotonou</span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl text-primary-deep leading-tight font-medium">
              {currentProduct.name}
            </h3>

            {currentProduct.description ? (
              <p className="text-sm sm:text-base text-foreground/85 leading-relaxed line-clamp-3">
                {currentProduct.description}
              </p>
            ) : (
              <p className="text-sm sm:text-base text-foreground/85 leading-relaxed">
                Création emblématique sélectionnée avec exigence pour révéler votre présence et laisser un sillage inoubliable.
              </p>
            )}

            <div className="pt-2 space-y-3">
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary-deep font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Testé en boutique
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary-deep font-medium">
                  <Truck className="h-3.5 w-3.5 text-primary" /> Livraison Express Cotonou
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    addItem(currentProduct);
                    toast.success(`${currentProduct.name} ajouté à votre panier ✨`);
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary-deep text-primary-foreground px-6 py-3.5 text-sm font-semibold hover:bg-primary transition-all shadow-md active:scale-95 text-center cursor-pointer"
                >
                  <ShoppingBag className="h-4 w-4 text-gold shrink-0" />
                  <span>Ajouter au panier</span>
                </button>

                <a
                  href={whatsappLink(
                    `Bonjour Al Kareem Parfumerie, je souhaite commander le parfum "${currentProduct.name}" à ${formatFCFA(currentProduct.price)} 🌸`,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-whatsapp text-whatsapp-foreground px-6 py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity shadow-md active:scale-95 text-center cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4 shrink-0" />
                  <span>Commander sur WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="pt-1">
              <Link
                to="/produit/$slug"
                params={{ slug: currentProduct.slug }}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:text-primary-deep transition-colors group"
              >
                <span>Fiche détaillée du parfum</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border flex items-center justify-between gap-4">
          <span className="text-xs font-medium text-muted-foreground">
            Modèle {activeIndex + 1} sur {totalSlides}
          </span>
          <div className="flex items-center gap-1.5">
            {featuredItems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                aria-label={`Aller au parfum ${idx + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === activeIndex
                    ? "w-8 bg-primary-deep"
                    : "w-2.5 bg-primary/20 hover:bg-primary/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 2. DIAGNOSTIC OLFACTIF INTERACTIF (Inspiration Le Labo & Byredo)
 */
export function ScentFinderSection({ products }: { products: Product[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categoryOptions = [
    { id: "all", label: "Toutes les créations", slug: "" },
    { id: "parfums", label: "Parfums d'Exception", slug: "parfums" },
    { id: "deodorants", label: "Déodorants de Luxe", slug: "deodorants" },
    { id: "huiles", label: "Huiles Concentrées", slug: "huiles-concentrees" },
    { id: "unisexe", label: "Senteurs Unisexe", slug: "senteurs-unisexe" },
    { id: "brumes", label: "Brumes & Sprays", slug: "brumes-sprays-corporels" },
    { id: "coffrets", label: "Coffrets Cadeaux", slug: "coffrets-cadeaux" },
  ];

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "all") return products.slice(0, 4);
    const opt = categoryOptions.find((c) => c.id === selectedCategory);
    if (!opt || !opt.slug) return products.slice(0, 4);
    const matches = products.filter((p) => p.categorySlug === opt.slug || p.category.toLowerCase().includes(opt.id));
    return matches.length > 0 ? matches.slice(0, 4) : products.slice(0, 4);
  }, [products, selectedCategory]);

  return (
    <section className="bg-gradient-to-b from-secondary/40 via-white to-white py-16 md:py-24 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-gold/30 text-xs font-semibold text-gold uppercase tracking-widest shadow-xs">
            <Compass className="h-3.5 w-3.5" />
            <span>Guide & Diagnostic Olfactif</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-primary-deep tracking-tight">
            Trouvez la Fragrance qui Répond à votre Aura
          </h2>
          <p className="text-sm text-foreground/80 leading-relaxed">
            Filtrez nos références en boutique pour découvrir le parfum qui vous correspond.
          </p>
        </div>

        {/* Boutons de filtres interactifs */}
        <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto mb-10">
          {categoryOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedCategory(opt.id)}
              className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                selectedCategory === opt.id
                  ? "bg-primary-deep text-white shadow-sm ring-2 ring-gold/40"
                  : "bg-white text-foreground/80 border border-border hover:border-primary/40 hover:bg-secondary/60"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Grille de 4 cartes recommandées */}
        <div className="mt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group relative flex flex-col rounded-2xl bg-white p-3 border border-border/80 shadow-xs hover:shadow-md transition-all"
              >
                <Link to="/produit/$slug" params={{ slug: product.slug }} className="block aspect-square overflow-hidden rounded-xl bg-muted/30">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
                <div className="mt-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {product.category || "Parfum"}
                    </div>
                    <h4 className="font-serif text-sm sm:text-base font-medium text-primary-deep line-clamp-1">
                      {product.name}
                    </h4>
                  </div>
                  <div className="mt-2 flex items-center justify-between pt-2 border-t border-border/60">
                    <span className="text-xs sm:text-sm font-bold text-primary-deep">
                      {formatFCFA(product.price)}
                    </span>
                    <Link
                      to="/produit/$slug"
                      params={{ slug: product.slug }}
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
                    >
                      Voir <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/boutique"
              search={selectedCategory !== "all" ? { category: categoryOptions.find(c => c.id === selectedCategory)?.slug } : undefined}
              className="inline-flex items-center gap-2 rounded-full bg-primary-deep text-white px-7 py-3 text-xs sm:text-sm font-semibold hover:bg-primary transition-all shadow-md hover:scale-105"
            >
              <span>Voir tous ces modèles dans la boutique</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * 3. GRILLE DES UNIVERS OLFACTIFS & CATÉGORIES (VRAIS LIENS FONCTIONNELS VERS LA BOUTIQUE)
 */
export function CategoryShowcaseSection({ categories }: { categories: Category[] }) {
  // Liste officielle des univers olfactifs avec leurs slugs correspondant en base de données
  const defaultCategories = [
    { name: "Parfums d'Exception", slug: "parfums", desc: "Grandes créations de marques renommées & jus rares", badge: "Incontournables" },
    { name: "Huiles Concentrées & Attars", slug: "huiles-concentrees", desc: "Huiles pures sans alcool à la tenue intense et raffinée", badge: "Pureté" },
    { name: "Senteurs Unisexe", slug: "senteurs-unisexe", desc: "Notes mixtes audacieuses et équilibrées", badge: "Tendance" },
    { name: "Brumes & Sprays Corporels", slug: "brumes-sprays-corporels", desc: "Fraîcheur quotidienne légère et captivante", badge: "Fraîcheur" },
    { name: "Déodorants de Luxe", slug: "deodorants", desc: "Protection parfumée haut de gamme au quotidien", badge: "Soin" },
    { name: "Coffrets Cadeaux", slug: "coffrets-cadeaux", desc: "L'art d'offrir dans des écrins de prestige", badge: "Exclusif" },
  ];

  const catsToDisplay = categories.length > 0 ? categories : defaultCategories;

  return (
    <section className="py-16 md:py-24 bg-white border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-xs uppercase tracking-widest text-gold font-semibold mb-2">
              Explorez nos Univers
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-primary-deep tracking-tight">
              Nos Catégories Olfactives
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Cliquez sur une catégorie pour afficher directement ses parfums dans la boutique.
            </p>
          </div>
          <Link
            to="/boutique"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-deep"
          >
            <span>Toute la boutique</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {catsToDisplay.map((cat, idx) => {
            const catSlug = cat.slug || defaultCategories[idx % defaultCategories.length].slug;
            const catBadge = "badge" in cat ? (cat as any).badge : "Collection";
            const catDesc = "desc" in cat ? (cat as any).desc : "Sélection soignée de parfums et senteurs authentiques.";

            return (
              <Link
                key={cat.id || cat.slug || idx}
                to="/boutique"
                search={{ category: catSlug }}
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary/80 via-white to-secondary/30 p-7 border border-gold/25 shadow-xs hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between min-h-[210px] cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
                
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-white text-primary-deep text-[11px] font-semibold border border-gold/30 shadow-xs">
                      {catBadge}
                    </span>
                    <Sparkles className="h-4 w-4 text-gold opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="font-serif text-2xl text-primary-deep group-hover:text-primary transition-colors font-medium">
                    {cat.name}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-foreground/75 leading-relaxed">
                    {catDesc}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-2 text-xs font-bold text-primary group-hover:text-primary-deep">
                  <span>Découvrir les parfums de cette catégorie</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const ENGAGEMENTS = [
  {
    icon: Sparkles,
    title: "Parfums Sélectionnés avec Exigence",
    desc: "Chaque référence est minutieusement choisie, sentie et testée en boutique avant d'être proposée.",
  },
  {
    icon: BadgeCheck,
    title: "100% Qualité & Authenticité",
    desc: "Flacons scellés et garantis d'origine. Packagings officiels contrôlés.",
  },
  {
    icon: HeartHandshake,
    title: "Conseil Privé Olfactif",
    desc: "Notre équipe vous oriente selon vos préférences pour trouver votre signature unique.",
  },
  {
    icon: Truck,
    title: "Livraison Express Bénin",
    desc: "Expédition rapide à Cotonou, Calavi, Porto-Novo et dans toutes les communes du Bénin.",
  },
];

/**
 * 4. SECTION CONFIANCE, AVIS & PREUVES D'AUTHENTICITÉ (Inspiration Chanel & Creed)
 */
export function TrustSection() {
  const { data: proofs = [] } = useQuery({
    queryKey: ["authenticity-proofs"],
    queryFn: fetchProofs,
  });
  const { data: testimonials = [] } = useQuery({
    queryKey: ["testimonials"],
    queryFn: fetchTestimonials,
  });

  return (
    <section className="bg-white border-y border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-16">
        <div>
          <div className="text-xs uppercase tracking-widest text-gold font-semibold mb-2">
            La Garantie Al Kareem
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-primary-deep">
            L'Excellence & la Confiance
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ENGAGEMENTS.map((e) => (
              <div
                key={e.title}
                className="rounded-2xl bg-secondary/60 p-6 border border-primary/5 hover:border-gold/30 hover:shadow-soft transition-all"
              >
                <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-primary-deep shadow-sm">
                  <e.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="mt-4 font-semibold text-foreground text-sm sm:text-base">
                  {e.title}
                </div>
                <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {e.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {proofs.length > 0 && (
          <div>
            <div className="flex items-end justify-between mb-6">
              <div>
                <h3 className="font-serif text-2xl sm:text-3xl text-primary-deep">
                  Preuves d'Authenticité
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Photos réelles de nos flacons, emballages scellés et étiquettes officielles.
                </p>
              </div>
              <Link
                to="/boutique"
                className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-deep"
              >
                Commander ces modèles <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              {proofs.slice(0, 8).map((p) => (
                <figure
                  key={p.id}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-hero border border-border"
                >
                  <img
                    src={p.image_url}
                    alt={p.caption || "Preuve d'authenticité Al Kareem"}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {p.caption && (
                    <figcaption className="px-3 py-2 text-xs text-muted-foreground bg-white border-t border-border">
                      {p.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </div>
        )}

        {testimonials.length > 0 && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <div className="text-xs uppercase tracking-widest text-gold font-semibold mb-1">
                  Avis Vérifiés
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl text-primary-deep">
                  Ce que nos clients disent
                </h3>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent text-primary-deep text-xs font-semibold">
                <ShieldCheck className="h-4 w-4 text-whatsapp" /> 4.9/5 satisfaction client
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <blockquote
                  key={t.id}
                  className="rounded-2xl border border-border bg-white p-6 shadow-sm hover:shadow-md transition-shadow relative"
                >
                  <Quote className="h-6 w-6 text-primary/20 mb-2" />
                  <p className="text-sm text-foreground/80 leading-relaxed italic">
                    "{t.message}"
                  </p>
                  <footer className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-primary-deep">{t.name}</span>
                    {t.rating ? (
                      <span className="flex items-center gap-0.5" aria-label={`${t.rating} sur 5`}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < t.rating!
                                ? "fill-gold text-gold"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </span>
                    ) : null}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
