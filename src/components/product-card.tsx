import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { formatFCFA, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { trackAddToCart } from "@/lib/analytics";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><rect width='400' height='400' fill='%23F5F0E8'/><text x='50%25' y='50%25' font-family='serif' font-size='28' fill='%236B2FA0' text-anchor='middle' dominant-baseline='middle'>Al Kareem</text></svg>";

export function ProductCard({
  product,
  className,
  priority = false,
}: {
  product: Product;
  className?: string;
  priority?: boolean;
}) {
  const { addItem } = useCart();
  const [imgSrc, setImgSrc] = useState(product.image);

  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round((1 - product.price / product.oldPrice) * 100)
      : 0;

  const add = () => {
    if (!product.inStock) return;
    addItem(product);
    trackAddToCart(product);
    toast.success(`${product.name} ajouté au panier`, {
      action: { label: "Voir le panier", onClick: () => (window.location.href = "/panier") },
    });
  };

  return (
    <article className={`group relative flex h-full flex-col ${className ?? ""}`}>
      <Link
        to="/parfum/$slug"
        params={{ slug: product.slug }}
        className="relative block aspect-square overflow-hidden rounded-xl bg-secondary"
      >
        <img
          src={imgSrc}
          alt={product.name}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          width={400}
          height={400}
          onError={() => {
            // Image transformée indisponible : on retombe sur l'originale, puis sur un visuel neutre.
            if (product.rawImage && imgSrc !== product.rawImage) setImgSrc(product.rawImage);
            else setImgSrc(FALLBACK_IMAGE);
          }}
          className={`h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] ${
            product.inStock ? "" : "opacity-60 grayscale-[30%]"
          }`}
        />
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {discount > 0 && (
            <span className="rounded-full bg-primary-deep px-2 py-0.5 text-[10px] font-semibold tracking-wide text-primary-foreground">
              −{discount} %
            </span>
          )}
          {!product.inStock && (
            <span className="rounded-full bg-foreground/80 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-background">
              Épuisé
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col pt-2.5 sm:pt-3">
        <div className="h-4 truncate text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:text-[11px]">
          {product.category}
          {product.volume ? ` · ${product.volume}` : ""}
        </div>
        <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] font-serif text-[15px] leading-tight text-foreground sm:min-h-[2.75rem] sm:text-lg">
          <Link
            to="/parfum/$slug"
            params={{ slug: product.slug }}
            className="hover:text-primary focus-visible:text-primary"
          >
            {product.name}
          </Link>
        </h3>

        {/* Mobile : prix puis bouton pleine largeur ; à partir de sm : côte à côte. */}
        <div className="mt-auto flex flex-col gap-2 pt-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 flex-col leading-tight">
            {product.oldPrice && (
              <span className="text-[11px] text-muted-foreground line-through sm:text-xs">
                {formatFCFA(product.oldPrice)}
              </span>
            )}
            <span
              className={`text-sm font-semibold sm:text-base ${
                product.oldPrice ? "text-primary" : "text-foreground"
              }`}
            >
              {formatFCFA(product.price)}
            </span>
          </div>
          <button
            type="button"
            onClick={add}
            disabled={!product.inStock}
            aria-label={
              product.inStock ? `Ajouter ${product.name} au panier` : `${product.name} épuisé`
            }
            className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-1 rounded-full bg-primary-deep pl-2.5 pr-3 text-[13px] font-semibold sm:w-auto text-primary-foreground transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground sm:h-10 sm:text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>{product.inStock ? "Ajouter" : "Épuisé"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
