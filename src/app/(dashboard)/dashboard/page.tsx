import { AppSidebar } from "@/components/dashboard-components/app-sidebar";
import { ChartAreaInteractive } from "@/components/dashboard-components/chart-area-interactive";
import { DataTable } from "@/components/dashboard-components/data-table";
import { SiteHeader } from "@/components/dashboard-components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import data from "./../../data.json";
{/* Esta es la pantalla de inicio */}
export default function Page() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <h1>Hola viajero!</h1>
            <ChartAreaInteractive />
          </div>
          <DataTable data={data} />
        </div>
      </div>
    </div>
  );
}
