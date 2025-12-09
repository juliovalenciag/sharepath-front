// src/app/(viajero)/viajero/perfil/[username]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Calendar as CalendarIcon, // Renombrado para evitar conflicto
  Users,
  UserPlus,
  MessageCircle,
  Share2,
  Briefcase,
  MoreHorizontal,
  Map as MapIcon,
  UserCheck,
  Globe2,
  Compass,
  Heart,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/utils";
import { ItinerariosAPI } from "@/api/ItinerariosAPI";
import { Publicacione, UserInfoResponse } from "@/api/interfaces/ApiRoutes";

// --- Tipos ---
interface ApiUser {
  username: string;
  nombre?: string; // Tu API puede devolver 'nombre'
  correo: string;
  foto_url: string | null;
  bio?: string;
  ciudad?: string;
  pais?: string;
  idiomas?: string[];
  intereses?: string[];
  created_at?: string;
  stats?: {
    itinerarios_publicos?: number;
    lugares_visitados?: number;
    amigos?: number;
  };
  is_friend?: boolean; // Asumimos que el backend podría devolver esto si lo implementas
}

// Estructura interna del perfil
interface TravelerProfile {
  id: string; // Usamos string para username en la URL, pero id interno si lo necesitas
  username: string;
  name: string;
  email: string;
  avatar: string | null;
  bio?: string;
  ciudad?: string;
  pais?: string;
  idiomas: string[];
  intereses: string[];
  createdAtLabel?: string;
  stats: {
    itinerarios_publicos: number;
    lugares_visitados: number;
    amigos: number;
  };
  is_friend: boolean;
}

// Tipo para itinerarios (puedes adaptarlo a tu respuesta real)
interface UserItinerary {
  id: number;
  titulo: string;
  fecha_inicio: string;
  fecha_fin: string;
  cover_url?: string;
  lugares_count: number;
  likes: number;
  updatedAt: string;
}

//const API_URL = "https://harol-lovers.up.railway.app";
const API_URL = "https://localhost:4000/";

export default function UserProfilePage() {

  const params = useParams();
  const router = useRouter();
  const usernameParam = params.username as string;

  const [profile, setProfile] = useState<UserInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const api = ItinerariosAPI.getInstance();

  useEffect(() => {
    setLoading(true);
    api.getOtherUserInfo(usernameParam)
      .then( (data) => {
        setProfile(data);
      })
      .catch((error) => {
        console.error("Error fetching user profile:", error);
        setErrorMsg("Error al cargar el perfil del usuario.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [usernameParam]);

  // --- Render Loading ---
  if (loading) {
    return <ProfileSkeleton />;
  }

  if (errorMsg || !profile) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
        <div className="p-4 bg-muted rounded-full">
            <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold">{errorMsg || "Usuario no encontrado"}</h2>
        <p className="text-sm text-muted-foreground">No pudimos encontrar información para @{usernameParam}</p>
        <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* --- HEADER / COVER --- */}
      <div className="relative h-48 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 md:h-64">
        <div className="absolute left-4 top-4 z-10">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 rounded-full bg-black/20 text-white hover:bg-black/40 backdrop-blur-md"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
        {/* Patrón decorativo */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        
        {/* --- INFO PRINCIPAL DEL PERFIL --- */}
        <div className="relative -mt-16 mb-8 flex flex-col items-center sm:flex-row sm:items-end sm:gap-6">
          {/* Avatar */}
          <Avatar className="h-32 w-32 border-4 border-background shadow-xl sm:h-40 sm:w-40 bg-background">
            <AvatarImage src={profile.foto_url || undefined} alt={profile.username} className="object-cover" />
            <AvatarFallback className="text-4xl font-bold bg-primary/10 text-primary">
              {getInitials(profile.username)}
            </AvatarFallback>
          </Avatar>

          {/* Nombres y Datos Básicos */}
          <div className="mt-4 flex-1 text-center sm:mt-0 sm:mb-4 sm:text-left">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground">{profile.nombre_completo}</h1>
            <p className="text-base text-muted-foreground font-medium">@{profile.username}</p>
          </div>

          {/* Acciones */}
          <div className="mt-4 flex gap-2 sm:mb-4 sm:mt-0">
            {/* {profile.is_friend ? (
               <Button variant="outline" className="gap-2 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 shadow-sm">
                 <UserCheck className="h-4 w-4" /> Amigos
               </Button>
            ) : (
               <Button className="gap-2 shadow-sm bg-primary hover:bg-primary/90">
                 <UserPlus className="h-4 w-4" /> Conectar
               </Button>
            )} */}
            <Button variant="default" size="icon" className="shadow-sm">
              <MessageCircle className="h-4 w-4" />
            </Button>
            <DropdownMenuButton />
          </div>
        </div>

        {/* --- CONTENIDO GRID --- */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
          
          {/* BARRA LATERAL (Info & Stats) */}
          <aside className="space-y-6">
            {/* Biografía y Detalles */}
            {/* <Card className="overflow-hidden border-border/60 shadow-sm">
                <CardContent className="p-6 space-y-6">
                    
                    <div>
                        <h3 className="text-sm font-semibold text-foreground mb-2">Acerca de</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            {profile.bio}
                        </p>
                    </div>
                    
                    <Separator />

       
                    <div className="space-y-3 text-sm">
                        {(profile.ciudad || profile.pais) && (
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <MapPin className="h-4 w-4 text-primary shrink-0" />
                                <span>{[profile.ciudad, profile.pais].filter(Boolean).join(", ")}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3 text-muted-foreground">
                            <CalendarIcon className="h-4 w-4 text-primary shrink-0" />
                            <span>Se unió en {profile.createdAtLabel}</span>
                        </div>
                        {profile.idiomas.length > 0 && (
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Globe2 className="h-4 w-4 text-primary shrink-0" />
                                <span>Habla {profile.idiomas.join(", ")}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3 text-muted-foreground">
                            <Briefcase className="h-4 w-4 text-primary shrink-0" />
                            <span>Viajero Frecuente</span>
                        </div>
                    </div>

                    
                    {profile.intereses.length > 0 && (
                        <div className="pt-2">
                            <div className="flex flex-wrap gap-2">
                                {profile.intereses.map((tag) => (
                                <Badge key={tag} variant="default" className="rounded-md font-normal text-xs">
                                    {tag}
                                </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card> */}

            {/* Estadísticas (Diseño Tarjetas Pequeñas) */}
            {/* <div className="grid grid-cols-3 gap-2">
                <StatCard
                  label="Viajes"
                  value={profile.stats.itinerarios_publicos}
                  icon={Compass}
                />
                <StatCard
                  label="Lugares"
                  value={profile.stats.lugares_visitados}
                  icon={MapPin}
                />
                <StatCard
                  label="Amigos"
                  value={profile.stats.amigos}
                  icon={Users}
                />
            </div> */}
          </aside>

          {/* CONTENIDO PRINCIPAL (Tabs) */}
          <main>
            <Tabs defaultValue="itinerarios" className="w-full">
                <TabsList className="w-full justify-start h-12 bg-muted/50 p-1 rounded-xl mb-6">
                    <TabsTrigger value="itinerarios" className="flex-1 sm:flex-none px-6 gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <MapIcon className="h-4 w-4" /> Itinerarios
                    </TabsTrigger>
                    <TabsTrigger value="favoritos" className="flex-1 sm:flex-none px-6 gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Heart className="h-4 w-4" /> Favoritos
                    </TabsTrigger>
                    <TabsTrigger value="reseñas" className="flex-1 sm:flex-none px-6 gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Star className="h-4 w-4" /> Reseñas
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="itinerarios" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold tracking-tight">Itinerarios Públicos</h3>
                        {/* <Badge variant="outline" className="font-normal">{itineraries.length} publicados</Badge> */}
                    </div>

                    {profile.publicaciones.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {profile.publicaciones.map((itinerary) => (
                                <ItineraryCard key={itinerary.id} data={itinerary} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState 
                            icon={MapIcon}
                            title="Sin itinerarios"
                            description="Este usuario aún no ha compartido ningún viaje público."
                        />
                    )}
                </TabsContent>

                <TabsContent value="favoritos">
                    <EmptyState 
                        icon={Heart}
                        title="Lista de favoritos oculta"
                        description="Este usuario mantiene sus lugares favoritos en privado."
                    />
                </TabsContent>
                
                <TabsContent value="reseñas">
                    <EmptyState 
                        icon={Star}
                        title="Sin reseñas"
                        description="Aún no hay reseñas públicas de este viajero."
                    />
                </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </div>
  );
}

// --- Componentes Auxiliares ---

function DropdownMenuButton() {
    // Si tienes un componente DropdownMenu importado, úsalo aquí. 
    // Sino, este botón es un placeholder visual.
    return (
        <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
        </Button>
    );
}

type StatCardProps = {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
};

function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <Card className="border bg-card/50 shadow-sm flex flex-col items-center justify-center p-3 text-center hover:bg-card transition-colors">
        <Icon className="h-5 w-5 text-primary mb-1" />
        <span className="text-lg font-bold text-foreground">{value}</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
    </Card>
  );
}

function ItineraryCard({ data }: { data: Publicacione }) {
  console.log(data.fotos);
  
    return (
        <Link href={`/viajero/itinerarios/${data.id}`} className="group block h-full">
            <Card className="overflow-hidden border-border/60 bg-card transition-all hover:shadow-md hover:border-primary/40 h-full flex flex-col rounded-xl">
                <div className="relative h-40 w-full bg-muted overflow-hidden">
                    {data.fotos.length > 0 ? (
                        data.fotos.map( foto => (
                        
                            <Image
                                key={foto.id}
                                src={foto.foto_url}
                                alt={data.descripcion || "Itinerario Foto"}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        ))
                    ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/80">
                            <MapIcon className="h-10 w-10 text-muted-foreground/20" />
                        </div>
                    )}
                    {/* <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
                        {data.lugares_count} PARADAS
                    </div> */}
                </div>
                <CardHeader className="p-4 flex-1 space-y-2">
                    <CardTitle className="text-base font-bold line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                        {data.itinerario.nombre}
                    </CardTitle>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                        <div className="flex items-center gap-1.5">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            <span>{data.id}</span>
                        </div>
                        {/* <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3 fill-current text-muted-foreground/50" />
                            <span>{data.likes}</span>
                        </div> */}
                    </div>
                </CardHeader>
            </Card>
        </Link>
    );
}

function EmptyState({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl border-dashed bg-muted/10">
            <div className="p-3 rounded-full bg-muted/30 mb-3">
                <Icon className="h-6 w-6 text-muted-foreground" />
            </div>
            <h4 className="text-sm font-semibold text-foreground">{title}</h4>
            <p className="text-sm text-muted-foreground max-w-xs mt-1">{description}</p>
        </div>
    );
}

function ProfileSkeleton() {
    return (
        <div className="min-h-screen bg-background pb-10">
            <div className="h-48 w-full bg-muted animate-pulse" />
            <div className="mx-auto max-w-5xl px-6">
                <div className="-mt-16 mb-8 flex flex-col items-center sm:flex-row sm:items-end sm:gap-6">
                    <Skeleton className="h-32 w-32 rounded-full border-4 border-background sm:h-40 sm:w-40" />
                    <div className="mt-4 space-y-2 flex-1 w-full sm:max-w-xs text-center sm:text-left">
                        <Skeleton className="h-8 w-3/4 mx-auto sm:mx-0" />
                        <Skeleton className="h-4 w-1/2 mx-auto sm:mx-0" />
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
                    <div className="space-y-4">
                        <Skeleton className="h-48 w-full rounded-xl" />
                        <div className="grid grid-cols-3 gap-2">
                            <Skeleton className="h-20 w-full rounded-xl" />
                            <Skeleton className="h-20 w-full rounded-xl" />
                            <Skeleton className="h-20 w-full rounded-xl" />
                        </div>
                    </div>
                    <div>
                        <Skeleton className="h-12 w-full rounded-xl mb-6" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Skeleton className="h-48 w-full rounded-xl" />
                            <Skeleton className="h-48 w-full rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}