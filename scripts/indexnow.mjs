// Signale toutes les pages du sitemap à IndexNow (Bing, Yandex, Seznam…) après une mise en ligne.
// Usage : npm run indexnow
const SITE = "https://www.al-kareemparfurmerie.com";
const KEY = "891400588bb4a219ef80a223326ca1af"; // fichier public/<KEY>.txt

const sitemap = await (await fetch(`${SITE}/sitemap.xml`)).text();
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: new URL(SITE).host,
    key: KEY,
    keyLocation: `${SITE}/${KEY}.txt`,
    urlList: urls,
  }),
});
console.log(`IndexNow : ${urls.length} adresses envoyées → HTTP ${res.status}`);
