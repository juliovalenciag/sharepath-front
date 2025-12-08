"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import {
  MapPin,
  Star,
  MoreHorizontal,
  Calendar,
  ImageOff,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getCategoryName,
  getDefaultImageForCategory,
} from "@/lib/category-utils";

// Tipos
interface DiaDetalle {
  id: string | number;
  dia: string;
  categoria: string;
  titulo: string;
  urlImagen: string | null;
  calificacion: number;
}

interface DiasCarouselProps {
  dias: DiaDetalle[];
  idItinerario: string | number;
  onItinerarioDeleted: (id: string | number) => void;
}

export default function DiasCarousel({ dias }: DiasCarouselProps) {
  // Agrupar actividades por día
  const groupedDays = useMemo(() => {
    const groups: Record<string, DiaDetalle[]> = {};
    dias.forEach((act) => {
      if (!groups[act.dia]) groups[act.dia] = [];
      groups[act.dia].push(act);
    });
    return Object.entries(groups);
  }, [dias]);

  if (dias.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[240px] w-full text-muted-foreground/60 bg-muted/10 rounded-2xl border-2 border-dashed border-muted">
        <Calendar className="h-10 w-10 mb-3 opacity-30" />
        <p className="text-sm font-medium">
          Tu itinerario está esperando aventuras
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-[320px] relative group/carousel">
      {" "}
      {/* Altura fija para consistencia */}
      {/* Máscaras de desvanecimiento laterales */}
      <div className="absolute left-0 top-0 bottom-0 w-12 from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 from-background to-transparent z-10 pointer-events-none" />
      <ScrollArea className="w-full h-full whitespace-nowrap rounded-lg">
        <div className="flex gap-5 p-1 pl-4 items-stretch h-full">
          {groupedDays.map(([diaLabel, activities], index) => (
            <DayCard
              key={diaLabel}
              dayLabel={diaLabel}
              activities={activities}
              index={index}
            />
          ))}

          {/* Espaciador final para scroll cómodo */}
          <div className="w-8 shrink-0" />
        </div>
        <ScrollBar
          orientation="horizontal"
          className="invisible group-hover/carousel:visible transition-opacity"
        />
      </ScrollArea>
    </div>
  );
}

// --- TARJETA DE DÍA PREMIUM ---
function DayCard({
  dayLabel,
  activities,
  index,
}: {
  dayLabel: string;
  activities: DiaDetalle[];
  index: number;
}) {
  const mainActivity = activities[0];
  const otherActivities = activities.slice(1);
  const hasMore = otherActivities.length > 2;
  const visibleOthers = otherActivities.slice(0, 2);
  const [imageError, setImageError] = useState(false);

  const imageUrl =
    !imageError && mainActivity.urlImagen
      ? mainActivity.urlImagen
      : getDefaultImageForCategory(mainActivity.categoria);

  return (
    <div className="relative w-[280px] shrink-0 h-[300px] rounded-2xl overflow-hidden group select-none transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl border border-border/40 bg-card">
      {/* --- FONDO: IMAGEN PRINCIPAL (FULL CARD) --- */}
      <div className="absolute inset-0 z-0">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={mainActivity.titulo}
            fill
            className="object-cover transition-transform duration-700"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted/80 flex items-center justify-center">
            <ImageOff className="h-10 w-10 text-muted-foreground/20" />
          </div>
        )}
        {/* Overlay degradado oscuro para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/10" />
      </div>

      {/* --- CONTENIDO SUPERIOR (HEADER) --- */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
        <Badge
          variant="outline"
          className="bg-black/30 backdrop-blur-md text-white border-white/20 text-xs font-bold px-3 py-1 shadow-sm"
        >
          {dayLabel}
        </Badge>
        <div className="bg-black/30 backdrop-blur-md h-6 w-6 rounded-full flex items-center justify-center border border-white/20 text-white/80">
          <span className="text-[10px] font-bold">{index + 1}</span>
        </div>
      </div>

      {/* --- CONTENIDO INFERIOR (DETALLES) --- */}
      <div className="absolute bottom-0 left-0 right-0 p-5 z-10 flex flex-col gap-4">
        {/* Actividad Principal (Hero Text) */}
        <div>
          <div className="flex items-center gap-2 mb-1.5 opacity-90">
            <span className="text-[9px] font-bold uppercase tracking-widest text-amber-400 line-clamp-1">
              {getCategoryName(mainActivity.categoria) || "Destacado"}
            </span>
            {mainActivity.calificacion > 0 && (
              <span className="flex items-center gap-0.5 text-[9px] font-bold text-white/80">
                <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                {mainActivity.calificacion.toFixed(1)}
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-white leading-tight line-clamp-2 drop-shadow-md group-hover:text-amber-50 transition-colors">
            {mainActivity.titulo}
          </h3>
        </div>

        {/* Lista de Actividades Secundarias (Timeline) */}
        {otherActivities.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-white/10">
            {visibleOthers.map((act) => (
              <div
                key={act.id}
                className="flex items-center gap-3 text-white/80 group/item"
              >
                {/* Dot de tiempo */}
                <div className="w-1.5 h-1.5 rounded-full bg-white/40 group-hover/item:bg-amber-400 transition-colors shadow-[0_0_8px_rgba(255,255,255,0.3)]" />

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate group-hover/item:text-white transition-colors">
                    {act.titulo}
                  </p>
                </div>
              </div>
            ))}

            {/* Footer "Ver más" */}
            {hasMore && (
              <div className="flex items-center gap-2 text-[10px] text-white/50 font-medium pl-4 pt-1">
                <PlusCircleIcon count={otherActivities.length - 2} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Icono custom para "+X más"
function PlusCircleIcon({ count }: { count: number }) {
  return (
    <span className="flex items-center gap-1 hover:text-white/80 transition-colors cursor-pointer">
      <MoreHorizontal className="h-3 w-3" />
      {count} lugares más
    </span>
  );
}
