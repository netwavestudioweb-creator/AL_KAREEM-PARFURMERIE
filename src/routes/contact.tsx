import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout";
import {
  CheckCircle2,
  Clock,
  Instagram,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Truck,
  Wallet,
} from "lucide-react";
import { whatsappLink } from "@/lib/products";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { SITE_CONFIG, getCanonicalUrl } from "@/lib/site-config";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: `Contact & Boutique — ${SITE_CONFIG.name}` },
      {
        name: "description",
        content:
          "Contactez Al Kareem Parfumerie à Cotonou : WhatsApp direct (+229 01 61 88 89 87), boutique et conseils sur mesure. Commandes et livraisons au Bénin.",
      },
      { property: "og:site_name", content: SITE_CONFIG.name },
      { property: "og:title", content: `Contact — ${SITE_CONFIG.name}` },
      {
        property: "og:description",
        content: "Boutique Cotonou, WhatsApp, livraisons au Bénin et dans la sous-région.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: getCanonicalUrl("/contact") },
      { property: "og:image", content: SITE_CONFIG.ogImageUrl },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: `Contact — ${SITE_CONFIG.name}` },
      { name: "twitter:image", content: SITE_CONFIG.ogImageUrl },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/contact") }],
  }),
  component: ContactPage,
});

const INPUT =
  "h-[50px] w-full rounded-xl border border-input bg-card px-3.5 text-base font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";
const LABEL = "flex flex-col gap-1.5 text-[13px] font-semibold";

const QUICK = [
  {
    href: whatsappLink("Bonjour Al Kareem, j'ai une question."),
    icon: MessageCircle,
    title: "WhatsApp",
    desc: "Réponse rapide, conseil et commandes",
    external: true,
    tone: "bg-whatsapp text-whatsapp-foreground",
  },
  {
    href: "tel:+2290161888987",
    icon: Phone,
    title: "Appeler",
    desc: "+229 01 61 88 89 87",
    external: false,
    tone: "bg-card text-foreground border border-border",
  },
  {
    href: "https://instagram.com/khadisidibehassan",
    icon: Instagram,
    title: "Instagram",
    desc: "@khadisidibehassan",
    external: true,
    tone: "bg-card text-foreground border border-border",
  },
];

function ContactPage() {
  const [form, setForm] = useState({ name: "", contact: "", message: "" });
  const [honeypot, setHoneypot] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Champ piège (invisible) : rempli uniquement par les robots.
    if (honeypot.trim()) {
      setSent(true);
      return;
    }
    if (
      form.name.trim().length < 2 ||
      form.contact.trim().length < 4 ||
      form.message.trim().length < 5 ||
      form.message.trim().length > 2000
    ) {
      toast.error("Merci de remplir tous les champs (message de 5 à 2000 caractères).");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: form.name.trim(),
      contact: form.contact.trim(),
      message: form.message.trim(),
    });
    setBusy(false);
    if (error) {
      toast.error(
        /Trop de messages/i.test(error.message)
          ? "Vous avez déjà envoyé plusieurs messages. Merci de patienter quelques minutes."
          : "Impossible d'envoyer le message. Réessayez ou écrivez-nous sur WhatsApp.",
      );
      return;
    }
    setForm({ name: "", contact: "", message: "" });
    setSent(true);
  };

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-[1180px] px-4 pb-16 pt-5 lg:px-8 lg:pt-8">
        <nav aria-label="Fil d'Ariane" className="flex gap-2 text-[13px] text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            Accueil
          </Link>
          <span aria-hidden>/</span>
          <span className="text-foreground" aria-current="page">
            Contact
          </span>
        </nav>
        <h1 className="mt-3 font-serif text-[34px] font-medium leading-tight text-primary-deep lg:text-5xl">
          Restons en contact
        </h1>
        <p className="mt-2 max-w-xl text-[15px] text-foreground/75">
          Une question, un conseil parfum, une commande particulière ? Nous vous répondons avec
          plaisir.
        </p>

        {/* Contacts rapides */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {QUICK.map((q) => (
            <a
              key={q.title}
              href={q.href}
              target={q.external ? "_blank" : undefined}
              rel={q.external ? "noopener noreferrer" : undefined}
              className={`flex items-center gap-3.5 rounded-2xl p-4 transition-transform hover:-translate-y-0.5 ${q.tone}`}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black/5">
                <q.icon className="h-5 w-5" />
              </span>
              <span className="flex flex-col">
                <span className="text-[15px] font-semibold">{q.title}</span>
                <span className="text-[13px] opacity-80">{q.desc}</span>
              </span>
            </a>
          ))}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-8">
          {/* Infos boutique */}
          <section className="flex flex-col gap-5 rounded-2xl bg-[#2D1244] p-6 text-white lg:p-8">
            <h2 className="font-serif text-2xl lg:text-3xl">La boutique</h2>
            <InfoRow
              icon={MapPin}
              title="Cotonou, Bénin"
              desc="Adresse précise sur demande WhatsApp"
            />
            <InfoRow icon={Clock} title="Lun — Sam · 9h - 20h" desc="Dimanche sur rendez-vous" />
            <InfoRow
              icon={Truck}
              title="Livraison"
              desc="Cotonou, Abomey-Calavi, Porto-Novo, tout le Bénin et la sous-région"
            />
            <InfoRow
              icon={Wallet}
              title="Paiement à la réception"
              desc="Espèces, MTN MoMo, Moov Money"
            />
          </section>

          {/* Formulaire */}
          <section className="rounded-2xl border border-border bg-card p-6 lg:p-8">
            {sent ? (
              <div role="status" className="flex flex-col items-start gap-4 py-6">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-primary">
                  <CheckCircle2 className="h-7 w-7" />
                </span>
                <h2 className="font-serif text-[28px] text-primary-deep">Message envoyé</h2>
                <p className="text-[15px] text-foreground/80">
                  Merci ! Nous vous répondons rapidement, par téléphone ou par e-mail selon le
                  contact indiqué.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/boutique"
                    className="inline-flex h-12 items-center rounded-full bg-primary-deep px-6 text-sm font-semibold text-primary-foreground"
                  >
                    Voir la boutique
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="inline-flex h-12 items-center rounded-full border border-input px-6 text-sm font-semibold"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
                <div>
                  <h2 className="font-serif text-2xl text-primary-deep lg:text-3xl">
                    Écrivez-nous
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Nous vous répondons dès que possible.
                  </p>
                </div>
                <label className={LABEL}>
                  Nom
                  <input
                    required
                    maxLength={100}
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={INPUT}
                  />
                </label>
                <label className={LABEL}>
                  Téléphone ou e-mail
                  <input
                    required
                    maxLength={120}
                    value={form.contact}
                    onChange={(e) => setForm({ ...form, contact: e.target.value })}
                    placeholder="01 61 88 89 87 ou vous@exemple.com"
                    className={INPUT}
                  />
                </label>
                <label className={LABEL}>
                  Message
                  <textarea
                    required
                    rows={5}
                    maxLength={2000}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className={`${INPUT} h-auto min-h-[130px] py-3 leading-relaxed`}
                  />
                  <span className="self-end text-[11.5px] font-normal text-muted-foreground">
                    {form.message.length} / 2000
                  </span>
                </label>
                {/* Champ piège anti-robots : invisible et non focalisable pour un humain. */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  className="hidden"
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-primary-deep text-[15px] font-semibold text-primary-foreground hover:bg-primary disabled:opacity-60"
                >
                  <Send className="h-4 w-4" /> {busy ? "Envoi…" : "Envoyer le message"}
                </button>
              </form>
            )}
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}

function InfoRow({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof MapPin;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3.5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-gold">
        <Icon className="h-5 w-5" />
      </span>
      <span className="flex flex-col">
        <span className="font-semibold">{title}</span>
        <span className="text-sm text-[#CFC3DA]">{desc}</span>
      </span>
    </div>
  );
}
