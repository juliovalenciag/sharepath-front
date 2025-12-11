"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

import {
  Settings,
  CircleHelp,
  Search,
  Database,
  ClipboardList,
  File,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { APP_CONFIG } from "@/config/app-config";
// ⛔️ Ya no usamos rootUser estático
// import { rootUser } from "@/data/users";
import { sidebarItems } from "@/navigation/sidebar/sidebar-items";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

const data = {
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: Settings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: CircleHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: Search,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: Database,
    },
    {
      name: "Reports",
      url: "#",
      icon: ClipboardList,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: File,
    },
  ],
};

// Tipo que espera NavUser nuevo
type SidebarUser = {
  readonly name: string;
  readonly email: string;
  readonly avatar: string;
};

// Tipo que viene del backend actual
interface ApiUser {
  username: string;
  correo: string;
  foto_url: string;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState<SidebarUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("authToken")
            : null;

        const res = await fetch("https://harol-lovers.up.railway.app/user", {
        //const res = await fetch("https://harol-lovers.up.railway.app/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: token || "",
          },
        });

        if (!res.ok) {
          throw new Error("No se pudieron obtener los datos del usuario");
        }

        const data: ApiUser = await res.json();

        setUser({
          name: data.username,
          email: data.correo,
          avatar: data.foto_url,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/viajero">
                <img
                  src="/sharepath.svg"
                  alt="Sharepath logo"
                  className="h-6 w-6 mr-2"
                />
                <span className="text-base font-semibold">
                  {APP_CONFIG.name}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={sidebarItems} />
        {/* Si en algún momento quieres reusar data.navSecondary o documents,
            puedes integrarlos aquí con tu NavDocuments/NavSecondary modernos */}
      </SidebarContent>

      {/* <SidebarFooter>
        {loadingUser && (
          <div className="px-4 py-2 text-xs text-muted-foreground">
            Cargando cuenta...
          </div>
        )}

        {!loadingUser && user && <NavUser user={user} />}

        {!loadingUser && !user && (
          <div className="px-4 py-2 text-xs text-destructive">
            No se pudo cargar la cuenta
          </div>
        )}
      </SidebarFooter> */}
    </Sidebar>
  );
}
