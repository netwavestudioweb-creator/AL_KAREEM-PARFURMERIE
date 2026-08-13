import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout";
import { MapPin, Phone, Clock, Instagram, MessageCircle, Send } from "lucide-react";
import { whatsappLink } from "@/lib/products";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Al Kareem Parfumerie" },
      { name: "description", content: "Contactez Al Kareem Parfumerie à Cotonou : boutique, WhatsApp, Instagram. Nous vous répondons rapidement." },
      { property: "og:title", content: "Contact — Al Kareem" },
      { property: "og:description", content: "Adresse, WhatsApp, réseaux — nous sommes à votre écoute." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "/og-alkareem.jpg" },
      { name: "twitter:image", content: "/og-alkareem.jpg" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", contact: "", message: "" });
  const [honeypot, setHoneypot] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Champ piège (invisible) : rempli uniquement par les robots.
    if (honeypot.trim()) {
      toast.success("Message envoyé ✨ Nous vous répondons rapidement.");
      setForm({ name: "", contact: "", message: "" });
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
          : "Impossible d'envoyer le message. Réessayez.",
      );
      return;
    }
    toast.success("Message envoyé ✨ Nous vous répondons rapidement.");
    setForm({ name: "", contact: "", message: "" });
    navigate({ to: "/" });
  };

  return (
    <SiteLayout>
      <section className="bg-gradient-hero">
        <div className="mx-auto max-w-4xl px-4 py-16 md:py-20 text-center">
          <div className="text-xs uppercase tracking-widest text-primary mb-3">Nous joindre</div>
          <h1 className="font-serif text-4xl md:text-5xl text-primary-deep">Restons en contact</h1>
          <p className="mt-4 text-foreground/70 max-w-xl mx-auto">
            Une question, un conseil parfum, une commande particulière ? Nous vous répondons avec plaisir.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 grid gap-6 md:grid-cols-2">
        <div className="p-8 rounded-2xl bg-white border border-border shadow-soft space-y-6">
          <h2 className="font-serif text-2xl text-primary-deep">Boutique physique</h2>
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-primary-deep shrink-0"><MapPin className="h-5 w-5" /></div>
            <div>
              <div className="font-medium">Cotonou, Bénin</div>
              <div className="text-sm text-muted-foreground">Adresse précise sur demande WhatsApp</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-primary-deep shrink-0"><Phone className="h-5 w-5" /></div>
            <div>
              <div className="font-medium">+229 01 61 88 89 87</div>
              <div className="text-sm text-muted-foreground">Appels & WhatsApp</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-primary-deep shrink-0"><Clock className="h-5 w-5" /></div>
            <div>
              <div className="font-medium">Lun — Sam · 9h - 20h</div>
              <div className="text-sm text-muted-foreground">Dimanche sur rendez-vous</div>
            </div>
          </div>
          <div className="pt-4 border-t border-border">
            <a
              href={whatsappLink("Bonjour Al Kareem 👋")}
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-whatsapp text-whatsapp-foreground px-6 py-3 text-sm font-medium hover:opacity-90"
            >
              <MessageCircle className="h-4 w-4" /> Ouvrir WhatsApp
            </a>
            <div className="mt-4">
              <a href="https://instagram.com/khadisidibehassan" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-primary-deep hover:opacity-80">
                <Instagram className="h-4 w-4" /> @khadisidibehassan
              </a>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="p-8 rounded-2xl bg-gradient-primary text-primary-foreground shadow-elegant space-y-4">
          <h2 className="font-serif text-2xl">Écrivez-nous</h2>
          <p className="opacity-90 text-sm">Laissez-nous un message, nous vous répondons dès que possible.</p>

          <label className="block">
            <span className="text-xs font-medium opacity-90">Nom</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full h-11 rounded-lg bg-white/95 text-foreground px-3 text-sm outline-none focus:ring-2 focus:ring-white/40"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium opacity-90">Téléphone ou e-mail</span>
            <input
              required
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              placeholder="+229 01 61 88 89 87 ou vous@exemple.com"
              className="mt-1 w-full h-11 rounded-lg bg-white/95 text-foreground px-3 text-sm outline-none focus:ring-2 focus:ring-white/40"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium opacity-90">Message</span>
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="mt-1 w-full rounded-lg bg-white/95 text-foreground px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/40"
            />
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
            className="inline-flex items-center gap-2 rounded-full bg-white text-primary-deep px-6 py-3 text-sm font-medium hover:opacity-90 disabled:opacity-60"
          >
            <Send className="h-4 w-4" /> {busy ? "Envoi…" : "Envoyer le message"}
          </button>
        </form>
      </section>
    </SiteLayout>
  );
}
