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
    name: "Admin",
    email: "admin@sharepath.com",
    avatar: "profile.png",
  },
  // Sección General
  navMain: [
    { title: "Inicio", url: "/dashboard", icon: IconHomeFilled },
    { title: "CRUD", url: "/dashboard/CRUD", icon: IconTable },
  ],
  // Sección Gestión
  navGestion: [
    { title: "Lugares", url: "/dashboard/lugares", icon: IconMapPin },
    { title: "Usuarios", url: "/dashboard/usuarios", icon: IconUsers },
    { title: "Reportes", url: "/dashboard/reportes", icon: IconFileText },
  ],
  // Sección Otros
  navSecondary: [
    { title: "Configuración", url: "/dashboard/configuracion", icon: IconSettings },
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
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              {/* Usa Link de Next para navegación cliente */}
              <Link href="/dashboard" className="flex items-center gap-2">
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
                <span className="text-base font-semibold">SharePath</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Gestionar"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
              asChild
            >
              <Link href="/dashboard" className="flex items-center gap-2 justify-center">
                <IconTable className="size-4" />
                <span>Gestionar</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Sección General */}
        <NavMain items={data.navMain} label="General" />
        
        {/* Sección Gestión */}
        <NavDocuments items={data.navGestion} label="Gestión" />
        
        {/* Sección Otros */}
        <NavSecondary items={data.navSecondary} label="Otros" className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
