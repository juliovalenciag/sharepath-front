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

import { NavDocuments } from "@/components/viajero-components/nav-documents";
import { NavMain } from "@/components/viajero-components/nav-main";
import { NavSecondary } from "@/components/viajero-components/nav-secondary";
import { NavUser } from "@/components/viajero-components/nav-user";

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
    {
      title: "Itinerarios",
      url: "/dashboard/itinerarios",
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
    {
      name: "Notificaciones",
      url: "/dashboard/notificaciones",
      icon: IconUsers,
    },
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
              {/* Usa Link de Next para navegación cliente */}
              <Link href="/viajero" className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-6"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
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
