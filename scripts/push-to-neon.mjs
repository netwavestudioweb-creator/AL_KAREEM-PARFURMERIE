import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const connectionString = process.argv[2] || process.env.NEON_DATABASE_URL;
  if (!connectionString) {
    console.error('Usage: node scripts/push-to-neon.mjs "<NEON_CONNECTION_STRING>"');
    console.error("Ou definissez la variable d'environnement NEON_DATABASE_URL.");
    process.exit(1);
  }

  console.log("Connexion a Neon...");
  let pg;
  try {
    const imported = await import("pg");
    pg = imported.default || imported;
  } catch {
    console.log("Installation temporaire du driver pg...");
    const { execSync } = await import("node:child_process");
    execSync("npm install --no-save pg", { stdio: "inherit" });
    const imported = await import("pg");
    pg = imported.default || imported;
  }

  const { Client } = pg;
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log("Connecte avec succes a la base Neon !");

  const sqlPath = path.resolve(__dirname, "../neon-backup.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");

  console.log("Execution du script SQL (schemas, categories, 96 produits)...");
  await client.query(sql);

  console.log("Synchronisation terminee avec succes !");
  const resCat = await client.query("SELECT COUNT(*) FROM public.categories");
  const resProd = await client.query("SELECT COUNT(*) FROM public.products");
  console.log(`Categories creees : ${resCat.rows[0].count}`);
  console.log(`Produits crees : ${resProd.rows[0].count}`);

  await client.end();
}

main().catch((err) => {
  console.error("Erreur:", err.message);
  process.exit(1);
});
