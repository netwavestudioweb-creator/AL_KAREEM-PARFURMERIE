import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { WhatsAppFab } from "./whatsapp-fab";

export function SiteLayout({
  children,
  hideFooter = false,
}: {
  children: ReactNode;
  hideFooter?: boolean;
}) {
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      {!hideFooter && <SiteFooter />}
      <WhatsAppFab />
    </div>
  );
}
