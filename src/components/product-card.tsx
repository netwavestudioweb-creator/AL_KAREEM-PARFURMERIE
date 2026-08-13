import { Link } from "@tanstack/react-router";
import { formatFCFA, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  return (
    <div className="group relative flex h-full flex-col">
      <Link to="/produit/$slug" params={{ slug: product.slug }} className="flex flex-1 flex-col">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-hero">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            width={400}
            height={400}
            sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.promo && (
              <span className="px-2 py-1 rounded-md bg-primary text-primary-foreground text-[10px] font-semibold uppercase tracking-wider">Promo</span>
            )}
            {!product.inStock && (
              <span className="px-2 py-1 rounded-md bg-foreground/70 text-primary-foreground text-[10px] font-semibold uppercase tracking-wider">Rupture</span>
            )}
          </div>
        </div>
        <div className="mt-4 flex flex-1 flex-col">
          {/* Hauteurs fixes : les cartes de la grille restent alignées quelle
              que soit la longueur du titre ou l'absence de catégorie/volume. */}
          <div className="h-4 text-[11px] uppercase tracking-widest text-muted-foreground truncate">
            {product.category}
          </div>
          <h3 className="mt-1 font-serif text-lg font-normal leading-snug text-foreground line-clamp-2 min-h-[3.25rem] group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="h-4 text-xs text-muted-foreground truncate">{product.volume ?? ""}</div>
          <div className="mt-auto flex items-baseline gap-2 pt-2">
            <span className="font-semibold text-primary-deep">{formatFCFA(product.price)}</span>
            {product.oldPrice && (
              <span className="text-xs text-muted-foreground line-through">{formatFCFA(product.oldPrice)}</span>
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
        className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-white py-2.5 text-sm font-medium text-primary-deep hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-primary-deep"
      >
        <ShoppingBag className="h-4 w-4" /> {product.inStock ? "Ajouter" : "Rupture"}
      </button>
    </div>
  );
}
