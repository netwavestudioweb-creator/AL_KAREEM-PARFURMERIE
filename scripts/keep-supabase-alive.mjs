#!/usr/bin/env node
/**
 * keep-supabase-alive.mjs
 *
 * Script de "keepalive" pour éviter la mise en pause automatique
 * de la base de données Supabase (plan gratuit — inactivité > 7 jours).
 *
 * Exécution manuelle :
 *   node scripts/keep-supabase-alive.mjs
 *
 * En production, ce script est déclenché automatiquement par GitHub Actions
 * toutes les 6 jours (voir .github/workflows/supabase-keepalive.yml).
 */

import { createClient } from "@supabase/supabase-js";

// ── Configuration ─────────────────────────────────────────────────────────────
// Les variables sont injectées par GitHub Actions Secrets ou par .env local.
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

// ── Client Supabase ───────────────────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Ping ──────────────────────────────────────────────────────────────────────
async function keepAlive() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🏓  Ping Supabase — ${SUPABASE_URL}`);

  try {
    // Requête légère : on lit 1 ligne de la table "products".
    // Adaptez le nom de la table si nécessaire.
    const { data, error } = await supabase
      .from("products")
      .select("id")
      .limit(1);

    if (error) {
      // Certaines erreurs ne sont pas fatales (RLS, table vide, etc.)
      console.warn(`⚠️   Réponse Supabase : ${error.message}`);
      console.warn("    La base de données est tout de même active.");
    } else {
      console.log(
        `✅  Ping réussi — ${data?.length ?? 0} enregistrement(s) reçu(s).`
      );
    }

    console.log(`[${timestamp}] 🛡️   Base de données maintenue en vie.`);
  } catch (err) {
    console.error("❌  Erreur réseau ou inattendue :", err.message);
    process.exit(1);
  }
}

keepAlive();
