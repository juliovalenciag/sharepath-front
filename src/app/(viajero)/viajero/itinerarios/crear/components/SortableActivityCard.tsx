"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  MapPin,
  MoreVertical,
  Trash2,
  Info,
  Star
} from "lucide-react";
import Image from "next/image";

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

  // Estilos para la animación del Drag
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.9 : 1,
    scale: isDragging ? 1.02 : 1,
  };

  const categoryStyle = getCategoryStyle(activity.lugar.category);
  const CategoryIcon = categoryStyle.icon;
  const foto =
    activity.lugar.foto_url ||
    getDefaultImageForCategory(activity.lugar.category);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative flex gap-4 group touch-none mb-1",
        isDragging && "cursor-grabbing"
      )}
    >
      {/* --- LÍNEA DE TIEMPO (Izquierda) --- */}
      <div className="flex flex-col items-center relative">
        {/* Línea conectora (Invisible en el último ítem) */}
        <div className="absolute top-8 bottom-[-16px] w-[2px] bg-border/50 group-last:hidden" />
        
        {/* Badge Numérico */}
        <div
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-sm z-10 transition-colors mt-1",
            "bg-primary text-primary-foreground border-2 border-background ring-2 ring-muted"
          )}
        >
          {index + 1}
        </div>
      </div>

      {/* --- TARJETA PRINCIPAL --- */}
      <div 
        className={cn(
            "flex-1 flex bg-card border border-border/60 rounded-xl shadow-sm overflow-hidden transition-all duration-200",
            "hover:shadow-md hover:border-primary/20",
            isDragging ? "shadow-xl ring-2 ring-primary/20" : ""
        )}
      >
        
        {/* DRAG HANDLE (Integrado sutilmente) */}
        <div
          className="w-6 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-muted/50 transition-colors border-r border-transparent hover:border-border/40"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
        </div>

        {/* CONTENIDO CLICKABLE */}
        <div className="flex flex-1 p-3 gap-3 min-w-0 items-center">
            
            {/* IMAGEN THUMBNAIL */}
            <div
              className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted border border-border/50 cursor-pointer hover:opacity-90 transition-opacity"
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

            {/* INFO TEXTUAL */}
            <div className="flex flex-col justify-center flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                    <h4
                        className="font-semibold text-sm text-foreground truncate cursor-pointer hover:text-primary transition-colors leading-tight"
                        onClick={() => onViewDetails(activity.id)}
                    >
                        {activity.lugar.nombre}
                    </h4>
                </div>

                {/* Categoría y Rating */}
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span
                        className={cn(
                            "flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide truncate max-w-[140px]",
                            categoryStyle.bg,
                            categoryStyle.color
                        )}
                    >
                        {CategoryIcon && <CategoryIcon className="h-3 w-3" />}
                        {categoryStyle.name}
                    </span>
                    
                    {activity.lugar.google_score && (
                        <span className="flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-md">
                            <Star className="h-3 w-3 text-amber-400 fill-amber-400" /> 
                            {activity.lugar.google_score.toFixed(1)}
                        </span>
                    )}
                </div>

                {/* Descripción (Si existe) */}
                {activity.descripcion && (
                    <p className="text-[11px] text-muted-foreground  mt-1.5 italic">
                        "{activity.descripcion}"
                    </p>
                )}
            </div>

            {/* MENÚ DE ACCIONES */}
            <div className="self-start -mt-1 -mr-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                      onClick={() => onViewDetails(activity.id)}
                      className="cursor-pointer"
                    >
                      <Info className="mr-2 h-4 w-4" /> Detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                      onClick={() => onDelete(activity.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
      </div>
    </div>
  );
}