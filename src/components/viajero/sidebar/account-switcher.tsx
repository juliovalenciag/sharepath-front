"use client";

import { useEffect, useState } from "react";

import { BadgeCheck, Bell, Edit, LogOut, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { cn, getInitials } from "@/lib/utils";

// Tipo que viene del backend
interface ApiUser {
  username: string;
  correo: string;
  foto_url: string;
}

// Tipo que usamos localmente
type ActiveUser = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly avatar: string;
  readonly role: string;
};

export function AccountSwitcher() {
  const [activeUser, setActiveUser] = useState<ActiveUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [errorUser, setErrorUser] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("authToken")
            : null;

        const res = await fetch("https://harol-lovers.up.railway.app/user", {
        // const res = await fetch("http://localhost:4000/user", {
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

        setActiveUser({
          id: data.correo || "current-user",
          name: data.username,
          email: data.correo,
          avatar: data.foto_url,
          role: "viajero", // Rol fijo para este proyecto
        });
        setErrorUser(null);
      } catch (error) {
        console.error("Error fetching user data in AccountSwitcher:", error);
        setActiveUser(null);
        setErrorUser("No se pudo cargar la cuenta");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserData();
  }, []);

  // Estado de carga
  if (loadingUser) {
    return (
      <Avatar className="size-9 rounded-lg">
        <AvatarFallback className="rounded-lg animate-pulse">SP</AvatarFallback>
      </Avatar>
    );
  }

  // Estado de error o sin usuario
  if (!activeUser || errorUser) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="size-9 rounded-lg">
            <AvatarFallback className="rounded-lg">
              {getInitials("Invitado")}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="min-w-56 space-y-1 rounded-lg"
          side="bottom"
          align="end"
          sideOffset={4}
        >
          <div className="px-2 py-2 text-xs text-destructive">
            {errorUser ?? "No se pudo cargar la cuenta"}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-9 rounded-lg cursor-pointer">
          <AvatarImage
            src={activeUser.avatar || undefined}
            alt={activeUser.name}
          />
          <AvatarFallback className="rounded-lg">
            {getInitials(activeUser.name)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-56 space-y-1 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        {/* 
          Antes aquí se listaban múltiples usuarios (users.map).
          En este proyecto SOLO usamos la cuenta activa del backend.
          Dejo el bloque comentado para que no cause dudas.
        */}
        {/*
        {users.map((user) => (
          <DropdownMenuItem
            key={user.email}
            className={cn(
              "p-0",
              user.id === activeUser.id &&
                "bg-accent/50 border-l-primary border-l-2"
            )}
            onClick={() => setActiveUser(user)}
          >
            ...
          </DropdownMenuItem>
        ))}
        */}
        <DropdownMenuItem
          className={cn(
            "p-0 bg-accent/40 border-l-primary border-l-2 cursor-default"
          )}
        >
          <div className="flex w-full items-center justify-between gap-2 px-1 py-1.5">
            <Avatar className="size-9 rounded-lg">
              <AvatarImage
                src={activeUser.avatar || undefined}
                alt={activeUser.name}
              />
              <AvatarFallback className="rounded-lg">
                {getInitials(activeUser.name)}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{activeUser.name}</span>
              <span className="truncate text-xs capitalize">
                {activeUser.role}
              </span>
            </div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {/* 
            Estas opciones son SOLO UI en este proyecto.
            No tienen lógica de navegación/acción aún.
          */}

          <DropdownMenuItem>
            <User />
            Perfil
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Edit />
            Cuenta
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bell />
            Notificaciones
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {/* 
          TODO: Conectar lógica real de logout cuando la tengas lista.
        */}
        <DropdownMenuItem>
          <LogOut />
          Cerrar Sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
