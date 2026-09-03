import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout";
import {
  Globe,
  Code2,
  Network,
  Bot,
  ArrowRight,
  CheckCircle2,
  Sliders,
  Clock,
  Sparkles,
  FileText,
  Palette,
  CreditCard,
  Layers,
} from "lucide-react";

export const Route = createFileRoute("/tarifs")({
  head: () => ({
    meta: [
      { title: "Tarifs & Services — NetWave Studio" },
      {
        name: "description",
        content:
          "Un tarif de base clair pour démarrer, un devis sur mesure dès que le projet se complexifie. Découvrez notre grille tarifaire par service.",
      },
      { property: "og:title", content: "Tarifs & Services — NetWave Studio" },
      {
        property: "og:description",
        content:
          "Un tarif de base clair pour démarrer, un devis sur mesure dès que le projet se complexifie.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/tarifs" }],
  }),
  component: TarifsPage,
});

function TarifsPage() {
  return (
    <SiteLayout>
      {/* 1. HERO / INTRO */}
      <section className="bg-gradient-hero border-b border-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-14 md:py-20 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary-deep mb-4 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Transparence & Clarté
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-primary-deep leading-tight">
            Nos Tarifs par Service
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto leading-relaxed">
            Un tarif de base clair pour démarrer, un devis sur mesure dès que le projet se
            complexifie. Pas de grille figée, pas de mauvaise surprise.
          </p>
        </div>
      </section>

      {/* 2. LES 4 SERVICES */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Service 1 : Développement Web & E-commerce */}
          <div className="flex flex-col justify-between rounded-3xl border border-border bg-white p-6 sm:p-8 shadow-soft hover:border-primary/40 transition-colors">
            <div>
              <div className="flex items-center gap-3.5 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary-deep flex items-center justify-center shrink-0">
                  <Globe className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl text-primary-deep font-medium leading-snug">
                    Développement Web & E-commerce
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Sites vitrines, plateformes sur mesure et boutiques en ligne
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Entrée de gamme : tarif chiffré valorisé */}
                <div className="rounded-2xl border-2 border-primary/30 bg-primary/[0.03] p-5 relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded-md bg-primary/10">
                        Tarif d'entrée de gamme
                      </span>
                      <h3 className="text-base font-semibold text-foreground">
                        Site vitrine essentiel
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        1 à 3 pages, template adapté à votre identité.
                      </p>
                    </div>
                    <div className="sm:text-right shrink-0">
                      <div className="text-[11px] text-muted-foreground uppercase font-medium">
                        À partir de
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold text-primary-deep font-sans tracking-tight">
                        100 000 <span className="text-sm font-semibold">FCFA</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Complexe : Sur devis */}
                <div className="rounded-2xl border border-border bg-muted/40 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-foreground">
                        Projet complet & E-commerce
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Site vitrine complet, multi-pages, design sur-mesure, ou boutique
                        e-commerce avec paiement intégré.
                      </p>
                    </div>
                    <div className="shrink-0 sm:text-right">
                      <span className="inline-block px-3.5 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold border border-border/60">
                        Sur devis
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border text-xs text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              <span>Responsive mobile garanti, performance et SEO inclus</span>
            </div>
          </div>

          {/* Service 2 : Logiciels & Outils de gestion sur mesure */}
          <div className="flex flex-col justify-between rounded-3xl border border-border bg-white p-6 sm:p-8 shadow-soft hover:border-primary/40 transition-colors">
            <div>
              <div className="flex items-center gap-3.5 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary-deep flex items-center justify-center shrink-0">
                  <Code2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl text-primary-deep font-medium leading-snug">
                    Logiciels & Outils de gestion sur mesure
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Digitalisation, automatisation et gestion interne
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Entrée de gamme : tarif chiffré valorisé */}
                <div className="rounded-2xl border-2 border-primary/30 bg-primary/[0.03] p-5 relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded-md bg-primary/10">
                        Tarif d'entrée de gamme
                      </span>
                      <h3 className="text-base font-semibold text-foreground">
                        Outil simple
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Automatisation ponctuelle, petit tableau de bord.
                      </p>
                    </div>
                    <div className="sm:text-right shrink-0">
                      <div className="text-[11px] text-muted-foreground uppercase font-medium">
                        À partir de
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold text-primary-deep font-sans tracking-tight">
                        150 000 <span className="text-sm font-semibold">FCFA</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Complexe : Sur devis */}
                <div className="rounded-2xl border border-border bg-muted/40 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-foreground">
                        Application métier complète
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Base de données, logique métier avancée, gestion multi-utilisateurs et rôles.
                      </p>
                    </div>
                    <div className="shrink-0 sm:text-right">
                      <span className="inline-block px-3.5 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold border border-border/60">
                        Sur devis
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border text-xs text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              <span>Propriété totale du code source, architecture évolutive</span>
            </div>
          </div>

          {/* Service 3 : Infrastructures Réseaux & Télécoms */}
          <div className="flex flex-col justify-between rounded-3xl border border-border bg-white p-6 sm:p-8 shadow-soft hover:border-primary/40 transition-colors">
            <div>
              <div className="flex items-center gap-3.5 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary-deep flex items-center justify-center shrink-0">
                  <Network className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl text-primary-deep font-medium leading-snug">
                    Infrastructures Réseaux & Télécoms
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Câblage structuré, interconnexion et sécurité réseau
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-muted/30 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="text-base font-semibold text-foreground">
                    Déploiement & Intervention sur site
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                    Chaque intervention dépend du site, des équipements existants et du périmètre
                    de sécurisation demandé.
                  </p>
                </div>
                <div className="shrink-0 sm:text-right">
                  <span className="inline-block px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold border border-border/60">
                    Sur devis
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border text-xs text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              <span>Audit préalable et dimensionnement sur mesure</span>
            </div>
          </div>

          {/* Service 4 : IA conversationnelle & Automatisation */}
          <div className="flex flex-col justify-between rounded-3xl border border-border bg-white p-6 sm:p-8 shadow-soft hover:border-primary/40 transition-colors">
            <div>
              <div className="flex items-center gap-3.5 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary-deep flex items-center justify-center shrink-0">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl text-primary-deep font-medium leading-snug">
                    IA conversationnelle & Automatisation
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Agents intelligents, bots WhatsApp et automatisation de flux
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-muted/30 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="text-base font-semibold text-foreground">
                    Solutions d'IA sur mesure
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                    La complexité varie fortement selon le nombre d'agents, les intégrations et le
                    volume de traitement.
                  </p>
                </div>
                <div className="shrink-0 sm:text-right">
                  <span className="inline-block px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold border border-border/60">
                    Sur devis
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border text-xs text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              <span>Intégration WhatsApp Business, CRM et outils métier</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION "CE QUI FAIT VARIER LE PRIX AU-DELÀ DU TARIF DE BASE" */}
      <section className="bg-secondary border-y border-border py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary mb-2">
              <Sliders className="h-4 w-4" /> Comprendre votre estimation
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-primary-deep">
              Ce qui fait varier le prix au-delà du tarif de base
            </h2>
            <p className="mt-2 text-sm text-foreground/70">
              Pour vous fournir un devis juste et transparent, nous évaluons précisément :
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl bg-white p-5 border border-border shadow-xs">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary-deep flex items-center justify-center shrink-0">
                  <Layers className="h-4 w-4" />
                </div>
                <h3 className="font-medium text-sm text-foreground">
                  Pages & Fonctionnalités
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Le nombre total d'écrans, la profondeur du catalogue et la complexité des modules
                spécifiques à développer.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 border border-border shadow-xs">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary-deep flex items-center justify-center shrink-0">
                  <Palette className="h-4 w-4" />
                </div>
                <h3 className="font-medium text-sm text-foreground">
                  Design & Personnalisation
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Le choix entre un template optimisé et adapté à votre identité ou une création
                graphique 100% sur-mesure.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 border border-border shadow-xs">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary-deep flex items-center justify-center shrink-0">
                  <CreditCard className="h-4 w-4" />
                </div>
                <h3 className="font-medium text-sm text-foreground">
                  Paiement & Gestion avancée
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Paiement en ligne (Mobile Money, Carte Bancaire), prise en charge multi-langue et
                back-office d'administration poussé.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 border border-border shadow-xs">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary-deep flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4" />
                </div>
                <h3 className="font-medium text-sm text-foreground">
                  Production de contenu
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Contenu produit directement par NetWave Studio (rédaction, visuels, fiches produits)
                plutôt que fourni par le client.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 border border-border shadow-xs sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary-deep flex items-center justify-center shrink-0">
                  <Clock className="h-4 w-4" />
                </div>
                <h3 className="font-medium text-sm text-foreground">
                  Délai de réalisation
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Le délai souhaité pour la livraison finale du projet (déploiement standard versus
                livraison accélérée prioritaire).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CTA FINAL */}
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl text-primary-deep">
            Un projet en tête ?
          </h2>
          <p className="mt-3 text-base text-muted-foreground max-w-lg mx-auto">
            Discutons de vos besoins et recevez un chiffrage adapté à votre réalité.
          </p>
          <div className="mt-8">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-deep text-primary-foreground px-8 py-4 text-sm font-semibold hover:bg-primary transition-all shadow-elegant hover:scale-105"
            >
              <span>Demander un devis détaillé, réponse sous 24-48h</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
