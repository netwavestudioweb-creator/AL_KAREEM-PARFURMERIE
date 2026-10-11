import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/layout";
import { ProductCard } from "@/components/product-card";
import {
  fetchCategories,
  fetchProductBySlug,
  fetchProducts,
  formatFCFA,
  whatsappLink,
} from "@/lib/products";
import { useCart } from "@/lib/cart";
import { useEffect, useRef, useState } from "react";
import { trackProductView, trackAddToCart, trackWhatsAppClick } from "@/lib/analytics";
import {
  ChevronDown,
  MessageCircle,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { SITE_CONFIG, getCanonicalUrl } from "@/lib/site-config";
import { jsonLd } from "@/lib/json-ld";

export const Route = createFileRoute("/parfum/$slug")({
  loader: async ({ params, context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: ["product", params.slug],
        queryFn: () => fetchProductBySlug(params.slug),
      }),
      // Utilisées par l'en-tête : évite un appel supplémentaire côté navigateur.
      context.queryClient.ensureQueryData({ queryKey: ["categories"], queryFn: fetchCategories }),
    ]);
    return (
      context.queryClient.getQueryData<Awaited<ReturnType<typeof fetchProductBySlug>>>([
        "product",
        params.slug,
      ]) ?? null
    );
  },
  head: ({ params, loaderData }) => {
    const p = loaderData ?? null;
    const title = p
      ? `${p.name} ${SITE_CONFIG.name} — Prix ${formatFCFA(p.price)} | Al Kareem Parfumerie Cotonou`
      : `${params.slug} — ${SITE_CONFIG.name}`;
    const rawDesc =
      p?.description ||
      `${p?.name || params.slug} chez Al Kareem Parfumerie Cotonou. Commandez en ligne et faites-vous livrer au Bénin et dans la sous-région.`;
    const desc = rawDesc.length > 155 ? `${rawDesc.slice(0, 152)}...` : rawDesc;
    const image = p?.largeImages?.[0] ?? p?.images?.[0];
    const url = getCanonicalUrl(`/parfum/${params.slug}`);
    const share = image && /^https?:\/\//.test(image) ? image : SITE_CONFIG.ogImageUrl;

    const meta = [
      { title },
      { name: "description", content: desc },
      { property: "og:site_name", content: SITE_CONFIG.name },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "product" },
      { property: "og:url", content: url },
      { property: "og:image", content: share },
      { property: "og:image:secure_url", content: share },
      ...(share !== SITE_CONFIG.ogImageUrl
        ? [
            { property: "og:image:width", content: "900" },
            { property: "og:image:height", content: "900" },
          ]
        : []),
      {
        property: "og:image:alt",
        content: p ? `${p.name} — Al Kareem Parfumerie` : SITE_CONFIG.name,
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: desc },
      { name: "twitter:image", content: share },
    ];

    const scripts: { type: string; children: string }[] = [];

    if (p) {
      scripts.push({
        type: "application/ld+json",
        children: jsonLd({
          "@context": "https://schema.org",
          "@type": "Product",
          name: p.name,
          image: p.images && p.images.length > 0 ? p.images : [share],
          description: p.description || desc,
          sku: p.id || params.slug,
          brand: {
            "@type": "Brand",
            name: SITE_CONFIG.name,
          },
          offers: {
            "@type": "Offer",
            url: url,
            priceCurrency: SITE_CONFIG.currency,
            price: p.price,
            availability: p.inStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: {
              "@type": "Organization",
              name: SITE_CONFIG.name,
            },
          },
        }),
      });

      scripts.push({
        type: "application/ld+json",
        children: jsonLd({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Accueil",
              item: SITE_CONFIG.url,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Boutique",
              item: `${SITE_CONFIG.url}/boutique`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: p.name,
              item: url,
            },
          ],
        }),
      });
    }

    return {
      meta,
      links: [{ rel: "canonical", href: url }],
      scripts,
    };
  },
  component: ProductPage,
});

const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><rect width='400' height='400' fill='%23F5F0E8'/><text x='50%25' y='50%25' font-family='serif' font-size='28' fill='%236B2FA0' text-anchor='middle' dominant-baseline='middle'>Al Kareem</text></svg>";

const LONG_DESCRIPTION = 280;

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug),
  });
  const { data: all = [] } = useQuery({ queryKey: ["products"], queryFn: () => fetchProducts() });
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [descOpen, setDescOpen] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);
  const mainCtaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (product) trackProductView(product);
    setQty(1);
    setActiveImg(0);
    setDescOpen(false);
    galleryRef.current?.scrollTo({ left: 0 });
  }, [product]);

  // La barre d'achat collante n'apparaît que lorsque le bouton principal sort de l'écran.
  useEffect(() => {
    const el = mainCtaRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setShowStickyBar(!entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, [product]);

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="mx-auto grid max-w-[1320px] gap-8 px-4 py-6 lg:grid-cols-2 lg:px-8">
          <div className="aspect-square animate-pulse rounded-2xl bg-secondary" />
          <div className="space-y-4">
            <div className="h-4 w-1/4 animate-pulse rounded bg-secondary" />
            <div className="h-10 w-3/4 animate-pulse rounded bg-secondary" />
            <div className="h-6 w-1/3 animate-pulse rounded bg-secondary" />
          </div>
        </div>
      </SiteLayout>
    );
  }
  if (!product) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-7xl px-4 py-24 text-center">
          <h1 className="font-serif text-3xl text-primary-deep">Parfum introuvable</h1>
          <p className="mt-2 text-muted-foreground">
            Ce parfum n'existe pas ou n'est plus disponible au catalogue.
          </p>
          <Link
            to="/boutique"
            className="mt-6 inline-block rounded-full bg-primary-deep px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary"
          >
            Retour à la boutique
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const images = product.largeImages.length > 0 ? product.largeImages : [product.image];
  const sameCategory = all.filter(
    (p) => p.id !== product.id && p.inStock && p.categorySlug === product.categorySlug,
  );
  const others = all.filter(
    (p) => p.id !== product.id && p.inStock && p.categorySlug !== product.categorySlug,
  );
  const related = [...sameCategory, ...others].slice(0, 4);

  const waMessage = product.inStock
    ? `Bonjour Al Kareem, je souhaite commander : ${product.name}${product.volume ? ` (${product.volume})` : ""} × ${qty} — ${formatFCFA(product.price * qty)}.`
    : `Bonjour Al Kareem, quand le parfum ${product.name} sera-t-il à nouveau disponible ?`;
  const isLongDescription = product.description.length > LONG_DESCRIPTION;

  const addToCart = () => {
    if (!product.inStock) return;
    addItem(product, qty);
    trackAddToCart(product, qty);
    toast.success(`${product.name} ajouté au panier`, {
      action: { label: "Voir le panier", onClick: () => (window.location.href = "/panier") },
    });
  };

  const onGalleryScroll = () => {
    const el = galleryRef.current;
    if (!el) return;
    setActiveImg(Math.round(el.scrollLeft / el.clientWidth));
  };
  const showImage = (i: number) => {
    setActiveImg(i);
    const el = galleryRef.current;
    el?.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  const summary =
    "flex cursor-pointer list-none items-center justify-between text-sm font-semibold uppercase tracking-[0.06em]";
  const panelText = "mt-3 text-[14.5px] leading-relaxed text-foreground/80";

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1320px] lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14 lg:px-8 lg:pt-6">
        {/* Galerie */}
        <div className="lg:sticky lg:top-40 lg:self-start">
          <div className="relative bg-secondary lg:overflow-hidden lg:rounded-2xl">
            <div
              ref={galleryRef}
              onScroll={onGalleryScroll}
              className="scrollbar-none flex aspect-square snap-x snap-mandatory overflow-x-auto"
            >
              {images.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt={i === 0 ? product.name : `${product.name} — photo ${i + 1}`}
                  width={900}
                  height={900}
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "auto"}
                  decoding="async"
                  onError={(e) => {
                    const img = e.currentTarget;
                    const raw = product.rawImage;
                    img.src = i === 0 && raw && img.src !== raw ? raw : FALLBACK_IMAGE;
                  }}
                  className={`h-full w-full shrink-0 snap-center object-cover ${product.inStock ? "" : "opacity-70 grayscale-[30%]"}`}
                />
              ))}
            </div>
            <div className="absolute left-3.5 top-3.5 flex flex-col items-start gap-1.5">
              {product.oldPrice && (
                <span className="rounded-full bg-primary-deep px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
                  −{Math.round((1 - product.price / product.oldPrice) * 100)} %
                </span>
              )}
              {!product.inStock && (
                <span className="rounded-full bg-foreground/85 px-2.5 py-1 text-[11px] font-semibold text-background">
                  Épuisé
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div
                className="absolute inset-x-0 bottom-3.5 flex justify-center gap-1.5 lg:hidden"
                aria-hidden
              >
                {images.map((src, i) => (
                  <span
                    key={src}
                    className={`block h-1.5 rounded-full transition-all ${i === activeImg ? "w-[18px] bg-primary-deep" : "w-1.5 bg-primary-deep/30"}`}
                  />
                ))}
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 px-4 pt-2.5 lg:px-0 lg:pt-3">
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => showImage(i)}
                  aria-label={`Voir la photo ${i + 1}`}
                  aria-current={i === activeImg}
                  className={`h-[60px] w-[60px] overflow-hidden rounded-[10px] lg:h-20 lg:w-20 ${i === activeImg ? "ring-2 ring-primary-deep" : "border border-border opacity-80 hover:opacity-100"}`}
                >
                  <img
                    src={product.images[i] ?? src}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Infos */}
        <div className="px-4 pt-5 lg:px-0 lg:pt-0">
          <nav
            aria-label="Fil d'Ariane"
            className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
          >
            <Link to="/boutique" className="hover:text-primary">
              Boutique
            </Link>
            {product.category && (
              <>
                <span aria-hidden>·</span>
                <Link
                  to="/boutique/$category"
                  params={{ category: product.categorySlug }}
                  className="hover:text-primary"
                >
                  {product.category}
                </Link>
              </>
            )}
          </nav>
          <h1 className="mt-2.5 font-serif text-[34px] font-medium leading-[1.05] lg:text-5xl">
            {product.name}
          </h1>
          {product.volume && (
            <p className="mt-1.5 text-[13.5px] text-muted-foreground">{product.volume}</p>
          )}

          <div className="mt-4 flex items-baseline gap-3">
            <span
              className={`text-2xl font-semibold lg:text-[28px] ${product.oldPrice ? "text-primary" : ""}`}
            >
              {formatFCFA(product.price)}
            </span>
            {product.oldPrice && (
              <span className="text-base text-muted-foreground line-through">
                {formatFCFA(product.oldPrice)}
              </span>
            )}
          </div>
          <p
            className={`mt-2.5 flex items-center gap-2 text-[13px] font-semibold ${product.inStock ? "text-[oklch(0.45_0.12_150)]" : "text-muted-foreground"}`}
          >
            <span
              className={`block h-2 w-2 rounded-full ${product.inStock ? "bg-whatsapp" : "bg-muted-foreground"}`}
            />
            {product.inStock ? "En stock — prêt à livrer" : "Épuisé pour le moment"}
          </p>

          <div ref={mainCtaRef} className="mt-6 flex flex-col gap-3">
            {product.inStock && (
              <div className="flex gap-2.5">
                <div
                  role="group"
                  aria-label="Quantité"
                  className="flex h-[52px] items-center rounded-full border border-input bg-card"
                >
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    aria-label="Diminuer la quantité"
                    className="flex h-full w-11 items-center justify-center rounded-l-full hover:bg-secondary"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-7 text-center font-semibold" aria-live="polite">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(20, q + 1))}
                    aria-label="Augmenter la quantité"
                    className="flex h-full w-11 items-center justify-center rounded-r-full hover:bg-secondary"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={addToCart}
                  className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-full bg-primary-deep text-[15px] font-semibold text-primary-foreground hover:bg-primary"
                >
                  <ShoppingBag className="h-[18px] w-[18px]" /> Ajouter au panier
                </button>
              </div>
            )}
            <a
              href={whatsappLink(waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick("product_detail", product.price * qty)}
              className="flex h-[50px] items-center justify-center gap-2 rounded-full border border-whatsapp text-[14.5px] font-semibold text-[oklch(0.42_0.11_150)] hover:bg-whatsapp/5"
            >
              <MessageCircle className="h-[18px] w-[18px]" />
              {product.inStock
                ? "Commander directement sur WhatsApp"
                : "Me prévenir du retour en stock"}
            </a>
          </div>

          <ul className="mt-5 flex flex-col gap-3 rounded-[14px] border border-border bg-card p-4 text-[13.5px]">
            <li className="flex gap-2.5">
              <ShieldCheck className="h-[18px] w-[18px] shrink-0 text-primary" />
              Flacon 100 % authentique, vérifié en boutique
            </li>
            <li className="flex gap-2.5">
              <Wallet className="h-[18px] w-[18px] shrink-0 text-primary" />
              Payé à la réception : espèces, MTN MoMo, Moov Money
            </li>
            <li className="flex gap-2.5">
              <Truck className="h-[18px] w-[18px] shrink-0 text-primary" />
              Livraison Cotonou &amp; Abomey-Calavi sous 24-48 h
            </li>
          </ul>

          <div className="mt-5 border-t border-border">
            {product.description && (
              <details open className="group border-b border-border py-4">
                <summary className={summary}>
                  Description
                  <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                </summary>
                <p
                  className={`${panelText} whitespace-pre-line ${isLongDescription && !descOpen ? "line-clamp-4" : ""}`}
                >
                  {product.description}
                </p>
                {isLongDescription && (
                  <button
                    type="button"
                    onClick={() => setDescOpen((o) => !o)}
                    className="mt-2 text-[13px] font-semibold text-primary-deep underline underline-offset-4"
                  >
                    {descOpen ? "Réduire" : "Lire la suite"}
                  </button>
                )}
              </details>
            )}
            <details className="group border-b border-border py-4">
              <summary className={summary}>
                Livraison &amp; paiement
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <p className={panelText}>
                Votre commande est confirmée avec vous sur WhatsApp. Livraison à Cotonou et
                Abomey-Calavi sous 24-48 h, expédition dans tout le Bénin et dans la sous-région
                (délais et frais confirmés sur WhatsApp). Au Bénin, vous payez à la réception, en
                espèces ou par Mobile Money (MTN MoMo, Moov Money).
              </p>
            </details>
            <details className="group border-b border-border py-4">
              <summary className={summary}>
                Garantie d'authenticité
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <p className={panelText}>
                Chaque flacon est contrôlé avant la mise en vente. Vous pouvez demander des photos
                du produit réel avant la livraison sur WhatsApp.
              </p>
            </details>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mx-auto mt-10 max-w-[1320px] px-4 pb-28 lg:mt-20 lg:px-8 lg:pb-20">
          <h2 className="mb-4 font-serif text-[26px] font-medium text-primary-deep lg:mb-6 lg:text-4xl">
            {product.inStock ? "Vous aimerez aussi" : "Alternatives disponibles"}
          </h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 lg:grid-cols-4 lg:gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Barre d'achat collante (mobile), visible quand le bouton principal est hors écran */}
      {product.inStock && (
        <div
          className={`fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-border bg-card/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] shadow-[0_-8px_24px_rgba(42,24,56,0.08)] backdrop-blur-md transition-transform duration-300 lg:hidden ${showStickyBar ? "translate-y-0" : "translate-y-full"}`}
          aria-hidden={!showStickyBar}
        >
          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-xs text-muted-foreground">
              {product.name}
              {product.volume ? ` · ${product.volume}` : ""}
            </span>
            <span className="text-base font-semibold">{formatFCFA(product.price * qty)}</span>
          </span>
          <button
            type="button"
            onClick={addToCart}
            tabIndex={showStickyBar ? 0 : -1}
            className="h-[50px] shrink-0 rounded-full bg-primary-deep px-6 text-[15px] font-semibold text-primary-foreground"
          >
            Ajouter au panier
          </button>
        </div>
      )}
    </SiteLayout>
  );
}
