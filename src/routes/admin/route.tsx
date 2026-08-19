import { Link, Outlet, createFileRoute, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { checkAdminExists, createInitialAdmin } from "@/lib/admin-setup.functions";
import { toast } from "sonner";
import { LogOut, LayoutGrid, Package, Tag, ShoppingBag, Mail, Sparkles } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administration — Al Kareem Parfumerie" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { loading, session, isAdmin } = useAuth();

  if (loading) {
    return <FullScreen>Chargement…</FullScreen>;
  }

  if (!session) {
    return <AuthScreen />;
  }

  if (!isAdmin) {
    return (
      <FullScreen>
        <div className="max-w-sm text-center space-y-4">
          <h1 className="text-xl font-semibold">Accès refusé</h1>
          <p className="text-sm text-gray-600">Ce compte n'a pas les droits d'administration.</p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="rounded-lg bg-gray-900 text-white px-4 py-2 text-sm"
          >
            Se déconnecter
          </button>
        </div>
      </FullScreen>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader email={session.user.email ?? ""} />
      <main className="mx-auto max-w-5xl px-4 py-6 pb-24">
        <Outlet />
      </main>
    </div>
  );
}

function useUnreadCounts() {
  const orders = useQuery({
    queryKey: ["admin-count-orders-envoyee"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "envoyee");
      if (error) return 0;
      return count ?? 0;
    },
    refetchInterval: 30_000,
  });
  const messages = useQuery({
    queryKey: ["admin-count-messages-unread"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("contact_messages")
        .select("id", { count: "exact", head: true })
        .eq("read", false);
      if (error) return 0;
      return count ?? 0;
    },
    refetchInterval: 30_000,
  });
  return { orders: orders.data ?? 0, messages: messages.data ?? 0 };
}

function AdminHeader({ email }: { email: string }) {
  const router = useRouter();
  const counts = useUnreadCounts();
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
      <div className="mx-auto max-w-5xl px-4 h-16 flex items-center justify-between gap-3">
        <Link to="/admin" className="flex items-center gap-2 min-w-0">
          <img
            src="/alkareem-logo.jpg"
            alt="Al Kareem"
            className="h-9 w-9 object-contain shrink-0 rounded-full"
          />
          <div className="leading-tight min-w-0">
            <div className="font-serif text-base text-gray-900 truncate">Al Kareem</div>
            <div className="text-[10px] tracking-widest text-gray-500 uppercase">
              Administration
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-xs text-gray-500 truncate max-w-[160px]">
            {email}
          </span>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.navigate({ to: "/admin" });
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 px-3 py-2 text-sm text-gray-800"
            title="Se déconnecter"
          >
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </div>
      <nav className="mx-auto max-w-5xl px-2 sm:px-4 pb-2 grid grid-cols-6 gap-1 sm:flex sm:flex-wrap sm:gap-2">
        <NavTab
          to="/admin"
          label="Produits"
          short="Produits"
          icon={<Package className="h-5 w-5 sm:h-4 sm:w-4" />}
          exact
        />
        <NavTab
          to="/admin/commandes"
          label="Commandes"
          short="Cmdes"
          icon={<ShoppingBag className="h-5 w-5 sm:h-4 sm:w-4" />}
          badge={counts.orders}
        />
        <NavTab
          to="/admin/messages"
          label="Messages"
          short="Messages"
          icon={<Mail className="h-5 w-5 sm:h-4 sm:w-4" />}
          badge={counts.messages}
        />
        <NavTab
          to="/admin/categories"
          label="Catégories"
          short="Catég."
          icon={<Tag className="h-5 w-5 sm:h-4 sm:w-4" />}
        />
        <NavTab
          to="/admin/vitrine"
          label="Vitrine"
          short="Vitrine"
          icon={<Sparkles className="h-5 w-5 sm:h-4 sm:w-4" />}
        />
        <NavTab
          to="/"
          label="Voir la boutique"
          short="Boutique"
          icon={<LayoutGrid className="h-5 w-5 sm:h-4 sm:w-4" />}
        />
      </nav>
    </header>
  );
}

const TAB_BASE =
  "relative min-w-0 flex flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[10px] font-medium text-center sm:flex-row sm:gap-1.5 sm:rounded-full sm:px-4 sm:text-sm";

function NavTab({
  to,
  label,
  short,
  icon,
  exact,
  badge,
}: {
  to: string;
  label: string;
  short: string;
  icon: React.ReactNode;
  exact?: boolean;
  badge?: number;
}) {
  return (
    <Link
      to={to}
      activeOptions={{ exact }}
      className={`${TAB_BASE} bg-gray-100 text-gray-700 hover:bg-gray-200`}
      activeProps={{ className: `${TAB_BASE} bg-gray-900 text-white` }}
    >
      <span className="relative shrink-0">
        {icon}
        {badge && badge > 0 ? (
          <span className="sm:hidden absolute -top-1.5 -right-2 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-semibold leading-none">
            {badge > 99 ? "99+" : badge}
          </span>
        ) : null}
      </span>
      <span className="w-full truncate sm:hidden">{short}</span>
      <span className="hidden sm:inline">{label}</span>
      {badge && badge > 0 ? (
        <span className="hidden sm:inline-flex ml-1 items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-semibold">
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
    </Link>
  );
}

function FullScreen({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}

function AuthScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-exists"],
    queryFn: () => checkAdminExists(),
  });

  if (isLoading) return <FullScreen>Chargement…</FullScreen>;
  return data?.exists ? <LoginForm /> : <SetupForm />;
}

function SetupForm({ onBack }: { onBack?: () => void } = {}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const mut = useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
      });
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: async () => {
      toast.success("Compte administrateur créé ✨. Vous pouvez vous connecter.");
      window.location.reload();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <FullScreen>
      <div className="text-center mb-6">
        <img
          src="/alkareem-logo.jpg"
          alt="Al Kareem"
          className="h-14 w-14 mx-auto mb-3 object-contain rounded-full"
        />
        <h1 className="font-serif text-2xl text-gray-900">Bienvenue</h1>
        <p className="text-sm text-gray-600 mt-2">
          Créez votre compte administrateur pour gérer votre boutique.
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (password.length < 10 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password))
            return toast.error("Mot de passe : 10 caractères minimum, avec lettres et chiffres.");
          mut.mutate({ email: email.trim(), password });
        }}
        className="space-y-4"
      >
        <Field label="Adresse e-mail">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={INPUT}
            autoComplete="email"
          />
        </Field>
        <Field label="Mot de passe (10 caractères min., lettres + chiffres)">
          <input
            type="password"
            required
            minLength={10}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={INPUT}
            autoComplete="new-password"
          />
        </Field>
        <button type="submit" disabled={mut.isPending} className={BTN_PRIMARY}>
          {mut.isPending ? "Création…" : "Créer mon compte"}
        </button>
      </form>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mt-4 w-full text-sm text-gray-600 underline underline-offset-4 hover:text-gray-900"
        >
          Retour à la connexion
        </button>
      )}
    </FullScreen>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sending, setSending] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    /* focus first field is nice-to-have */
  }, []);

  if (showSetup) {
    return <SetupForm onBack={() => setShowSetup(false)} />;
  }

  return (
    <FullScreen>
      <div className="text-center mb-6">
        <img
          src="/alkareem-logo.jpg"
          alt="Al Kareem"
          className="h-14 w-14 mx-auto mb-3 object-contain rounded-full"
        />
        <h1 className="font-serif text-2xl text-gray-900">Connexion</h1>
        <p className="text-sm text-gray-600 mt-2">Espace administration</p>
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const { error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
          setBusy(false);
          if (error) toast.error("E-mail ou mot de passe incorrect.");
        }}
        className="space-y-4"
      >
        <Field label="Adresse e-mail">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={INPUT}
            autoComplete="email"
          />
        </Field>
        <Field label="Mot de passe">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={INPUT}
            autoComplete="current-password"
          />
        </Field>
        <button type="submit" disabled={busy} className={BTN_PRIMARY}>
          {busy ? "Connexion…" : "Se connecter"}
        </button>
      </form>
      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          disabled={sending}
          onClick={async () => {
            const target = email.trim();
            if (!target) return toast.error("Saisissez d'abord votre adresse e-mail.");
            setSending(true);
            const { error } = await supabase.auth.resetPasswordForEmail(target, {
              redirectTo: `${window.location.origin}/reset-password`,
            });
            setSending(false);
            if (error)
              toast.error("Envoi impossible pour le moment. Réessayez dans quelques minutes.");
            else
              toast.success(
                "E-mail de réinitialisation envoyé. Vérifiez votre boîte de réception.",
              );
          }}
          className="w-full text-sm text-gray-600 underline underline-offset-4 hover:text-gray-900 disabled:opacity-60"
        >
          {sending ? "Envoi…" : "Mot de passe oublié ?"}
        </button>
        <button
          type="button"
          onClick={() => setShowSetup(true)}
          className="w-full text-sm text-gray-600 underline underline-offset-4 hover:text-gray-900"
        >
          Créer un compte administrateur
        </button>
      </div>
    </FullScreen>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-800">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const INPUT =
  "w-full h-12 rounded-lg border border-gray-300 bg-white px-3 text-base outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";
const BTN_PRIMARY =
  "w-full h-12 rounded-lg bg-gray-900 text-white text-base font-medium hover:bg-black disabled:opacity-60";
