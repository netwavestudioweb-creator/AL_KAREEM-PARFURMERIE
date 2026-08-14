const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const outDir = path.join(__dirname, 'video siteweb');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  console.log('Lancement du navigateur Edge...');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
    defaultViewport: {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    },
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(60000);
  page.setDefaultNavigationTimeout(60000);

  // 1. PAGE COLLECTION — FOCUS SUR LES VRAIS PRODUITS DANS LA GRILLE
  console.log('1. Navigation vers http://localhost:3000/boutique ...');
  await page.goto('http://localhost:3000/boutique', { waitUntil: 'domcontentloaded', timeout: 60000 });
  
  // Attendre 3 secondes que TanStack Query charge les données depuis Supabase
  await sleep(4000);

  // Faire défiler d'environ 280px pour afficher les cartes produits (photos + prix)
  await page.evaluate(() => {
    window.scrollBy({ top: 300, behavior: 'instant' });
  });
  await sleep(1500);

  await page.screenshot({
    path: path.join(outDir, '11-collection-produits-visibles.jpg'),
    type: 'jpeg',
    quality: 95,
  });
  console.log('-> 11-collection-produits-visibles.jpg capturé avec succès !');

  // 2. BONUS : FORMULAIRE DE LIVRAISON SANS ERREUR
  console.log('2. Navigation vers la fiche produit...');
  const firstProduct = await page.$('a[href^="/produit/"]');
  if (firstProduct) {
    const href = await page.evaluate((el) => el.getAttribute('href'), firstProduct);
    await page.goto(`http://localhost:3000${href}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(2500);

    // Clic sur Ajouter au panier
    const addBtns = await page.$$('button');
    for (const btn of addBtns) {
      const txt = await page.evaluate((el) => el.innerText, btn);
      if (txt.includes('Ajouter au panier') || txt.includes('Ajouter')) {
        await btn.click();
        break;
      }
    }
    await sleep(1000);

    // Aller au panier
    await page.goto('http://localhost:3000/panier', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(2000);

    // Clic Finaliser
    const finalizeBtns = await page.$$('button');
    for (const btn of finalizeBtns) {
      const txt = await page.evaluate((el) => el.innerText, btn);
      if (txt.includes('Finaliser')) {
        await btn.click();
        break;
      }
    }
    await sleep(1000);

    // Remplissage propre sans déclencher d'erreur
    const nameInput = await page.$('input[type="text"], input:not([type])');
    if (nameInput) await nameInput.type('Khadija Hassan');

    const telInput = await page.$('input[type="tel"]');
    if (telInput) await telInput.type('01 61 88 89 87');

    const addressInput = await page.$('textarea');
    if (addressInput) await addressInput.type('Akpakpa, Cotonou');

    await sleep(1000);

    await page.screenshot({
      path: path.join(outDir, '12-formulaire-livraison-propre.jpg'),
      type: 'jpeg',
      quality: 95,
    });
    console.log('-> 12-formulaire-livraison-propre.jpg capturé avec succès !');
  }

  await browser.close();
  console.log('SUCCESS: Terminé avec succès !');
}

main().catch((err) => {
  console.error('Erreur:', err);
  process.exit(1);
});
