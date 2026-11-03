// Génère les vignettes WebP (400 et 900 px) des images utilisées par le site.
//
// La base principale est sur l'offre gratuite de Supabase : pas de redimensionnement à la volée
// (/render/image/ répond 403). Les vignettes sont donc précalculées dans le bucket, sous
// thumbs/<largeur>/<chemin sans extension>.webp, et le site les sert (voir getOptimizedImageUrl).
//
//   npm i --no-save sharp
//   node --env-file=.env scripts/generate-thumbnails.mjs           # à blanc : liste ce qui manque
//   node --env-file=.env scripts/generate-thumbnails.mjs --apply   # crée les vignettes manquantes
//   node --env-file=.env scripts/generate-thumbnails.mjs --apply --force   # les recrée toutes
//
// Variables (.env) : SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, et pour --apply SUPABASE_SERVICE_ROLE_KEY.

import sharp from "sharp";

const APPLY = process.argv.includes("--apply");
const FORCE = process.argv.includes("--force");
const BUCKET = "product-images";
const WIDTHS = [400, 900];
const QUALITY = 78;

const BASE = process.env.SUPABASE_URL;
const key = APPLY ? process.env.SUPABASE_SERVICE_ROLE_KEY : process.env.SUPABASE_PUBLISHABLE_KEY;
if (!BASE || !key) {
  throw new Error(
    APPLY
      ? "--apply nécessite SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env"
      : "SUPABASE_URL et SUPABASE_PUBLISHABLE_KEY sont requis dans .env",
  );
}
const headers = key.startsWith("sb_")
  ? { apikey: key }
  : { apikey: key, Authorization: `Bearer ${key}` };
const encodePath = (p) => p.split("/").map(encodeURIComponent).join("/");
const publicUrl = (p) => `${BASE}/storage/v1/object/public/${BUCKET}/${encodePath(p)}`;
export const thumbPath = (path, w) => `thumbs/${w}/${path.replace(/\.[a-z0-9]+$/i, "")}.webp`;

/** fetch avec 4 nouvelles tentatives sur erreur réseau (connexions instables). */
async function retryFetch(url, init) {
  for (let i = 0; ; i++) {
    try {
      return await fetch(url, init);
    } catch (err) {
      if (i >= 4) throw err;
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
  }
}

async function rest(path) {
  const res = await retryFetch(`${BASE}/rest/v1/${path}`, { headers });
  if (!res.ok) throw new Error(`GET ${path} → HTTP ${res.status}`);
  return res.json();
}

function objectPath(url) {
  if (typeof url !== "string" || !url.startsWith(BASE)) return null;
  const m = url.match(new RegExp(`/storage/v1/object/(?:public|sign)/${BUCKET}/([^?]+)`));
  return m && !m[1].startsWith("thumbs/") ? decodeURIComponent(m[1]) : null;
}

// 1. Images référencées par le site
const products = await rest("products?select=image_urls");
const categories = await rest("categories?select=image_url");
const proofs = await rest("authenticity_proofs?select=image_url");
const paths = new Set(
  [
    ...products.flatMap((p) => p.image_urls || []),
    ...categories.map((c) => c.image_url),
    ...proofs.map((p) => p.image_url),
  ]
    .map(objectPath)
    .filter(Boolean),
);

// 2. Vignettes déjà présentes (une liste par dossier, plutôt qu'une requête par fichier)
async function listFolder(prefix) {
  const res = await retryFetch(`${BASE}/storage/v1/object/list/${BUCKET}`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ prefix, limit: 10000 }),
  });
  if (!res.ok) throw new Error(`Liste ${prefix} → HTTP ${res.status}`);
  return (await res.json()).filter((o) => o.id).map((o) => `${prefix}/${o.name}`);
}
const existing = new Set();
if (!FORCE) {
  const dirs = new Set(
    [...paths].map((p) => (p.includes("/") ? p.slice(0, p.lastIndexOf("/")) : "")),
  );
  for (const w of WIDTHS) {
    for (const d of dirs)
      (await listFolder(d ? `thumbs/${w}/${d}` : `thumbs/${w}`)).forEach((f) => existing.add(f));
  }
}
const todo = [...paths].filter((p) => WIDTHS.some((w) => !existing.has(thumbPath(p, w))));
console.log(
  `Images référencées : ${paths.size} — images sans vignettes complètes : ${todo.length}`,
);
if (!APPLY) {
  console.log("À blanc : rien n'a été modifié. Relancer avec --apply.");
  process.exit(0);
}

// 3. Génération et envoi, 6 images à la fois
let before = 0;
let after = 0;
let done = 0;
async function processImage(path) {
  const res = await retryFetch(publicUrl(path));
  if (!res.ok) throw new Error(`Original introuvable : ${path} (HTTP ${res.status})`);
  const src = Buffer.from(await res.arrayBuffer());
  for (const w of WIDTHS) {
    if (existing.has(thumbPath(path, w))) continue;
    const out = await sharp(src)
      .rotate()
      .resize({ width: w, height: w, fit: "inside", withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 5 })
      .toBuffer();
    if (w === 400) {
      before += src.length;
      after += out.length;
    }
    const up = await retryFetch(
      `${BASE}/storage/v1/object/${BUCKET}/${encodePath(thumbPath(path, w))}`,
      {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "image/webp",
          "x-upsert": "true",
          "cache-control": "max-age=31536000",
        },
        body: out,
      },
    );
    if (!up.ok)
      throw new Error(`Envoi ${thumbPath(path, w)} → HTTP ${up.status} ${await up.text()}`);
  }
  if (++done % 20 === 0 || done === todo.length) console.log(`  ${done}/${todo.length}`);
}
const queue = [...todo];
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (queue.length) await processImage(queue.shift());
  }),
);
console.log(`Images traitées : ${todo.length}`);
if (before) {
  console.log(
    `Poids moyen en liste : ${Math.round(before / todo.length / 1024)} Ko → ${Math.round(after / todo.length / 1024)} Ko par image`,
  );
}
