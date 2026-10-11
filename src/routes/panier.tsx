import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout";
import { useCart } from "@/lib/cart";
import { SITE_CONFIG } from "@/lib/site-config";
import { formatFCFA, whatsappLink, WHATSAPP_NUMBER } from "@/lib/products";
import { buildOrderMessage, type OrderMessageItem } from "@/lib/order-message";
import { fetchLiveProducts, type LiveProductInfo } from "@/lib/catalog";
import { formatPhoneForCountry, PHONE_COUNTRIES } from "@/lib/phone";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, MessageCircle, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { trackWhatsAppClick } from "@/lib/analytics";

export const Route = createFileRoute("/panier")({
  head: () => ({
    meta: [
      { title: "Panier — Al Kareem Parfumerie" },
      {
        name: "description",
        content:
          "Finalisez votre commande via WhatsApp. Paiement à la livraison ou en main propre.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Panier — Al Kareem" },
      { property: "og:description", content: "Finalisez votre commande de parfums via WhatsApp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: SITE_CONFIG.ogImageUrl },
      {
        name: "twitter:image",
        content: SITE_CONFIG.ogImageUrl,
      },
    ],
  }),
  component: CartPage,
});

const CUSTOMER_KEY = "alkareem_customer_v1";
const CUSTOMER_FORM_TTL_MS = 30 * 24 * 60 * 60 * 1000;

type ZoneKey = "Cotonou" | "Abomey-Calavi" | "Porto-Novo" | "Autre" | "Hors Bénin";
const ZONE_OPTIONS: { value: ZoneKey; label: string }[] = [
  { value: "Cotonou", label: "Cotonou" },
  { value: "Abomey-Calavi", label: "Abomey-Calavi" },
  { value: "Porto-Novo", label: "Porto-Novo" },
  { value: "Autre", label: "Autre ville du Bénin" },
  { value: "Hors Bénin", label: "Hors Bénin (sous-région)" },
];

const INPUT =
  "h-[50px] w-full rounded-xl border border-input bg-card px-3.5 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";
const LABEL = "flex flex-col gap-1.5 text-[13px] font-semibold";

function CartPage() {
  const navigate = useNavigate();
  const { items, updateQty, removeItem, total, clear, syncWithLive } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [unavailable, setUnavailable] = useState<string[]>([]);
  const [pricesChecked, setPricesChecked] = useState(false);
  const [form, setForm] = useState({
    nom: "",
    pays: "229",
    tel: "",
    zone: "Cotonou" as ZoneKey,
    autreVille: "",
    adresse: "",
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CUSTOMER_KEY);
      if (raw) {
        const c = JSON.parse(raw) as { savedAt?: number } & typeof form;
        if (c.savedAt && Date.now() - c.savedAt <= CUSTOMER_FORM_TTL_MS) {
          setForm((f) => ({ ...f, ...c }));
        } else {
          localStorage.removeItem(CUSTOMER_KEY);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  /** Relit prix et stock en base ; signale les changements au client. */
  const refreshPrices = async () => {
    const live = await fetchLiveProducts(items.map((i) => i.productId));
    const report = syncWithLive(live);
    setUnavailable(report.unavailable);
    for (const c of report.priceChanged) {
      toast.info(`Prix mis à jour : ${c.name} est maintenant à ${formatFCFA(c.after)}.`);
    }
    setPricesChecked(true);
    return { live, report };
  };

  // Vérification à l'ouverture du panier (une fois).
  useEffect(() => {
    if (items.length === 0 || pricesChecked) return;
    refreshPrices().catch(() => setPricesChecked(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const needsPlace = form.zone === "Autre" || form.zone === "Hors Bénin";
  const zoneLabel = !needsPlace
    ? form.zone
    : form.zone === "Hors Bénin"
      ? `Hors Bénin — ${form.autreVille.trim()}`.slice(0, 60)
      : form.autreVille.trim();

  const buildMessage = (lines: OrderMessageItem[], sum: number, phone: string) =>
    buildOrderMessage({
      items: lines,
      total: sum,
      name: form.nom.trim(),
      phone,
      zone: zoneLabel,
      address: form.adresse,
    });

  const [lastMessage, setLastMessage] = useState("");

  const openWhatsApp = () => {
    trackWhatsAppClick("cart_checkout", total);
    const popup = window.open(whatsappLink(lastMessage), "_blank");
    if (popup) popup.opener = null;
    else toast.error("WhatsApp ne s'est pas ouvert. Autorisez les fenêtres pop-up puis réessayez.");
  };

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (form.nom.trim().length < 2) {
      toast.error("Merci d'indiquer votre nom.");
      return;
    }
    const phone = formatPhoneForCountry(form.pays, form.tel);
    if (!phone) {
      toast.error(
        form.pays === "229"
          ? "Numéro invalide. Exemple : 01 61 88 89 87."
          : "Numéro invalide. Vérifiez l'indicatif et le numéro.",
      );
      return;
    }
    if (needsPlace && form.autreVille.trim().length < 2) {
      toast.error(
        form.zone === "Hors Bénin"
          ? "Merci de préciser votre pays et votre ville."
          : "Merci de préciser votre ville.",
      );
      return;
    }

    // Fenêtre ouverte pendant le geste utilisateur : sinon un navigateur mobile peut bloquer
    // WhatsApp une fois l'enregistrement asynchrone terminé.
    const whatsappWindow = window.open("about:blank", "_blank");
    if (!whatsappWindow) {
      toast.error("WhatsApp ne s'est pas ouvert. Autorisez les fenêtres pop-up puis réessayez.");
      return;
    }
    whatsappWindow.opener = null;
    setSubmitting(true);
    const abort = (message: string) => {
      whatsappWindow.close();
      setSubmitting(false);
      toast.error(message);
    };

    // Prix et stock relus juste avant l'envoi : le message WhatsApp affiche les prix de la base.
    let live: Map<string, LiveProductInfo>;
    try {
      ({ live } = await refreshPrices());
    } catch {
      abort("Connexion interrompue. Vérifiez votre réseau puis réessayez.");
      return;
    }
    const lines = items.map((i) => {
      const l = live.get(i.productId);
      return {
        productId: i.productId,
        name: l?.name ?? i.name,
        volume: l?.volume ?? i.volume,
        price: l?.price ?? i.price,
        quantity: i.quantity,
        available: !!l?.inStock,
      };
    });
    if (lines.some((l) => !l.available)) {
      abort("Un article n'est plus disponible. Retirez-le du panier puis réessayez.");
      return;
    }
    const sum = lines.reduce((s, l) => s + l.price * l.quantity, 0);

    let error: { message: string } | null = null;
    try {
      const res = await supabase.from("orders").insert({
        customer_name: form.nom.trim(),
        customer_phone: phone,
        zone: zoneLabel,
        address: form.adresse.trim(),
        items: lines.map((l) => ({
          product_id: l.productId,
          name: l.name,
          volume: l.volume,
          unit_price_fcfa: l.price,
          quantity: l.quantity,
          line_total_fcfa: l.price * l.quantity,
        })),
        subtotal_fcfa: sum,
        total_fcfa: sum,
        status: "envoyee",
      });
      error = res.error;
    } catch {
      abort("Connexion interrompue. Vérifiez votre réseau puis réessayez.");
      return;
    }

    if (error) {
      const m = error.message ?? "";
      abort(
        /Trop de commandes/i.test(m)
          ? "Plusieurs commandes ont déjà été envoyées avec ce numéro. Merci de patienter un moment ou de nous écrire sur WhatsApp."
          : /indisponible/i.test(m)
            ? "Un article de votre panier est en rupture de stock. Retirez-le puis réessayez."
            : /introuvable|inconnu/i.test(m)
              ? "Un article de votre panier n'est plus disponible à la vente. Retirez-le puis réessayez."
              : "Impossible d'enregistrer la commande. Réessayez ou écrivez-nous sur WhatsApp.",
      );
      return;
    }

    try {
      localStorage.setItem(
        CUSTOMER_KEY,
        JSON.stringify({
          nom: form.nom,
          pays: form.pays,
          tel: form.pays === "229" ? phone : form.tel,
          zone: form.zone,
          autreVille: form.autreVille,
          adresse: form.adresse,
          savedAt: Date.now(),
        }),
      );
    } catch {
      /* ignore */
    }

    const message = buildMessage(lines, sum, phone);
    setLastMessage(message);
    setForm((f) => ({ ...f, tel: phone }));
    setOrderCreated(true);
    setSubmitting(false);
    trackWhatsAppClick("cart_checkout", sum);
    whatsappWindow.location.href = whatsappLink(message);
  };

  const finishOrder = () => {
    clear();
    navigate({ to: "/commande-envoyee" });
  };

  if (items.length === 0) {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-xl px-4 py-24 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent text-primary-deep">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h1 className="font-serif text-3xl text-primary-deep">Votre panier est vide</h1>
          <p className="mt-2 text-muted-foreground">
            Découvrez nos fragrances et laissez-vous séduire.
          </p>
          <Link
            to="/boutique"
            className="mt-6 inline-flex rounded-full bg-primary-deep px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary"
          >
            Découvrir la boutique
          </Link>
        </section>
      </SiteLayout>
    );
  }

  const steps = [
    { label: "Panier", done: true },
    { label: "Livraison", done: true },
    { label: "WhatsApp", done: orderCreated },
  ];
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1180px] px-4 pb-16 pt-5 lg:px-8 lg:pt-8">
        <h1 className="font-serif text-[30px] font-medium text-primary-deep lg:text-[44px]">
          Votre panier ({count})
        </h1>

        <ol
          aria-label="Étapes de la commande"
          className="mt-4 grid grid-cols-3 gap-1.5 text-center text-[11.5px] font-semibold lg:max-w-md lg:text-xs"
        >
          {steps.map((s, i) => (
            <li
              key={s.label}
              className={`border-t-[3px] pt-2 ${s.done ? "border-primary text-primary-deep" : "border-border text-muted-foreground"}`}
            >
              {i + 1} · {s.label}
            </li>
          ))}
        </ol>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-10">
          {/* Articles */}
          <section aria-label="Articles">
            <ul className="divide-y divide-border border-y border-border">
              {items.map((i) => {
                const isUnavailable = unavailable.includes(i.name);
                return (
                  <li
                    key={i.productId}
                    className="grid grid-cols-[84px_minmax(0,1fr)] gap-3 py-3.5"
                  >
                    <img
                      src={i.image}
                      alt=""
                      width={84}
                      height={84}
                      className={`h-[84px] w-[84px] rounded-[10px] bg-secondary object-cover ${isUnavailable ? "opacity-50" : ""}`}
                    />
                    <div className="flex min-w-0 flex-col gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-serif text-lg leading-tight">{i.name}</span>
                        <button
                          type="button"
                          onClick={() => removeItem(i.productId)}
                          aria-label={`Retirer ${i.name} du panier`}
                          className="-mr-2 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      {i.volume && (
                        <span className="text-[12.5px] text-muted-foreground">{i.volume}</span>
                      )}
                      {isUnavailable && (
                        <span className="text-[12.5px] font-semibold text-destructive">
                          Plus disponible — retirez-le pour commander
                        </span>
                      )}
                      <div className="mt-1.5 flex items-center justify-between">
                        <div
                          role="group"
                          aria-label={`Quantité de ${i.name}`}
                          className="flex h-9 items-center rounded-full border border-input bg-card"
                        >
                          <button
                            type="button"
                            onClick={() => updateQty(i.productId, i.quantity - 1)}
                            aria-label="Diminuer"
                            className="flex h-full w-9 items-center justify-center rounded-l-full hover:bg-secondary"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">
                            {i.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQty(i.productId, Math.min(20, i.quantity + 1))}
                            aria-label="Augmenter"
                            className="flex h-full w-9 items-center justify-center rounded-r-full hover:bg-secondary"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="text-[15px] font-semibold">
                          {formatFCFA(i.price * i.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <Link
              to="/boutique"
              className="mt-4 inline-block text-sm font-semibold text-primary-deep hover:text-primary"
            >
              ← Continuer mes achats
            </Link>
          </section>

          {/* Récapitulatif + livraison */}
          <div className="flex flex-col gap-5 lg:sticky lg:top-40 lg:self-start">
            <section
              aria-label="Récapitulatif"
              className="flex flex-col gap-2.5 rounded-[14px] border border-border bg-card p-4 text-sm"
            >
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span className="font-semibold">{formatFCFA(total)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Livraison</span>
                <span>Confirmée sur WhatsApp</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between text-[17px]">
                <span className="font-semibold">Total articles</span>
                <span className="font-bold">{formatFCFA(total)}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {pricesChecked ? "Prix vérifiés à l'instant · " : ""}Rien à payer maintenant
              </span>
            </section>

            {orderCreated ? (
              <section
                role="status"
                className="flex flex-col gap-3 rounded-[14px] border border-primary/30 bg-accent p-5"
              >
                <span className="flex items-center gap-2 font-serif text-xl text-primary-deep">
                  <CheckCircle2 className="h-5 w-5 text-primary" /> Commande enregistrée
                </span>
                <p className="text-sm leading-relaxed text-foreground/85">
                  Envoyez maintenant le message préparé dans WhatsApp. Votre panier reste disponible
                  jusqu'à votre confirmation.
                </p>
                <button
                  type="button"
                  onClick={openWhatsApp}
                  className="flex h-12 items-center justify-center gap-2 rounded-full border border-primary-deep text-sm font-semibold text-primary-deep hover:bg-primary-deep hover:text-primary-foreground"
                >
                  <MessageCircle className="h-4 w-4" /> Rouvrir WhatsApp
                </button>
                <button
                  type="button"
                  onClick={finishOrder}
                  className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-whatsapp text-[15px] font-semibold text-whatsapp-foreground"
                >
                  <CheckCircle2 className="h-4 w-4" /> J'ai envoyé mon message
                </button>
              </section>
            ) : (
              <form onSubmit={submitOrder} className="flex flex-col gap-3.5" noValidate>
                <h2 className="font-serif text-2xl font-medium text-primary-deep">Où livrer ?</h2>
                <label className={LABEL}>
                  Nom complet
                  <input
                    required
                    autoComplete="name"
                    maxLength={100}
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    className={INPUT}
                  />
                </label>
                <label className={LABEL}>
                  Téléphone (WhatsApp)
                  <span className="flex gap-2">
                    <select
                      aria-label="Indicatif du pays"
                      value={form.pays}
                      onChange={(e) => setForm({ ...form, pays: e.target.value })}
                      className="h-[50px] w-[132px] shrink-0 rounded-xl border border-input bg-secondary px-2 text-[15px] font-medium outline-none focus:border-primary"
                    >
                      {PHONE_COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          +{c.code} {c.label}
                        </option>
                      ))}
                    </select>
                    <input
                      required
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      maxLength={20}
                      placeholder={
                        form.pays === "229" ? "01 61 88 89 87" : "Numéro sans l'indicatif"
                      }
                      value={form.tel}
                      onChange={(e) => setForm({ ...form, tel: e.target.value })}
                      className={`${INPUT} min-w-0 flex-1`}
                    />
                  </span>
                </label>
                <fieldset className="flex flex-col gap-2">
                  <legend className="mb-2 text-[13px] font-semibold">Zone de livraison</legend>
                  <div className="grid grid-cols-2 gap-2">
                    {ZONE_OPTIONS.map((z) => (
                      <label
                        key={z.value}
                        className={`flex h-[46px] cursor-pointer items-center justify-center gap-2 rounded-xl text-sm ${z.value === "Hors Bénin" ? "col-span-2" : ""} ${form.zone === z.value ? "border-2 border-primary bg-accent font-semibold text-primary-deep" : "border border-input bg-card"}`}
                      >
                        <input
                          type="radio"
                          name="zone"
                          value={z.value}
                          checked={form.zone === z.value}
                          onChange={() => setForm({ ...form, zone: z.value })}
                          className="accent-[var(--color-primary)]"
                        />
                        {z.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
                {needsPlace && (
                  <label className={LABEL}>
                    {form.zone === "Hors Bénin" ? "Pays et ville" : "Ville"}
                    <input
                      required
                      maxLength={45}
                      placeholder={form.zone === "Hors Bénin" ? "Ex : Lomé, Togo" : "Ex : Parakou"}
                      value={form.autreVille}
                      onChange={(e) => setForm({ ...form, autreVille: e.target.value })}
                      className={INPUT}
                    />
                    {form.zone === "Hors Bénin" && (
                      <span className="text-xs font-normal text-muted-foreground">
                        Délais, frais de livraison et mode de paiement confirmés avec vous sur
                        WhatsApp.
                      </span>
                    )}
                  </label>
                )}
                <label className={LABEL}>
                  <span>
                    Adresse ou point de repère{" "}
                    <span className="font-normal text-muted-foreground">(facultatif)</span>
                  </span>
                  <input
                    maxLength={300}
                    autoComplete="street-address"
                    placeholder="Ex : Fidjrossè, près de la pharmacie…"
                    value={form.adresse}
                    onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                    className={INPUT}
                  />
                </label>

                <button
                  type="submit"
                  disabled={submitting || unavailable.length > 0}
                  className="mt-2 flex h-14 items-center justify-center gap-2.5 rounded-full bg-whatsapp text-base font-semibold text-whatsapp-foreground hover:brightness-110 disabled:opacity-60"
                >
                  <MessageCircle className="h-5 w-5" />
                  {submitting ? "Enregistrement…" : "Valider et envoyer sur WhatsApp"}
                </button>
                <p className="text-center text-[12.5px] leading-relaxed text-muted-foreground">
                  Votre commande est enregistrée, puis WhatsApp s'ouvre avec le récapitulatif prêt à
                  envoyer au +229 {WHATSAPP_NUMBER.slice(3).replace(/(\d{2})(?=\d)/g, "$1 ")}. Nous
                  confirmons la livraison et le paiement avec vous.
                </p>
                <div className="flex justify-center gap-4 text-xs font-semibold text-foreground/75">
                  <span>✓ Paiement à la réception</span>
                  <span>✓ 100 % authentique</span>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
