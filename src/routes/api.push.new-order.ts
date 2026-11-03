import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { timingSafeEqual } from "node:crypto";
import webpush from "web-push";
import { VAPID_PUBLIC_KEY } from "@/lib/push-config";
import { SITE_CONFIG } from "@/lib/site-config";

/**
 * Appelée par la base (déclencheur orders_notify_push, via pg_net) à chaque nouvelle commande :
 * envoie une notification à chaque téléphone admin abonné. Protégée par un secret partagé
 * (PUSH_WEBHOOK_SECRET côté Vercel, « push_webhook_secret » dans Vault côté Supabase).
 */

interface Subscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

interface Payload {
  order?: {
    id?: string;
    customer_name?: string;
    total_fcfa?: number;
    zone?: string;
    items?: number;
  };
  subscriptions?: Subscription[];
}

function sameSecret(given: string | null, expected: string | undefined): boolean {
  if (!given || !expected) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Espaces des milliers en espace simple (fr-FR utilise des espaces insécables fines).
const fcfa = (n: number) => `${n.toLocaleString("fr-FR").replace(/\s/g, " ")} FCFA`;

export const Route = createFileRoute("/api/push/new-order")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!sameSecret(request.headers.get("x-push-secret"), process.env.PUSH_WEBHOOK_SECRET)) {
          return new Response("Unauthorized", { status: 401 });
        }
        const privateKey = process.env.VAPID_PRIVATE_KEY;
        if (!privateKey) return new Response("VAPID_PRIVATE_KEY manquante", { status: 500 });

        let data: Payload;
        try {
          data = (await request.json()) as Payload;
        } catch {
          return new Response("JSON invalide", { status: 400 });
        }
        const subs = (data.subscriptions ?? []).filter((s) => s?.endpoint && s.keys?.p256dh);
        const o = data.order ?? {};

        const parts = [
          o.customer_name?.trim() || "Client",
          typeof o.total_fcfa === "number" ? fcfa(o.total_fcfa) : null,
          o.items ? `${o.items} article${o.items > 1 ? "s" : ""}` : null,
          o.zone || null,
        ].filter(Boolean);
        const notification = JSON.stringify({
          title: "Nouvelle commande",
          body: parts.join(" · "),
          url: "/admin/commandes",
          tag: o.id ? `order-${o.id}` : "order",
        });

        webpush.setVapidDetails(SITE_CONFIG.url, VAPID_PUBLIC_KEY, privateKey);
        const results = await Promise.allSettled(
          subs.map((s) =>
            webpush.sendNotification(s, notification, { TTL: 86400, urgency: "high" }),
          ),
        );
        const sent = results.filter((r) => r.status === "fulfilled").length;
        return Response.json({ sent, failed: results.length - sent });
      },
    },
  },
});
