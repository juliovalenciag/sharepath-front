"use client";

import * as React from "react";
import Link from "next/link";
import {
  IconHomeFilled,
  IconTable,
  IconMapPin,
  IconUsers,
  IconFileText,
  IconSettings,
  IconBell,
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
import { set } from "date-fns";

const data = {
  user: {
    username: "Admin",
    correo: "admin@sharepath.com",
    foto_url: "profile.png",
  },
  // Sección General
  navMain: [
    { title: "Inicio", url: "/admin", icon: IconHomeFilled },
    { title: "CRUD", url: "/admin/CRUD", icon: IconTable },
  ],
  // Sección Gestión
  navGestion: [
    { title: "Lugares", url: "/admin/lugares", icon: IconMapPin },
    { title: "Usuarios", url: "/admin/usuarios", icon: IconUsers },
    { title: "Reportes", url: "/admin/reportes", icon: IconFileText },
  ],
  navSecondary: [],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const [user, setUser] = React.useState<null | { username: string; correo: string; foto_url: string }>(null)

  React.useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    const user = {
      username: storedUser
        ? JSON.parse(storedUser).username
        : "Harol Hater",
      correo: storedUser
        ? JSON.parse(storedUser).correo
        : "harol@hater.com",
      foto_url: storedUser
        ? JSON.parse(storedUser).foto_url
        : "./profile.png"
    };
    setUser(user)
  }, [])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/admin" className="flex items-center gap-2">
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
        <NavMain items={data.navMain} label="General" />
        
        <NavDocuments items={data.navGestion} label="Gestión" />
      </SidebarContent>

      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
}
