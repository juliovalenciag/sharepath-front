"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Map, Compass, Plane } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

// API y Tipos
import { ItinerariosAPI } from "@/api/ItinerariosAPI";
import { transformarItinerario } from "@/lib/utils/itinerario-helpers";

// Componentes
import ItinerarioCard from "@/components/viajero-components/ItineraryCard";

export default function MisItinerariosPage() {
  const [itinerarios, setItinerarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItinerarios = async () => {
      try {
        const api = ItinerariosAPI.getInstance();
        const response: any = await api.getMyItinerarios();
        console.log("Itinerarios recibidos:", response);
        if (Array.isArray(response)) {
          const processed = response.map(transformarItinerario);
          // Ordenar: Más recientes (futuros) primero, luego pasados
          processed.sort(
            (a, b) => b.startDate.getTime() - a.startDate.getTime()
          );
          setItinerarios(processed);
        } else {
          console.error("Formato inesperado", response);
        }
      } catch (error: any) {
        toast.error("Error al cargar itinerarios", {
          description: error.message || "No pudimos conectar con el servidor.",
        });
      } finally {
        // Pequeño delay artificial para suavizar la transición si la API responde muy rápido
        setTimeout(() => setLoading(false), 300);
      }
    };

    fetchItinerarios();
  }, []);

  const handleDeleteSuccess = (idEliminado: string | number) => {
    setItinerarios((prev) => prev.filter((it) => it.id !== idEliminado));
    toast.success("Viaje eliminado", {
      description: "El itinerario se ha borrado correctamente.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-10 space-y-8">
        {/* === HEADER === */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              Mis Itinerarios{" "}
              <Plane className="h-6 w-6 text-primary animate-pulse" />
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-lg">
              Gestiona, edita y comparte tus itinerarios.
            </p>
          </div>

          <Link href="/viajero/itinerarios/crear">
            <Button
              size="lg"
              className="shadow-lg shadow-primary/20 hover:shadow-xl  transition-all font-semibold rounded-xl"
            >
              <Plus className="mr-2 h-5 w-5" /> Nuevo Itinerario
            </Button>
          </Link>
        </div>

        <Separator className="bg-border/60" />

        {/* === GRID DE CONTENIDO === */}
        <div className="flex flex-col gap-8 pb-20">
          {loading ? (
            // SKELETONS (Diseñados para coincidir con la forma de ItinerarioCard)
            Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="w-full bg-card rounded-3xl border border-border/50 overflow-hidden flex flex-col lg:flex-row h-[500px] lg:h-[340px]"
              >
                {/* Skeleton Izquierdo (Info) */}
                <div className="w-full lg:w-[360px] p-6 flex flex-col gap-4 border-b lg:border-b-0 lg:border-r border-border/50 bg-muted/5">
                  <Skeleton className="h-48 w-full rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <Skeleton className="h-10 flex-1 rounded-xl" />
                    <Skeleton className="h-10 w-10 rounded-xl" />
                  </div>
                </div>
                {/* Skeleton Derecho (Carrusel) */}
                <div className="flex-1 p-6 flex items-center justify-center bg-background">
                  <div className="flex gap-4 w-full overflow-hidden">
                    <Skeleton className="h-[260px] w-[220px] rounded-2xl shrink-0" />
                    <Skeleton className="h-[260px] w-[220px] rounded-2xl shrink-0" />
                    <Skeleton className="h-[260px] w-[220px] rounded-2xl shrink-0" />
                  </div>
                </div>
              </div>
            ))
          ) : itinerarios.length > 0 ? (
            // LISTA REAL
            itinerarios.map((itinerario, index) => (
              <div
                key={itinerario.id}
                className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards"
                style={{ animationDelay: `${index * 100}ms` }} // Efecto cascada
              >
                <ItinerarioCard
                  data={itinerario}
                  onDelete={handleDeleteSuccess}
                />
              </div>
            ))
          ) : (
            // EMPTY STATE (Estado Vacío)
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center animate-in zoom-in-95 duration-500">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <div className="relative h-24 w-24 bg-card rounded-3xl shadow-xl border border-border/50 flex items-center justify-center rotate-3 transition-transform hover:rotate-6">
                  <Compass className="h-12 w-12 text-primary/80" />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-foreground">
                Tu bitácora está vacía
              </h3>
              <p className="text-muted-foreground max-w-md mt-3 mb-8 leading-relaxed">
                Aún no has creado ningún itinerario. Explora destinos, agrega
                lugares y organiza tu próxima escapada en minutos.
              </p>

              <Link href="/viajero/itinerarios/crear">
                <Button
                  size="lg"
                  className="rounded-full px-8 font-bold text-base h-12 shadow-primary/25 shadow-lg"
                >
                  Comenzar una Aventura
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
