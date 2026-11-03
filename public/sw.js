// Service worker de l'espace admin (portée /admin/) : affiche les notifications
// de nouvelles commandes envoyées par /api/push/new-order. Aucune mise en cache.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "Nouvelle commande", {
      body: data.body || "Une commande vient d'arriver sur le site.",
      icon: "/alkareem-logo-120.webp",
      tag: data.tag || "order",
      renotify: true,
      requireInteraction: true,
      data: { url: data.url || "/admin/commandes" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/admin/commandes", self.location.origin)
    .href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
      const admin = wins.find((w) => w.url.includes("/admin"));
      if (admin) return admin.navigate(url).then((w) => (w || admin).focus());
      return self.clients.openWindow(url);
    }),
  );
});
