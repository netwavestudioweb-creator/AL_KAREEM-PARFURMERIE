import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { CartProvider } from "../lib/cart";
import { SiteLayout } from "../components/layout";
import { LoadingScreen } from "../components/loading-screen";

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

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
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

    if (import.meta.env.VITE_CLARITY_ID) {
      scripts.push({
        type: "text/javascript",
        children: `
          (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${import.meta.env.VITE_CLARITY_ID}");
        `,
      });
    }

    if (import.meta.env.VITE_GA_ID) {
      scripts.push(
        {
          src: `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_ID}`,
          async: true,
        },
        {
          type: "text/javascript",
          children: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${import.meta.env.VITE_GA_ID}');
          `,
        }
      );
    }

    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: "Al Kareem Parfumerie — Sublimez votre aura" },
        {
          name: "description",
          content:
            "Parfumerie de référence à Cotonou. Parfums femme, homme, unisexe et coffrets. Commande WhatsApp et paiement Mobile Money.",
        },
        { property: "og:title", content: "Al Kareem Parfumerie" },
        {
          property: "og:description",
          content:
            "L'amour se porte en parfum. Une sélection d'exception à Cotonou et dans tout le Bénin.",
        },
        { property: "og:image", content: "https://al-kareem-parfurmerie.vercel.app/og-alkareem.jpg" },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "icon", href: "/favicon.ico" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap",
        },
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
        <LoadingScreen />
      </CartProvider>
    </QueryClientProvider>
  );
}
