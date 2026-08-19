import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/product-card";
import type { Category, Product } from "@/lib/catalog";
import { fetchProofs, fetchTestimonials } from "@/lib/vitrine";
import { ArrowRight, BadgeCheck, Sparkles, HeartHandshake, Star, Quote } from "lucide-react";

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

const ROTATE_MS = 6500;

/**
 * Une carte produit par catégorie ; la sélection tourne en boucle.
 * Rotation désactivée si prefers-reduced-motion est actif.
 */
export function RotatingSelection({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const reduced = usePrefersReducedMotion();
  const [tick, setTick] = useState(0);
  const [fading, setFading] = useState(false);

  const byCategory = useMemo(() => {
    return categories
      .map((c) => ({
        category: c,
        items: products.filter((p) => p.categorySlug === c.slug && p.inStock),
      }))
      .filter((g) => g.items.length > 0);
  }, [products, categories]);

  const rotatable = byCategory.some((g) => g.items.length > 1);

  useEffect(() => {
    if (reduced || !rotatable) return;
    const id = window.setInterval(() => {
      setFading(true);
      window.setTimeout(() => {
        setTick((t) => t + 1);
        setFading(false);
      }, 350);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [reduced, rotatable]);

  if (byCategory.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
      <div className="flex items-end justify-between mb-10">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary mb-2">
            Un choix par univers
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-primary-deep">Notre sélection</h2>
        </div>
        <Link
          to="/boutique"
          className="hidden sm:inline-flex items-center gap-1 text-sm text-primary hover:text-primary-deep"
        >
          Tout voir <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 transition-opacity duration-300 motion-reduce:transition-none"
        style={{ opacity: fading ? 0.25 : 1 }}
      >
        {byCategory.map((g) => {
          const p = g.items[tick % g.items.length];
          return (
            <div key={g.category.id} className="flex flex-col">
              <ProductCard product={p} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

const ENGAGEMENTS = [
  {
    icon: Sparkles,
    title: "Parfums sélectionnés avec soin",
    desc: "Chaque référence est choisie et sentie avant d'entrer en boutique.",
  },
  {
    icon: BadgeCheck,
    title: "Qualité vérifiée",
    desc: "Packaging et étiquettes contrôlés, tenue et sillage testés.",
  },
  {
    icon: HeartHandshake,
    title: "Conseil personnalisé",
    desc: "On vous aide à trouver la fragrance qui vous ressemble vraiment.",
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-12 md:space-y-16">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary mb-2">Nos engagements</div>
          <h2 className="font-serif text-3xl md:text-4xl text-primary-deep">
            Authenticité garantie
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ENGAGEMENTS.map((e) => (
              <div key={e.title} className="rounded-2xl bg-secondary p-6">
                <div className="h-11 w-11 rounded-full bg-white flex items-center justify-center text-primary-deep">
                  <e.icon className="h-5 w-5" />
                </div>
                <div className="mt-4 font-medium text-foreground">{e.title}</div>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{e.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {proofs.length > 0 && (
          <div>
            <h3 className="font-serif text-2xl text-primary-deep">Preuves d'authenticité</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Nos flacons, packagings et étiquettes en photo.
            </p>
            <div className="mt-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
              {proofs.slice(0, 8).map((p) => (
                <figure key={p.id} className="overflow-hidden rounded-2xl bg-gradient-hero">
                  <img
                    src={p.image_url}
                    alt={p.caption || "Preuve d'authenticité Al Kareem"}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full aspect-square object-cover"
                  />
                  {p.caption && (
                    <figcaption className="px-3 py-2 text-xs text-muted-foreground bg-white">
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
            <h3 className="font-serif text-2xl text-primary-deep">Témoignages clients</h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <blockquote
                  key={t.id}
                  className="rounded-2xl border border-border bg-secondary/50 p-6"
                >
                  <Quote className="h-5 w-5 text-primary/50" />
                  <p className="mt-3 text-sm text-foreground/80 leading-relaxed">{t.message}</p>
                  <footer className="mt-4 flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-primary-deep">{t.name}</span>
                    {t.rating ? (
                      <span className="flex items-center gap-0.5" aria-label={`${t.rating} sur 5`}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${i < t.rating! ? "fill-primary text-primary" : "text-muted-foreground/40"}`}
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
