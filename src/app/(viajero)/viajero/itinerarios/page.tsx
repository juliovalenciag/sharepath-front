"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Plane, Compass, AlertTriangle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// API y Tipos
import { ItinerariosAPI } from "@/api/ItinerariosAPI";
import { transformarItinerario } from "@/lib/utils/itinerario-helpers";

// Componentes
import ItinerarioCard from "@/components/viajero-components/ItineraryCard";

export default function MisItinerariosPage() {
  const [itinerarios, setItinerarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para el modal de eliminación
  const [deleteId, setDeleteId] = useState<string | number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const api = ItinerariosAPI.getInstance();

  useEffect(() => {
    const fetchItinerarios = async () => {
      try {
        const response: any = await api.getMyItinerarios();
        if (Array.isArray(response)) {
          const processed = response.map(transformarItinerario);
          // Ordenar: Más recientes (futuros) primero
          processed.sort(
            (a, b) => b.startDate.getTime() - a.startDate.getTime()
          );
          setItinerarios(processed);
        } else {
          console.error("Formato inesperado", response);
          setItinerarios([]);
        }
      } catch (error: any) {
        toast.error("Error al cargar itinerarios", {
          description: error.message || "No pudimos conectar con el servidor.",
        });
      } finally {
        setTimeout(() => setLoading(false), 300);
      }
    };

    fetchItinerarios();
  }, []);

  // Abre el modal
  const requestDelete = (id: string | number) => {
    setDeleteId(id);
  };

  // Ejecuta la eliminación real
  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);

    try {
      await api.deleteItinerario(deleteId);
      setItinerarios((prev) => prev.filter((it) => it.id !== deleteId));
      toast.success("Viaje eliminado", {
        description: "El itinerario se ha borrado correctamente.",
      });
    } catch (err: any) {
      toast.error("Error al eliminar", {
        description: err.message || "No pudimos conectar con el servidor.",
      });
    } finally {
      setIsDeleting(false);
      setDeleteId(null); // Cierra el modal
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8 grid grid-cols-1">
        
        {/* === HEADER === */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              Mis Itinerarios{" "}
              <Plane className="h-8 w-8 text-primary animate-pulse" />
            </h1>
            <p className="text-muted-foreground text-base max-w-xl leading-relaxed">
              Gestiona tus próximas aventuras. Edita detalles, agrega nuevos destinos o comparte tus planes con amigos.
            </p>
          </div>

          <Link href="/viajero/itinerarios/crear">
            <Button
              size="lg"
              className="shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all font-bold rounded-full px-8 h-12 gap-2"
            >
              <Plus className="h-5 w-5" /> Nuevo itinerario
            </Button>
          </Link>
        </div>

        <Separator className="bg-border/60" />

        {/* === GRID DE CONTENIDO === */}
        <div className="flex flex-col gap-10">
          {loading ? (
            // SKELETONS ROBUSTOS
            Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="w-full bg-card rounded-[2rem] border border-border/50 overflow-hidden flex flex-col lg:flex-row h-[520px] lg:h-[360px] shadow-sm"
              >
                <div className="w-full lg:w-[380px] p-8 flex flex-col gap-6 border-b lg:border-b-0 lg:border-r border-border/50 bg-muted/5">
                  <Skeleton className="h-48 w-full rounded-2xl" />
                  <div className="space-y-3">
                    <Skeleton className="h-8 w-3/4 rounded-lg" />
                    <Skeleton className="h-4 w-1/2 rounded-lg" />
                  </div>
                  <div className="flex gap-3 mt-auto">
                    <Skeleton className="h-11 flex-1 rounded-xl" />
                    <Skeleton className="h-11 w-12 rounded-xl" />
                  </div>
                </div>
                <div className="flex-1 p-8 flex items-center justify-center bg-background/50">
                  <div className="flex gap-6 w-full overflow-hidden opacity-50">
                    <Skeleton className="h-[280px] w-[240px] rounded-3xl shrink-0" />
                    <Skeleton className="h-[280px] w-[240px] rounded-3xl shrink-0" />
                    <Skeleton className="h-[280px] w-[240px] rounded-3xl shrink-0" />
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
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <ItinerarioCard
                  data={itinerario}
                  // Pasamos la función que abre el modal, NO la que borra directo
                  onDelete={requestDelete}
                />
              </div>
            ))
          ) : (
            // EMPTY STATE
            <div className="flex flex-col items-center justify-center py-32 px-4 text-center animate-in zoom-in-95 duration-500 bg-muted/5 rounded-[3rem] border border-dashed border-border">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <div className="relative h-28 w-28 bg-card rounded-3xl shadow-xl border border-border/50 flex items-center justify-center rotate-3 transition-transform hover:rotate-6 group cursor-pointer">
                  <Compass className="h-14 w-14 text-primary/80 group-hover:text-primary transition-colors" />
                </div>
              </div>

              <h3 className="text-3xl font-bold text-foreground tracking-tight">
                Tu bitácora está vacía
              </h3>
              <p className="text-muted-foreground max-w-md mt-4 mb-10 text-lg leading-relaxed">
                Aún no has creado ningún itinerario. Explora destinos y comienza a planear tu próxima escapada hoy mismo.
              </p>

              <Link href="/viajero/itinerarios/crear">
                <Button
                  size="lg"
                  className="rounded-full px-10 font-bold text-lg h-14 shadow-primary/25 shadow-xl hover:scale-105 transition-transform"
                >
                  <Plus className="mr-2 h-5 w-5" /> Crear primer viaje
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* === MODAL DE CONFIRMACIÓN DE ELIMINACIÓN === */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-3xl border-destructive/20 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3 text-destructive text-xl">
                <div className="p-2 bg-destructive/10 rounded-full">
                    <AlertTriangle className="h-6 w-6" />
                </div>
                ¿Eliminar itinerario?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base pt-2">
              Esta acción es irreversible. Se eliminarán permanentemente el itinerario, las fotos y todos los lugares asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="rounded-xl h-11 border-transparent bg-muted/50 hover:bg-muted font-medium mt-0">
                Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
                onClick={(e) => {
                    e.preventDefault(); // Prevenir cierre automático para manejar estado de carga
                    confirmDelete();
                }}
                disabled={isDeleting}
                className="rounded-xl h-11 bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold shadow-lg shadow-destructive/20"
            >
              {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Eliminando...
                  </>
              ) : (
                  "Sí, eliminar viaje"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}