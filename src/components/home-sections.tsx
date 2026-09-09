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

const AUTOPLAY_MS = 4000;

/**
 * Carrousel signature : fait défiler les vrais produits de la boutique
 * avec leurs vraies photos, vrais noms et vrais prix officiels.
 */
export function RotatingSelection({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const { addItem } = useCart();
  const reduced = usePrefersReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Filtrer les vrais produits de la boutique avec photo réelle et en stock
  const featuredItems = useMemo(() => {
    if (!products || products.length === 0) return [];
    const withRealImages = products.filter(
      (p) => p.inStock && p.image && !p.image.includes("data:image/svg"),
    );
    return withRealImages.length >= 4 ? withRealImages.slice(0, 6) : products.slice(0, 4);
  }, [products]);

  const totalSlides = featuredItems.length;

  // Défilement automatique continu des vrais articles
  useEffect(() => {
    if (reduced || isPaused || totalSlides <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalSlides);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [reduced, isPaused, totalSlides]);

  if (totalSlides === 0) {
    return (
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24 overflow-hidden">
        <div className="rounded-3xl bg-gradient-to-br from-white/95 via-secondary/40 to-white/95 p-8 border border-gold/20 shadow-elegant min-h-[400px] flex items-center justify-center">
          <div className="font-serif text-lg text-primary-deep/60 animate-pulse">
            Chargement de la sélection Al Kareem...
          </div>
        </div>
      </section>
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
    <section
      className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* En-tête de section avec orientation claire vers la boutique */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 md:mb-14">
        <div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-primary-deep tracking-tight">
            Les Coups de Cœur de la Boutique
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-xl">
            Découvrez nos flacons réels les plus plébiscités. Tous sont disponibles immédiatement à
            la commande dans notre boutique.
          </p>
        </div>

        {/* Bouton vers toute la collection */}
        <Link
          to="/boutique"
          className="inline-flex items-center gap-2 self-start md:self-end rounded-full bg-primary-deep text-primary-foreground px-5 sm:px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold hover:bg-primary transition-all shadow-elegant hover:scale-105 whitespace-nowrap"
        >
          <span className="hidden sm:inline">Voir toute la boutique (100 parfums)</span>
          <span className="sm:hidden">Boutique (100 parfums)</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Le Carrousel interactif des vrais produits */}
      <div
        className="relative rounded-3xl bg-gradient-to-br from-white/95 via-secondary/40 to-white/95 p-4 sm:p-6 lg:p-8 border border-gold/20 shadow-elegant"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Contrôles de navigation flèches */}
        <button
          onClick={goToPrev}
          aria-label="Article précédent"
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/90 border border-primary/20 text-primary-deep flex items-center justify-center shadow-lg hover:bg-primary hover:text-white transition-all hover:scale-110 active:scale-95"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        <button
          onClick={goToNext}
          aria-label="Article suivant"
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/90 border border-primary/20 text-primary-deep flex items-center justify-center shadow-lg hover:bg-primary hover:text-white transition-all hover:scale-110 active:scale-95"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        {/* Vue Slide active en grand format */}
        <div className="grid gap-6 lg:grid-cols-12 items-center min-h-[380px] sm:min-h-[420px]">
          {/* Vraie Image du produit en boutique */}
          <div className="lg:col-span-5 relative group overflow-hidden rounded-2xl aspect-square bg-muted/30">
            <img
              src={currentProduct.image}
              alt={currentProduct.name}
              width={600}
              height={600}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Badge flottant réel */}
            <div className="absolute top-4 left-4 flex gap-1.5">
              {currentProduct.promo ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-destructive text-white text-xs font-semibold shadow-sm">
                  <Flame className="h-3 w-3" /> Promotion
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-deep/90 backdrop-blur-md text-white text-xs font-medium border border-gold/40 shadow-sm">
                  <Sparkles className="h-3 w-3 text-gold" /> Flacon Authentique
                </span>
              )}
            </div>

            {/* Pastille du vrai prix en boutique */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
              <span className="text-xs uppercase tracking-widest text-white/80">
                {currentProduct.volume ? currentProduct.volume : "Prix boutique"}
              </span>
              <div className="flex items-baseline gap-2 bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20">
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

          {/* Description & Vrais Call to Action vers la boutique */}
          <div className="lg:col-span-7 flex flex-col justify-center px-2 sm:px-6 space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-primary font-semibold">
              <span>{currentProduct.category || "Parfumerie d'Exception"}</span>
              <span className="h-1 w-1 rounded-full bg-gold" />
              <span className="text-muted-foreground">En stock à Cotonou</span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl text-primary-deep leading-tight font-medium">
              {currentProduct.name}
            </h3>

            {currentProduct.description ? (
              <p className="text-sm sm:text-base text-foreground/80 leading-relaxed line-clamp-3">
                {currentProduct.description}
              </p>
            ) : (
              <p className="text-sm sm:text-base text-foreground/80 leading-relaxed">
                Fragrance d'exception sélectionnée avec soin par Al Kareem Parfumerie. Disponible
                immédiatement avec livraison express à Cotonou et partout au Bénin.
              </p>
            )}

            {/* Groupe de boutons d'action concrets */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5 sm:gap-3">
              <Link
                to="/produit/$slug"
                params={{ slug: currentProduct.slug }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-deep text-primary-foreground px-5 sm:px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold hover:bg-primary transition-all shadow-elegant whitespace-nowrap"
              >
                <span>Commander ce parfum</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <button
                onClick={() => {
                  addItem(currentProduct);
                  toast.success(`${currentProduct.name} ajouté au panier`);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/30 bg-white text-primary-deep px-4 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold hover:bg-primary hover:text-white transition-colors whitespace-nowrap"
              >
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">Ajouter au panier</span>
                <span className="sm:hidden">Ajouter</span>
              </button>

              <a
                href={whatsappLink(
                  `Bonjour Al Kareem, je souhaite commander le parfum "${currentProduct.name}" à ${formatFCFA(currentProduct.price)} 🌸`,
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-whatsapp text-whatsapp-foreground px-4 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Lien direct pour découvrir l'ensemble du catalogue en boutique */}
            <div className="pt-1">
              <Link
                to="/boutique"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-primary hover:text-primary-deep transition-colors group"
              >
                <span>Explorer l'ensemble des 100 parfums en boutique</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Onglets miniatures des vrais produits en bas du carrousel */}
        <div className="mt-8 pt-6 border-t border-border grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {featuredItems.map((item, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={item.id}
                onClick={() => setActiveIndex(idx)}
                className={`group text-left p-2 rounded-xl transition-all flex items-center gap-2.5 border ${
                  isActive
                    ? "bg-white border-primary-deep/50 shadow-soft ring-2 ring-primary-deep/20"
                    : "bg-white/50 border-transparent hover:bg-white"
                }`}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-10 w-10 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0">
                  <div
                    className={`text-xs font-semibold truncate ${
                      isActive ? "text-primary-deep" : "text-foreground"
                    }`}
                  >
                    {item.name}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {formatFCFA(item.price)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Indicateurs de progression (Dots) */}
        <div className="mt-5 flex items-center justify-center gap-2">
          {featuredItems.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              aria-label={`Aller au parfum ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === activeIndex
                  ? "w-8 bg-primary-deep"
                  : "w-2 bg-primary/20 hover:bg-primary/40"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bannière de conversion intermédiaire invitant à visiter la boutique */}
      <div className="mt-10 rounded-2xl bg-gradient-primary text-primary-foreground p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-elegant">
        <div className="space-y-1 text-center md:text-left">
          <div className="text-xs uppercase tracking-widest text-gold font-semibold">
            Catalogue Réel & Disponible
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl text-white">
            Trouvez votre parfum idéal parmi notre sélection
          </h3>
          <p className="text-xs sm:text-sm text-primary-foreground/80 max-w-xl">
            Eaux de parfum authentiques, huiles concentrées et déodorants soignés. Livraison rapide
            à Cotonou, Calavi et dans tout le Bénin.
          </p>
        </div>
        <Link
          to="/boutique"
          className="shrink-0 inline-flex items-center gap-2 rounded-full bg-white text-primary-deep px-6 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold hover:bg-accent transition-all shadow-lg hover:scale-105 whitespace-nowrap"
        >
          <span>Accéder à la boutique (100 parfums)</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

const ENGAGEMENTS = [
  {
    icon: Sparkles,
    title: "Parfums Sélectionnés avec Soin",
    desc: "Chaque référence est choisie, sentie et testée en boutique avant d'entrer en catalogue.",
  },
  {
    icon: BadgeCheck,
    title: "100% Qualité & Authenticité",
    desc: "Packagings et étiquettes minutieusement contrôlés. Flacons scellés et garantis d'origine.",
  },
  {
    icon: HeartHandshake,
    title: "Conseil Privé Personnalisé",
    desc: "Notre équipe vous conseille selon votre style, vos goûts et les occasions pour trouver votre sillage.",
  },
  {
    icon: Truck,
    title: "Livraison Express Bénin",
    desc: "Expédition rapide à Cotonou, Calavi, Porto-Novo et dans toutes les villes du Bénin.",
  },
];

/** Engagements + preuves d'authenticité + témoignages clients. */
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
        {/* Piliers d'authenticité */}
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

        {/* Preuves d'authenticité avec photos réelles */}
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

        {/* Témoignages clients avec notes 5 étoiles */}
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
