/**
 * Consentement aux mesures d'audience (Google Analytics, Microsoft Clarity).
 * Rien n'est chargé tant que le visiteur n'a pas accepté ; le choix est
 * conservé 13 mois, puis redemandé.
 */
const KEY = "alk_consent_v1";
const MAX_AGE_MS = 13 * 30 * 24 * 60 * 60 * 1000;

export type ConsentChoice = "granted" | "denied";

const GA_ID = import.meta.env.VITE_GA_ID as string | undefined;
const CLARITY_ID = import.meta.env.VITE_CLARITY_ID as string | undefined;

export const analyticsConfigured = Boolean(GA_ID || CLARITY_ID);

export function readConsent(): ConsentChoice | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const { choice, at } = JSON.parse(raw) as { choice: ConsentChoice; at: number };
    if (Date.now() - at > MAX_AGE_MS) return null;
    return choice === "granted" || choice === "denied" ? choice : null;
  } catch {
    return null;
  }
}

export function saveConsent(choice: ConsentChoice) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ choice, at: Date.now() }));
  } catch {
    /* navigation privée : le choix ne vaut que pour cette visite */
  }
  if (choice === "granted") loadAnalytics();
}

let loaded = false;

/** Identifiants attendus : G-XXXX pour GA4, alphanumérique pour Clarity. */
const SAFE_ID = /^[A-Za-z0-9-]{4,32}$/;

export function loadAnalytics() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;

  if (GA_ID && SAFE_ID.test(GA_ID)) {
    const w = window as unknown as { dataLayer: unknown[]; gtag: (...args: unknown[]) => void };
    w.dataLayer = w.dataLayer || [];
    w.gtag = function gtag() {
      // gtag attend l'objet `arguments` tel quel.
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer.push(arguments);
    };
    w.gtag("js", new Date());
    w.gtag("config", GA_ID, { anonymize_ip: true });
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
    document.head.appendChild(s);
  }

  if (CLARITY_ID && SAFE_ID.test(CLARITY_ID)) {
    const w = window as unknown as { clarity?: ((...args: unknown[]) => void) & { q?: unknown[] } };
    w.clarity =
      w.clarity ||
      Object.assign(
        (...args: unknown[]) => {
          (w.clarity!.q = w.clarity!.q || []).push(args);
        },
        { q: [] as unknown[] },
      );
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.clarity.ms/tag/${encodeURIComponent(CLARITY_ID)}`;
    document.head.appendChild(s);
  }
}
