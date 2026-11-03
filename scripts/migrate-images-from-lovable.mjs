// Rapatrie les images (produits, catégories, preuves) du stockage Lovable vers la base principale.
//
// Contexte : depuis la panne Lovable du 01/11/2026, les données sont sur la base principale
// mais les URLs d'images pointent encore vers le bucket « product-images » de Lovable.
//
//   node --env-file=.env scripts/migrate-images-from-lovable.mjs           # à blanc : inventaire, rien n'est modifié
//   node --env-file=.env scripts/migrate-images-from-lovable.mjs --apply   # copie les fichiers puis réécrit les URLs
//
// Variables (.env) : SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_BACKUP_URL,
// et pour --apply : SUPABASE_SERVICE_ROLE_KEY (clé service_role de la base principale, jamais dans le chat).
// Le script est rejouable : les fichiers déjà copiés sont écrasés à l'identique, les URLs déjà migrées ignorées.

const APPLY = process.argv.includes("--apply");
const BUCKET = "product-images";

const PRIMARY = process.env.SUPABASE_URL;
const READ_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
const WRITE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const LOVABLE_HOST = new URL(
  process.env.SUPABASE_BACKUP_URL || "https://zoagwbhgpaslyjjsdnnv.supabase.co",
).host;
const LOVABLE_KEY = process.env.SUPABASE_BACKUP_PUBLISHABLE_KEY;

if (!PRIMARY || !READ_KEY)
  throw new Error("SUPABASE_URL et SUPABASE_PUBLISHABLE_KEY sont requis dans .env");
if (new URL(PRIMARY).host === LOVABLE_HOST)
  throw new Error("SUPABASE_URL pointe vers Lovable : arrêt.");
if (APPLY && !WRITE_KEY) {
  throw new Error("--apply nécessite SUPABASE_SERVICE_ROLE_KEY (base principale) dans .env");
}

const key = APPLY ? WRITE_KEY : READ_KEY;
const authHeaders = key.startsWith("sb_")
  ? { apikey: key }
  : { apikey: key, Authorization: `Bearer ${key}` };

async function rest(path, init = {}) {
  const res = await fetch(`${PRIMARY}/rest/v1/${path}`, {
    ...init,
    headers: { ...authHeaders, "Content-Type": "application/json", ...init.headers },
  });
  if (!res.ok)
    throw new Error(`${init.method || "GET"} ${path} → HTTP ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

/** Chemin de l'objet dans le bucket, quelle que soit la forme de l'URL Lovable (public, sign, render). */
function objectPath(url) {
  const m = url.match(
    new RegExp(
      `/storage/v1/(?:object|render/image)/(?:public|sign|authenticated)/${BUCKET}/([^?]+)`,
    ),
  );
  return m ? decodeURIComponent(m[1]) : null;
}

const isLovable = (url) => typeof url === "string" && url.includes(LOVABLE_HOST);
const newUrl = (path) =>
  `${PRIMARY}/storage/v1/object/public/${BUCKET}/${path.split("/").map(encodeURIComponent).join("/")}`;

// 1. Inventaire
const products = await rest("products?select=id,name,image_urls");
const categories = await rest("categories?select=id,name,image_url");
const proofs = await rest("authenticity_proofs?select=id,caption,image_url");

const files = new Map(); // chemin → URL Lovable téléchargeable
const unknown = [];
const note = (url, where) => {
  if (!isLovable(url)) return;
  const path = objectPath(url);
  if (!path) return unknown.push(`${where} : ${url.slice(0, 90)}`);
  if (!files.has(path)) files.set(path, url);
};
for (const p of products) (p.image_urls || []).forEach((u) => note(u, `produit « ${p.name} »`));
for (const c of categories) note(c.image_url, `catégorie « ${c.name} »`);
for (const pr of proofs) note(pr.image_url, `preuve « ${pr.caption} »`);

const countRows = (rows, get) => rows.filter((r) => [].concat(get(r) || []).some(isLovable)).length;
console.log(`Base principale : ${new URL(PRIMARY).host} (${products.length} produits)`);
console.log(
  `Liées à Lovable : ${countRows(products, (r) => r.image_urls)} produits, ` +
    `${countRows(categories, (r) => r.image_url)} catégories, ${countRows(proofs, (r) => r.image_url)} preuves`,
);
console.log(`Fichiers distincts à copier : ${files.size}`);
if (unknown.length)
  console.log(`URLs Lovable non reconnues (laissées telles quelles) :\n  ${unknown.join("\n  ")}`);

// 2. Téléchargement (vérifie que chaque fichier est encore accessible chez Lovable)
const downloaded = new Map();
const failed = [];
let bytes = 0;
for (const [path, url] of files) {
  // Les URLs « render » renvoient une version recompressée : on demande l'original.
  let original = url
    .replace("/storage/v1/render/image/", "/storage/v1/object/")
    .replace(/[?&](width|height|quality|resize)=[^&]*/g, "");
  // Bucket privé : une URL « public » (sans jeton) répond 400, on la signe d'abord chez Lovable.
  if (original.includes("/storage/v1/object/public/") && LOVABLE_KEY) {
    const s = await fetch(`https://${LOVABLE_HOST}/storage/v1/object/sign/${BUCKET}/${path}`, {
      method: "POST",
      headers: { apikey: LOVABLE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ expiresIn: 600 }),
    });
    if (s.ok) original = `https://${LOVABLE_HOST}/storage/v1${(await s.json()).signedURL}`;
  }
  const res = await fetch(original);
  if (!res.ok) {
    failed.push(`${path} (HTTP ${res.status})`);
    continue;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  bytes += buf.length;
  downloaded.set(path, {
    buf,
    type: res.headers.get("content-type") || "application/octet-stream",
  });
}
console.log(
  `Téléchargés depuis Lovable : ${downloaded.size}/${files.size} (${(bytes / 1048576).toFixed(1)} Mo)`,
);
if (failed.length) console.log(`Introuvables chez Lovable :\n  ${failed.join("\n  ")}`);

if (!APPLY) {
  console.log(
    "\nÀ blanc : rien n'a été modifié. Relancer avec --apply pour copier et réécrire les URLs.",
  );
  process.exit(failed.length ? 1 : 0);
}
if (failed.length)
  throw new Error("Des fichiers manquent chez Lovable : arrêt avant toute écriture.");

// 3. Copie dans le bucket de la base principale (upsert)
for (const [path, { buf, type }] of downloaded) {
  const res = await fetch(
    `${PRIMARY}/storage/v1/object/${BUCKET}/${path.split("/").map(encodeURIComponent).join("/")}`,
    {
      method: "POST",
      headers: {
        ...authHeaders,
        "Content-Type": type,
        "x-upsert": "true",
        "cache-control": "max-age=31536000",
      },
      body: buf,
    },
  );
  if (!res.ok) throw new Error(`Envoi ${path} → HTTP ${res.status} ${await res.text()}`);
}
console.log(`Copiés dans ${BUCKET} : ${downloaded.size}`);

// 4. Réécriture des URLs (seulement après la copie de tous les fichiers)
const rewrite = (url) => (isLovable(url) && objectPath(url) ? newUrl(objectPath(url)) : url);
let updated = 0;
for (const p of products) {
  if (!(p.image_urls || []).some(isLovable)) continue;
  await rest(`products?id=eq.${p.id}`, {
    method: "PATCH",
    body: JSON.stringify({ image_urls: p.image_urls.map(rewrite) }),
  });
  updated++;
}
for (const [table, rows] of [
  ["categories", categories],
  ["authenticity_proofs", proofs],
]) {
  for (const r of rows) {
    if (!isLovable(r.image_url)) continue;
    await rest(`${table}?id=eq.${r.id}`, {
      method: "PATCH",
      body: JSON.stringify({ image_url: rewrite(r.image_url) }),
    });
    updated++;
  }
}
console.log(`Lignes mises à jour : ${updated}. Terminé.`);
