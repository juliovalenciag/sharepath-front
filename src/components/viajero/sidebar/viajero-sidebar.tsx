"use client";

import * as React from "react";
import Link from "next/link";
import {
  IconCamera,
  IconFileAi,
  IconFileDescription,
  IconHelp,
  IconInnerShadowTop,
  IconSearch,
  IconSettings,
  IconUsers,
  IconHomeFilled,
  IconCalendarFilled,
  IconMessages,
  IconMapPinFilled,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/dashboard-components/nav-documents";
import { NavSecondary } from "@/components/dashboard-components/nav-secondary";
import { NavUser } from "@/components/dashboard-components/nav-user";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ViajeroNavMain } from "./viajero-navmain";

const data = {
  user: {
    name: "Harol",
    email: "harol@hater.com",
    avatar: "profile.png",
  },
  navMain: [
    { title: "Inicio", url: "/viajero", icon: IconHomeFilled },
    {
      title: "Itinerarios",
      url: "/viajero/itinerarios",
      icon: IconCalendarFilled,
    },
    { title: "Ver Mapa", url: "/viajero/vermapa", icon: IconMapPinFilled },
  ],
  navClouds: [
    { title: "Capture", icon: IconCamera, isActive: true, url: "#", items: [] },
    { title: "Proposal", icon: IconFileDescription, url: "#", items: [] },
    { title: "Prompts", icon: IconFileAi, url: "#", items: [] },
  ],
  navSecondary: [
    { title: "Configuración", url: "/dashboard/settings", icon: IconSettings },
    { title: "Obtener Ayuda", url: "/help", icon: IconHelp },
    { title: "Buscar", url: "/search", icon: IconSearch },
  ],
  documents: [
    { name: "Chats", url: "/viajero/chats", icon: IconMessages },
    {
      name: "Notificaciones",
      url: "/dashboard/notificaciones",
      icon: IconUsers,
    },
  ],
};

export function ViajeroSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="icon"
      className="bg-sidebar text-sidebar-foreground"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link
                href="/"
                className="flex items-center gap-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              >
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">
                  Share Path VIAJERO
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <ViajeroNavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}

export default ViajeroSidebar;
