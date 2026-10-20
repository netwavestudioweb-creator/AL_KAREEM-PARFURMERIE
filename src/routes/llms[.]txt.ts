import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { SITE_CONFIG } from "@/lib/site-config";
import { BRANDS } from "@/lib/brands";
import { GUIDES, HOME_FAQ } from "@/lib/guides";
import { CATEGORY_SEO, GENRE_SEO } from "@/lib/category-seo";

// Résumé du site pour les assistants IA (ChatGPT, Perplexity, Gemini…), au format llms.txt.
// Généré depuis les données du site : marques, catégories et conseils restent à jour.
export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: () => {
        const url = SITE_CONFIG.url;
        const lines = [
          `# ${SITE_CONFIG.name}`,
          "",
          `> Parfumerie de Cotonou (Bénin) qui vend des parfums 100 % authentiques : parfums femme, homme et unisexe, parfums orientaux (oud, musc, ambre), huiles concentrées, brumes et coffrets cadeaux. Commande sur le site ou sur WhatsApp (${SITE_CONFIG.phone}), paiement à la réception (espèces, MTN MoMo, Moov Money), livraison au Bénin et dans la sous-région (${SITE_CONFIG.areaServed.join(", ")}).`,
          "",
          `Aussi appelée : ${SITE_CONFIG.alternateNames.join(", ")}.`,
          "",
          "## Rayons",
          ...Object.entries(GENRE_SEO).map(
            ([slug, s]) => `- [${s.title}](${url}/boutique/genre/${slug}) : ${s.description}`,
          ),
          ...Object.entries(CATEGORY_SEO).map(
            ([slug, s]) => `- [${s.title}](${url}/boutique/${slug}) : ${s.description}`,
          ),
          "",
          "## Marques disponibles à Cotonou",
          ...BRANDS.map((b) => `- [Parfums ${b.name}](${url}/marques/${b.slug}) : ${b.intro}`),
          "",
          "## Conseils parfum",
          ...GUIDES.map((g) => `- [${g.h1}](${url}/conseils/${g.slug}) : ${g.description}`),
          "",
          "## Questions fréquentes",
          ...HOME_FAQ.map((f) => `- ${f.q} ${f.a}`),
          "",
          "## Contact",
          `- Site : ${url}`,
          `- WhatsApp : ${SITE_CONFIG.whatsapp}`,
          `- Adresse : Cotonou, Bénin. Ouvert du lundi au samedi, ${SITE_CONFIG.openingHours.opens}–${SITE_CONFIG.openingHours.closes}.`,
          "",
        ];
        return new Response(lines.join("\n"), {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
