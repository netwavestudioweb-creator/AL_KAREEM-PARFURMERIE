import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface ProductSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * ProductSkeleton — Skeleton Loader élégant et mobile-first pour les cartes de parfums.
 * Structure :
 * - Conteneur avec bordure arrondie
 * - Grand bloc aspect-square pour le flacon
 * - Petit bloc pour la marque/catégorie
 * - Bloc moyen pour le nom du parfum
 * - Bloc pour le prix
 * - Bloc pleine largeur pour le bouton d'action
 */
export function ProductSkeleton({ className, ...props }: ProductSkeletonProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 p-4 border border-border/70 rounded-xl bg-card shadow-xs transition-colors",
        className,
      )}
      {...props}
    >
      {/* 1. Grand bloc pour l'image du flacon */}
      <Skeleton className="w-full aspect-square rounded-lg" />

      {/* 2. Petit bloc pour la marque / catégorie */}
      <Skeleton className="h-4 w-1/3 mt-2 rounded-md" />

      {/* 3. Bloc moyen pour le nom du parfum */}
      <Skeleton className="h-5 w-3/4 rounded-md" />

      {/* 4. Bloc pour le prix */}
      <Skeleton className="h-5 w-1/4 mt-2 rounded-md" />

      {/* 5. Bloc pleine largeur pour le bouton d'ajout au panier */}
      <Skeleton className="h-10 w-full mt-4 rounded-full" />
    </div>
  );
}

export default ProductSkeleton;
