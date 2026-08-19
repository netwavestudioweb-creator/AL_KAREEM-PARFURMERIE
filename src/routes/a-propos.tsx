import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout";
import boutique from "@/assets/boutique.jpg";
import { Heart, Sparkles, Users } from "lucide-react";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "À propos — Al Kareem Parfumerie" },
      {
        name: "description",
        content:
          "Découvrez l'histoire d'Al Kareem Parfumerie, une maison de parfum née à Cotonou, portée par la passion et le conseil personnalisé.",
      },
      { property: "og:title", content: "À propos — Al Kareem" },
      { property: "og:description", content: "Notre histoire, nos valeurs, notre engagement." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://al-kareem-parfurmerie.vercel.app/og-alkareem.jpg" },
      {
        name: "twitter:image",
        content: "https://al-kareem-parfurmerie.vercel.app/og-alkareem.jpg",
      },
      { property: "og:url", content: "/a-propos" },
    ],
    links: [{ rel: "canonical", href: "/a-propos" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <section className="bg-gradient-hero">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-14 md:py-24 text-center">
          <div className="text-xs uppercase tracking-widest text-primary mb-3">Notre maison</div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-6xl text-primary-deep">
            Une maison de parfum née à Cotonou
          </h1>
          <p className="mt-6 text-base sm:text-lg text-foreground/75 max-w-2xl mx-auto leading-relaxed">
            Al Kareem Parfumerie, c'est une sélection soignée de parfums, huiles, brumes et
            coffrets, pour révéler la personnalité de chacun(e).
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-14 md:py-16 grid gap-8 md:gap-12 md:grid-cols-2 items-center">
        <img
          src={boutique}
          alt="Notre boutique"
          width={1200}
          height={800}
          loading="lazy"
          className="rounded-3xl shadow-elegant object-cover w-full aspect-[4/3]"
        />
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-widest text-primary mb-2">
            Notre engagement
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-primary-deep mb-4">
            Le conseil, la qualité, l'attention
          </h2>
          <p className="text-foreground/75 leading-relaxed mb-4">
            Notre engagement : le conseil personnalisé, la qualité, et l'attention portée à chaque
            client(e) comme s'il ou elle était unique. Parce qu'il ou elle l'est.
          </p>
          <p className="text-foreground/75 leading-relaxed">
            De la boutique physique de Cotonou aux commandes WhatsApp qui nous parviennent depuis
            tout le Bénin, notre priorité reste la même : le conseil sincère et l'attention portée à
            chaque détail.
          </p>
        </div>
      </section>

      <section className="bg-secondary">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 md:py-16">
          <div className="text-center mb-10 md:mb-12">
            <div className="text-xs uppercase tracking-widest text-primary mb-2">Nos valeurs</div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-primary-deep">
              Ce qui nous guide
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Sparkles,
                title: "Qualité",
                desc: "Une sélection contrôlée, des produits authentiques uniquement.",
              },
              {
                icon: Users,
                title: "Conseil",
                desc: "Un accompagnement personnalisé, en boutique comme en ligne.",
              },
              {
                icon: Heart,
                title: "Chaleur",
                desc: "Un accueil sincère, parce que chaque client(e) compte pour nous.",
              },
            ].map((v) => (
              <div key={v.title} className="p-6 sm:p-8 rounded-2xl bg-card text-center shadow-soft">
                <div className="h-14 w-14 mx-auto rounded-full bg-accent flex items-center justify-center text-primary-deep mb-4">
                  <v.icon className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-xl text-primary-deep mb-2">{v.title}</h3>
                <p className="text-sm text-foreground/70">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
