import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { SiteLayout } from "./layout";
import { whatsappLink } from "@/lib/products";

export interface LegalSection {
  id: string;
  title: string;
  content: ReactNode;
}

/** Gabarit commun des pages légales : sommaire, sections lisibles, contact. */
export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro?: ReactNode;
  sections: LegalSection[];
}) {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1100px] px-4 pb-16 pt-5 lg:px-8 lg:pt-8">
        <nav aria-label="Fil d'Ariane" className="flex gap-2 text-[13px] text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            Accueil
          </Link>
          <span aria-hidden>/</span>
          <span className="text-foreground" aria-current="page">
            {title}
          </span>
        </nav>
        <header className="mt-3 border-b border-border pb-6">
          <h1 className="font-serif text-[34px] font-medium leading-tight text-primary-deep lg:text-5xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Dernière mise à jour : {updated}</p>
          {intro && (
            <div className="mt-4 max-w-2xl text-[15px] leading-relaxed text-foreground/80">
              {intro}
            </div>
          )}
        </header>

        <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-14">
          <nav aria-label="Sommaire" className="min-w-0 lg:sticky lg:top-40 lg:self-start">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Sommaire
            </p>
            <ol className="scrollbar-none flex gap-2 overflow-x-auto lg:flex-col lg:gap-1 lg:overflow-visible">
              {sections.map((s, i) => (
                <li key={s.id} className="shrink-0">
                  <a
                    href={`#${s.id}`}
                    className="block rounded-full border border-input px-3.5 py-1.5 text-[13px] hover:border-primary hover:text-primary lg:rounded-lg lg:border-0 lg:px-2 lg:py-1.5 lg:hover:bg-secondary"
                  >
                    <span className="hidden text-muted-foreground lg:inline">{i + 1}. </span>
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="flex min-w-0 flex-col gap-8">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-40">
                <h2 className="font-serif text-2xl font-medium text-primary-deep lg:text-[28px]">
                  <span className="text-gold-ink">{i + 1}.</span> {s.title}
                </h2>
                <div className="mt-3 flex flex-col gap-3 text-[15px] leading-relaxed text-foreground/85 [&_a]:font-semibold [&_a]:text-primary-deep [&_a]:underline [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-foreground">
                  {s.content}
                </div>
              </section>
            ))}

            <aside className="flex flex-col gap-4 rounded-2xl bg-primary-deep p-6 text-primary-foreground sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-serif text-2xl">Une question ?</p>
                <p className="mt-1 text-sm text-primary-foreground/80">
                  Nous vous répondons sur WhatsApp, généralement en quelques heures.
                </p>
              </div>
              <a
                href={whatsappLink("Bonjour Al Kareem, j'ai une question.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-whatsapp px-6 text-sm font-semibold text-whatsapp-foreground"
              >
                <MessageCircle className="h-4 w-4" /> Écrire sur WhatsApp
              </a>
            </aside>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
