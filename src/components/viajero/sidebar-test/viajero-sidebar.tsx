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

import { NavDocuments } from "@/components/viajero-components/nav-documents";
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
import { ViajeroNavMain } from "./viajero-navmain";
import { useState, useEffect } from "react";

interface UserData {
  username: string;
  correo: string;
  foto_url: string;
}
const data = {
  navMain: [
    { title: "Descubre", url: "/viajero", icon: IconHomeFilled },
    {
      title: "Itinerarios",
      url: "/viajero/itinerarios",
      icon: IconCalendarFilled,
    },
    { title: "Ver Mapa", url: "/viajero/vermapa", icon: IconMapPinFilled },
  ],
  navSecondary: [
    { title: "Configuración", url: "/dashboard/settings", icon: IconSettings },
    { title: "Añadir amigos", url: "/viajero/buscar-viajero", icon: IconUsers },
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
  const [user, setUser] = useState<UserData | null>(null);
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("https://harol-lovers.up.railway.app/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("authToken") || "",
          },
        });
        if (!res.ok) {
          throw new Error("No se pudieron obtener los datos del usuario");
        }
        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);
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
                href="/viajero"
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
        {user ? (
          <NavUser user={user} />
        ) : (
          <div className="p-4 text-sm text-center">Cargando usuario...</div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

export default ViajeroSidebar;
