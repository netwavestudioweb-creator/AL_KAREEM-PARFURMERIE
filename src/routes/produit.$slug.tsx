import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/layout";
import { ProductCard } from "@/components/product-card";
import { fetchProductBySlug, fetchProducts, formatFCFA, whatsappLink } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { useState } from "react";
import {
  MessageCircle,
  ShoppingBag,
  Minus,
  Plus,
  ChevronRight,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

const SITE_URL = "https://al-kareem-parfurmerie.vercel.app";

export const Route = createFileRoute("/produit/$slug")({
  loader: async ({ params, context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["product", params.slug],
      queryFn: () => fetchProductBySlug(params.slug),
    });
    return (
      context.queryClient.getQueryData<Awaited<ReturnType<typeof fetchProductBySlug>>>([
        "product",
        params.slug,
      ]) ?? null
    );
  },
  head: ({ params, loaderData }) => {
    const p = loaderData ?? null;
    const title = p ? `${p.name} — Al Kareem Parfumerie` : `${params.slug} — Al Kareem Parfumerie`;
    const desc = p
      ? p.description?.slice(0, 155) ||
        `${p.name}${p.volume ? ` (${p.volume})` : ""} — ${formatFCFA(p.price)}. Commande WhatsApp, livraison au Bénin.`
      : "Fiche produit Al Kareem Parfumerie.";
    const image = p?.images?.[0];
    const url = `${SITE_URL}/produit/${params.slug}`;
    const meta = [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: p?.name ?? params.slug },
      { property: "og:description", content: desc },
      { property: "og:type", content: "product" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
    ];
    const share = image && /^https?:\/\//.test(image) ? image : `${SITE_URL}/og-alkareem.jpg`;
    meta.push({ property: "og:image", content: share });
    meta.push({ name: "twitter:image", content: share });

    return {
      meta,
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug),
  });
  const { data: all = [] } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-7xl px-4 py-24 text-center text-muted-foreground">
          Chargement…
        </div>
      </SiteLayout>
    );
  }
  if (!product) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-7xl px-4 py-24 text-center">
          <h1 className="font-serif text-3xl text-primary-deep">Produit introuvable</h1>
          <Link to="/boutique" className="mt-6 inline-block text-primary underline">
            Retour à la boutique
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const similar = all
    .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
    .slice(0, 4);
  const waMessage = `Bonjour Al Kareem 🌸\nJe souhaite commander : ${product.name}${product.volume ? ` (${product.volume})` : ""} — ${formatFCFA(product.price)}.`;

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <nav className="text-xs text-muted-foreground flex items-center gap-1">
          <Link to="/" className="hover:text-primary">
            Accueil
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/boutique" className="hover:text-primary">
            Boutique
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground truncate">{product.name}</span>
        </nav>
      </div>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16 grid gap-8 lg:gap-12 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="aspect-[4/3] sm:aspect-square max-h-[46vh] sm:max-h-none rounded-2xl sm:rounded-3xl bg-gradient-hero overflow-hidden flex items-center justify-center">
            <img
              src={product.images[activeImg]}
              alt={product.name}
              width={800}
              height={800}
              fetchPriority="high"
              decoding="async"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><rect width='400' height='400' fill='%23F3E9F7'/><text x='50%25' y='50%25' font-family='serif' font-size='28' fill='%236B2FA0' text-anchor='middle' dominant-baseline='middle'>Al Kareem</text></svg>";
              }}
              className="w-full h-full object-contain sm:object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`aspect-square rounded-xl bg-gradient-hero overflow-hidden ${i === activeImg ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100"}`}
                >
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    width={200}
                    height={200}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><rect width='400' height='400' fill='%23F3E9F7'/><text x='50%25' y='50%25' font-family='serif' font-size='28' fill='%236B2FA0' text-anchor='middle' dominant-baseline='middle'>Al Kareem</text></svg>";
                    }}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.category && (
            <div className="text-xs uppercase tracking-widest text-primary mb-2">
              {product.category}
            </div>
          )}
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-primary-deep">{product.name}</h1>
          {product.volume && (
            <div className="text-sm text-muted-foreground mt-1.5">{product.volume}</div>
          )}

          <div className="mt-4 sm:mt-6 flex items-baseline gap-3">
            <div className="font-serif text-2xl sm:text-3xl text-primary-deep">{formatFCFA(product.price)}</div>
            {product.oldPrice && (
              <div className="text-base sm:text-lg text-muted-foreground line-through">
                {formatFCFA(product.oldPrice)}
              </div>
            )}
            {product.promo && (
              <span className="px-2 py-1 rounded-md bg-primary text-primary-foreground text-[10px] font-semibold uppercase">
                Promo
              </span>
            )}
          </div>

          {product.description && (
            <p className="text-foreground/75 leading-relaxed mt-4 sm:mt-6 whitespace-pre-line text-sm sm:text-base">
              {product.description}
            </p>
          )}

          <div className="mt-6 sm:mt-8 flex items-center gap-4">
            <div className="inline-flex items-center border border-border rounded-full">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="h-10 sm:h-11 w-10 sm:w-11 flex items-center justify-center hover:bg-secondary rounded-l-full"
                aria-label="Diminuer la quantité"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-medium text-sm">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="h-10 sm:h-11 w-10 sm:w-11 flex items-center justify-center hover:bg-secondary rounded-r-full"
                aria-label="Augmenter la quantité"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="text-xs text-muted-foreground">
              {product.inStock ? "En stock" : "Rupture de stock"}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => {
                if (!product.inStock) {
                  toast.error("Ce produit est en rupture.");
                  return;
                }
                addItem(product, qty);
                toast.success(`${product.name} ajouté au panier`);
              }}
              disabled={!product.inStock}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-deep text-primary-foreground px-6 py-3.5 text-sm font-medium hover:bg-primary transition-colors shadow-soft disabled:opacity-50"
            >
              <ShoppingBag className="h-4 w-4" /> Ajouter au panier
            </button>
            <a
              href={whatsappLink(waMessage)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-whatsapp text-whatsapp-foreground px-6 py-3.5 text-sm font-medium hover:opacity-90"
            >
              <MessageCircle className="h-4 w-4" /> Commander sur WhatsApp
            </a>
          </div>

          <div className="mt-6 sm:mt-8 border-t border-border pt-6 space-y-3 text-sm text-foreground/75">
            <div className="flex items-center gap-3">
              <Truck className="h-4 w-4 text-primary shrink-0" /> Livraison Cotonou & Abomey-Calavi sous
              24-48h
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0" /> Paiement Mobile Money ou à la
              livraison
            </div>
          </div>
        </div>
      </section>

      {/* Barre d'action fixe en bas sur Mobile (Sticky CTA — adaptée du plus petit iPhone SE (320px) au plus grand iPhone 16 Pro Max / Android) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-border bg-white/95 backdrop-blur-md px-3 sm:px-4 py-2.5 sm:py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pl-[max(0.75rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))]">
        <div className="flex items-center justify-between gap-2 sm:gap-3 max-w-md mx-auto">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] sm:text-xs text-muted-foreground truncate font-medium">{product.name}</div>
            <div className="font-serif text-base sm:text-lg font-semibold text-primary-deep leading-tight truncate">
              {formatFCFA(product.price * qty)}
              {qty > 1 && (
                <span className="text-[10px] sm:text-[11px] font-sans font-normal text-muted-foreground ml-1">
                  ({qty}x)
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => {
                if (!product.inStock) {
                  toast.error("Ce produit est en rupture.");
                  return;
                }
                addItem(product, qty);
                toast.success(`${product.name} ajouté au panier`);
              }}
              disabled={!product.inStock}
              className="inline-flex items-center justify-center gap-1 sm:gap-1.5 rounded-full border border-primary text-primary-deep px-2.5 sm:px-3.5 py-2 sm:py-2.5 text-[11px] sm:text-xs font-semibold hover:bg-primary hover:text-white transition-colors disabled:opacity-50 min-h-[40px]"
            >
              <ShoppingBag className="h-3.5 w-3.5 shrink-0" /> <span>Panier</span>
            </button>
            <a
              href={whatsappLink(waMessage)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1 sm:gap-1.5 rounded-full bg-whatsapp text-whatsapp-foreground px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs font-semibold shadow-sm hover:opacity-90 min-h-[40px]"
            >
              <MessageCircle className="h-3.5 w-3.5 shrink-0" /> <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-28 lg:pb-20">
          <h2 className="font-serif text-2xl md:text-3xl text-primary-deep mb-8">
            Vous aimerez aussi
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
