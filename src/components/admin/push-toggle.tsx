import { useEffect, useState } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";
import { toast } from "sonner";
import {
  disablePush,
  enablePush,
  getPushState,
  showTestNotification,
  type PushState,
} from "@/lib/push";

/** Encart « Notifications sur ce téléphone » de la page Commandes. */
export function PushToggle() {
  const [state, setState] = useState<PushState | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getPushState()
      .then(setState)
      .catch(() => setState("unsupported"));
  }, []);

  if (state === null) return null;

  const run = async (action: () => Promise<PushState>, ok?: string) => {
    setBusy(true);
    try {
      const next = await action();
      setState(next);
      if (next === "on" && ok) {
        toast.success(ok);
        await showTestNotification().catch(() => {});
      }
      if (next === "denied") toast.error("Notifications refusées dans les réglages du téléphone.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Activation impossible.");
    } finally {
      setBusy(false);
    }
  };

  const text: Record<PushState, string> = {
    on: "Activées sur ce téléphone : vous êtes prévenu à chaque nouvelle commande.",
    off: "Recevez une notification sur ce téléphone à chaque nouvelle commande.",
    denied:
      "Bloquées par le téléphone. Autorisez les notifications pour ce site dans les réglages du navigateur, puis rechargez la page.",
    "ios-needs-install":
      "Sur iPhone : touchez Partager puis « Sur l'écran d'accueil », ouvrez Al Kareem depuis l'icône, puis revenez ici.",
    unsupported: "Ce navigateur ne gère pas les notifications. Utilisez Chrome sur Android.",
  };

  const Icon = state === "on" ? BellRing : state === "off" ? Bell : BellOff;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3">
      <Icon
        className={`h-5 w-5 shrink-0 ${state === "on" ? "text-emerald-600" : "text-gray-500"}`}
      />
      <p className="min-w-0 flex-1 text-sm text-gray-700">
        <span className="font-semibold text-gray-900">Notifications · </span>
        {text[state]}
      </p>
      {state === "off" && (
        <button
          type="button"
          disabled={busy}
          onClick={() => run(enablePush, "Notifications activées sur ce téléphone.")}
          className="rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Activation…" : "Activer"}
        </button>
      )}
      {state === "on" && (
        <div className="flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => showTestNotification().catch(() => toast.error("Test impossible."))}
            className="rounded-full bg-gray-100 px-4 py-2 text-xs font-medium text-gray-700"
          >
            Tester
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => run(disablePush)}
            className="rounded-full bg-gray-100 px-4 py-2 text-xs font-medium text-gray-700"
          >
            Désactiver
          </button>
        </div>
      )}
    </div>
  );
}
