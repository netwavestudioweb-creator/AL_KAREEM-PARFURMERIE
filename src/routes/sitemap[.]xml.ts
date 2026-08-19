import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = process.env.SITE_URL || "https://alkareem-parfumerie.bj";

const STATIC_PATHS = [
  { path: "/", priority: "1.0", changefreq: "weekly" as const },
  { path: "/boutique", priority: "0.9", changefreq: "daily" as const },
  { path: "/a-propos", priority: "0.5", changefreq: "monthly" as const },
  { path: "/contact", priority: "0.5", changefreq: "monthly" as const },
  { path: "/mentions-legales", priority: "0.2", changefreq: "yearly" as const },
  { path: "/confidentialite", priority: "0.2", changefreq: "yearly" as const },
  { path: "/cgv", priority: "0.2", changefreq: "yearly" as const },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_PUBLISHABLE_KEY;
        let productPaths: { path: string; lastmod?: string }[] = [];
        if (url && key) {
          try {
            const sb = createClient(url, key, {
              auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
            });
            const { data } = await sb.from("products").select("slug,updated_at");
            productPaths = (data ?? []).map((p) => ({
              path: `/produit/${p.slug}`,
              lastmod: p.updated_at ? new Date(p.updated_at).toISOString() : undefined,
            }));
          } catch {
            /* ignore */
          }
        }

        const urls = [
          ...STATIC_PATHS.map((e) => ({ ...e })),
          ...productPaths.map((p) => ({
            path: p.path,
            lastmod: p.lastmod,
            changefreq: "weekly" as const,
            priority: "0.7",
          })),
        ].map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            "lastmod" in e && e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
