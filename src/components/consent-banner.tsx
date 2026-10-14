import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { analyticsConfigured, loadAnalytics, readConsent, saveConsent } from "@/lib/consent";

/** Bandeau de consentement aux mesures d'audience (jamais affiché dans l'admin ni sur la page d'avis). */
export function ConsentBanner() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!analyticsConfigured) return;
    const choice = readConsent();
    if (choice === "granted") loadAnalytics();
    else if (choice === null) setOpen(true);
  }, []);

  if (!open || pathname.startsWith("/admin") || pathname.startsWith("/avis")) return null;

  const decide = (choice: "granted" | "denied") => {
    saveConsent(choice);
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Mesure d'audience"
      className="fixed inset-x-3 bottom-[calc(76px+env(safe-area-inset-bottom,0px))] z-50 mx-auto flex max-w-xl flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-elegant lg:bottom-6 lg:left-6 lg:right-auto lg:mx-0"
    >
      <p className="text-[13.5px] leading-relaxed text-foreground/85">
        Nous mesurons l'audience du site (Google Analytics, Microsoft Clarity) pour l'améliorer.
        Acceptez-vous ces cookies ?{" "}
        <Link to="/confidentialite" className="font-semibold text-primary-deep underline">
          En savoir plus
        </Link>
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => decide("denied")}
          className="h-11 flex-1 rounded-full border border-input text-sm font-semibold"
        >
          Refuser
        </button>
        <button
          type="button"
          onClick={() => decide("granted")}
          className="h-11 flex-1 rounded-full bg-primary-deep text-sm font-semibold text-primary-foreground"
        >
          Accepter
        </button>
      </div>
    </div>
  );
}
