#!/usr/bin/env node
/**
 * keep-supabase-alive.mjs
 *
 * Script de "keepalive" pour éviter la mise en pause automatique
 * des bases Supabase (plan gratuit — inactivité > 7 jours).
 *
 * Utilise fetch() natif (Node.js 18+) — aucune dépendance npm requise.
 *
 * Bases pingées (chaque paire URL + clé publishable est facultative,
 * mais il en faut au moins une) :
 *   - SUPABASE_URL   / SUPABASE_PUBLISHABLE_KEY    → base du site en production
 *   - SUPABASE_URL_2 / SUPABASE_PUBLISHABLE_KEY_2  → seconde base (projet perso)
 *
 * Le script échoue (code 1) si une base ne répond pas correctement :
 * GitHub envoie alors un e-mail d'échec au lieu d'afficher un faux succès.
 *
 * Exécution manuelle :
 *   node scripts/keep-supabase-alive.mjs
 *
 * En production, déclenché automatiquement par GitHub Actions deux fois par semaine
 * (voir .github/workflows/supabase-keepalive.yml).
 */

// ── Configuration ─────────────────────────────────────────────────────────────
const env = process.env;
const targets = [
  {
    url: env.SUPABASE_URL || env.VITE_SUPABASE_URL || "",
    key: env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || "",
  },
  { url: env.SUPABASE_URL_2 || "", key: env.SUPABASE_PUBLISHABLE_KEY_2 || "" },
].filter((t) => t.url && t.key);

if (targets.length === 0) {
  console.error(
    "❌  Variables d'environnement manquantes : SUPABASE_URL et/ou SUPABASE_PUBLISHABLE_KEY",
  );
  process.exit(1);
}

// ── Ping via REST API (fetch natif — zéro dépendance) ────────────────────────
async function ping({ url, key }) {
  // Nom du projet seulement (sous-domaine) : l'URL complète reste masquée dans les logs.
  const project = new URL(url).hostname.split(".")[0];
  const endpoint = `${url.replace(/\/$/, "")}/rest/v1/products?select=id&limit=1`;

  try {
    const res = await fetch(endpoint, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(30_000),
    });
    if (res.ok) {
      console.log(`✅  ${project} — HTTP ${res.status}, requête exécutée par la base.`);
      return true;
    }
    // Un 401/404/5xx veut dire que la requête n'a pas atteint la base :
    // elle ne compte pas comme une activité, donc on le signale comme un échec.
    const body = (await res.text()).slice(0, 200);
    console.error(`❌  ${project} — HTTP ${res.status} : ${body}`);
    return false;
  } catch (err) {
    console.error(`❌  ${project} — erreur réseau : ${err.message}`);
    return false;
  }
}

console.log(`[${new Date().toISOString()}] 🏓  Ping de ${targets.length} base(s) Supabase`);
const results = await Promise.all(targets.map(ping));
if (results.every(Boolean)) {
  console.log("🛡️   Toutes les bases sont maintenues en vie.");
} else {
  process.exit(1);
}
