"use client";

import Image from "next/image";
import { MapPin, Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getCategoryStyle,
  getDefaultImageForCategory,
} from "@/lib/category-utils";

interface ActivityReadCardProps {
  activity: any;
  index: number;
}

export function ActivityReadCard({ activity, index }: ActivityReadCardProps) {
  const categoryStyle = getCategoryStyle(activity.categoria);
  const CategoryIcon = categoryStyle.icon;
  const imageUrl =
    activity.imageUrl || getDefaultImageForCategory(activity.categoria);

  return (
    <div className="group relative flex gap-4 pb-6 last:pb-0">
      {/* --- LÍNEA DE TIEMPO (Izquierda) --- */}
      <div className="flex flex-col items-center pt-1">
        {/* Badge Numérico con efecto al hover */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background border-2 border-primary text-primary text-xs font-bold shadow-sm z-10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md">
          {index + 1}
        </div>
        {/* Línea conectora sólida y elegante */}
        <div className="w-0.5 h-full bg-border/60 -mt-2 mb-2 group-last:hidden group-hover:bg-primary/30 transition-colors" />
      </div>

      {/* --- TARJETA DE CONTENIDO --- */}
      <div className="flex-1 flex flex-col sm:flex-row gap-4 p-4 rounded-xl border bg-card/60 hover:bg-card shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-default">
        {/* Imagen Thumbnail Responsiva */}
        <div className="relative w-full h-40 sm:w-32 sm:h-32 shrink-0 overflow-hidden rounded-lg bg-muted border border-border/50 shadow-inner">
          <Image
            src={imageUrl}
            alt={activity.titulo}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 128px"
          />
          {/* Overlay sutil al hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        </div>

        {/* Información Detallada */}
        <div className="flex flex-col justify-center flex-1 min-w-0 gap-2">
          {/* Header: Título y Rating */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-start gap-2">
            <h4 className="font-bold text-base sm:text-lg text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {activity.titulo}
            </h4>

            {/* Rating (si existe) */}
            {activity.calificacion > 0 && (
              <div className="flex items-center gap-1 self-start bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-md border border-amber-100 dark:border-amber-900/30 shrink-0">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                  {Number(activity.calificacion).toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Metadatos: Categoría y Ubicación */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border transition-colors",
                categoryStyle.bg,
                categoryStyle.color,
                "border-transparent bg-opacity-80"
              )}
            >
              {CategoryIcon && <CategoryIcon className="h-3 w-3" />}
              {categoryStyle.name}
            </span>

            {activity.estado && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full border border-border/50 truncate max-w-[150px]">
                <MapPin className="h-3 w-3" />
                {activity.estado}
              </span>
            )}
          </div>

          {/* Descripción / Notas */}
          {activity.descripcion ? (
            <div className="mt-1 flex gap-2 items-start text-muted-foreground/80 group/desc">
              <Quote className="h-3 w-3 shrink-0 mt-0.5 opacity-40 scale-x-[-1]" />
              <p className="text-sm leading-relaxed line-clamp-2 group-hover:text-foreground transition-colors">
                {activity.descripcion}
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/40 italic mt-1 pl-1">
              Sin notas adicionales.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
