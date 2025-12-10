"use client";
// Perfil estilo Instagram — versión optimizada visualmente
// Conserva tu lógica, tus tabs, tus llamadas a la API y tus componentes.
// Solo se mejoró el layout, estructura visual e interfaz tipo Instagram.

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Calendar as CalendarIcon,
  Users,
  MessageCircle,
  MoreHorizontal,
  Heart,
  Star,
  Map as MapIcon
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

import { ItinerariosAPI } from "@/api/ItinerariosAPI";
import { getInitials } from "@/lib/utils";
import { Publicacione, UserInfoResponse } from "@/api/interfaces/ApiRoutes";

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
      .then((data) => setProfile(data))
      .catch(() => setErrorMsg("Error al cargar el perfil del usuario."))
      .finally(() => setLoading(false));
  }, [usernameParam]);

  if (loading) return <ProfileSkeleton />;

  if (errorMsg || !profile)
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-xl font-semibold">{errorMsg || "Usuario no encontrado"}</h2>
        <Button variant="outline" onClick={() => router.back()}><ArrowLeft /> Volver</Button>
      </div>
    );

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Header tipo IG */}
      <div className="sticky top-0 z-20 flex items-center justify-between bg-background/80 backdrop-blur-md px-4 py-3">
  <Button variant="ghost" size="icon" onClick={() => router.back()}>
    <ArrowLeft />
  </Button>
  <div /> {/* espacio vacío para mantener alineación */}
  <Button variant="ghost" size="icon">
    <MoreHorizontal />
  </Button>
</div>

      {/* Avatar + bio estilo Instagram */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
       <div className="flex items-center justify-between gap-6">
  {/* Foto + Username */}
  <div className="flex items-center gap-4">
    <Avatar className="h-24 w-24 border shadow-md">
      <AvatarImage src={profile.foto_url || undefined} />
      <AvatarFallback>{getInitials(profile.username)}</AvatarFallback>
    </Avatar>

    <div className="flex flex-col">
      <p className="font-semibold text-lg">@{profile.username}</p>
      <p className="text-sm text-muted-foreground">{profile.nombre_completo}</p>
    </div>
  </div>

  {/* Stats estilo IG */}
  <div className="flex-1 flex justify-around text-center">
    <div>
      <p className="text-lg font-bold">{profile.publicaciones.length}</p>
      <p className="text-xs text-muted-foreground">Itinerarios</p>
    </div>
    <div>
      <p className="text-lg font-bold">{0}</p>
      <p className="text-xs text-muted-foreground">Amigos</p>
    </div>
    <div>
      <p className="text-lg font-bold">{0}</p>
      <p className="text-xs text-muted-foreground">Lugares</p>
    </div>
  </div>
</div>


        <div className="mt-4">
          <p className="font-semibold text-sm">{profile.nombre_completo}</p>
          <p className="text-sm text-muted-foreground leading-tight">{""}</p>
        </div>

        <div className="mt-3 flex gap-2">
          <Button className="flex-1">Mensaje</Button>
          <Button variant="secondary" size="icon"><Users /></Button>
        </div>
      </div>

      {/* Tabs estilo Instagram (Feed, Favoritos, Reseñas) */}
      <div className="max-w-4xl mx-auto mt-6 px-4">
        <Tabs defaultValue="itinerarios">
          <TabsList className="grid grid-cols-3 w-full rounded-xl bg-muted/50 py-1 mb-4">
            <TabsTrigger value="itinerarios"><MapIcon className="h-4 w-4" /></TabsTrigger>
            <TabsTrigger value="favoritos"><Heart className="h-4 w-4" /></TabsTrigger>
            <TabsTrigger value="reseñas"><Star className="h-4 w-4" /></TabsTrigger>
          </TabsList>

          <TabsContent value="itinerarios">
  {profile.publicaciones.length > 0 ? (
    <>
      <p className="text-sm text-muted-foreground mb-3 font-semibold">
        Itinerarios públicos
      </p>

      <div className="grid grid-cols-3 gap-1">
        {profile.publicaciones.map((post) => (
          <Link key={post.id} href={`/viajero/itinerarios/${post.id}`}>
            <div className="relative h-36 w-full">
              {post.fotos.length > 0 ? (
                <Image
                  src={post.fotos[0].foto_url}
                  alt="img"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center bg-muted h-full">
                  <MapIcon className="opacity-30" />
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </>
  ) : (
    <EmptyState
      title="Sin itinerarios"
      description="Este viajero aún no publica."
      icon={MapIcon}
    />
  )}
</TabsContent>
          <TabsContent value="favoritos">
            <EmptyState title="Favoritos ocultos" description="Este usuario mantiene su lista privada." icon={Heart} />
          </TabsContent>

          <TabsContent value="reseñas">
            <EmptyState title="Sin reseñas" description="No hay reseñas públicas aún." icon={Star} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center opacity-70">
      <Icon className="h-8 w-8 mb-2" />
      <h3 className="font-medium text-sm">{title}</h3>
      <p className="text-xs text-muted-foreground w-40">{description}</p>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="p-6 animate-pulse space-y-6">
      <div className="h-12 bg-muted rounded-lg" />
      <div className="flex gap-4">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="flex-1 grid grid-cols-3 gap-4">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      </div>
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-10" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}