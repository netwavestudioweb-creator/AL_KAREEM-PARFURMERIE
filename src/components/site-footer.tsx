import { Link } from "@tanstack/react-router";
import { Instagram, MessageCircle, Phone, MapPin } from "lucide-react";
import { whatsappLink } from "@/lib/products";

export function SiteFooter() {
  return (
    <footer className="bg-primary-deep text-primary-foreground mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-soft overflow-hidden shrink-0">
              <img
                src="/alkareem-logo.jpg"
                alt="Al Kareem Parfumerie"
                className="h-10 w-10 object-contain"
              />
            </div>
            <div>
              <div className="font-serif text-2xl leading-tight">Al Kareem</div>
              <div className="text-[10px] tracking-[0.25em] uppercase opacity-70">Parfumerie</div>
            </div>
          </div>
          <p className="text-sm opacity-80 leading-relaxed">
            Sublimez votre aura. Une sélection de parfums d'exception, à Cotonou et dans tout le
            Bénin.
          </p>
        </div>
        <div>
          <div className="font-semibold mb-4 text-sm uppercase tracking-wider opacity-80">
            Boutique
          </div>
          <ul className="space-y-2 text-sm opacity-90">
            <li>
              <Link to="/boutique" search={{ genre: "Femme" }}>
                Femme
              </Link>
            </li>
            <li>
              <Link to="/boutique" search={{ genre: "Homme" }}>
                Homme
              </Link>
            </li>
            <li>
              <Link to="/boutique" search={{ genre: "Unisexe" }}>
                Unisexe
              </Link>
            </li>
            <li>
              <Link to="/boutique" search={{ genre: "Coffret" }}>
                Coffrets
              </Link>
            </li>
            <li>
              <Link to="/boutique" search={{ promo: true }}>
                Promotions
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-4 text-sm uppercase tracking-wider opacity-80">
            Contact
          </div>
          <ul className="space-y-3 text-sm opacity-90">
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0" /> Cotonou, Bénin
            </li>
            <li className="flex items-start gap-2">
              <Phone className="h-4 w-4 mt-0.5 shrink-0" /> +229 01 61 88 89 87
            </li>
            <li>
              <a
                href={whatsappLink("Bonjour Al Kareem 👋")}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 hover:opacity-100"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp Business
              </a>
            </li>
            <li>
              <a
                href="https://instagram.com/khadisidibehassan"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2"
              >
                <Instagram className="h-4 w-4" /> @khadisidibehassan
              </a>
            </li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-4 text-sm uppercase tracking-wider opacity-80">
            Informations
          </div>
          <ul className="space-y-2 text-sm opacity-90">
            <li>
              <Link to="/a-propos">À propos</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            <li>
              <Link to="/mentions-legales">Mentions légales</Link>
            </li>
            <li>
              <Link to="/confidentialite">Confidentialité</Link>
            </li>
            <li>
              <Link to="/cgv">CGV</Link>
            </li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-md bg-white/10 text-[11px] font-medium">
              MTN MoMo
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white/10 text-[11px] font-medium">
              Moov Money
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white/10 text-[11px] font-medium">
              À la livraison
            </span>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs opacity-70">
        © {new Date().getFullYear()} Al Kareem Parfumerie — Tous droits réservés. Réalisé par NetWave Studio.
      </div>
    </footer>
  );
}
