"use client"
//ESTE ARCHIVO YA NO SE USA

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSocket } from "@/context/socketContext"; // <--- Importar esto
import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { url } from "inspector";
import { useRouter } from "next/router";

export function NavUser({
  user,
}: {
  user: {
    username: string
    correo: string
    foto_url: string
  }
}) {
  const { isMobile } = useSidebar();
  const pathname     = usePathname();

  const { recargarUsuario } = useSocket();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('sessionID');

    recargarUsuario();

    window.location.href = '/';
    console.log("Sesion cerrada");
  };

  const menuItems = [
    { title: "Cuenta", url: "/viajero/cuenta", icon: IconUserCircle},
    // { title: "Notificaciones", url: "/viajero/notificaciones", icon: IconNotification},
  ];

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={user.foto_url || "/videos/profile.jpg"} alt={user.username} />
                <AvatarFallback className="rounded-lg">{ `${user.username?.charAt(0).toUpperCase()}${user.username?.charAt(1).toUpperCase()}` || "U" }</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.username}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.correo}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.foto_url} alt={user.username} />
                  <AvatarFallback className="rounded-lg"> { `${user.username?.charAt(0).toUpperCase()}${user.username?.charAt(1).toUpperCase()}` || "U" } </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.username}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.correo}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              {menuItems.map((item) => {
                const isActive =
                  pathname === item.url || pathname.startsWith(item.url);
                const Icon = item.icon;

                return (
                  <DropdownMenuItem
                    asChild
                    key={item.title}
                    className={`flex items-center gap-2 ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "hover:bg-sidebar-accent/60"
                    }`}
                  >
                    <Link href={item.url}>
                      <Icon className="size-4" />
                      {item.title}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/" className="flex items-center gap-2" onClick={handleLogout}>
                <IconLogout />
                Cerrar sesión
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
