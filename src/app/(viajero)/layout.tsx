import * as React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";

import { SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/dashboard-components/site-header";
import ViajeroSidebar from "@/components/viajero/sidebar/viajero-sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
      className="overflow-x-hidden" 
    >
      <ViajeroSidebar variant="inset" />

      <SidebarInset className="overflow-x-hidden">
        <SiteHeader />

        <div className="flex flex-1 flex-col overflow-x-hidden">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
