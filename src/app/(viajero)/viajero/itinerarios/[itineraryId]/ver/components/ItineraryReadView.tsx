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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// IMPORTACIÓN SEGURA DEL MAPA
const ItineraryViewMap = dynamic(() => import("./ItineraryViewMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-muted/20 animate-pulse flex flex-col items-center justify-center text-muted-foreground gap-2">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="text-sm font-medium">Cargando mapa...</span>
    </div>
  ),
});

import { ActivityReadCard } from "./ActivityReadCard";

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
  const [itinerario, setItinerario] = useState<ItinerarioCompleto | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string>("1");

  // ESTADO DE SELECCIÓN GLOBAL (Conecta Mapa <-> Lista)
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  // Resetear selección al cambiar de día
  useEffect(() => {
    setSelectedPlaceId(null);
  }, [selectedDay]);

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

  const currentDayData = useMemo(() => {
    if (!itinerario) return null;
    return itinerario.dias.find((d) => d.dia.toString() === selectedDay);
  }, [itinerario, selectedDay]);

  const mapActivities = useMemo(() => {
    if (!currentDayData) return [];
    return currentDayData.lugares.map((l) => ({
      id: l.id,
      nombre: l.titulo,
      lat: l.lat,
      lng: l.lng,
    }));
  }, [currentDayData]);

  if (loading)
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );

  if (!itinerario)
    return <div className="p-10 text-center">Itinerario no encontrado</div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight line-clamp-1">
                {itinerario.titulo}
              </h1>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {format(itinerario.resumen.fechaInicio, "d MMM", {
                    locale: es,
                  })}{" "}
                  -{" "}
                  {format(itinerario.resumen.fechaFin, "d MMM yyyy", {
                    locale: es,
                  })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/viajero/itinerarios/${id}/editar`)}
            >
              <Edit3 className="mr-2 h-4 w-4" /> Editar
            </Button>
            <Button size="sm">
              <Share2 className="mr-2 h-4 w-4" /> Compartir
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 grid lg:grid-cols-[400px_1fr] gap-6 h-[calc(100vh-80px)] overflow-hidden">
        {/* LISTA IZQUIERDA */}
        <div className="flex flex-col h-full bg-card rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-muted/10">
            <ScrollArea className="w-full whitespace-nowrap pb-2">
              <div className="flex gap-2">
                {itinerario.dias.map((d) => (
                  <button
                    key={d.dia}
                    onClick={() => setSelectedDay(d.dia.toString())}
                    className={cn(
                      "flex flex-col items-center justify-center min-w-[70px] px-3 py-2 rounded-xl text-sm border transition-all",
                      selectedDay === d.dia.toString()
                        ? "bg-primary text-primary-foreground border-primary shadow-md"
                        : "bg-background hover:bg-muted text-muted-foreground border-transparent"
                    )}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Día {d.dia}
                    </span>
                    <span className="text-xs font-medium opacity-90">
                      {format(new Date(d.fecha), "d MMM", { locale: es })}
                    </span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          <ScrollArea className="flex-1 bg-muted/5">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" /> Itinerario del Día
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {currentDayData?.lugares.length || 0} paradas
                </Badge>
              </div>

              {currentDayData?.lugares.map((lugar, idx) => (
                <div
                  key={lugar.id}
                  onClick={() => setSelectedPlaceId(lugar.id)} // CONEXIÓN CLAVE
                  className={cn(
                    "cursor-pointer transition-all duration-300 rounded-xl",
                    selectedPlaceId === lugar.id
                      ? "ring-2 ring-primary ring-offset-2 bg-primary/5 shadow-sm"
                      : "hover:bg-muted/50"
                  )}
                >
                  <ActivityReadCard activity={lugar} index={idx} />
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* MAPA DERECHO (CONECTADO) */}
        <div className="hidden lg:block h-full w-full bg-muted rounded-2xl overflow-hidden border shadow-inner relative">
          <ItineraryViewMap
            activities={mapActivities}
            className="h-full w-full"
            selectedPlaceId={selectedPlaceId} // Pasamos el ID seleccionado
            onSelectPlace={setSelectedPlaceId} // Pasamos el setter para que el mapa actualice al padre
          />
        </div>
      </main>
    </div>
  );
}
