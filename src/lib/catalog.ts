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

const PLACEHOLDER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><rect width='400' height='400' fill='%23F3E9F7'/><text x='50%25' y='50%25' font-family='serif' font-size='28' fill='%236B2FA0' text-anchor='middle' dominant-baseline='middle'>Al Kareem</text></svg>";

export function toProduct(p: DbProduct, categoriesById: Map<string, Category>): Product {
  const cat = p.category_id ? categoriesById.get(p.category_id) : undefined;
  const promoActive =
    p.promo_price_fcfa != null &&
    p.promo_price_fcfa < p.price_fcfa &&
    (!p.promo_end_date || new Date(p.promo_end_date) >= new Date(new Date().toDateString()));
  const effective = promoActive ? p.promo_price_fcfa! : p.price_fcfa;
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
    images: p.image_urls.length ? p.image_urls : [PLACEHOLDER],
    image: p.image_urls[0] ?? PLACEHOLDER,
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

export async function fetchProducts(): Promise<Product[]> {
  const [cats, prods] = await Promise.all([
    fetchCategories(),
    supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) throw error;
        return (data ?? []) as DbProduct[];
      }),
  ]);
  const map = new Map(cats.map((c) => [c.id, c]));
  return prods.map((p) => toProduct(p, map));
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const cats = await fetchCategories();
  return toProduct(data as DbProduct, new Map(cats.map((c) => [c.id, c])));
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
