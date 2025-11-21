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

export function NavMain({
  items,
}: {
  items: { title: string; url: string; icon?: Icon }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {/* Acciones rápidas*/}
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Crear Itinerario"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
              asChild
            >
              {/* Si quieres que navegue, cambia href a la ruta destino */}
              <Link href="/dashboard/itinerario">
                <IconCirclePlusFilled />
                <span>Crear Itinerario</span>
              </Link>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <IconCalendarWeekFilled />
              <span className="sr-only">Calendar</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Navegación principal */}
        <SidebarMenu>
          {items.map((item) => {
            const IsActive =
              item.url !== "#" &&
              (pathname === item.url || pathname.startsWith(item.url));

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={IsActive}
                  tooltip={item.title}
                >
                  {item.url === "#" ? (
                    <div className="opacity-60 cursor-not-allowed flex items-center gap-2">
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </div>
                  ) : (
                    <Link href={item.url} className="flex items-center gap-2">
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
