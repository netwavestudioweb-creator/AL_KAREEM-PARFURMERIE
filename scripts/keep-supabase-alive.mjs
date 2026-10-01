#!/usr/bin/env node
/**
 * keep-supabase-alive.mjs
 *
 * Script de "keepalive" pour éviter la mise en pause automatique
 * de la base de données Supabase (plan gratuit — inactivité > 7 jours).
 *
 * Utilise fetch() natif (Node.js 18+) — aucune dépendance npm requise.
 *
 * Exécution manuelle :
 *   node scripts/keep-supabase-alive.mjs
 *
 * En production, déclenché automatiquement par GitHub Actions toutes les 6 jours
 * (voir .github/workflows/supabase-keepalive.yml).
 */

// ── Configuration ─────────────────────────────────────────────────────────────
const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "❌  Variables d'environnement manquantes : SUPABASE_URL et/ou SUPABASE_PUBLISHABLE_KEY"
  );
  process.exit(1);
}

// ── Ping via REST API (fetch natif — zéro dépendance) ────────────────────────
async function keepAlive() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🏓  Ping Supabase — ${SUPABASE_URL}`);

  // Appel REST direct : GET /rest/v1/products?select=id&limit=1
  const url = `${SUPABASE_URL}/rest/v1/products?select=id&limit=1`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const body = await res.text();

    if (res.ok) {
      console.log(`✅  Ping réussi — HTTP ${res.status} — réponse : ${body}`);
    } else if (res.status === 401 || res.status === 403) {
      // Erreur d'auth : la DB est active mais la clé est invalide
      console.warn(
        `⚠️  HTTP ${res.status} — clé invalide, mais la DB est active.`
      );
    } else {
      // Autres codes (404 table absente, 406, etc.) : DB toujours active
      console.warn(
        `⚠️  HTTP ${res.status} — réponse inattendue, mais la DB est active.`
      );
      console.warn(`    Corps : ${body}`);
    }

    console.log(`[${timestamp}] 🛡️   Base de données maintenue en vie.`);
    process.exit(0);
  } catch (err) {
    // Erreur réseau réelle → on échoue
    console.error("❌  Erreur réseau :", err.message);
    process.exit(1);
  }
}

keepAlive();
