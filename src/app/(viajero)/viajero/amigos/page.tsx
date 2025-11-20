"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  UserPlus,
  Users,
  UserCheck,
  UserX,
  MapPin,
  MessageCircle,
  Search,
  Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Link from "next/link";
import { getInitials } from "@/lib/utils";

// ===== Tipos esperados desde el backend =====

interface ApiFriend {
  id: string;
  username: string;
  nombre?: string;
  correo?: string;
  foto_url?: string;
  ciudad?: string;
  pais?: string;
  mutuos?: number;
  conectado?: boolean;
}

interface ApiFriendRequest {
  id: string;
  username: string;
  nombre?: string;
  foto_url?: string;
  mensaje?: string; // opcional
  fecha?: string;
}

interface ApiFriendSuggestion {
  id: string;
  username: string;
  nombre?: string;
  foto_url?: string;
  ciudad?: string;
  pais?: string;
  intereses?: string[];
  mutuos?: number;
}

// Tipos internos normalizados
type Friend = {
  id: string;
  username: string;
  name: string;
  avatar: string;
  city?: string;
  country?: string;
  mutualCount: number;
  isOnline: boolean;
};

type FriendRequest = {
  id: string;
  username: string;
  name: string;
  avatar: string;
  message?: string;
  dateLabel?: string;
};

type FriendSuggestion = {
  id: string;
  username: string;
  name: string;
  avatar: string;
  city?: string;
  country?: string;
  mutualCount: number;
  interests: string[];
};

// ===== Página principal de amigos =====

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchFriendsData = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("authToken")
            : null;

        const commonHeaders: HeadersInit = {
          "Content-Type": "application/json",
          token: token || "",
        };

        // NOTA:
        // Ajusta estas rutas a como las tengas en tu backend.
        const [friendsRes, requestsRes, suggestionsRes] = await Promise.all([
          fetch("https://harol-lovers.up.railway.app/friends", {
            method: "GET",
            headers: commonHeaders,
          }),
          fetch("https://harol-lovers.up.railway.app/friends/requests", {
            method: "GET",
            headers: commonHeaders,
          }),
          fetch("https://harol-lovers.up.railway.app/friends/suggestions", {
            method: "GET",
            headers: commonHeaders,
          }),
        ]);

        if (!friendsRes.ok && friendsRes.status !== 404) {
          throw new Error("Error al obtener amigos");
        }
        if (!requestsRes.ok && requestsRes.status !== 404) {
          throw new Error("Error al obtener solicitudes");
        }
        if (!suggestionsRes.ok && suggestionsRes.status !== 404) {
          throw new Error("Error al obtener sugerencias");
        }

        // Amigos
        if (friendsRes.ok) {
          const friendsData: ApiFriend[] = await friendsRes.json();
          setFriends(
            friendsData.map((f) => ({
              id: f.id,
              username: f.username,
              name: f.nombre ?? f.username,
              avatar: f.foto_url ?? "",
              city: f.ciudad,
              country: f.pais,
              mutualCount: f.mutuos ?? 0,
              isOnline: Boolean(f.conectado),
            }))
          );
        } else {
          setFriends([]);
        }

        // Solicitudes
        if (requestsRes.ok) {
          const reqData: ApiFriendRequest[] = await requestsRes.json();
          setRequests(
            reqData.map((r) => ({
              id: r.id,
              username: r.username,
              name: r.nombre ?? r.username,
              avatar: r.foto_url ?? "",
              message: r.mensaje,
              dateLabel: r.fecha
                ? new Date(r.fecha).toLocaleDateString("es-MX", {
                    day: "2-digit",
                    month: "short",
                  })
                : undefined,
            }))
          );
        } else {
          setRequests([]);
        }

        // Sugerencias
        if (suggestionsRes.ok) {
          const sugData: ApiFriendSuggestion[] = await suggestionsRes.json();
          setSuggestions(
            sugData.map((s) => ({
              id: s.id,
              username: s.username,
              name: s.nombre ?? s.username,
              avatar: s.foto_url ?? "",
              city: s.ciudad,
              country: s.pais,
              mutualCount: s.mutuos ?? 0,
              interests: s.intereses ?? [],
            }))
          );
        } else {
          setSuggestions([]);
        }

        setErrorMsg(null);
      } catch (error) {
        console.error("Error cargando datos de amigos:", error);
        setErrorMsg("No se pudo cargar la información de amigos.");
      } finally {
        setLoading(false);
      }
    };

    fetchFriendsData();
  }, []);

  const totalFriends = friends.length;
  const totalRequests = requests.length;
  const totalSuggestions = suggestions.length;

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando amigos...
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="mx-auto flex h-full w-full max-w-3xl flex-col items-center justify-center gap-4 px-4 py-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Conexiones no disponibles</CardTitle>
            <CardDescription>{errorMsg}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
            <p>
              Intenta recargar la página o verificar tu conexión. Si el problema
              persiste, revisa el estado del servidor.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Reintentar
              </Button>
              <Button size="sm" variant="default" asChild>
                <Link href="/viajero/buscar-viajero">
                  <Search className="mr-1 h-3 w-3" />
                  Buscar viajero
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 lg:px-0">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Amigos</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona tus amigos, solicitudes y nuevas conexiones dentro de
            SharePath.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/viajero/buscar-viajero">
              <Search className="mr-1 h-3 w-3" />
              Buscar amigos
            </Link>
          </Button>
          <Button variant="default" size="sm">
            <UserPlus className="mr-1 h-3 w-3" />
            Invitar por enlace
          </Button>
        </div>
      </div>

      {/* Resumen / Stats */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <SummaryCard
          label="Amigos"
          value={totalFriends}
          icon={Users}
          highlight
        />
        <SummaryCard
          label="Solicitudes pendientes"
          value={totalRequests}
          icon={UserPlus}
        />
        <SummaryCard
          label="Sugerencias"
          value={totalSuggestions}
          icon={Sparkles}
        />
      </div>

      {/* Tabs principales */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Tu red de viajeros
          </CardTitle>
          <CardDescription className="text-xs">
            Conecta con otros viajeros, acepta solicitudes y descubre nuevas
            personas con intereses similares.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="friends" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="friends">Amigos ({totalFriends})</TabsTrigger>
              <TabsTrigger value="requests">
                Solicitudes ({totalRequests})
              </TabsTrigger>
              <TabsTrigger value="suggestions">
                Sugerencias ({totalSuggestions})
              </TabsTrigger>
            </TabsList>

            {/* Amigos */}
            <TabsContent value="friends" className="space-y-3">
              {friends.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="Aún no tienes amigos agregados"
                  description="Busca viajeros con intereses similares y envíales una solicitud."
                  ctaLabel="Buscar amigos"
                  ctaHref="/viajero/buscar-viajero"
                />
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {friends.map((friend) => (
                    <FriendCard key={friend.id} friend={friend} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Solicitudes */}
            <TabsContent value="requests" className="space-y-3">
              {requests.length === 0 ? (
                <EmptyState
                  icon={UserPlus}
                  title="No tienes solicitudes pendientes"
                  description="Cuando alguien te envíe una solicitud, aparecerá aquí."
                />
              ) : (
                <div className="space-y-3">
                  {requests.map((req) => (
                    <FriendRequestCard key={req.id} request={req} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Sugerencias */}
            <TabsContent value="suggestions" className="space-y-3">
              {suggestions.length === 0 ? (
                <EmptyState
                  icon={Sparkles}
                  title="Sin sugerencias por ahora"
                  description="A medida que interactúes con itinerarios y viajeros, te mostraremos sugerencias aquí."
                />
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {suggestions.map((s) => (
                    <FriendSuggestionCard key={s.id} suggestion={s} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// ===== Componentes auxiliares =====

type SummaryCardProps = {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
};

function SummaryCard({
  label,
  value,
  icon: Icon,
  highlight = false,
}: SummaryCardProps) {
  return (
    <Card
      className={
        highlight ? "border-primary/40 bg-primary/5 shadow-sm" : "bg-card/60"
      }
    >
      <CardContent className="flex items-center gap-3 p-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className="text-sm font-semibold">{value}</span>
        </div>
      </CardContent>
    </Card>
  );
}

type FriendCardProps = {
  friend: Friend;
};

function FriendCard({ friend }: FriendCardProps) {
  return (
    <Card className="border bg-card/70 shadow-sm">
      <CardContent className="flex items-center justify-between gap-3 p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-xl">
            <AvatarImage src={friend.avatar || undefined} alt={friend.name} />
            <AvatarFallback className="rounded-xl">
              {getInitials(friend.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{friend.name}</span>
              <span className="text-[11px] text-muted-foreground">
                @{friend.username}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              {friend.city || friend.country ? (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {friend.city && <span>{friend.city}</span>}
                  {friend.city && friend.country && <span>•</span>}
                  {friend.country && <span>{friend.country}</span>}
                </span>
              ) : null}
              {friend.mutualCount > 0 && (
                <span>{friend.mutualCount} amigos en común</span>
              )}
              {friend.isOnline && (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  En línea
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Button variant="outline" size="icon">
            <MessageCircle className="h-4 w-4" />
            <span className="sr-only">Enviar mensaje</span>
          </Button>
          <Button variant="ghost" className="text-red-500">
            <UserX className="mr-1 h-3 w-3" />
            <span className="text-[11px]">Eliminar</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

type FriendRequestCardProps = {
  request: FriendRequest;
};

function FriendRequestCard({ request }: FriendRequestCardProps) {
  return (
    <Card className="border bg-card/70 shadow-sm">
      <CardContent className="flex items-center justify-between gap-3 p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-xl">
            <AvatarImage src={request.avatar || undefined} alt={request.name} />
            <AvatarFallback className="rounded-xl">
              {getInitials(request.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold">{request.name}</span>
            <span className="text-[11px] text-muted-foreground">
              @{request.username}
            </span>
            {request.message && (
              <p className="mt-1 text-[11px] text-muted-foreground/80 line-clamp-2">
                {request.message}
              </p>
            )}
            {request.dateLabel && (
              <span className="mt-1 text-[10px] text-muted-foreground/70">
                Solicitud enviada el {request.dateLabel}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Button size="sm" className="h-7 text-xs">
            <UserCheck className="mr-1 h-3 w-3" />
            Aceptar
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 border-destructive/40 text-[11px] text-destructive"
          >
            <UserX className="mr-1 h-3 w-3" />
            Rechazar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

type FriendSuggestionCardProps = {
  suggestion: FriendSuggestion;
};

function FriendSuggestionCard({ suggestion }: FriendSuggestionCardProps) {
  return (
    <Card className="border bg-card/70 shadow-sm">
      <CardContent className="flex items-center justify-between gap-3 p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-xl">
            <AvatarImage
              src={suggestion.avatar || undefined}
              alt={suggestion.name}
            />
            <AvatarFallback className="rounded-xl">
              {getInitials(suggestion.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold">{suggestion.name}</span>
            <span className="text-[11px] text-muted-foreground">
              @{suggestion.username}
            </span>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              {(suggestion.city || suggestion.country) && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {suggestion.city && <span>{suggestion.city}</span>}
                  {suggestion.city && suggestion.country && <span>•</span>}
                  {suggestion.country && <span>{suggestion.country}</span>}
                </span>
              )}
              {suggestion.mutualCount > 0 && (
                <span>{suggestion.mutualCount} amigos en común</span>
              )}
            </div>
            {suggestion.interests.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {suggestion.interests.slice(0, 3).map((i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="text-[10px] font-normal"
                  >
                    {i}
                  </Badge>
                ))}
                {suggestion.interests.length > 3 && (
                  <Badge variant="outline" className="text-[10px] font-normal">
                    +{suggestion.interests.length - 3} más
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Button size="sm" className="h-7 text-xs">
            <UserPlus className="mr-1 h-3 w-3" />
            Agregar
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]">
            Ocultar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

type EmptyStateProps = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
};

function EmptyState({
  icon: Icon,
  title,
  description,
  ctaLabel,
  ctaHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed bg-muted/30 px-4 py-6 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {ctaLabel && ctaHref && (
        <Button size="sm" variant="outline" asChild>
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      )}
    </div>
  );
}
