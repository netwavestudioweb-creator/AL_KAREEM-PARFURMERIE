import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Réinitialiser le mot de passe — Al Kareem Parfumerie" },
      {
        name: "description",
        content:
          "Définissez un nouveau mot de passe pour votre espace d'administration Al Kareem Parfumerie.",
      },
      { name: "robots", content: "noindex,nofollow" },
      { property: "og:title", content: "Réinitialiser le mot de passe — Al Kareem" },
      {
        property: "og:description",
        content: "Définissez un nouveau mot de passe pour votre espace d'administration.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:image", content: "https://al-kareem-parfurmerie.vercel.app/og-alkareem.jpg" },
      {
        name: "twitter:image",
        content: "https://al-kareem-parfurmerie.vercel.app/og-alkareem.jpg",
      },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <img
            src="/alkareem-logo.jpg"
            alt="Al Kareem"
            className="h-14 w-14 mx-auto mb-3 object-contain rounded-full"
          />
          <h1 className="font-serif text-2xl text-gray-900">Nouveau mot de passe</h1>
          <p className="text-sm text-gray-600 mt-2">
            {ready
              ? "Choisissez un nouveau mot de passe (10 caractères min., lettres + chiffres)."
              : "Ouvrez cette page depuis le lien reçu par e-mail pour continuer."}
          </p>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (password.length < 10 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
              return toast.error("Mot de passe : 10 caractères minimum, avec lettres et chiffres.");
            }
            if (password !== confirm)
              return toast.error("Les deux mots de passe ne correspondent pas.");
            setBusy(true);
            const { error } = await supabase.auth.updateUser({ password });
            setBusy(false);
            if (error)
              return toast.error(
                "Lien expiré ou invalide. Redemandez un e-mail de réinitialisation.",
              );
            toast.success("Mot de passe mis à jour ✨");
            router.navigate({ to: "/admin" });
          }}
          className="space-y-4"
        >
          <label className="block">
            <span className="text-sm font-medium text-gray-800">Nouveau mot de passe</span>
            <input
              type="password"
              required
              minLength={10}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={!ready}
              autoComplete="new-password"
              className="mt-1.5 w-full h-12 rounded-lg border border-gray-300 bg-white px-3 text-base outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 disabled:bg-gray-100"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-800">Confirmer le mot de passe</span>
            <input
              type="password"
              required
              minLength={10}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={!ready}
              autoComplete="new-password"
              className="mt-1.5 w-full h-12 rounded-lg border border-gray-300 bg-white px-3 text-base outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 disabled:bg-gray-100"
            />
          </label>
          <button
            type="submit"
            disabled={busy || !ready}
            className="w-full h-12 rounded-lg bg-gray-900 text-white text-base font-medium hover:bg-black disabled:opacity-60"
          >
            {busy ? "Enregistrement…" : "Enregistrer le mot de passe"}
          </button>
        </form>
      </div>
    </div>
  );
}
