import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

// Politique de sécurité du contenu : le navigateur ne charge et n'envoie des données
// qu'aux domaines listés. Même si un script malveillant était injecté, il ne pourrait
// pas exfiltrer la session admin vers un serveur tiers (connect-src).
// 'unsafe-inline' reste nécessaire pour les scripts d'hydratation de TanStack Start.
const SUPABASE = "https://*.supabase.co wss://*.supabase.co";
const ANALYTICS =
  "https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://*.clarity.ms";

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://*.clarity.ms`,
  `connect-src 'self' ${SUPABASE} ${ANALYTICS}`,
  `img-src 'self' data: blob: https://*.supabase.co ${ANALYTICS}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "media-src 'self'",
  "frame-src 'none'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self' https://wa.me https://api.whatsapp.com",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

// En-têtes de sécurité appliqués à toutes les réponses.
const SECURITY_HEADERS: Record<string, string> = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "strict-transport-security": "max-age=31536000; includeSubDomains",
  "cross-origin-opener-policy": "same-origin-allow-popups",
  "x-frame-options": "SAMEORIGIN",
  "content-security-policy": CONTENT_SECURITY_POLICY,
};

// Pages publiques mises en cache 60 s sur le CDN, puis resservies pendant leur
// rafraîchissement en arrière-plan : réponse quasi instantanée pour la plupart des
// visites. Le HTML ne contient aucune donnée personnelle (panier et session admin
// vivent dans le navigateur). Une modification dans l'admin apparaît sous ~1 min.
const PUBLIC_PAGE_CACHE = "public, max-age=0, s-maxage=60, stale-while-revalidate=600";
const NO_CDN_CACHE_PREFIXES = ["/admin", "/reset-password", "/avis", "/_serverFn", "/api"];

function isCacheablePage(request: Request, response: Response): boolean {
  if (request.method !== "GET" || response.status !== 200) return false;
  if (!(response.headers.get("content-type") ?? "").includes("text/html")) return false;
  if (response.headers.has("cache-control") || response.headers.has("set-cookie")) return false;
  const { pathname } = new URL(request.url);
  return !NO_CDN_CACHE_PREFIXES.some((p) => pathname.startsWith(p));
}

function withSecurityHeaders(response: Response, request?: Request): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    if (!headers.has(key)) headers.set(key, value);
  }
  if (request && isCacheablePage(request, response)) {
    headers.set("cache-control", PUBLIC_PAGE_CACHE);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return withSecurityHeaders(await normalizeCatastrophicSsrResponse(response), request);
    } catch (error) {
      console.error(error);
      return withSecurityHeaders(
        new Response(renderErrorPage(), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
      );
    }
  },
};
