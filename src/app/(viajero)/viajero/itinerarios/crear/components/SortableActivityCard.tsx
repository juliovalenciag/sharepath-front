"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  MapPin,
  MoreHorizontal,
  Trash2,
  Info,
} from "lucide-react";
import Image from "next/image";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  getCategoryStyle,
  getDefaultImageForCategory,
} from "@/lib/category-utils";
import type { BuilderActivity } from "@/lib/itinerary-builder-store";

interface SortableActivityCardProps {
  activity: BuilderActivity;
  index: number;
  // Ya no necesitamos onChange para tiempos
  onDelete: (id: string) => void;
  onViewDetails: (activityId: string) => void;
}

export function SortableActivityCard({
  activity,
  index,
  onDelete,
  onViewDetails,
}: SortableActivityCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.6 : 1,
  };

  const categoryStyle = getCategoryStyle(activity.lugar.category);
  const foto =
    activity.lugar.foto_url ||
    getDefaultImageForCategory(activity.lugar.category);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative flex gap-3 touch-none group"
    >
      {/* Indicador Numérico (Timeline) */}
      <div className="flex flex-col items-center pt-2">
        <div
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold shadow-sm z-10 transition-colors",
            "bg-primary text-primary-foreground"
          )}
        >
          {index + 1}
        </div>
        {/* Línea conectora */}
        <div className="flex-1 w-0.5 bg-border/50 my-1 group-last:hidden" />
      </div>

      {/* Tarjeta */}
      <Card className="flex-1 overflow-hidden border-muted-foreground/10 bg-card hover:border-primary/20 transition-all shadow-sm mb-2">
        <div className="flex">
          {/* Drag Handle */}
          <div
            className="flex w-8 flex-col items-center justify-center bg-muted/20 cursor-grab active:cursor-grabbing hover:bg-muted/40 transition-colors"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground/50" />
          </div>

          {/* Contenido */}
          <div className="flex flex-1 p-3 gap-3 min-w-0">
            {/* Imagen Thumbnail */}
            <div
              className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => onViewDetails(activity.id)}
            >
              {foto ? (
                <Image
                  src={foto}
                  alt={activity.lugar.nombre}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground/30">
                  <MapPin className="h-6 w-6" />
                </div>
              )}
            </div>

            {/* Textos */}
            <div className="flex flex-col justify-center flex-1 min-w-0 gap-1">
              <div className="flex justify-between items-start gap-2">
                <h4
                  className="font-semibold text-sm truncate cursor-pointer hover:text-primary transition-colors"
                  onClick={() => onViewDetails(activity.id)}
                >
                  {activity.lugar.nombre}
                </h4>

                {/* Menú de acciones */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 -mr-2 -mt-1 text-muted-foreground hover:text-foreground"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onViewDetails(activity.id)}
                    >
                      <Info className="mr-2 h-3.5 w-3.5" /> Ver detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => onDelete(activity.id)}
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" /> Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span
                  className={cn(
                    "font-medium px-1.5 py-0.5 rounded-full bg-opacity-10 truncate max-w-[120px]",
                    categoryStyle.bg,
                    categoryStyle.color
                  )}
                >
                  {categoryStyle.name}
                </span>
                {activity.lugar.google_score && (
                  <span className="text-amber-500 font-medium flex items-center gap-0.5">
                    ★ {activity.lugar.google_score.toFixed(1)}
                  </span>
                )}
              </div>

              {activity.descripcion && (
                <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                  {activity.descripcion}
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
