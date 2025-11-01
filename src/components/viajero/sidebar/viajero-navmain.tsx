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
    if (a === b || a.startsWith(b + "/")) {
      if (!best || b.length > best.length) best = b;
    }
  }
  return best;
}

export function ViajeroNavMain({ items }: { items: Item[] }) {
  const pathname = usePathname();
  const activeHref = longestMatchingHref(pathname, items);

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
                "bg-palette-blue text-palette-white",
                "hover:bg-palette-dark",
                "focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              )}
            >
              <Link href="/viajero/itinerarios/nuevo">
                <IconCirclePlusFilled />
                <span>Crear Itinerario viajero</span>
              </Link>
            </SidebarMenuButton>

            <Button
              size="icon"
              variant="outline"
              className="size-8 group-data-[collapsible=icon]:opacity-0 focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              aria-label="Calendario"
            >
              <IconCalendarWeekFilled />
            </Button>
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
                    // estilo base
                    "bg-transparent text-foreground",
                    // hover (ya estaba bien)
                    "hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    active &&
                      "data-[active]:bg-sidebar-primary data-[active]:text-sidebar-primary-foreground data-[active]:shadow-sm",
                    // borde sutil
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
                      className="flex items-center gap-2 px-3 py-2 w-full rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
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
