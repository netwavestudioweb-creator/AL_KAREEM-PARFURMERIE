import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, MessageCircle } from "lucide-react";
import { SiteLayout } from "@/components/layout";
import { findGuide, GUIDES } from "@/lib/guides";
import { jsonLd } from "@/lib/json-ld";
import { whatsappLink } from "@/lib/products";
import { OG_IMAGE_META, SITE_CONFIG, getCanonicalUrl } from "@/lib/site-config";

export const Route = createFileRoute("/conseils/$slug")({
  loader: ({ params }) => {
    const guide = findGuide(params.slug);
    if (!guide) throw notFound();
    return { slug: guide.slug };
  },
  head: ({ params }) => {
    const guide = findGuide(params.slug);
    if (!guide) return {};
    const url = getCanonicalUrl(`/conseils/${guide.slug}`);
    const title = `${guide.title} | Al Kareem`;
    return {
      meta: [
        { title },
        { name: "description", content: guide.description },
        { property: "og:site_name", content: SITE_CONFIG.name },
        { property: "og:title", content: guide.h1 },
        { property: "og:description", content: guide.description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        ...OG_IMAGE_META,
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: guide.h1 },
        { name: "twitter:image", content: SITE_CONFIG.ogImageUrl },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: jsonLd({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: guide.h1,
            description: guide.description,
            inLanguage: "fr",
            datePublished: guide.updated,
            dateModified: guide.updated,
            mainEntityOfPage: url,
            image: SITE_CONFIG.ogImageUrl,
            author: { "@id": `${SITE_CONFIG.url}/#organization` },
            publisher: { "@id": `${SITE_CONFIG.url}/#organization` },
            about: guide.keywords,
          }),
        },
        {
          type: "application/ld+json",
          children: jsonLd({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: guide.faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        },
        {
          type: "application/ld+json",
          children: jsonLd({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_CONFIG.url },
              {
                "@type": "ListItem",
                position: 2,
                name: "Conseils parfum",
                item: `${SITE_CONFIG.url}/conseils`,
              },
              { "@type": "ListItem", position: 3, name: guide.title, item: url },
            ],
          }),
        },
      ],
    };
  },
  component: GuidePage,
});

function GuidePage() {
  const { slug } = Route.useParams();
  const guide = findGuide(slug)!;
  const others = GUIDES.filter((g) => g.slug !== guide.slug).slice(0, 3);

  return (
    <SiteLayout>
      <article className="mx-auto max-w-[760px] px-4 pb-16 pt-5 lg:px-8 lg:pt-8">
        <nav
          aria-label="Fil d'Ariane"
          className="flex flex-wrap gap-2 text-[13px] text-muted-foreground"
        >
          <Link to="/" className="hover:text-primary">
            Accueil
          </Link>
          <span aria-hidden>/</span>
          <Link to="/conseils" className="hover:text-primary">
            Conseils parfum
          </Link>
        </nav>

        <header className="mt-3 border-b border-border pb-6">
          <h1 className="font-serif text-[32px] font-medium leading-tight text-primary-deep lg:text-[44px]">
            {guide.h1}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Par Al Kareem Parfumerie, Cotonou · mis à jour le{" "}
            {new Date(guide.updated).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <p className="mt-4 text-[16px] leading-relaxed text-foreground/85">{guide.intro}</p>
        </header>

        <div className="mt-6 flex flex-col gap-4 text-[15.5px] leading-relaxed text-foreground/85">
          {guide.body.map((b, i) =>
            b.type === "h2" ? (
              <h2
                key={i}
                className="mt-4 font-serif text-[26px] font-medium leading-tight text-primary-deep"
              >
                {b.text}
              </h2>
            ) : b.type === "p" ? (
              <p key={i}>{b.text}</p>
            ) : (
              <ul key={i} className="list-disc space-y-2 pl-5">
                {b.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            ),
          )}
        </div>

        <section className="mt-8 rounded-2xl bg-secondary p-5 lg:p-6">
          <h2 className="font-serif text-[22px] font-medium text-primary-deep">
            Voir dans la boutique
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {guide.links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
                >
                  {l.label} <ArrowRight className="h-4 w-4" />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="font-serif text-[26px] font-medium text-primary-deep">
            Questions fréquentes
          </h2>
          <dl className="mt-3 divide-y divide-border">
            {guide.faq.map((f) => (
              <div key={f.q} className="py-4">
                <dt className="font-semibold text-foreground">{f.q}</dt>
                <dd className="mt-1 text-[15px] leading-relaxed text-foreground/80">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <a
          href={whatsappLink(
            `Bonjour Al Kareem, j'ai lu « ${guide.title} » et j'aimerais un conseil.`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-primary-deep px-6 text-[15px] font-semibold text-primary-foreground"
        >
          <MessageCircle className="h-5 w-5" /> Demander conseil sur WhatsApp
        </a>

        <section className="mt-12 border-t border-border pt-8">
          <h2 className="font-serif text-[24px] font-medium text-primary-deep">À lire aussi</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {others.map((g) => (
              <li key={g.slug}>
                <Link
                  to="/conseils/$slug"
                  params={{ slug: g.slug }}
                  className="font-medium text-primary hover:underline"
                >
                  {g.h1}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </SiteLayout>
  );
}
