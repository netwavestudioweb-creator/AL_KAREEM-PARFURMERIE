import { Link, Outlet, createFileRoute, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { useAdminCounts } from "@/lib/admin-counts";
import { checkAdminExists, createInitialAdmin } from "@/lib/admin-setup.functions";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  ExternalLink,
  LogOut,
  Mail,
  Package,
  ShoppingBag,
  Sparkles,
  Tag,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administration — Al Kareem Parfumerie" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminLayout,
});

/** Déconnexion automatique après une heure sans activité sur l'espace admin. */
const IDLE_TIMEOUT_MS = 60 * 60 * 1000;

function useIdleSignOut(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        await supabase.auth.signOut();
        toast.info("Session fermée après une heure d'inactivité.");
      }, IDLE_TIMEOUT_MS);
    };
    const events = ["pointerdown", "keydown", "scroll", "visibilitychange"] as const;
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [enabled]);
}

function AdminLayout() {
  const { loading, session, isAdmin } = useAuth();
  useIdleSignOut(!!session);

  if (loading) return <AuthShell>Chargement…</AuthShell>;
  if (!session) return <AuthScreen />;
  if (!isAdmin) {
    return (
      <AuthShell>
        <div className="space-y-4 text-center">
          <h1 className="font-serif text-2xl text-primary-deep">Accès refusé</h1>
          <p className="text-sm text-muted-foreground">
            Ce compte n'a pas les droits d'administration.
          </p>
          <button onClick={() => supabase.auth.signOut()} className={BTN_PRIMARY}>
            Se déconnecter
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#F6F2EB] lg:flex">
      <AdminSidebar email={session.user.email ?? ""} />
      <div className="min-w-0 flex-1">
        <AdminMobileHeader />
        <main className="mx-auto max-w-5xl px-4 py-5 pb-28 lg:px-10 lg:py-8">
          <Outlet />
        </main>
      </div>
      <AdminTabBar />
    </div>
  );
}

const NAV = [
  { to: "/admin", label: "Produits", short: "Produits", icon: Package, exact: true },
  { to: "/admin/commandes", label: "Commandes", short: "Commandes", icon: ShoppingBag },
  { to: "/admin/messages", label: "Messages", short: "Messages", icon: Mail },
  { to: "/admin/vitrine", label: "Vitrine (avis & preuves)", short: "Vitrine", icon: Sparkles },
  { to: "/admin/categories", label: "Catégories", short: "Catégories", icon: Tag },
] as const;

function useSignOut() {
  const router = useRouter();
  return async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/admin" });
  };
}

function AdminSidebar({ email }: { email: string }) {
  const counts = useAdminCounts();
  const signOut = useSignOut();
  return (
    <aside className="sticky top-0 hidden h-[100dvh] w-[260px] shrink-0 flex-col gap-1 bg-[#2A1838] px-4 py-6 text-[#D9CFE2] lg:flex">
      <Link to="/admin" className="flex items-center gap-2.5 px-2 pb-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background">
          <img src="/alkareem-logo.webp" alt="" className="h-[30px] w-auto" />
        </span>
        <span className="leading-tight">
          <span className="block font-serif text-[22px] text-white">Al Kareem</span>
          <span className="block text-[10px] tracking-[0.24em] text-gold">ADMIN</span>
        </span>
      </Link>
      {NAV.map((n) => {
        const badge =
          n.to === "/admin/commandes"
            ? counts.orders
            : n.to === "/admin/messages"
              ? counts.messages
              : 0;
        return (
          <Link
            key={n.to}
            to={n.to}
            activeOptions={{ exact: "exact" in n }}
            className="flex items-center justify-between rounded-[10px] px-3 py-3 text-sm hover:bg-white/5"
            activeProps={{ className: "!bg-white/10 font-semibold text-white" }}
          >
            <span className="flex items-center gap-2.5">
              <n.icon className="h-4 w-4" /> {n.label}
            </span>
            {badge > 0 && (
              <span className="flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-gold px-1.5 text-[11px] font-bold text-[#2A1838]">
                {badge > 99 ? "99+" : badge}
              </span>
            )}
          </Link>
        );
      })}
      <span className="flex-1" />
      <a
        href="/"
        target="_blank"
        rel="noopener"
        className="flex items-center gap-2 px-3 py-3 text-[13.5px] hover:text-white"
      >
        Voir la boutique <ExternalLink className="h-3.5 w-3.5" />
      </a>
      <div className="border-t border-white/10 px-3 pt-3 text-xs text-[#A99BB6]">
        <div className="truncate">{email}</div>
        <button
          onClick={signOut}
          className="mt-1.5 inline-flex items-center gap-1.5 hover:text-white"
        >
          <LogOut className="h-3.5 w-3.5" /> Se déconnecter
        </button>
      </div>
    </aside>
  );
}

function AdminMobileHeader() {
  const signOut = useSignOut();
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between bg-[#2A1838] px-4 text-white lg:hidden">
      <Link to="/admin" className="flex items-center gap-2">
        <img
          src="/alkareem-logo.webp"
          alt=""
          className="h-8 w-8 rounded-full bg-background object-contain p-0.5"
        />
        <span className="font-serif text-xl">Al Kareem</span>
        <span className="text-[10px] tracking-[0.2em] text-gold">ADMIN</span>
      </Link>
      <button
        onClick={signOut}
        aria-label="Se déconnecter"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </header>
  );
}

function AdminTabBar() {
  const counts = useAdminCounts();
  return (
    <nav
      aria-label="Administration"
      className="fixed inset-x-0 bottom-0 z-30 grid h-[calc(64px+env(safe-area-inset-bottom,0px))] grid-cols-5 border-t border-border bg-card pb-[env(safe-area-inset-bottom,0px)] lg:hidden"
    >
      {NAV.map((n) => {
        const dot =
          (n.to === "/admin/commandes" && counts.orders > 0) ||
          (n.to === "/admin/messages" && counts.messages > 0);
        return (
          <Link
            key={n.to}
            to={n.to}
            activeOptions={{ exact: "exact" in n }}
            className="relative flex flex-col items-center justify-center gap-1 text-[10.5px] font-semibold text-foreground"
            activeProps={{ className: "!text-primary" }}
          >
            <n.icon className="h-5 w-5" />
            {n.short}
            {dot && (
              <span
                className="absolute right-[22%] top-2.5 h-2 w-2 rounded-full bg-[#C2410C]"
                aria-label="Nouveaux éléments"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Connexion                                                          */
/* ------------------------------------------------------------------ */

function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#2A1838] lg:items-center lg:justify-center lg:p-6">
      <div className="flex flex-col items-center gap-3 px-7 pb-8 pt-14 text-center text-white lg:pt-0">
        <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-background">
          <img src="/alkareem-logo.webp" alt="" className="h-[52px] w-auto" />
        </span>
        <span className="font-serif text-[30px]">Al Kareem</span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">
          Espace administration
        </span>
      </div>
      <section className="flex flex-1 flex-col gap-5 rounded-t-[28px] bg-background px-6 py-8 lg:w-full lg:max-w-md lg:flex-none lg:rounded-[28px] lg:px-8">
        {children}
      </section>
    </div>
  );
}

function AuthScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-exists"],
    queryFn: () => checkAdminExists(),
  });
  if (isLoading) return <AuthShell>Chargement…</AuthShell>;
  return data?.exists ? <LoginForm /> : <SetupForm />;
}

function PasswordInput({
  value,
  onChange,
  autoComplete,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  id: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="relative block">
      <input
        id={id}
        type={visible ? "text" : "password"}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className={`${INPUT} pr-14`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center text-muted-foreground"
      >
        {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </span>
  );
}

function SetupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const mut = useMutation({
    // Création côté serveur (clé service) : refusée si un admin existe déjà.
    mutationFn: (input: { email: string; password: string }) => createInitialAdmin({ data: input }),
    onSuccess: () => {
      toast.success("Compte administrateur créé. Vous pouvez vous connecter.");
      window.location.reload();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AuthShell>
      <div>
        <h1 className="font-serif text-[32px] font-medium text-primary-deep">Bienvenue</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Créez le compte administrateur de la boutique.
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (password.length < 10 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password))
            return toast.error("Mot de passe : 10 caractères minimum, avec lettres et chiffres.");
          mut.mutate({ email: email.trim(), password });
        }}
        className="flex flex-col gap-4"
      >
        <label className={LABEL}>
          Adresse e-mail
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={INPUT}
            autoComplete="email"
          />
        </label>
        <label className={LABEL} htmlFor="setup-password">
          Mot de passe (10 caractères min., lettres + chiffres)
          <PasswordInput
            id="setup-password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
          />
        </label>
        <button type="submit" disabled={mut.isPending} className={BTN_PRIMARY}>
          {mut.isPending ? "Création…" : "Créer le compte"}
        </button>
      </form>
    </AuthShell>
  );
}

/** Après 3 échecs, délai d'attente croissant (30 s, 60 s, 120 s… plafonné à 15 min). */
const LOCK_KEY = "alk_admin_login_lock";
function readLock(): { fails: number; until: number } {
  try {
    return JSON.parse(localStorage.getItem(LOCK_KEY) ?? "") as { fails: number; until: number };
  } catch {
    return { fails: 0, until: 0 };
  }
}
function writeLock(v: { fails: number; until: number }) {
  try {
    localStorage.setItem(LOCK_KEY, JSON.stringify(v));
  } catch {
    /* ignore */
  }
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sending, setSending] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [lock, setLock] = useState(readLock);
  const waitSeconds = Math.max(0, Math.ceil((lock.until - now) / 1000));

  useEffect(() => {
    if (waitSeconds <= 0) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [waitSeconds]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (waitSeconds > 0) return;
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      const fails = lock.fails + 1;
      const until = fails >= 3 ? Date.now() + Math.min(30_000 * 2 ** (fails - 3), 15 * 60_000) : 0;
      const next = { fails, until };
      writeLock(next);
      setLock(next);
      setNow(Date.now());
      toast.error("E-mail ou mot de passe incorrect.");
      return;
    }
    writeLock({ fails: 0, until: 0 });
    setPassword("");
  };

  return (
    <AuthShell>
      <div>
        <h1 className="font-serif text-[32px] font-medium text-primary-deep">Connexion</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Accès réservé à l'équipe Al Kareem.</p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className={LABEL}>
          Adresse e-mail
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={INPUT}
            autoComplete="email"
          />
        </label>
        <label className={LABEL} htmlFor="login-password">
          Mot de passe
          <PasswordInput
            id="login-password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
          />
        </label>
        <button type="submit" disabled={busy || waitSeconds > 0} className={BTN_PRIMARY}>
          {busy
            ? "Connexion…"
            : waitSeconds > 0
              ? `Réessayez dans ${waitSeconds} s`
              : "Se connecter"}
        </button>
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
            // Même message dans tous les cas : ne révèle pas si l'adresse existe.
            if (error)
              toast.error("Envoi impossible pour le moment. Réessayez dans quelques minutes.");
            else
              toast.success(
                "Si cette adresse est enregistrée, un e-mail de réinitialisation vient d'être envoyé.",
              );
          }}
          className="self-center text-[13.5px] font-medium text-primary-deep underline underline-offset-4 disabled:opacity-60"
        >
          {sending ? "Envoi…" : "Mot de passe oublié ?"}
        </button>
      </form>
      <span className="mt-auto text-center text-[11.5px] text-muted-foreground">
        Connexion chiffrée · Session fermée automatiquement après inactivité
      </span>
    </AuthShell>
  );
}

const LABEL = "flex flex-col gap-1.5 text-[13px] font-semibold";
const INPUT =
  "h-[52px] w-full rounded-xl border border-input bg-card px-3.5 text-base font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";
const BTN_PRIMARY =
  "h-[54px] w-full rounded-full bg-primary-deep text-base font-semibold text-primary-foreground hover:bg-primary disabled:opacity-60";
