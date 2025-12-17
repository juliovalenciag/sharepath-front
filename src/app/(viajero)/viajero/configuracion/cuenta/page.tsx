"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Globe,
  Lock,
  Pencil,
  Mail,
  Map,
  Users,
  LayoutGrid,
  ShieldCheck,
  Calendar,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";

import { ItinerariosAPI } from "@/api/ItinerariosAPI";
import { Usuario } from "@/api/interfaces/ApiRoutes";
import { cn } from "@/lib/utils";

export default function AccountPage() {
  const [user, setUser] = useState<Usuario | null>(null);
  const api = ItinerariosAPI.getInstance();

  useEffect(() => {
    api.getUser().then(setUser);
  }, []);

  if (!user) {
    return <ProfileSkeleton />;
  }

  // Estilos dinámicos para el rol
  const roleStyles =
    user.role === "admin"
      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200/50"
      : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200/50";

  return (
    <div className="min-h-screen w-full bg-background pb-20">
      {/* 1. HERO BANNER */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        {/* Fondo con degradado y patrón */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          ></div>
        </div>

        {/* Overlay degradado inferior para transición suave */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative -mt-32">
        {/* 2. TARJETA PRINCIPAL DE PERFIL */}
        <div className="bg-card/80 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="p-8 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* COLUMNA IZQUIERDA: AVATAR Y ACCIONES */}
            <div className="flex flex-col items-center gap-5 shrink-0">
              <div className="relative group">
                {/* Efecto de brillo detrás del avatar */}
                <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-blue-500 rounded-full opacity-60 blur-md group-hover:opacity-80 transition duration-500"></div>

                <Avatar className="h-36 w-36 md:h-44 md:w-44 border-[6px] border-background relative shadow-xl">
                  <AvatarImage
                    src={`${user.foto_url}`}
                    alt={user.username}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-5xl font-black bg-muted text-muted-foreground/50">
                    {user.username?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                {/* Indicador de estado (opcional) */}
                <div
                  className="absolute bottom-2 right-2 h-6 w-6 bg-emerald-500 border-4 border-background rounded-full"
                  title="Activo"
                ></div>
              </div>

              <div className="w-full space-y-3">
                <Link
                  href="/viajero/configuracion/cuenta/editar"
                  className="w-full block"
                >
                  <Button className="w-full rounded-full gap-2 font-semibold shadow-lg shadow-primary/20 hover:scale-105 transition-transform h-11">
                    <Pencil className="h-4 w-4" />
                    Editar Perfil
                  </Button>
                </Link>

                
              </div>
            </div>

            {/* COLUMNA DERECHA: INFORMACIÓN DETALLADA */}
            <div className="flex-1 w-full space-y-8 text-center md:text-left pt-2">
              {/* Encabezado de Identidad */}
              <div className="space-y-3">
                <div className="flex flex-col md:flex-row items-center md:items-baseline gap-3 justify-center md:justify-start">
                  <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
                    {user.username}
                  </h1>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "px-3 py-1 text-xs tracking-wider font-bold uppercase border",
                      roleStyles
                    )}
                  >
                    {user.role === "user" ? "Viajero" : user.role}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <h2 className="text-xl font-medium text-foreground/80">
                    {user.nombre_completo}
                  </h2>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4 text-primary/70" />
                    <span className="text-sm font-medium">{user.correo}</span>
                  </div>
                </div>
              </div>

              <Separator className="bg-border/40" />

              {/* Grid de Estadísticas (Estilo Bento) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Stat: Itinerarios */}
                <Card className="border-0 bg-muted/40 hover:bg-muted/60 transition-colors shadow-none">
                  <CardContent className="p-5 flex flex-col items-center md:items-start gap-1">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-2">
                      <Map className="h-6 w-6" />
                    </div>
                    <span className="text-3xl font-bold text-foreground">
                      {user.itineraryCount}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Itinerarios
                    </span>
                  </CardContent>
                </Card>

                {/* Stat: Amigos */}
                <Card className="border-0 bg-muted/40 hover:bg-muted/60 transition-colors shadow-none">
                  <CardContent className="p-5 flex flex-col items-center md:items-start gap-1">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 mb-2">
                      <Users className="h-6 w-6" />
                    </div>
                    <span className="text-3xl font-bold text-foreground">
                      {user.friendsCount}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Amigos
                    </span>
                  </CardContent>
                </Card>

                {/* Stat: Privacidad */}
                <Card
                  className={cn(
                    "border-0 transition-colors shadow-none sm:col-span-2 lg:col-span-1",
                    user.privacity_mode
                      ? "bg-emerald-500/5 hover:bg-emerald-500/10"
                      : "bg-amber-500/5 hover:bg-amber-500/10"
                  )}
                >
                  <CardContent className="p-5 flex flex-col items-center md:items-start gap-2 h-full justify-center">
                    <div className="flex items-center gap-2 mb-1">
                      {user.privacity_mode ? (
                        <Globe className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <Lock className="h-5 w-5 text-amber-600" />
                      )}
                      <span
                        className={cn(
                          "text-sm font-bold uppercase tracking-wider",
                          user.privacity_mode
                            ? "text-emerald-700 dark:text-emerald-400"
                            : "text-amber-700 dark:text-amber-400"
                        )}
                      >
                        {user.privacity_mode ? "Público" : "Privado"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground text-center md:text-left leading-relaxed">
                      {user.privacity_mode
                        ? "Tu perfil es visible para toda la comunidad."
                        : "Solo tus seguidores pueden ver tu actividad."}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Barra Decorativa Inferior */}
          <div className="h-1.5 w-full bg-gradient-to-r from-primary via-purple-500 to-blue-500 opacity-90" />
        </div>

        
      </div>
    </div>
  );
}

// Skeleton mejorado para matching visual
function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-80 bg-muted animate-pulse w-full" />
      <div className="max-w-5xl mx-auto px-6 -mt-32">
        <div className="bg-card rounded-[2rem] h-[500px] w-full shadow-xl p-10 flex flex-col md:flex-row gap-10 border border-border/50">
          <div className="flex flex-col items-center gap-6">
            <Skeleton className="h-44 w-44 rounded-full border-4 border-background" />
            <Skeleton className="h-11 w-full rounded-full" />
          </div>
          <div className="flex-1 space-y-6 pt-4">
            <Skeleton className="h-12 w-3/4 rounded-lg" />
            <Skeleton className="h-6 w-1/2 rounded-lg" />
            <div className="grid grid-cols-3 gap-4 mt-8">
              <Skeleton className="h-32 rounded-2xl" />
              <Skeleton className="h-32 rounded-2xl" />
              <Skeleton className="h-32 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
