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

  console.log('Launching Edge browser...');
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

  // 1. Boutique / Collection
  console.log('1. Capturing 01-collection.jpg...');
  await page.goto('http://localhost:3000/boutique', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await sleep(2000);
  await page.screenshot({ path: path.join(outDir, '01-collection.jpg'), type: 'jpeg', quality: 95 });

  // 2. Boutique Scrolled
  console.log('2. Capturing 02-scroll-collection.jpg...');
  await page.evaluate(() => window.scrollBy({ top: 500, behavior: 'instant' }));
  await sleep(1000);
  await page.screenshot({ path: path.join(outDir, '02-scroll-collection.jpg'), type: 'jpeg', quality: 95 });

  // 3. Fiche Produit
  console.log('3. Capturing 03-fiche-produit.jpg...');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await sleep(500);
  const productLink = await page.$('a[href^="/produit/"]');
  if (productLink) {
    const href = await page.evaluate((el) => el.getAttribute('href'), productLink);
    await page.goto(`http://localhost:3000${href}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  }
  await sleep(2000);
  await page.screenshot({ path: path.join(outDir, '03-fiche-produit.jpg'), type: 'jpeg', quality: 95 });

  // 4. Fiche Produit Zoom / Boutons
  console.log('4. Capturing 04-fiche-produit-zoom.jpg...');
  await page.evaluate(() => window.scrollBy({ top: 380, behavior: 'instant' }));
  await sleep(1000);
  await page.screenshot({ path: path.join(outDir, '04-fiche-produit-zoom.jpg'), type: 'jpeg', quality: 95 });

  // 5. Add to Cart & Panier
  console.log('5. Capturing 05-panier.jpg...');
  const addButtons = await page.$$('button');
  for (const btn of addButtons) {
    const text = await page.evaluate((el) => el.innerText, btn);
    if (text.includes('Ajouter au panier') || text.includes('Ajouter')) {
      await btn.click();
      break;
    }
  }
  await sleep(1000);
  await page.goto('http://localhost:3000/panier', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await sleep(1500);
  await page.screenshot({ path: path.join(outDir, '05-panier.jpg'), type: 'jpeg', quality: 95 });

  // 6. Formulaire / Bouton WhatsApp
  console.log('6. Capturing 06-bouton-whatsapp.jpg...');
  const finalizeButtons = await page.$$('button');
  for (const btn of finalizeButtons) {
    const text = await page.evaluate((el) => el.innerText, btn);
    if (text.includes('Finaliser')) {
      await btn.click();
      break;
    }
  }
  await sleep(800);
  
  // Fill inputs
  const inputs = await page.$$('input');
  if (inputs.length > 0) {
    await inputs[0].type('Khadija Hassan');
  }
  const telInput = await page.$('input[type="tel"]');
  if (telInput) {
    await telInput.type('0161888987');
  }

  // Click verifier
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) {
    await submitBtn.click();
    await sleep(800);
  }

  await page.screenshot({ path: path.join(outDir, '06-bouton-whatsapp.jpg'), type: 'jpeg', quality: 95 });

  await browser.close();
  console.log('SUCCESS: All 6 screenshots saved in video siteweb/ !');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
