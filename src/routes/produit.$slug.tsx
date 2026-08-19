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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <nav className="text-xs text-muted-foreground flex items-center gap-1">
          <Link to="/" className="hover:text-primary">
            Accueil
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/boutique" className="hover:text-primary">
            Boutique
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{product.name}</span>
        </nav>
      </div>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 grid gap-12 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="aspect-square rounded-3xl bg-gradient-hero overflow-hidden">
            <img
              src={product.images[activeImg]}
              alt={product.name}
              width={800}
              height={800}
              fetchPriority="high"
              decoding="async"
              className="w-full h-full object-cover"
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
          <h1 className="font-serif text-4xl md:text-5xl text-primary-deep">{product.name}</h1>
          {product.volume && (
            <div className="text-sm text-muted-foreground mt-2">{product.volume}</div>
          )}

          <div className="mt-6 flex items-baseline gap-3">
            <div className="font-serif text-3xl text-primary-deep">{formatFCFA(product.price)}</div>
            {product.oldPrice && (
              <div className="text-lg text-muted-foreground line-through">
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
            <p className="text-foreground/75 leading-relaxed mt-6 whitespace-pre-line">
              {product.description}
            </p>
          )}

          <div className="mt-8 flex items-center gap-4">
            <div className="inline-flex items-center border border-border rounded-full">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="h-11 w-11 flex items-center justify-center hover:bg-secondary rounded-l-full"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-medium">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="h-11 w-11 flex items-center justify-center hover:bg-secondary rounded-r-full"
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

          <div className="mt-8 border-t border-border pt-6 space-y-3 text-sm text-foreground/75">
            <div className="flex items-center gap-3">
              <Truck className="h-4 w-4 text-primary" /> Livraison Cotonou & Abomey-Calavi sous
              24-48h
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-primary" /> Paiement Mobile Money ou à la
              livraison
            </div>
          </div>
        </div>
      </section>

      {similar.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
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
