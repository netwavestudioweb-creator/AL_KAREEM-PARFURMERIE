import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

/**
 * Écran de chargement : dégradé violet + logo blanc animé (SVG inline, aucun
 * asset à télécharger). Affiché au premier rendu puis retiré dès l'hydratation,
 * et réaffiché si une navigation prend plus de 400 ms.
 */
export function LoadingScreen() {
  const [booting, setBooting] = useState(true);
  const isPending = useRouterState({ select: (s) => s.status === "pending" });
  const [slowNav, setSlowNav] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 350);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!isPending) {
      setSlowNav(false);
      return;
    }
    const t = setTimeout(() => setSlowNav(true), 400);
    return () => clearTimeout(t);
  }, [isPending]);

  const visible = booting || (isPending && slowNav);
  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[100] flex items-center justify-center alk-loader"
    >
      <AlKareemMark />
    </div>
  );
}

function AlKareemMark() {
  return (
    <div className="flex flex-col items-center gap-4 alk-loader-mark">
      <div className="h-24 w-24 rounded-full bg-white p-2 shadow-2xl flex items-center justify-center animate-pulse">
        <img
          src="/alkareem-logo.jpg"
          alt="Al Kareem Parfumerie"
          className="h-20 w-20 object-contain rounded-full"
        />
      </div>
      <div className="text-white text-[12px] uppercase tracking-[0.35em] font-medium mt-1">
        Al Kareem Parfumerie
      </div>
    </div>
  );
}
