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
 * Converts a legacy signed URL stored in the database to a stable public URL.
 * Safe to call on public URLs or placeholders -- returns them unchanged.
 */
export function toPublicUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("data:")) return url;
  // Already a public URL -> return as-is
  if (url.includes("/storage/v1/object/public/")) return url;
  // Signed URL -> extract the object path and rebuild as public URL
  if (url.includes("/storage/v1/object/sign/")) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const match = url.match(/\/storage\/v1\/object\/sign\/([^/]+)\/(.+?)(\?|$)/);
    if (match) {
      const bucket = match[1];
      const filePath = match[2];
      return `${supabaseUrl}/storage/v1/object/public/${bucket}/${filePath}`;
    }
  }
  return url;
}

export function getOptimizedImageUrl(
  url: string | null | undefined,
  width = 400,
  height = 400,
  quality = 80,
): string {
  if (!url) return PLACEHOLDER;
  if (url.startsWith("data:")) return url;

  if (url.includes("/storage/v1/object/public/")) {
    const transformed = url.replace(
      "/storage/v1/object/public/",
      "/storage/v1/render/image/public/",
    );
    const separator = transformed.includes("?") ? "&" : "?";
    return `${transformed}${separator}width=${width}&height=${height}&quality=${quality}&resize=contain&format=webp`;
  }

  return url;
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
  // Convert any stored signed URLs to stable public URLs
  return (data ?? []).map((c) => ({
    ...(c as Category),
    image_url: toPublicUrl(c.image_url),
  }));
}

export async function fetchProducts(limit?: number): Promise<Product[]> {
  let query = supabase.from("products").select("*").order("created_at", { ascending: false });

  if (limit && limit > 0) {
    query = query.limit(limit);
  }

  const [cats, { data, error }] = await Promise.all([fetchCategories(), query]);
  if (error) throw error;

  const map = new Map(cats.map((c) => [c.id, c]));
  const list = (data ?? []) as DbProduct[];

  return list.map((p) => {
    // Convert any legacy signed URLs stored in DB to stable public URLs
    const fixedUrls = (p.image_urls ?? []).map((u) => toPublicUrl(u) ?? u);
    return toProduct({ ...p, image_urls: fixedUrls }, map);
  });
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const dbProd = data as DbProduct;
  // Convert any legacy signed URLs to stable public URLs
  const fixedUrls = (dbProd.image_urls ?? []).map((u) => toPublicUrl(u) ?? u);
  const cats = await fetchCategories();
  return toProduct({ ...dbProd, image_urls: fixedUrls }, new Map(cats.map((c) => [c.id, c])));
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}