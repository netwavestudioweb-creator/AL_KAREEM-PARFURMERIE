import { Analytics } from "@vercel/analytics/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { CartProvider } from "../lib/cart";
import { SiteLayout } from "../components/layout";
import { LoadingScreen } from "../components/loading-screen";
import { SITE_CONFIG } from "../lib/site-config";
import { ConsentBanner } from "../components/consent-banner";
import { jsonLd } from "@/lib/json-ld";

function NotFoundComponent() {
  return (
    <SiteLayout>
      <div className="flex min-h-[60dvh] items-center justify-center bg-background px-4 py-16">
        <div className="max-w-md text-center">
          <h1 className="text-7xl font-serif text-primary-deep">404</h1>
          <h2 className="mt-4 text-xl font-semibold text-foreground">Page introuvable</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Cette page n'existe pas ou a été déplacée.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-deep transition-colors"
            >
              Retour à l'accueil
            </Link>
            <Link
              to="/boutique"
              className="inline-flex items-center justify-center rounded-full border border-input bg-background px-6 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
            >
              Voir la boutique
            </Link>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">Une erreur est survenue</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Merci de rafraîchir la page ou de revenir à l'accueil.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-deep"
          >
            Réessayer
          </button>
          <a
            href="/"
            className="rounded-full border border-input bg-background px-6 py-2.5 text-sm font-medium hover:bg-accent"
          >
            Accueil
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => {
    const scripts = [];

    // Mesures d'audience : chargées seulement après consentement (ConsentBanner).
    scripts.push({
      type: "application/ld+json",
      children: jsonLd({
        "@context": "https://schema.org",
        "@type": ["Organization", "Store", "PerfumeStore"],
        "@id": `${SITE_CONFIG.url}/#organization`,
        name: SITE_CONFIG.name,
        alternateName: SITE_CONFIG.alternateNames,
        url: SITE_CONFIG.url,
        logo: {
          "@type": "ImageObject",
          url: SITE_CONFIG.logoUrl,
          width: "512",
          height: "512",
        },
        image: SITE_CONFIG.ogImageUrl,
        description: SITE_CONFIG.description,
        telephone: SITE_CONFIG.phone,
        priceRange: SITE_CONFIG.priceRange,
        address: {
          "@type": "PostalAddress",
          addressLocality: SITE_CONFIG.address.addressLocality,
          addressCountry: SITE_CONFIG.address.addressCountry,
        },
        currenciesAccepted: SITE_CONFIG.currency,
        paymentAccepted: "Cash, MTN Mobile Money, Moov Money",
        sameAs: [
          ...SITE_CONFIG.sameAs,
          `https://wa.me/${SITE_CONFIG.whatsapp.replace(/[^0-9]/g, "")}`,
        ],
        areaServed: SITE_CONFIG.areaServed,
        contactPoint: {
          "@type": "ContactPoint",
          telephone: SITE_CONFIG.phone,
          contactType: "customer service",
          availableLanguage: ["French"],
          areaServed: SITE_CONFIG.areaServed,
        },
      }),
    });

    // Codes de validation Search Console / Bing, renseignés dans les variables d'environnement Vercel.
    const verification = [
      import.meta.env.VITE_GOOGLE_SITE_VERIFICATION
        ? {
            name: "google-site-verification",
            content: import.meta.env.VITE_GOOGLE_SITE_VERIFICATION,
          }
        : null,
      import.meta.env.VITE_BING_SITE_VERIFICATION
        ? { name: "msvalidate.01", content: import.meta.env.VITE_BING_SITE_VERIFICATION }
        : null,
    ].filter((m): m is { name: string; content: string } => m !== null);

    return {
      meta: [
        { charSet: "utf-8" },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover",
        },
        { name: "theme-color", content: "#4B1D6E" },
        { name: "mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-status-bar-style", content: "default" },
        { name: "format-detection", content: "telephone=no" },
        ...verification,
        { title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}` },
        {
          name: "description",
          content: SITE_CONFIG.description,
        },
        { property: "og:site_name", content: SITE_CONFIG.name },
        { property: "og:locale", content: "fr_FR" },
        { property: "og:title", content: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}` },
        {
          property: "og:description",
          content: SITE_CONFIG.description,
        },
        { property: "og:image", content: SITE_CONFIG.ogImageUrl },
        { property: "og:logo", content: SITE_CONFIG.logoUrl },
        { property: "og:type", content: "website" },
        { property: "og:url", content: SITE_CONFIG.url },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}` },
        { name: "twitter:description", content: SITE_CONFIG.description },
        { name: "twitter:image", content: SITE_CONFIG.ogImageUrl },
      ],
      links: [
        {
          rel: "preconnect",
          href: "https://zoagwbhgpaslyjjsdnnv.supabase.co",
          crossOrigin: "anonymous",
        },
        { rel: "dns-prefetch", href: "https://zoagwbhgpaslyjjsdnnv.supabase.co" },
        { rel: "manifest", href: "/site.webmanifest" },
        { rel: "preload", as: "style", href: appCss },
        {
          rel: "preload",
          as: "font",
          type: "font/woff2",
          href: "/fonts/cormorant-10.woff2",
          crossOrigin: "anonymous",
        },
        {
          rel: "preload",
          as: "font",
          type: "font/woff2",
          href: "/fonts/inter-32.woff2",
          crossOrigin: "anonymous",
        },
        { rel: "stylesheet", href: appCss },
        { rel: "icon", href: "/favicon.ico" },
        { rel: "apple-touch-icon", href: "/alkareem-logo.webp" },
      ],
      scripts,
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <Outlet />
        <Toaster position="top-center" richColors />
        <ConsentBanner />
        <LoadingScreen />
        <Analytics />
      </CartProvider>
    </QueryClientProvider>
  );
}
