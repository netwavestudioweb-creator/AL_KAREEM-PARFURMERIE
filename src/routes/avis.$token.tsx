import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { CheckCircle2, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { REVIEW_QUESTIONS, SCORE_LABELS, type Score } from "@/lib/reviews";

export const Route = createFileRoute("/avis/$token")({
  head: () => ({
    meta: [
      { title: "Votre avis — Al Kareem Parfumerie" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ReviewPage,
});

const RATING_LABELS = ["", "Très déçu(e)", "Déçu(e)", "Correct", "Très bien", "Excellent"];

type Answers = Record<(typeof REVIEW_QUESTIONS)[number]["key"], Score | "">;

function ReviewPage() {
  const { token } = Route.useParams();
  const request = useQuery({
    queryKey: ["review-request", token],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_review_request", { p_token: token });
      if (error) throw error;
      return data?.[0] ?? null;
    },
    retry: false,
    staleTime: Infinity,
  });

  const [rating, setRating] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    product_score: "",
    delivery_score: "",
    service_score: "",
  });
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (request.data?.first_name && !name) setName(request.data.first_name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request.data?.first_name]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (rating < 1) return setError("Choisissez une note de 1 à 5 étoiles.");
    if (message.trim().length < 3) return setError("Écrivez quelques mots sur votre expérience.");
    if (!name.trim()) return setError("Indiquez le prénom à afficher.");
    setSending(true);
    const { error: rpcError } = await supabase.rpc("submit_review", {
      p_token: token,
      p_rating: rating,
      p_product: answers.product_score,
      p_delivery: answers.delivery_score,
      p_service: answers.service_score,
      p_message: message.trim(),
      p_display_name: name.trim(),
      p_city: city.trim(),
      p_consent: consent,
    });
    setSending(false);
    if (rpcError) {
      setError(
        /déjà utilisé|invalide/i.test(rpcError.message) &&
          !/Note|Message|Nom/.test(rpcError.message)
          ? "Ce lien a déjà servi ou n'est plus valide."
          : "L'envoi n'a pas abouti. Vérifiez votre connexion puis réessayez.",
      );
      return;
    }
    setSent(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-[100dvh] bg-background px-4 pb-16 pt-[max(2rem,env(safe-area-inset-top,0px))]">
      <div className="mx-auto flex max-w-lg flex-col gap-6">
        <header className="flex flex-col items-center gap-2 text-center">
          <img src="/alkareem-logo.webp" alt="" width={56} height={75} className="h-14 w-auto" />
          <span className="font-serif text-2xl text-primary-deep">Al Kareem</span>
          <span className="text-[10px] uppercase tracking-[0.35em] text-gold-ink">Parfumerie</span>
        </header>

        {request.isLoading ? (
          <Card>
            <p className="text-center text-sm text-muted-foreground">Chargement…</p>
          </Card>
        ) : !request.data ? (
          <Card>
            <h1 className="font-serif text-3xl text-primary-deep">Lien introuvable</h1>
            <p className="text-[15px] text-foreground/80">
              Ce lien d'avis n'est pas valide. Vérifiez qu'il est complet, ou écrivez-nous sur
              WhatsApp.
            </p>
            <BackToShop />
          </Card>
        ) : sent || request.data.already_submitted ? (
          <Card>
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-primary">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <h1 className="font-serif text-3xl text-primary-deep">
              Merci {name || request.data.first_name} !
            </h1>
            <p className="text-[15px] leading-relaxed text-foreground/80">
              {sent
                ? "Votre avis est bien envoyé. Il nous aide à toujours mieux vous servir."
                : "Votre avis nous est déjà parvenu. Merci pour votre confiance."}
            </p>
            <BackToShop />
          </Card>
        ) : (
          <form onSubmit={submit} noValidate className="flex flex-col gap-6">
            <div className="text-center">
              <h1 className="font-serif text-[32px] font-medium leading-tight text-primary-deep">
                {request.data.first_name ? `${request.data.first_name}, votre avis` : "Votre avis"}{" "}
                compte pour nous
              </h1>
              <p className="mt-2 text-[15px] text-foreground/75">
                30 secondes pour nous dire comment s'est passée votre commande.
              </p>
            </div>

            <Card>
              <fieldset className="flex flex-col items-center gap-2">
                <legend className="mb-2 w-full text-center text-sm font-semibold">
                  Votre note globale
                </legend>
                <div role="radiogroup" aria-label="Note de 1 à 5 étoiles" className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={rating === n}
                      aria-label={`${n} étoile${n > 1 ? "s" : ""} — ${RATING_LABELS[n]}`}
                      onClick={() => setRating(n)}
                      className="flex h-12 w-12 items-center justify-center rounded-full hover:bg-accent"
                    >
                      <Star
                        className={`h-9 w-9 ${n <= rating ? "fill-gold text-gold" : "text-border"}`}
                      />
                    </button>
                  ))}
                </div>
                <span className="h-5 text-sm font-medium text-primary-deep">
                  {RATING_LABELS[rating]}
                </span>
              </fieldset>
            </Card>

            <Card>
              {REVIEW_QUESTIONS.map((q) => (
                <fieldset key={q.key} className="flex flex-col gap-2.5">
                  <legend className="mb-2.5 text-[15px] font-semibold">{q.question}</legend>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(SCORE_LABELS) as Score[]).map((s) => (
                      <label
                        key={s}
                        className={`flex h-11 cursor-pointer items-center justify-center rounded-xl text-sm ${answers[q.key] === s ? "border-2 border-primary bg-accent font-semibold text-primary-deep" : "border border-input bg-card"}`}
                      >
                        <input
                          type="radio"
                          name={q.key}
                          value={s}
                          checked={answers[q.key] === s}
                          onChange={() => setAnswers((a) => ({ ...a, [q.key]: s }))}
                          className="sr-only"
                        />
                        {SCORE_LABELS[s]}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </Card>

            <Card>
              <label
                className="flex flex-col gap-1.5 text-[15px] font-semibold"
                htmlFor="avis-message"
              >
                En quelques mots
                <textarea
                  id="avis-message"
                  rows={4}
                  maxLength={600}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ce que vous avez aimé : le parfum, la tenue, la livraison, le conseil…"
                  className="rounded-xl border border-input bg-card px-3.5 py-3 text-base font-normal leading-relaxed outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
                <span className="self-end text-xs font-normal text-muted-foreground">
                  {message.length} / 600
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <label
                  className="flex flex-col gap-1.5 text-[13px] font-semibold"
                  htmlFor="avis-nom"
                >
                  Prénom affiché
                  <input
                    id="avis-nom"
                    maxLength={40}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 rounded-xl border border-input bg-card px-3.5 text-base font-normal outline-none focus:border-primary"
                  />
                </label>
                <label
                  className="flex flex-col gap-1.5 text-[13px] font-semibold"
                  htmlFor="avis-ville"
                >
                  Ville
                  <input
                    id="avis-ville"
                    maxLength={40}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Cotonou"
                    className="h-12 rounded-xl border border-input bg-card px-3.5 text-base font-normal outline-none focus:border-primary"
                  />
                </label>
              </div>
              <label className="flex cursor-pointer items-start gap-3 text-sm leading-snug">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-primary)]"
                />
                J'accepte que mon avis (prénom, ville, note et texte) soit publié sur le site Al
                Kareem Parfumerie.
              </label>
            </Card>

            {error && (
              <p
                role="alert"
                className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={sending}
              className="h-14 rounded-full bg-primary-deep text-base font-semibold text-primary-foreground hover:bg-primary disabled:opacity-60"
            >
              {sending ? "Envoi…" : "Envoyer mon avis"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5">
      {children}
    </section>
  );
}

function BackToShop() {
  return (
    <Link
      to="/boutique"
      className="inline-flex h-12 items-center justify-center rounded-full bg-primary-deep px-6 text-sm font-semibold text-primary-foreground"
    >
      Découvrir la boutique
    </Link>
  );
}
