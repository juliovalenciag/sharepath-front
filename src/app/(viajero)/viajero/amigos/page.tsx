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
  UserMinus,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Link from "next/link";
import { getInitials } from "@/lib/utils";

//const API_URL = "https://harol-lovers.up.railway.app";
const API_URL = "http://localhost:4000";

import { ItinerariosAPI } from "@/api/ItinerariosAPI";

const api = ItinerariosAPI.getInstance();

// Estados posibles para responder a una solicitud de amistad
enum FriendRequestState {
  PENDING = 0,
  FRIEND = 1, // ACEPTAR
  REJECTED = 2, // RECHAZAR
}

// Función para llamar al endpoint
async function respondToRequest(requestId: string | number, state: number) {
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("No hay sesión");

  const response = await fetch(`${API_URL}/amigo/respond`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      token: token,
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify({ Id: Number(requestId), state: state }),
  });

  if (!response.ok) {
    throw new Error("Error al responder la solicitud");
  }

  return await response.json();
}

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
  correo: string;
  name: string;
  avatar: string;
  city?: string;
  country?: string;
  mutualCount: number;
  isOnline: boolean;
};
type PendingRequest = {
  id: string | number;
  dateLabel?: string;
  status: number;
};
type FriendRequest = {
  id: string | number;
  name: string;
  username: string;
  avatar: string;
  message?: string;
  dateLabel?: string;
  status: number;
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

  // --- DATOS ESTÁTICOS PARA PRUEBA VISUAL ---
  const mockRequest: FriendRequest = {
    id: "99999",
    username: "test_design",
    name: "Diseño Estático",
    avatar: "https://github.com/shadcn.png",
    dateLabel: "Hace un momento",
    status: 0, // PENDIENTE
    message: undefined, // opcional
  };
  async function respondToRequest(requestId: string | number, state: number) {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("No hay sesión activa");

    const response = await fetch(`${API_URL}/amigo/respond`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        token,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ Id: Number(requestId), state }),
    });

    if (!response.ok) throw new Error("Error al responder la solicitud");

    return await response.json();
  }

  const handleRespond = async (id: number, state: number) => {
    try {
      await respondToRequest(id, state);

      // Eliminar solicitud de la lista visual
      setRequests((prev) => prev.filter((req) => Number(req.id) !== id));

      console.log(
        state === FriendRequestState.FRIEND
          ? "Solicitud aceptada"
          : "Solicitud rechazada"
      );
    } catch (error) {
      console.error(error);
      alert("Hubo un error al procesar la solicitud");
    }
  };
  async function fetchFriendsAPI() {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("No hay sesión activa");

    const res = await fetch(`${API_URL}/amigo`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        token,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Error al cargar lista de amigos");

    return await res.json();
  }

  async function deleteFriend(correo: string) {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("No hay sesión activa");

    const response = await fetch(`${API_URL}/amigo/${correo}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        token,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Error al eliminar amigo");

    return await response.json();
  }

  async function handleDelete(correo: string) {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No hay sesión activa");
      console.log("correo de: ", correo);
      const res = await fetch(`${API_URL}/amigo/${correo}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          token,
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Error al eliminar amigo");

      setFriends((prev) => prev.filter((f) => f.correo !== correo));
    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar al amigo");
    }
  }

  // Cargar solicitudes pendientes
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No hay sesión activa");

        const res = await fetch(`${API_URL}/amigo/pendiente`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token,
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          setRequests([]); 
        return; 
        }
         

        const json = await res.json(); 
        const rawRequests: {
          id: number;
          fecha_amistad: string;
          status: number;
        }[] = json.data;

        const mappedRequests: FriendRequest[] = rawRequests.map((r) => ({
          id: r.id,
          name: "Usuario desconocido",
          username: "desconocido",
          avatar: "", // placeholder
          dateLabel: r.fecha_amistad
            ? new Date(r.fecha_amistad).toLocaleDateString("es-MX", {
                day: "2-digit",
                month: "short",
              })
            : undefined,
          status: r.status,
          message: undefined,
        }));

        setRequests(mappedRequests);
      } catch (error) {
        console.error("Error cargando solicitudes pendientes:", error);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();

    const loadFriends = async () => {
      try {
        const json = await fetchFriendsAPI();

        console.log("Amigos recibidos:", json);

        const rawFriends = Array.isArray(json) ? json : [];

        const mapped: Friend[] = rawFriends.map((f) => {
          const me = JSON.parse(localStorage.getItem("user") || "{}").username;

          const user =
            f.requesting_user?.username !== me
              ? f.requesting_user
              : f.receiving_user;

          return {
            id: f.id,
            username: user.username,
            name: user.nombre || user.username,
            avatar: user.foto_url || "",
            correo: user.correo,
            city: user.ciudad,
            country: user.pais,
            mutualCount: 0,
            isOnline: false,
          };
        });

        setFriends(mapped);
      } catch (err) {
        console.error("Error cargando amigos:", err);
        setFriends([]);
      }
    };

    loadFriends();

    // Cargar sugerencias de amigos
    const loadSuggestions = async () => {
      try {
        const resp = await api.getFriendSuggestions();
        const list = Array.isArray(resp?.data) ? resp.data : [];
        const mapped: FriendSuggestion[] = list.map((s: any) => ({
          id: s.username || String(s.id || ""),
          username: s.username,
          name: s.nombre_completo || s.username,
          avatar: s.foto_url || "",
          city: s.ciudad,
          country: s.pais,
          mutualCount: s.mutuos || 0,
          interests: s.intereses || [],
        }));

        setSuggestions(mapped);
      } catch (err) {
        console.warn("No se pudieron cargar sugerencias:", err);
        setSuggestions([]);
      }
    };

    loadSuggestions();
  }, []);

  const totalFriends = friends.length;
  const totalRequests = requests.length;
  const totalSuggestions = suggestions.length;

  if (loading) {
    return (
      <div className="flex min-h-[300px] w-full flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Cargando tu red...</p>
      </div>
    );
  }

  if (errorMsg && requests.length === 0) {
    return (
      <div className="mx-auto flex h-full w-full max-w-xl flex-col items-center justify-center gap-6 px-4 py-12">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <UserX className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold">Algo salió mal</h3>
          <p className="text-sm text-muted-foreground max-w-sm">{errorMsg}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Intentar de nuevo
          </Button>
          <Button asChild>
            <Link href="/viajero/amigos/buscar-viajero">
              Buscar manualmente
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 lg:px-8">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Amigos y Conexiones
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestiona tu red de viajeros y descubre nuevas aventuras juntos.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild className="h-9">
            <Link href="/viajero/amigos/buscar-viajero">
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Link>
          </Button>
          <Button size="sm" className="h-9">
            <UserPlus className="mr-2 h-4 w-4" />
            Invitar
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Total Amigos"
          value={totalFriends}
          icon={Users}
          active
        />
        <SummaryCard
          label="Solicitudes"
          value={totalRequests}
          icon={UserCheck}
          intent={totalRequests > 0 ? "warning" : "default"}
        />
        <SummaryCard
          label="Sugerencias"
          value={totalSuggestions}
          icon={Sparkles}
          intent="info"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="friends" className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="h-9 w-full justify-start rounded-lg bg-muted p-1 sm:w-auto">
            <TabsTrigger value="friends" className="px-4 text-xs sm:text-sm">
              Amigos
              <Badge
                variant="default"
                className="ml-2 h-5 px-1.5 text-[10px] font-normal"
              >
                {totalFriends}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="requests" className="px-4 text-xs sm:text-sm">
              Solicitudes
              {totalRequests > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-2 h-5 px-1.5 text-[10px] font-normal"
                >
                  {totalRequests}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="suggestions"
              className="px-4 text-xs sm:text-sm"
            >
              Sugerencias
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="friends"
          className="animate-in fade-in-50 slide-in-from-bottom-2"
        >
          {friends.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Tu lista de amigos está vacía"
              description="¡Es hora de socializar! Busca viajeros con tus mismos intereses para empezar."
              actionLabel="Buscar viajeros"
              actionHref="/viajero/amigos/buscar-viajero"
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              {friends.map((friend) => (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent
          value="requests"
          className="animate-in fade-in-50 slide-in-from-bottom-2"
        >
          {requests.length === 0 ? (
            <EmptyState
              icon={UserCheck}
              title="Todo al día"
              description="No tienes solicitudes de amistad pendientes en este momento."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {requests.map((req) => (
                <FriendRequestCard
                  key={req.id}
                  request={req}
                  onRespond={handleRespond}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent
          value="suggestions"
          className="animate-in fade-in-50 slide-in-from-bottom-2"
        >
          {suggestions.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="Sin sugerencias nuevas"
              description="Vuelve más tarde o interactúa más con la plataforma para recibir recomendaciones personalizadas."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {suggestions.map((s) => (
                <FriendSuggestionCard key={s.id} suggestion={s} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ===== Componentes Auxiliares Mejorados =====

function SummaryCard({
  label,
  value,
  icon: Icon,
  active = false,
  intent = "default",
}: {
  label: string;
  value: number;
  icon: any;
  active?: boolean;
  intent?: "default" | "warning" | "info";
}) {
  const colors = {
    default: "bg-primary/10 text-primary",
    warning: "bg-orange-500/10 text-orange-600",
    info: "bg-blue-500/10 text-blue-600",
  };

  return (
    <Card
      className={`overflow-hidden transition-all hover:shadow-md ${
        active ? "border-primary/50 ring-1 ring-primary/20" : ""
      }`}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors[intent]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// function FriendCard({ friend }: { friend: Friend }) {
function FriendCard({
  friend,
  onDelete,
}: {
  friend: Friend;
  onDelete: (correo: string) => void;
}) {
  return (
    <Card className="group flex flex-col justify-between overflow-hidden transition-all hover:border-primary/30 hover:shadow-md">
      <CardContent className="flex flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex gap-3">
            <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
              <AvatarImage src={friend.avatar} alt={friend.name} />
              <AvatarFallback className="bg-primary/5 font-medium text-primary">
                {getInitials(friend.name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="font-semibold leading-none">{friend.name}</h4>
              <p className="text-xs text-muted-foreground">
                @{friend.username}
              </p>
              {friend.isOnline && (
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-medium text-emerald-600">
                    En línea
                  </span>
                </div>
              )}
            </div>
          </div>
          <Link href={`/viajero/chats?username=${friend.username}`}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="space-y-2 rounded-lg bg-muted/40 p-2.5 text-xs text-muted-foreground">
          {(friend.city || friend.country) && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                {[friend.city, friend.country].filter(Boolean).join(", ")}
              </span>
            </div>
          )}
          {friend.mutualCount > 0 && (
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 shrink-0" />
              <span>{friend.mutualCount} amigos en común</span>
            </div>
          )}
        </div>
      </CardContent>
      <div className="border-t bg-muted/10 p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          onClick={() => onDelete(friend.correo)}
        >
          <UserMinus className="mr-2 h-3.5 w-3.5" />
          Dejar de seguir
        </Button>
      </div>
    </Card>
  );
}

function FriendRequestCard({
  request,
  onRespond,
}: {
  request: FriendRequest;
  onRespond: (id: number, state: number) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  const handleAction = async (state: number) => {
    setLoading(true);

    await onRespond(Number(request.id), state);

    setLoading(false);
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* Avatar */}
          <Avatar className="h-10 w-10">
            <AvatarImage src={request.avatar} alt={request.name} />
            <AvatarFallback>{getInitials(request.name)}</AvatarFallback>
          </Avatar>

          {/* Información del usuario */}
          <div className="flex-1 space-y-1">
            <div className="flex justify-between">
              <h4 className="font-medium text-sm">{request.name}</h4>
              {request.dateLabel && (
                <span className="text-[10px] text-muted-foreground">
                  {request.dateLabel}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">@{request.username}</p>
            {request.message && (
              <div className="mt-2 rounded-md bg-muted p-2 text-xs italic text-muted-foreground">
                &quot;{request.message}&quot;
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* Botones de Acción (Aceptar / Rechazar) */}
      <div className="grid grid-cols-2 gap-px bg-border border-t">
        <Button
          variant="ghost"
          className="rounded-none bg-card hover:bg-primary/5 hover:text-primary h-10 text-xs font-medium disabled:opacity-50"
          onClick={() => handleAction(FriendRequestState.FRIEND)} // Envía 1 (Aceptar)
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
          ) : (
            <UserCheck className="mr-2 h-3.5 w-3.5" />
          )}
          Aceptar
        </Button>

        <Button
          variant="ghost"
          className="rounded-none bg-card hover:bg-destructive/5 hover:text-destructive h-10 text-xs font-medium disabled:opacity-50"
          onClick={() => handleAction(FriendRequestState.REJECTED)} // Envía 2 (Rechazar)
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
          ) : (
            <UserX className="mr-2 h-3.5 w-3.5" />
          )}
          Rechazar
        </Button>
      </div>
    </Card>
  );
}

function FriendSuggestionCard({
  suggestion,
}: {
  suggestion: FriendSuggestion;
}) {
  return (
    <Card className="flex flex-col justify-between transition-all hover:border-primary/40">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={suggestion.avatar} alt={suggestion.name} />
            <AvatarFallback>{getInitials(suggestion.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-medium text-sm">{suggestion.name}</h4>
            <p className="text-xs text-muted-foreground">
              @{suggestion.username}
            </p>
            {suggestion.mutualCount > 0 && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {suggestion.mutualCount} amigos en común
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 min-h-[24px]">
          {suggestion.interests.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="rounded-md px-1.5 py-0 text-[10px] font-normal"
            >
              {tag}
            </Badge>
          ))}
          {suggestion.interests.length > 3 && (
            <Badge
              variant="outline"
              className="rounded-md px-1.5 py-0 text-[10px] font-normal"
            >
              +{suggestion.interests.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
      <div className="p-3 pt-0 mt-auto">
        <Button className="w-full h-8 text-xs" variant="outline">
          <UserPlus className="mr-2 h-3.5 w-3.5" />
          Conectar
        </Button>
      </div>
    </Card>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: any;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 p-8 text-center animate-in zoom-in-95 duration-300">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Icon className="h-7 w-7 text-muted-foreground/50" />
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {actionLabel && actionHref && (
        <Button className="mt-6" size="sm" asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}
