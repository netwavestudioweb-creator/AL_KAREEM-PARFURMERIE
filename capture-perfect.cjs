const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const outDir = path.join(__dirname, "video siteweb");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  console.log("Lancement du navigateur...");
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-web-security"],
    defaultViewport: {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    },
  });

  const page = await browser.newPage();

  // 1. PAGE COLLECTION CHARGÉE
  console.log("1. Chargement de la page Boutique...");
  await page.goto("http://localhost:3000/boutique", { waitUntil: "domcontentloaded" });
  // Attente explicite que les cartes produits apparaissent dans le DOM
  try {
    await page.waitForSelector('a[href^="/produit/"]', { timeout: 15000 });
  } catch {
    console.log("Attente supplémentaire pour les produits...");
  }
  await sleep(2500); // Laisse le temps aux images de finir le rendu
  await page.screenshot({
    path: path.join(outDir, "07-collection-chargee.jpg"),
    type: "jpeg",
    quality: 95,
  });
  console.log("-> 07-collection-chargee.jpg capturé !");

  // 2. FICHE PRODUIT OUVERTE
  console.log("2. Ouverture de la fiche produit...");
  const productCard = await page.$('a[href^="/produit/"]');
  if (productCard) {
    await productCard.click();
  } else {
    await page.goto("http://localhost:3000/boutique", { waitUntil: "domcontentloaded" });
  }
  await sleep(2500);
  await page.screenshot({
    path: path.join(outDir, "08-fiche-produit-ouverte.jpg"),
    type: "jpeg",
    quality: 95,
  });
  console.log("-> 08-fiche-produit-ouverte.jpg capturé !");

  // 3. AJOUT AU PANIER ET CAPTURE DU PANIER REMPLI
  console.log("3. Ajout au panier...");
  const allBtns = await page.$$("button");
  for (const btn of allBtns) {
    const txt = await page.evaluate((el) => el.innerText, btn);
    if (txt.includes("Ajouter au panier") || txt.includes("Ajouter")) {
      await btn.click();
      break;
    }
  }
  await sleep(1500);

  console.log("Navigation vers le panier...");
  await page.goto("http://localhost:3000/panier", { waitUntil: "domcontentloaded" });
  await sleep(2000);
  await page.screenshot({
    path: path.join(outDir, "09-panier-rempli.jpg"),
    type: "jpeg",
    quality: 95,
  });
  console.log("-> 09-panier-rempli.jpg capturé !");

  // 4. BOUTON DE COMMANDE / VALIDATION WHATSAPP
  console.log("4. Accès au bouton de validation de commande...");
  const finalizeBtns = await page.$$("button");
  for (const btn of finalizeBtns) {
    const txt = await page.evaluate((el) => el.innerText, btn);
    if (txt.includes("Finaliser")) {
      await btn.click();
      break;
    }
  }
  await sleep(1000);

  // Remplissage rapide du formulaire pour afficher l'étape finale avec le bouton WhatsApp
  const inputs = await page.$$("input");
  if (inputs.length > 0) {
    await inputs[0].type("Khadija Hassan");
  }
  const telInput = await page.$('input[type="tel"]');
  if (telInput) {
    await telInput.type("0161888987");
  }

  const verifBtn = await page.$('button[type="submit"]');
  if (verifBtn) {
    await verifBtn.click();
    await sleep(1200);
  }

  await page.screenshot({
    path: path.join(outDir, "10-bouton-commande.jpg"),
    type: "jpeg",
    quality: 95,
  });
  console.log("-> 10-bouton-commande.jpg capturé !");

  await browser.close();
  console.log('SUCCÈS : Les 4 nouvelles captures ont été générées dans "video siteweb" !');
}

main().catch((err) => {
  console.error("Erreur:", err);
  process.exit(1);
});
