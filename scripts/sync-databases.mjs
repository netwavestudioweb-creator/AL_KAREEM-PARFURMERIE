#!/usr/bin/env node
/**
 * sync-databases.mjs
 *
 * Synchronise les données de la base Supabase principale (dnakohzxqxpnqfopxtni)
 * vers la base de données miroir Neon (PostgreSQL).
 *
 * Utilise l'API REST Supabase pour extraire les données en direct (toujours à jour)
 * et les injecte dans Neon avec ON CONFLICT (upsert).
 *
 * Variables d'environnement supportées :
 *   - SUPABASE_PRIMARY_URL : URL Supabase principale (défaut : projet personnel)
 *   - SUPABASE_PRIMARY_KEY : Clé publishable ou service_role principale
 *   - NEON_DATABASE_URL    : Chaîne de connexion PostgreSQL vers Neon (requis pour Neon)
 */

import { execSync } from "node:child_process";

const PRIMARY_URL =
  process.env.SUPABASE_PRIMARY_URL ||
  process.env.SUPABASE_URL ||
  "https://dnakohzxqxpnqfopxtni.supabase.co";

const PRIMARY_KEY =
  process.env.SUPABASE_PRIMARY_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_DldMc2XvXuixYVrWf6mxWA_eREpV44R";

const NEON_URL = process.env.NEON_DATABASE_URL || process.argv[2];

async function fetchFromSupabase(table) {
  const url = `${PRIMARY_URL.replace(/\/$/, "")}/rest/v1/${table}?select=*`;
  const res = await fetch(url, {
    headers: {
      apikey: PRIMARY_KEY,
      Authorization: `Bearer ${PRIMARY_KEY}`,
    },
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    throw new Error(
      `Échec lors de la récupération de la table ${table} : HTTP ${res.status} ${res.statusText}`,
    );
  }

  return await res.json();
}

function sqlStr(val) {
  if (val === null || val === undefined) return "NULL";
  return `'${String(val).replace(/'/g, "''")}'`;
}

function sqlArray(arr) {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return "'{}'::text[]";
  const items = arr.map((item) => `'${String(item).replace(/'/g, "''")}'`).join(",\n      ");
  return `ARRAY[\n      ${items}\n    ]::text[]`;
}

async function getPgClient() {
  let pg;
  try {
    const imported = await import("pg");
    pg = imported.default || imported;
  } catch {
    console.log("📦 Installation temporaire du driver pg...");
    execSync("npm install --no-save pg", { stdio: "inherit" });
    const imported = await import("pg");
    pg = imported.default || imported;
  }
  return pg;
}

async function syncToNeon(categories, products, proofs, testimonials) {
  if (!NEON_URL) {
    console.log("ℹ️  Variable NEON_DATABASE_URL non définie. Synchronisation Neon ignorée.");
    return;
  }

  console.log("🔌 Connexion à la base Neon...");
  const pg = await getPgClient();
  const client = new pg.Client({
    connectionString: NEON_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log("✅ Connecté à Neon !");

  try {
    // 1. Structure de base (si première exécution)
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
      CREATE SCHEMA IF NOT EXISTS auth;
      CREATE TABLE IF NOT EXISTS auth.users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email text,
        created_at timestamptz DEFAULT now()
      );

      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
          CREATE TYPE public.app_role AS ENUM ('admin', 'user');
        END IF;
      END$$;

      CREATE TABLE IF NOT EXISTS public.user_roles (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
        role public.app_role NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        UNIQUE (user_id, role)
      );

      CREATE TABLE IF NOT EXISTS public.categories (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL UNIQUE,
        slug text NOT NULL UNIQUE,
        sort_order integer NOT NULL DEFAULT 0,
        image_url text,
        created_at timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS public.products (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        slug text NOT NULL UNIQUE,
        category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
        price_fcfa integer NOT NULL CHECK (price_fcfa >= 0),
        promo_price_fcfa integer CHECK (promo_price_fcfa IS NULL OR promo_price_fcfa >= 0),
        promo_end_date date,
        description text NOT NULL DEFAULT '',
        volume text,
        in_stock boolean NOT NULL DEFAULT true,
        image_urls text[] NOT NULL DEFAULT '{}',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS public.authenticity_proofs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        image_url text NOT NULL,
        caption text NOT NULL DEFAULT '',
        sort_order integer NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS public.testimonials (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        message text NOT NULL,
        rating integer CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
        sort_order integer NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
      CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
      CREATE INDEX IF NOT EXISTS idx_products_in_stock ON public.products(in_stock);
    `);

    // 2. Synchronisation Categories
    console.log(`🔄 Synchronisation de ${categories.length} catégories...`);
    for (const c of categories) {
      await client.query(`
        INSERT INTO public.categories (id, name, slug, sort_order, image_url, created_at)
        VALUES (${sqlStr(c.id)}, ${sqlStr(c.name)}, ${sqlStr(c.slug)}, ${c.sort_order ?? 0}, ${sqlStr(c.image_url)}, ${sqlStr(c.created_at)})
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          sort_order = EXCLUDED.sort_order,
          image_url = EXCLUDED.image_url;
      `);
    }

    // 3. Synchronisation Preuves & Témoignages
    console.log(
      `🔄 Synchronisation de ${proofs.length} preuves et ${testimonials.length} témoignages...`,
    );
    for (const p of proofs) {
      await client.query(`
        INSERT INTO public.authenticity_proofs (id, image_url, caption, sort_order, created_at)
        VALUES (${sqlStr(p.id)}, ${sqlStr(p.image_url)}, ${sqlStr(p.caption || "")}, ${p.sort_order ?? 0}, ${sqlStr(p.created_at)})
        ON CONFLICT (id) DO UPDATE SET
          image_url = EXCLUDED.image_url,
          caption = EXCLUDED.caption,
          sort_order = EXCLUDED.sort_order;
      `);
    }

    for (const t of testimonials) {
      await client.query(`
        INSERT INTO public.testimonials (id, name, message, rating, sort_order, created_at)
        VALUES (${sqlStr(t.id)}, ${sqlStr(t.name)}, ${sqlStr(t.message)}, ${t.rating !== null && t.rating !== undefined ? t.rating : "NULL"}, ${t.sort_order ?? 0}, ${sqlStr(t.created_at)})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          message = EXCLUDED.message,
          rating = EXCLUDED.rating,
          sort_order = EXCLUDED.sort_order;
      `);
    }

    // 4. Synchronisation Produits
    console.log(`🔄 Synchronisation de ${products.length} produits...`);
    for (const prod of products) {
      await client.query(`
        INSERT INTO public.products (id, name, slug, category_id, price_fcfa, promo_price_fcfa, promo_end_date, description, volume, in_stock, image_urls, created_at, updated_at)
        VALUES (
          ${sqlStr(prod.id)},
          ${sqlStr(prod.name)},
          ${sqlStr(prod.slug)},
          ${sqlStr(prod.category_id)},
          ${prod.price_fcfa},
          ${prod.promo_price_fcfa !== null && prod.promo_price_fcfa !== undefined ? prod.promo_price_fcfa : "NULL"},
          ${sqlStr(prod.promo_end_date)},
          ${sqlStr(prod.description)},
          ${sqlStr(prod.volume)},
          ${prod.in_stock ? "true" : "false"},
          ${sqlArray(prod.image_urls)},
          ${sqlStr(prod.created_at)},
          ${sqlStr(prod.updated_at)}
        )
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          category_id = EXCLUDED.category_id,
          price_fcfa = EXCLUDED.price_fcfa,
          promo_price_fcfa = EXCLUDED.promo_price_fcfa,
          promo_end_date = EXCLUDED.promo_end_date,
          description = EXCLUDED.description,
          volume = EXCLUDED.volume,
          in_stock = EXCLUDED.in_stock,
          image_urls = EXCLUDED.image_urls,
          updated_at = EXCLUDED.updated_at;
      `);
    }

    const resProdCount = await client.query("SELECT COUNT(*) FROM public.products");
    console.log(
      `🎉 Synchronisation Neon réussie ! Total produits en base Neon : ${resProdCount.rows[0].count}`,
    );
  } finally {
    await client.end();
  }
}

async function main() {
  console.log("📡 Extraction des données depuis la base principale Supabase...");
  const [categories, products, proofs, testimonials] = await Promise.all([
    fetchFromSupabase("categories"),
    fetchFromSupabase("products"),
    fetchFromSupabase("authenticity_proofs"),
    fetchFromSupabase("testimonials"),
  ]);

  console.log(
    `✅ Données récupérées : ${categories.length} catégories, ${products.length} produits, ${proofs.length} preuves, ${testimonials.length} témoignages.`,
  );

  await syncToNeon(categories, products, proofs, testimonials);
}

main().catch((err) => {
  console.error("❌ Erreur pendant la synchronisation :", err.message);
  process.exit(1);
});
