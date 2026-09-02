import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { formatFCFA, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [imgSrc, setImgSrc] = useState(product.image);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="group relative flex h-full flex-col">
      <Link to="/produit/$slug" params={{ slug: product.slug }} className="flex flex-1 flex-col">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted/40">
          {!loaded && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-muted/30 via-muted/60 to-muted/30" />
          )}
          <img
            src={imgSrc}
            alt={product.name}
            loading="lazy"
            decoding="async"
            width={400}
            height={400}
            onLoad={() => setLoaded(true)}
            onError={() => {
              setLoaded(true);
              setImgSrc(
                "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><rect width='400' height='400' fill='%23F3E9F7'/><text x='50%25' y='50%25' font-family='serif' font-size='28' fill='%236B2FA0' text-anchor='middle' dominant-baseline='middle'>Al Kareem</text></svg>",
              );
            }}
            sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw"
            className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
              loaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-95 blur-sm"
            }`}
          />
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.promo && (
              <span className="px-2 py-1 rounded-md bg-primary text-primary-foreground text-[10px] font-semibold uppercase tracking-wider">
                Promo
              </span>
            )}
            {!product.inStock && (
              <span className="px-2 py-1 rounded-md bg-foreground/70 text-primary-foreground text-[10px] font-semibold uppercase tracking-wider">
                Rupture
              </span>
            )}
          </div>
        </div>
        <div className="mt-2.5 sm:mt-4 flex flex-1 flex-col">
          {/* Hauteurs fixes : les cartes de la grille restent alignées quelle
              que soit la longueur du titre ou l'absence de catégorie/volume. */}
          <div className="h-3.5 sm:h-4 text-[10px] sm:text-[11px] uppercase tracking-widest text-muted-foreground truncate">
            {product.category}
          </div>
          <h3 className="mt-0.5 sm:mt-1 font-serif text-sm sm:text-lg font-normal leading-snug text-foreground line-clamp-2 min-h-[2.5rem] sm:min-h-[3.25rem] group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="h-3.5 sm:h-4 text-[11px] sm:text-xs text-muted-foreground truncate">{product.volume ?? ""}</div>
          <div className="mt-auto flex flex-wrap items-baseline gap-1.5 sm:gap-2 pt-1.5 sm:pt-2">
            <span className="text-sm sm:text-base font-semibold text-primary-deep">{formatFCFA(product.price)}</span>
            {product.oldPrice && (
              <span className="text-[10px] sm:text-xs text-muted-foreground line-through">
                {formatFCFA(product.oldPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          if (!product.inStock) {
            toast.error("Ce produit est en rupture.");
            return;
          }
          addItem(product);
          toast.success(`${product.name} ajouté au panier`);
        }}
        disabled={!product.inStock}
        className="mt-2 sm:mt-3 w-full inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full border border-primary/20 bg-white py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-primary-deep hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-primary-deep min-h-[36px] sm:min-h-[40px]"
      >
        <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" /> <span>{product.inStock ? "Ajouter" : "Rupture"}</span>
      </button>
    </div>
  );
}
