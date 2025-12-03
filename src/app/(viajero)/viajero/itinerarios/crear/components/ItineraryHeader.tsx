// src/app/(viajero)/viajero/itinerarios/crear/components/ItineraryHeader.tsx
"use client";

import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarDays,
  MapPin,
  Save,
  Wand2,
  Trash2,
  Pencil,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { REGIONS_DATA, RegionKey } from "@/lib/constants/regions";
import { BuilderMeta } from "@/lib/itinerary-builder-store";

interface ItineraryHeaderProps {
  meta: BuilderMeta;
  onEditSetup: () => void;
  onReset: () => void;
  onOptimize: () => void;
  onSave: () => void;
  isSaving: boolean;
  canOptimize: boolean;
}

export function ItineraryHeader({
  meta,
  onEditSetup,
  onReset,
  onOptimize,
  onSave,
  isSaving,
  canOptimize,
}: ItineraryHeaderProps) {
  // Lógica para mostrar múltiples estados
  const regionsDisplay = React.useMemo(() => {
    if (!meta.regions || meta.regions.length === 0) return "Sin destino";

    // Mostramos hasta 3 nombres cortos, luego "..."
    const names = meta.regions.map(
      (r) => REGIONS_DATA[r as RegionKey]?.short || r
    );

    if (names.length <= 3) {
      return names.join(", ");
    } else {
      return `${names.slice(0, 3).join(", ")} (+${names.length - 3})`;
    }
  }, [meta.regions]);

  return (
    <header className="z-20 flex flex-col gap-3 border-b bg-background/80 px-4 py-3 backdrop-blur-md sticky top-0 sm:flex-row sm:items-center sm:justify-between transition-all duration-300">
      {/* INFO DEL VIAJE */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h1
            className="truncate text-lg font-bold tracking-tight text-foreground max-w-[250px] sm:max-w-md"
            title={meta.title}
          >
            {meta.title}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={onEditSetup}
            title="Editar configuración"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
          <span
            className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-md max-w-full truncate"
            title={meta.regions.join(", ")} // Tooltip nativo con todos los nombres
          >
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{regionsDisplay}</span>
          </span>
          <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-md shrink-0">
            <CalendarDays className="h-3 w-3" />
            {format(meta.start, "d MMM", { locale: es })} —{" "}
            {format(meta.end, "d MMM", { locale: es })}
          </span>
        </div>
      </div>

      {/* ACCIONES */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-red-500 hover:text-red-600 hover:bg-red-500/10 h-9"
          title="Borrar todo"
        >
          <Trash2 className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Reset</span>
        </Button>

        <div className="h-4 w-px bg-border mx-1 hidden sm:block" />

        <Button
          variant="secondary"
          size="sm"
          onClick={onOptimize}
          disabled={!canOptimize}
          className="h-9 hidden sm:flex"
          title="Reordenar ruta por distancia"
        >
          <Wand2 className="mr-2 h-3.5 w-3.5 text-primary" />
          Optimizar
        </Button>

        <Button
          size="sm"
          onClick={onSave}
          disabled={isSaving}
          className="h-9 min-w-[110px] shadow-sm active:scale-95 transition-transform"
        >
          {isSaving ? (
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="mr-2 h-3.5 w-3.5" />
          )}
          {isSaving ? "Guardando" : "Guardar"}
        </Button>
      </div>
    </header>
  );
}
