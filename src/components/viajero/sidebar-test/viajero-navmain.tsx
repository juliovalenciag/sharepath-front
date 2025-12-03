"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconCirclePlusFilled,
  IconCalendarWeekFilled,
  type Icon,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type Item = { title: string; url: string; icon?: Icon };

function longestMatchingHref(pathname: string, items: Item[]) {
  const clean = (p: string) => (p || "").replace(/\/+$/, "");
  const a = clean(pathname);
  let best: string | null = null;

  for (const it of items) {
    if (!it.url || it.url === "#") continue;
    const b = clean(it.url);
    if (a === b) {
      if (!best || b.length > best.length) best = b;
    }
  }
  return best;
}

export function ViajeroNavMain({ items }: { items: Item[] }) {
  const pathname = usePathname();
  const activeHref = longestMatchingHref(pathname, items);
  const isActiveCTA = pathname === "/viajero/itinerarios/crear";
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {/* Acción rápida: Crear itinerario */}
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Crear Itineraio"
              asChild
              className={cn(
                "min-w-8 duration-200 ease-linear",
                "hover:from-blue-700 hover:to-blue-500",
                "focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                "shadow-lg border border-blue-700 rounded-md",
                isActiveCTA
                  ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                  : "bg-transparent text-blue-600 border-blue-700"
              )}
            >
              <Link
                href="/viajero/itinerarios/crear"
                className="flex items-center gap-2 px-3 py-2"
              >
                <IconCirclePlusFilled
                  className={cn(isActiveCTA ? "text-white" : "text-blue-600")}
                />
                <span
                  className={cn(isActiveCTA ? "text-white" : "text-blue-600")}
                >
                  <strong>Crear Itinerario</strong>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Navegación principal */}
        <SidebarMenu>
          {items.map((item) => {
            const clean = (p: string) => (p || "").replace(/\/+$/, "");
            const hrefClean = clean(item.url);
            const active = activeHref === hrefClean;

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  tooltip={item.title}
                  className={cn(
                    "justify-start transition-colors",
                    "bg-transparent text-foreground",
                    "hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    "data-[active=true]: data-[active=true]:text-black data-[active=true]:font-bold data-[active=true]:bg-gray-200",
                    "border border-border"
                  )}
                >
                  {item.url === "#" ? (
                    <div className="opacity-60 cursor-not-allowed flex items-center gap-2 px-3 py-2">
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </div>
                  ) : (
                    <Link
                      href={item.url}
                      className="flex items-center gap-2 py-2 w-full rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export default ViajeroNavMain;
