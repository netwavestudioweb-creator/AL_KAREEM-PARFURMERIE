import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout";
import boutique from "@/assets/boutique.webp";
import heroPerfumes from "@/assets/hero-perfumes.jpg";
import { PerksStrip } from "@/components/home-sections";
import { whatsappLink } from "@/lib/products";
import { ArrowRight, Heart, MessageCircle, Sparkles, Users } from "lucide-react";
import { SITE_CONFIG, getCanonicalUrl } from "@/lib/site-config";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: `À propos — ${SITE_CONFIG.name}` },
      {
        name: "description",
        content:
          "Découvrez l'histoire d'Al Kareem Parfumerie, une maison de parfum d'exception née à Cotonou, portée par la passion et le conseil personnalisé.",
      },
      { property: "og:site_name", content: SITE_CONFIG.name },
      { property: "og:title", content: `À propos — ${SITE_CONFIG.name}` },
      {
        property: "og:description",
        content: "Notre histoire, nos valeurs et notre engagement parfum à Cotonou.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: getCanonicalUrl("/a-propos") },
      { property: "og:image", content: SITE_CONFIG.ogImageUrl },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: `À propos — ${SITE_CONFIG.name}` },
      { name: "twitter:image", content: SITE_CONFIG.ogImageUrl },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/a-propos") }],
  }),
  component: AboutPage,
});

const VALUES = [
  {
    icon: Sparkles,
    title: "Qualité",
    desc: "Une sélection contrôlée, des produits authentiques uniquement. Chaque flacon est vérifié avant d'être proposé.",
  },
  {
    icon: Users,
    title: "Conseil",
    desc: "Un accompagnement personnalisé, en boutique comme sur WhatsApp, pour trouver la fragrance qui vous ressemble.",
  },
  {
    icon: Heart,
    title: "Chaleur",
    desc: "Un accueil sincère, parce que chaque client(e) compte pour nous, de la première question à la livraison.",
  },
];

function AboutPage() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="mx-auto mt-1 w-full max-w-[1320px] px-4 lg:mt-6 lg:px-8">
        <div className="grid overflow-hidden rounded-[18px] bg-[#2D1244] text-white lg:min-h-[480px] lg:grid-cols-2 lg:rounded-[20px]">
          <div className="flex flex-col justify-center gap-4 p-6 lg:gap-5 lg:p-14">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-gold lg:text-xs">
              La Maison Al Kareem
            </span>
            <h1 className="font-serif text-[36px] font-medium leading-[1.05] lg:text-[56px]">
              Une maison de parfum née à Cotonou.
            </h1>
            <p className="max-w-[460px] text-[15px] leading-relaxed text-[#E4DAEC] lg:text-base">
              Al Kareem Parfumerie, c'est une sélection soignée de parfums, huiles, brumes et
              coffrets, pour révéler la personnalité de chacun(e).
            </p>
            <div className="mt-1 flex flex-wrap gap-3">
              <Link
                to="/boutique"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-gold px-6 text-[15px] font-semibold text-[#2A1838]"
              >
                Découvrir la collection <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={whatsappLink("Bonjour Al Kareem, j'aimerais un conseil parfum.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-white/45 px-6 text-[15px] font-medium hover:bg-white/10"
              >
                <MessageCircle className="h-4 w-4" /> Conseil privé
              </a>
            </div>
          </div>
          <div className="relative h-[260px] lg:h-auto">
            <img
              src={boutique}
              alt="La boutique Al Kareem à Cotonou"
              width={1200}
              height={800}
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Histoire */}
      <section className="mx-auto mt-12 grid w-full max-w-[1320px] gap-8 px-4 lg:mt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:gap-16 lg:px-8">
        <img
          src={heroPerfumes}
          alt="Flacons de parfum en boutique"
          loading="lazy"
          className="aspect-[4/3] w-full rounded-2xl object-cover"
        />
        <div className="flex flex-col gap-4">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-ink">
            Notre engagement
          </span>
          <h2 className="font-serif text-[30px] font-medium leading-tight text-primary-deep lg:text-[44px]">
            Le conseil, la qualité, l'attention.
          </h2>
          <p className="text-[15.5px] leading-relaxed text-foreground/80">
            Notre engagement : le conseil personnalisé, la qualité, et l'attention portée à chaque
            client(e) comme s'il ou elle était unique. Parce qu'il ou elle l'est.
          </p>
          <p className="text-[15.5px] leading-relaxed text-foreground/80">
            De la boutique physique de Cotonou aux commandes WhatsApp qui nous parviennent depuis
            tout le Bénin et la sous-région, notre priorité reste la même : le conseil sincère et
            l'attention portée à chaque détail.
          </p>
        </div>
      </section>

      {/* Valeurs */}
      <section className="mt-12 bg-secondary py-12 lg:mt-20 lg:py-20">
        <div className="mx-auto w-full max-w-[1320px] px-4 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-ink">
            Nos valeurs
          </span>
          <h2 className="mt-2 font-serif text-[30px] font-medium text-primary-deep lg:text-[44px]">
            Ce qui nous guide
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3 lg:mt-10 lg:gap-6">
            {VALUES.map((v) => (
              <article key={v.title} className="flex flex-col gap-3 rounded-2xl bg-card p-6 lg:p-8">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
                  <v.icon className="h-5 w-5" />
                </span>
                <h3 className="font-serif text-2xl text-primary-deep">{v.title}</h3>
                <p className="text-[14.5px] leading-relaxed text-foreground/75">{v.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Promesses */}
      <PerksStrip />

      {/* Appel à l'action */}
      <section className="mx-auto mt-12 w-full max-w-[1320px] px-4 pb-4 lg:mt-20 lg:px-8">
        <div className="flex flex-col gap-5 rounded-[18px] bg-accent p-6 lg:flex-row lg:items-center lg:justify-between lg:rounded-[20px] lg:p-12">
          <div>
            <h2 className="font-serif text-[28px] font-medium leading-tight text-primary-deep lg:text-[38px]">
              Trouvez votre signature olfactive.
            </h2>
            <p className="mt-2 text-[15px] text-foreground/80">
              Parcourez la collection ou laissez-vous guider par notre quiz en deux questions.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/boutique"
              className="inline-flex h-12 items-center rounded-full bg-primary-deep px-6 text-sm font-semibold text-primary-foreground hover:bg-primary"
            >
              Voir la boutique
            </Link>
            <a
              href="/#quiz"
              className="inline-flex h-12 items-center rounded-full border border-primary-deep px-6 text-sm font-semibold text-primary-deep"
            >
              Faire le quiz
            </a>
          </div>
        </div>
      </section>
      <div className="h-12" />
    </SiteLayout>
  );
}
