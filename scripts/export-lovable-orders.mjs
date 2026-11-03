// Exporte les commandes, messages et avis restés dans l'ancienne base Lovable
// et prépare le fichier SQL à exécuter dans la base principale.
//
//   node --env-file=.env scripts/export-lovable-orders.mjs
//
// Connexion avec le compte admin de l'ancienne base : l'e-mail et le mot de passe sont tapés
// dans le terminal (le mot de passe ne s'affiche pas) et ne sont enregistrés nulle part.
// Rien n'est modifié chez Lovable : lecture seule.
//
// Résultat : supabase/import-anciennes-commandes.sql (contient des données clients : fichier
// ignoré par Git, à supprimer après l'import). À coller dans Supabase → projet principal →
// SQL Editor → Run. Rejouable : les lignes déjà présentes sont ignorées.

import { randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";
import { createInterface } from "node:readline";

const URL_LOVABLE = process.env.SUPABASE_BACKUP_URL || process.env.SUPABASE_URL_2;
const KEY = process.env.SUPABASE_BACKUP_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY_2;
const OUT = "supabase/import-anciennes-commandes.sql";
if (!URL_LOVABLE || !KEY)
  throw new Error("SUPABASE_BACKUP_URL et SUPABASE_BACKUP_PUBLISHABLE_KEY manquent dans .env");

function ask(question, hidden = false) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = (s) => {
        if (s.startsWith(question)) rl.output.write(question);
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer.trim());
    });
  });
}

console.log(`Ancienne base : ${new URL(URL_LOVABLE).host}`);
const email = await ask("E-mail admin : ");
const password = await ask("Mot de passe admin (invisible) : ", true);

const auth = await fetch(`${URL_LOVABLE}/auth/v1/token?grant_type=password`, {
  method: "POST",
  headers: { apikey: KEY, "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
if (!auth.ok) {
  console.error(`Connexion refusée (HTTP ${auth.status}) : vérifie l'e-mail et le mot de passe.`);
  process.exit(1);
}
const { access_token } = await auth.json();
const headers = { apikey: KEY, Authorization: `Bearer ${access_token}` };

async function readAll(table) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const res = await fetch(`${URL_LOVABLE}/rest/v1/${table}?select=*&order=created_at.asc`, {
      headers: { ...headers, Range: `${from}-${from + 999}` },
    });
    if (res.status === 404) return null; // table absente
    if (!res.ok) throw new Error(`${table} → HTTP ${res.status} ${await res.text()}`);
    const page = await res.json();
    rows.push(...page);
    if (page.length < 1000) return rows;
  }
}

const orders = await readAll("orders");
const messages = (await readAll("contact_messages")) ?? [];
const reviews = (await readAll("reviews")) ?? [];
await fetch(`${URL_LOVABLE}/auth/v1/logout`, { method: "POST", headers }).catch(() => {});

if (!orders) throw new Error("Table des commandes introuvable dans l'ancienne base.");
const day = (r) => (r ? String(r.created_at).slice(0, 10) : "—");
console.log(`\nCommandes : ${orders.length} (du ${day(orders[0])} au ${day(orders.at(-1))})`);
console.log(`Messages  : ${messages.length}`);
console.log(`Avis      : ${reviews.length}`);
if (orders.length === 0) {
  console.log(
    "\nAucune commande visible : soit la base est vide, soit ce compte n'est pas admin dans l'ancienne base.",
  );
  process.exit(1);
}

// Délimiteur de chaîne SQL ($tag$…$tag$) absent des données : aucun échappement nécessaire.
const tag = `alk${randomBytes(4).toString("hex")}`;
const lit = (rows) => `$${tag}$${JSON.stringify(rows)}$${tag}$::json`;
const insert = (table, rows) =>
  `insert into public.${table}\n  select * from json_populate_recordset(null::public.${table}, ${lit(rows)})\n  on conflict do nothing;`;

const sql = `-- Import des anciennes commandes de la base Lovable (${new Date().toISOString().slice(0, 10)}).
-- À exécuter dans Supabase → projet principal (dnakohzxqxpnqfopxtni) → SQL Editor → Run.
-- Rejouable : les lignes déjà présentes (même identifiant) sont ignorées.
begin;
-- Sans cela, le contrôle des nouvelles commandes (prix du jour, statut « envoyée »,
-- limite par heure) réécrirait ou rejetterait les anciennes commandes.
set local session_replication_role = replica;
${insert("orders", orders)}
${insert("contact_messages", messages)}
${insert("reviews", reviews)}
commit;
select
  (select count(*) from public.orders) as commandes,
  (select count(*) from public.contact_messages) as messages,
  (select count(*) from public.reviews) as avis;
`;
writeFileSync(OUT, sql);
console.log(`\nFichier prêt : ${OUT} (${Math.round(sql.length / 1024)} Ko)`);
console.log(
  "Ouvre-le, copie tout, colle-le dans le SQL Editor de la base principale et clique sur Run.",
);
