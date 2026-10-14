import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Archive, Eye, EyeOff, Globe, Star } from "lucide-react";
import {
  REVIEW_QUESTIONS,
  SCORE_LABELS,
  fetchReviews,
  publishReview,
  setReviewStatus,
  type Review,
  type ReviewStatus,
  type Score,
} from "@/lib/reviews";

const TABS: { id: ReviewStatus; label: string }[] = [
  { id: "received", label: "À traiter" },
  { id: "published", label: "Publiés" },
  { id: "internal", label: "Internes" },
  { id: "archived", label: "Archivés" },
  { id: "requested", label: "En attente de réponse" },
];

const SCORE_STYLE: Record<Score, string> = {
  oui: "bg-[#E3F3EA] text-[#1E6B3E]",
  moyen: "bg-[#FBF0DA] text-[#8A6420]",
  non: "bg-[#FCE4E4] text-[#9B1C1C]",
};

function Stars({ value }: { value: number | null }) {
  return (
    <span className="flex gap-0.5" aria-label={`${value ?? 0} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-4 w-4 ${value && n <= value ? "fill-gold text-gold" : "text-border"}`}
        />
      ))}
    </span>
  );
}

/** Modération des avis clients (section de la page Vitrine). */
export function ReviewsModeration() {
  const qc = useQueryClient();
  const {
    data: reviews = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: fetchReviews,
  });
  const [tab, setTab] = useState<ReviewStatus>("received");

  const answered = reviews.filter((r) => r.status !== "requested");
  const stats = useMemo(() => {
    const rated = answered.filter((r) => r.rating);
    const avg = rated.length ? rated.reduce((s, r) => s + (r.rating ?? 0), 0) / rated.length : 0;
    const share = (key: (typeof REVIEW_QUESTIONS)[number]["key"]) => {
      const withAnswer = answered.filter((r) => r[key]);
      if (!withAnswer.length) return null;
      return Math.round(
        (withAnswer.filter((r) => r[key] === "oui").length / withAnswer.length) * 100,
      );
    };
    return {
      avg,
      count: answered.length,
      shares: REVIEW_QUESTIONS.map((q) => ({ label: q.label, pct: share(q.key) })),
    };
  }, [answered]);

  const shown = reviews.filter((r) => r.status === tab);

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["admin-reviews"] });
    await qc.invalidateQueries({ queryKey: ["admin-count-reviews"] });
    await qc.invalidateQueries({ queryKey: ["testimonials"] });
  };
  const publish = useMutation({
    mutationFn: publishReview,
    onSuccess: async () => {
      await refresh();
      toast.success("Avis publié sur le site.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const move = useMutation({
    mutationFn: ({ r, status }: { r: Review; status: "internal" | "archived" }) =>
      setReviewStatus(r, status),
    onSuccess: async (_d, v) => {
      await refresh();
      toast.success(v.status === "internal" ? "Avis gardé en interne." : "Avis archivé.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (error) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Le module des avis n'est pas encore installé dans la base de données.
      </div>
    );
  }

  return (
    <section id="avis" className="flex scroll-mt-24 flex-col gap-5">
      <h2 className="font-serif text-2xl text-gray-900">Avis clients</h2>

      <section className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <div className="flex flex-col gap-1 rounded-[14px] bg-[#2A1838] p-4 text-white">
          <span className="text-[26px] font-semibold leading-none">
            {stats.count ? stats.avg.toFixed(1).replace(".", ",") : "—"}
            <span className="text-base font-normal text-gold"> / 5</span>
          </span>
          <span className="text-[12.5px] text-[#CFC3DA]">
            Note moyenne · {stats.count} avis reçu{stats.count > 1 ? "s" : ""}
          </span>
        </div>
        {stats.shares.map((s) => (
          <div
            key={s.label}
            className="flex flex-col gap-1 rounded-[14px] border border-border bg-card p-4"
          >
            <span className="text-[26px] font-semibold leading-none text-primary-deep">
              {s.pct === null ? "—" : `${s.pct} %`}
            </span>
            <span className="text-[12.5px] text-muted-foreground">{s.label} : satisfaits</span>
          </div>
        ))}
      </section>

      <div className="scrollbar-none flex gap-2 overflow-x-auto">
        {TABS.map((t) => {
          const n = reviews.filter((r) => r.status === t.id).length;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-[13px] ${tab === t.id ? "bg-primary-deep font-semibold text-primary-foreground" : "border border-input bg-card"}`}
            >
              {t.label} ({n})
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <p className="py-12 text-center text-muted-foreground">Chargement…</p>
      ) : shown.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          {tab === "received"
            ? "Aucun nouvel avis. Demandez un avis depuis une commande livrée (onglet Commandes)."
            : "Rien dans cette liste pour le moment."}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {shown.map((r) => (
            <li
              key={r.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4"
            >
              {r.status === "requested" ? (
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold">{r.customer_name}</span>
                  <span className="text-muted-foreground">
                    Demandé le {new Date(r.created_at).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-3">
                      <Stars value={r.rating} />
                      <span className="text-sm font-semibold">
                        {[r.display_name, r.city].filter(Boolean).join(", ")}
                      </span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {r.customer_name} ·{" "}
                      {r.submitted_at && new Date(r.submitted_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <blockquote className="font-serif text-lg leading-snug">
                    « {r.message} »
                  </blockquote>
                  <div className="flex flex-wrap gap-2">
                    {REVIEW_QUESTIONS.map((q) => {
                      const v = r[q.key];
                      return v ? (
                        <span
                          key={q.key}
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${SCORE_STYLE[v]}`}
                        >
                          {q.label} : {SCORE_LABELS[v]}
                        </span>
                      ) : null;
                    })}
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${r.consent_publish ? "bg-accent text-primary-deep" : "bg-muted text-muted-foreground"}`}
                    >
                      {r.consent_publish ? "Publication autorisée" : "Publication refusée"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                    {r.status !== "published" && (
                      <button
                        type="button"
                        disabled={!r.consent_publish || publish.isPending}
                        onClick={() => publish.mutate(r)}
                        title={
                          r.consent_publish
                            ? undefined
                            : "La cliente n'a pas autorisé la publication"
                        }
                        className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary-deep px-4 text-[13px] font-semibold text-primary-foreground disabled:opacity-40"
                      >
                        <Globe className="h-4 w-4" /> Publier sur le site
                      </button>
                    )}
                    {r.status !== "internal" && (
                      <button
                        type="button"
                        disabled={move.isPending}
                        onClick={() => move.mutate({ r, status: "internal" })}
                        className="inline-flex h-10 items-center gap-1.5 rounded-full border border-input px-4 text-[13px] font-semibold"
                      >
                        {r.status === "published" ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        {r.status === "published" ? "Retirer du site" : "Garder en interne"}
                      </button>
                    )}
                    {r.status !== "archived" && (
                      <button
                        type="button"
                        disabled={move.isPending}
                        onClick={() => move.mutate({ r, status: "archived" })}
                        className="inline-flex h-10 items-center gap-1.5 rounded-full border border-input px-4 text-[13px] font-semibold text-muted-foreground"
                      >
                        <Archive className="h-4 w-4" /> Archiver
                      </button>
                    )}
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
