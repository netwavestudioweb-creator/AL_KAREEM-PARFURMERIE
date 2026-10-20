import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/layout";
import { GUIDES } from "@/lib/guides";
import { OG_IMAGE_META, SITE_CONFIG, getCanonicalUrl } from "@/lib/site-config";

const TITLE = "Conseils parfum : bien choisir son parfum au Bénin | Al Kareem";
const DESC =
  "Les conseils de notre parfumerie de Cotonou : reconnaître un parfum original, parfums orientaux, tenue sous la chaleur, idées cadeaux, huile ou eau de parfum.";

export const Route = createFileRoute("/conseils/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:site_name", content: SITE_CONFIG.name },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: getCanonicalUrl("/conseils") },
      ...OG_IMAGE_META,
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: SITE_CONFIG.ogImageUrl },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/conseils") }],
  }),
  component: GuidesIndex,
});

function GuidesIndex() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1100px] px-4 pb-16 pt-5 lg:px-8 lg:pt-8">
        <nav aria-label="Fil d'Ariane" className="flex gap-2 text-[13px] text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            Accueil
          </Link>
          <span aria-hidden>/</span>
          <span className="text-foreground" aria-current="page">
            Conseils parfum
          </span>
        </nav>
        <header className="mt-3 max-w-2xl">
          <h1 className="font-serif text-[34px] font-medium leading-tight text-primary-deep lg:text-5xl">
            Conseils parfum
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/80">
            Les réponses de notre parfumerie de Cotonou aux questions que l'on nous pose le plus :
            comment choisir, reconnaître un original, faire tenir son parfum sous la chaleur, quoi
            offrir.
          </p>
        </header>
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {GUIDES.map((g) => (
            <li key={g.slug}>
              <Link
                to="/conseils/$slug"
                params={{ slug: g.slug }}
                className="flex h-full flex-col gap-2 rounded-2xl border border-border p-5 transition-colors hover:border-primary/40"
              >
                <h2 className="font-serif text-[22px] font-medium leading-snug text-primary-deep">
                  {g.h1}
                </h2>
                <p className="text-[14.5px] leading-relaxed text-foreground/75">{g.description}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-primary">
                  Lire <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </SiteLayout>
  );
}
