import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { WhatsAppFab } from "./whatsapp-fab";
import { MobileTabBar } from "./mobile-tab-bar";

export function SiteLayout({
  children,
  hideFooter = false,
}: {
  children: ReactNode;
  hideFooter?: boolean;
}) {
  return (
    // Sur mobile, on réserve la hauteur de la barre d'onglets fixe en bas.
    <div className="flex min-h-[100dvh] flex-col pb-[calc(64px+env(safe-area-inset-bottom,0px))] lg:pb-0">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      {!hideFooter && <SiteFooter />}
      <WhatsAppFab />
      <MobileTabBar />
    </div>
  );
}
