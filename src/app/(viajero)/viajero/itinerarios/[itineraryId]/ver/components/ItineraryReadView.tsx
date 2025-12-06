"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarDays,
  Map as MapIcon,
  Edit3,
  ArrowLeft,
  Share2,
  Clock,
  Loader2,
  List,
  MapPin,
  Globe,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// --- IMPORTACIÓN DINÁMICA DEL MAPA ---
const ItineraryViewMap = dynamic(() => import("./ItineraryViewMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-muted/20 animate-pulse flex flex-col items-center justify-center text-muted-foreground gap-3">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
        <Loader2 className="h-8 w-8 animate-spin text-primary relative z-10" />
      </div>
      <span className="text-xs font-medium tracking-widest uppercase opacity-70">
        Cargando Mapa...
      </span>
    </div>
  ),
});

import { ActivityReadCard } from "./ActivityReadCard";

// --- TIPOS ---
interface ItinerarioCompleto {
  id: string;
  titulo: string;
  dias: Array<{
    dia: number;
    fecha: string;
    lugares: any[];
  }>;
  resumen: {
    diasTotales: number;
    totalLugares: number;
    fechaInicio: Date;
    fechaFin: Date;
  };
}

export default function ItineraryReadView({ id }: { id: string }) {
  const router = useRouter();

  // Estados de Datos
  const [itinerario, setItinerario] = useState<ItinerarioCompleto | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados de UI
  const [selectedDay, setSelectedDay] = useState<string>("1");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  // Estado para vista móvil (Lista vs Mapa)
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  // Resetear selección al cambiar de día
  useEffect(() => {
    setSelectedPlaceId(null);
  }, [selectedDay]);

  // Fetch de Datos
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `https://harol-lovers.up.railway.app/itinerario/${id}`,
          {
            headers: { token: localStorage.getItem("authToken") || "" },
          }
        );
        const data = await res.json();

        const actividades = (data.actividades || []).sort(
          (a: any, b: any) =>
            new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
        );

        const grouped: Record<string, any[]> = {};
        actividades.forEach((act: any) => {
          const fechaKey = new Date(act.fecha).toISOString().split("T")[0];
          if (!grouped[fechaKey]) grouped[fechaKey] = [];
          grouped[fechaKey].push({
            id: act._id || act.id,
            titulo: act.lugar.nombre,
            descripcion: act.description,
            imageUrl: act.lugar.foto_url,
            categoria: act.lugar.category,
            estado: act.lugar.mexican_state,
            lat: Number(act.lugar.latitud),
            lng: Number(act.lugar.longitud),
            calificacion: act.lugar.google_score,
          });
        });

        const diasArray = Object.keys(grouped)
          .sort()
          .map((fecha, idx) => ({
            dia: idx + 1,
            fecha,
            lugares: grouped[fecha],
          }));

        setItinerario({
          id: data.id,
          titulo: data.title,
          dias: diasArray,
          resumen: {
            diasTotales: diasArray.length,
            totalLugares: actividades.length,
            fechaInicio: new Date(diasArray[0]?.fecha || Date.now()),
            fechaFin: new Date(
              diasArray[diasArray.length - 1]?.fecha || Date.now()
            ),
          },
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  // Memo: Datos del día actual
  const currentDayData = useMemo(() => {
    if (!itinerario) return null;
    return itinerario.dias.find((d) => d.dia.toString() === selectedDay);
  }, [itinerario, selectedDay]);

  // Memo: Actividades para el mapa
  const mapActivities = useMemo(() => {
    if (!currentDayData) return [];
    return currentDayData.lugares.map((l) => ({
      id: l.id,
      nombre: l.titulo,
      lat: l.lat,
      lng: l.lng,
    }));
  }, [currentDayData]);

  // Handler para seleccionar lugar (con lógica móvil)
  const handlePlaceSelect = (id: string | null) => {
    setSelectedPlaceId(id);
    if (id && window.innerWidth < 1024) {
      setMobileView("map"); // En móvil, ir al mapa al seleccionar
    }
  };

  if (loading)
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">
            Cargando tu viaje...
          </p>
        </div>
      </div>
    );

  if (!itinerario)
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 text-center p-6">
        <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center">
          <MapIcon className="h-10 w-10 text-muted-foreground/30" />
        </div>
        <h2 className="text-xl font-bold">Itinerario no encontrado</h2>
        <Button variant="outline" onClick={() => router.back()}>
          Volver
        </Button>
      </div>
    );

  return (
    // Usamos 100dvh para evitar problemas de scroll en móviles iOS/Android
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      {/* --- HEADER --- */}
      <header className="z-50 bg-background/80 backdrop-blur-xl border-b border-border/60 shrink-0 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full shrink-0 hover:bg-muted"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex flex-col overflow-hidden">
              <h1 className="text-base md:text-lg font-bold tracking-tight truncate">
                {itinerario.titulo}
              </h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                <span className="flex items-center gap-1 shrink-0">
                  <CalendarDays className="h-3 w-3" />
                  {format(itinerario.resumen.fechaInicio, "d MMM", {
                    locale: es,
                  })}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="bg-muted px-2 py-0.5 rounded-full text-[10px] font-medium truncate">
                  {itinerario.resumen.totalLugares} lugares
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* BOTÓN PUBLICAR DESTACADO */}
            <Button
              onClick={() => router.push(`/viajero/itinerarios/${id}/publicar`)}
              className="hidden sm:flex bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all rounded-full px-5 h-9 font-semibold"
            >
              <Globe className="mr-2 h-4 w-4" /> Publicar
            </Button>

            {/* Acciones Secundarias */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/viajero/itinerarios/${id}/editar`)}
              className="hidden sm:flex h-9 rounded-full"
            >
              <Edit3 className="mr-2 h-4 w-4" /> Editar
            </Button>

            {/* Menú Móvil Simplificado */}
            <Button
              size="icon"
              variant="ghost"
              className="sm:hidden rounded-full"
              onClick={() => router.push(`/viajero/itinerarios/${id}/publicar`)}
            >
              <Share2 className="h-5 w-5 text-primary" />
            </Button>
          </div>
        </div>
      </header>

      {/* --- BODY --- */}
      <main className="flex-1 relative w-full max-w-[1600px] mx-auto overflow-hidden">
        <div className="flex h-full w-full relative">
          {/* PANEL IZQUIERDO: LISTA */}
          <div
            className={cn(
              "flex flex-col h-full bg-background transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) absolute inset-0 z-20 lg:relative lg:translate-x-0 lg:w-[480px] lg:border-r lg:z-10",
              mobileView === "list" ? "translate-x-0" : "-translate-x-full"
            )}
          >
            {/* Selector de Días Horizontal */}
            <div className="shrink-0 border-b bg-muted/5 p-2">
              <ScrollArea className="w-full whitespace-nowrap pb-2">
                <div className="flex gap-2 px-2">
                  {itinerario.dias.map((d) => {
                    const isSelected = selectedDay === d.dia.toString();
                    return (
                      <button
                        key={d.dia}
                        onClick={() => setSelectedDay(d.dia.toString())}
                        className={cn(
                          "flex flex-col items-center justify-center min-w-[72px] px-3 py-2 rounded-xl text-xs border transition-all duration-200 select-none",
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                            : "bg-card hover:bg-muted text-muted-foreground border-border"
                        )}
                      >
                        <span className="font-extrabold uppercase tracking-wider text-[10px]">
                          Día {d.dia}
                        </span>
                        <span
                          className={cn(
                            "font-medium text-[10px] mt-0.5",
                            isSelected ? "opacity-90" : "opacity-60"
                          )}
                        >
                          {format(new Date(d.fecha), "d MMM", { locale: es })}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            {/* --- CONTENEDOR DE SCROLL REPARADO --- */}
            {/* Usamos flex-1 y min-h-0 para asegurar que el scroll funcione dentro del flex container */}
            <div className="flex-1 min-h-0 relative">
              <ScrollArea className="h-full w-full bg-muted/5">
                <div className="p-4 space-y-4 pb-24 lg:pb-10">
                  {/* Header de la Lista (Sticky) */}
                  <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur py-3 z-10 border-b border-dashed mb-4">
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Cronograma del Día {selectedDay}
                    </h3>
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-background px-2"
                    >
                      {currentDayData?.lugares.length || 0} paradas
                    </Badge>
                  </div>

                  {/* Lista de Tarjetas */}
                  <div className="space-y-4">
                    {currentDayData?.lugares.map((lugar, idx) => (
                      <div
                        key={lugar.id}
                        onClick={() => handlePlaceSelect(lugar.id)}
                        className={cn(
                          "cursor-pointer transition-all duration-300 rounded-2xl border-2",
                          selectedPlaceId === lugar.id
                            ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                            : "border-transparent hover:border-border"
                        )}
                      >
                        <ActivityReadCard activity={lugar} index={idx} />
                      </div>
                    ))}
                  </div>

                  {/* Empty State */}
                  {(!currentDayData || currentDayData.lugares.length === 0) && (
                    <div className="py-20 text-center flex flex-col items-center justify-center opacity-60">
                      <MapIcon className="h-12 w-12 text-muted-foreground/30 mb-3" />
                      <p className="text-sm font-medium">Día libre</p>
                      <p className="text-xs text-muted-foreground">
                        Sin actividades programadas para hoy.
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* PANEL DERECHO: MAPA */}
          {/* - En móvil: Absoluto, ocupa todo, entra desde la derecha.
                - En desktop: Relativo, flex-1, siempre visible.
            */}
          <div
            className={cn(
              "flex-1 h-full bg-muted transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) absolute inset-0 z-10 lg:relative lg:translate-x-0 lg:z-0",
              mobileView === "map" ? "translate-x-0" : "translate-x-full"
            )}
          >
            <ItineraryViewMap
              activities={mapActivities}
              className="h-full w-full"
              selectedPlaceId={selectedPlaceId}
              onSelectPlace={handlePlaceSelect}
            />
          </div>
        </div>

        {/* BOTÓN FLOTANTE (SOLO MÓVIL) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 lg:hidden animate-in slide-in-from-bottom-6 duration-700">
          <div className="flex bg-foreground/90 text-background rounded-full shadow-2xl border border-white/10 p-1.5 backdrop-blur-xl ring-1 ring-black/10">
            <button
              onClick={() => setMobileView("list")}
              className={cn(
                "flex items-center gap-2 rounded-full px-6 py-3 text-xs font-bold transition-all duration-300",
                mobileView === "list"
                  ? "bg-background text-foreground shadow-md scale-105"
                  : "text-background/70 hover:text-background"
              )}
            >
              <List className="h-4 w-4" /> Lista
            </button>
            <button
              onClick={() => setMobileView("map")}
              className={cn(
                "flex items-center gap-2 rounded-full px-6 py-3 text-xs font-bold transition-all duration-300",
                mobileView === "map"
                  ? "bg-background text-foreground shadow-md scale-105"
                  : "text-background/70 hover:text-background"
              )}
            >
              <MapIcon className="h-4 w-4" /> Mapa
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
