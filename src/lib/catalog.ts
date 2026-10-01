import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  image_url: string | null;
}

export interface DbProduct {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  price_fcfa: number;
  promo_price_fcfa: number | null;
  promo_end_date: string | null;
  description: string;
  volume: string | null;
  in_stock: boolean;
  image_urls: string[];
  created_at: string;
  updated_at: string;
}

/** Public product shape used across the site. */
export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string; // category name (may be empty)
  categorySlug: string;
  price: number; // effective (promo if active)
  oldPrice?: number; // regular if promo is active
  promo: boolean;
  description: string;
  volume: string | null;
  inStock: boolean;
  images: string[];
  image: string; // first image or placeholder
  createdAt: string;
}

const PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><rect width='400' height='400' fill='%23F3E9F7'/><text x='50%25' y='50%25' font-family='serif' font-size='28' fill='%236B2FA0' text-anchor='middle' dominant-baseline='middle'>Al Kareem</text></svg>";

/**
 * Returns the image URL as-is if it is already usable (signed URL, public URL, data URL).
 * For Supabase public bucket URLs, applies image transformation (resize + webp).
 * Signed URLs are returned as-is — they are valid for years and work without changes.
 */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  width = 400,
  height = 400,
  quality = 80,
): string {
  if (!url) return PLACEHOLDER;
  if (url.startsWith("data:")) return url;

  // Public bucket URL -> apply Supabase image transform
  if (url.includes("/storage/v1/object/public/")) {
    const transformed = url.replace(
      "/storage/v1/object/public/",
      "/storage/v1/render/image/public/",
    );
    const separator = transformed.includes("?") ? "&" : "?";
    return `${transformed}${separator}width=${width}&height=${height}&quality=${quality}&resize=contain&format=webp`;
  }

  // Signed URL -> return as-is (valid for years, no transformation needed)
  return url;
}

// Cache resolved signed URLs in memory so we only request them once
const signedUrlCache = new Map<string, string>();

/**
 * Ensures any images stored as public URLs or raw paths for the private
 * "product-images" bucket are converted to valid 10-year signed URLs.
 */
async function ensureSignedUrls(products: DbProduct[]): Promise<void> {
  const pathsToSign: string[] = [];

  for (const p of products) {
    for (const url of p.image_urls) {
      if (url.includes("/storage/v1/object/public/product-images/")) {
        const path = url.split("/storage/v1/object/public/product-images/")[1];
        if (path && !signedUrlCache.has(path)) {
          pathsToSign.push(path);
        }
      }
    }
  }

  if (pathsToSign.length > 0) {
    try {
      const { data } = await supabase.storage
        .from("product-images")
        .createSignedUrls(pathsToSign, 60 * 60 * 24 * 365 * 10);
      if (data) {
        for (const item of data) {
          if (item.signedUrl && item.path) {
            signedUrlCache.set(item.path, item.signedUrl);
          }
        }
      }
    } catch {
      // Ignore signing errors, keep original URLs
    }
  }

  for (const p of products) {
    p.image_urls = p.image_urls.map((url) => {
      if (url.includes("/storage/v1/object/public/product-images/")) {
        const path = url.split("/storage/v1/object/public/product-images/")[1];
        if (path && signedUrlCache.has(path)) {
          return signedUrlCache.get(path)!;
        }
      }
      return url;
    });
  }
}

export function toProduct(p: DbProduct, categoriesById: Map<string, Category>): Product {
  const cat = p.category_id ? categoriesById.get(p.category_id) : undefined;
  const promoActive =
    p.promo_price_fcfa != null &&
    p.promo_price_fcfa < p.price_fcfa &&
    (!p.promo_end_date || new Date(p.promo_end_date) >= new Date(new Date().toDateString()));
  const effective = promoActive ? p.promo_price_fcfa! : p.price_fcfa;
  const rawImages = p.image_urls.length ? p.image_urls : [PLACEHOLDER];
  const optimizedImages = rawImages.map((img) => getOptimizedImageUrl(img, 400, 400, 80));
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: cat?.name ?? "",
    categorySlug: cat?.slug ?? "",
    price: effective,
    oldPrice: promoActive ? p.price_fcfa : undefined,
    promo: promoActive,
    description: p.description,
    volume: p.volume,
    inStock: p.in_stock,
    images: optimizedImages,
    image: optimizedImages[0] ?? PLACEHOLDER,
    createdAt: p.created_at,
  };
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,sort_order,image_url")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function fetchProducts(limit?: number): Promise<Product[]> {
  let query = supabase.from("products").select("*").order("created_at", { ascending: false });

  if (limit && limit > 0) {
    query = query.limit(limit);
  }

  const [cats, { data, error }] = await Promise.all([fetchCategories(), query]);
  if (error) throw error;

  const rawProducts = (data ?? []) as DbProduct[];
  await ensureSignedUrls(rawProducts);

  const map = new Map(cats.map((c) => [c.id, c]));
  return rawProducts.map((p) => toProduct(p, map));
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const rawProduct = data as DbProduct;
  await ensureSignedUrls([rawProduct]);

  const cats = await fetchCategories();
  return toProduct(rawProduct, new Map(cats.map((c) => [c.id, c])));
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}