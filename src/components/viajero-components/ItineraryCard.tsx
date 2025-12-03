"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarRange,
  MapPin,
  MoreVertical,
  Trash2,
  Share2,
  Loader2,
  ImageOff,
  Pencil,
  LayoutTemplate,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Importamos tu componente de carrusel premium
import DiasCarousel from "./DiaCarousel";

interface ItinerarioCardProps {
  data: any;
  onDelete: (id: string | number) => void;
}

export default function ItinerarioCard({
  data,
  onDelete,
}: ItinerarioCardProps) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleAction = async (action: string, path: string) => {
    setLoadingAction(action);
    router.push(path);
  };

  // Formateo seguro de fechas
  const dateStr =
    data.startDate && data.endDate
      ? `${format(new Date(data.startDate), "d MMM", {
          locale: es,
        })} - ${format(new Date(data.endDate), "d MMM yyyy", { locale: es })}`
      : "Fechas por definir";

  return (
    <div className="group relative w-full bg-card rounded-3xl border border-border/50 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col lg:flex-row">
      {/* === COLUMNA IZQUIERDA: RESUMEN DEL VIAJE === */}
      <div className="w-full lg:w-[360px] shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-border/50 bg-muted/5 relative z-10">
        {/* 1. Portada */}
        <div className="relative h-52 lg:h-60 w-full overflow-hidden">
          {data.images && data.images.length > 0 ? (
            <Image
              src={data.images[0]}
              alt={data.titulo}
              fill
              className="object-cover transition-transform duration-700"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground/20">
              <ImageOff className="h-16 w-16" />
            </div>
          )}

          {/* Gradiente sutil */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent lg:hidden" />

          {/* Badge de Duración */}
          <div className="absolute top-4 left-4">
            <Badge className="backdrop-blur-md bg-black/60 hover:bg-black/70 text-white border-0 shadow-lg px-3 py-1 text-xs font-bold tracking-wide">
              {data.totalDays} {data.totalDays === 1 ? "DÍA" : "DÍAS"}
            </Badge>
          </div>
        </div>

        {/* 2. Información y Acciones */}
        <div className="p-5 flex flex-col flex-1 justify-between -mt-12 lg:mt-0 relative z-20">
          <div className="space-y-4">
            {/* Título */}
            <h3
              className="text-2xl font-extrabold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors cursor-pointer"
              onClick={() =>
                handleAction("ver", `/viajero/itinerarios/${data.id}/ver`)
              }
              title={data.titulo}
            >
              {data.titulo}
            </h3>

            {/* Metadatos */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 text-sm group/item">
                <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <CalendarRange className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                    Cuándo
                  </p>
                  <p className="font-medium text-foreground truncate max-w-[200px]">
                    {dateStr}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm group/item">
                <div className="h-8 w-8 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                    Destinos
                  </p>
                  <p className="font-medium text-foreground">
                    {data.totalPlaces} lugares planificados
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer de Acciones (BOTONES IGUALES) */}
          <div className="flex items-center gap-2 mt-6 pt-5 border-t border-border/40">
            {/* Botón Ver Plan */}
            <Button
              onClick={() =>
                handleAction("ver", `/viajero/itinerarios/${data.id}/ver`)
              }
              disabled={!!loadingAction}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm font-semibold h-10 rounded-xl px-2"
            >
              {loadingAction === "ver" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <LayoutTemplate className="w-4 h-4 mr-2" />
                  <span className="truncate">Ver detalles</span>
                </>
              )}
            </Button>

            {/* Botón Publicar (Estilo igual pero color distintivo) */}
            <Button
              onClick={() =>
                handleAction(
                  "publicar",
                  `/viajero/itinerarios/${data.id}/publicar`
                )
              }
              disabled={!!loadingAction}
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700 shadow-sm font-semibold h-10 rounded-xl px-2 border border-blue-500"
            >
              {loadingAction === "publicar" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-2" />
                  <span className="truncate">Publicar</span>
                </>
              )}
            </Button>

            {/* Menú Más Opciones (Eliminar) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-xl border-border/60 hover:bg-muted ml-1"
                >
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10 cursor-pointer gap-2 py-2.5"
                  onClick={() => onDelete(data.id)}
                >
                  <Trash2 className="h-4 w-4" /> Eliminar Itinerario
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* === COLUMNA DERECHA: TIMELINE INTERACTIVO === */}
      <div className="flex-1 bg-background flex flex-col min-w-0 relative">
        {/* Header del Preview */}
        <div className="px-6 py-3 border-b border-border/40 flex justify-between items-center bg-muted/5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Vista Rápida
            </p>
          </div>

          {/* Botón Editar con Lápiz */}
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7 gap-1.5 text-primary hover:bg-primary/10 hover:text-primary font-semibold px-3 rounded-full"
            onClick={() =>
              handleAction("ver", `/viajero/itinerarios/${data.id}/ver`)
            }
          >
            Editar <Pencil className="h-3 w-3" />
          </Button>
        </div>

        {/* Contenedor del Carrusel */}
        <div className="flex-1 bg-gradient-to-br from-background to-muted/10 p-2 lg:p-0 flex items-center justify-center relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          ></div>

          {/* El componente DiasCarousel toma el control aquí */}
          <div className="w-full h-full max-h-[360px] flex items-center">
            <DiasCarousel
              dias={data.dias}
              idItinerario={data.id}
              onItinerarioDeleted={onDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
