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
  IconCompassFilled,
  IconMapPinFilled,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/dashboard-components/nav-documents";
import { NavMain } from "@/components/dashboard-components/nav-main";
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

const data = {
  user: {
    name: "Harol",
    email: "harol@hater.com",
    avatar: "profile.png",
  },
  navMain: [
    { title: "Inicio", url: "/dashboard", icon: IconHomeFilled },
    { title: "Descubre", url: "/dashboard/descubre", icon: IconCompassFilled },
    {
      title: "Itinerario",
      url: "/dashboard/itinerario",
      icon: IconCalendarFilled,
    },
    { title: "Ver Mapa", url: "/dashboard/vermapa", icon: IconMapPinFilled },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        { title: "Active Proposals", url: "#" },
        { title: "Archived", url: "#" },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        { title: "Active Proposals", url: "#" },
        { title: "Archived", url: "#" },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        { title: "Active Proposals", url: "#" },
        { title: "Archived", url: "#" },
      ],
    },
  ],
  navSecondary: [
    { title: "Configuración", url: "/dashboard/settings", icon: IconSettings },
    { title: "Obtener Ayuda", url: "/help", icon: IconHelp },
    { title: "Buscar", url: "/search", icon: IconSearch },
  ],
  documents: [
    { name: "Chats", url: "/dashboard/chats", icon: IconMessages },
    { name: "Amigos", url: "/dashboard/amigos", icon: IconUsers },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              {/* ✅ Usa Link de Next para navegación cliente */}
              <Link href="/" className="flex items-center gap-2">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Share Path</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Estas tres usan Link internamente en las implementaciones de abajo */}
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
