"use client";

import React from "react";
import { format, differenceInCalendarDays } from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarDays,
  MapPin,
  Save,
  Wand2,
  Loader2,
  Settings,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { BuilderMeta } from "@/lib/itinerary-builder-store";

interface HeaderToolbarProps {
  meta: BuilderMeta;
  activityCount: number;
  onEditSettings: () => void;
  onOptimize: () => void;
  onSave: () => void;
  isSaving: boolean;
  isOptimizing: boolean;
  canOptimize: boolean;
}

export function HeaderToolbar({
  meta,
  activityCount,
  onEditSettings,
  onOptimize,
  onSave,
  isSaving,
  isOptimizing,
  canOptimize,
}: HeaderToolbarProps) {
  const totalDays = differenceInCalendarDays(meta.end, meta.start) + 1;

  return (
    <header className="z-30 flex flex-col gap-4 border-b bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:flex-row sm:items-center sm:justify-between shadow-sm">
      {/* Left: Info del Viaje */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <h1 className="truncate text-xl font-bold tracking-tight text-foreground">
            {meta.title}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={onEditSettings}
            title="Configuración del viaje"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1.5">
          <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-md">
            <CalendarDays className="h-3.5 w-3.5" />
            <span className="font-medium">
              {format(meta.start, "d MMM", { locale: es })} -{" "}
              {format(meta.end, "d MMM", { locale: es })}
            </span>
          </div>
          <Separator orientation="vertical" className="h-3" />
          <div className="flex items-center gap-1.5">
            <span className="font-medium">{totalDays} días</span>
          </div>
          <Separator orientation="vertical" className="h-3" />
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate max-w-[150px]">
              {meta.regions.join(", ")}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Acciones */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:block text-xs text-muted-foreground mr-2">
          <span className="font-bold text-foreground">{activityCount}</span>{" "}
          lugares añadidos
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onOptimize}
          disabled={isOptimizing || !canOptimize}
          className="h-9 border-dashed border-primary/30 text-primary hover:bg-primary/5 hover:text-primary hover:border-primary"
        >
          {isOptimizing ? (
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-3.5 w-3.5" />
          )}
          Optimizar Ruta
        </Button>

        <Button
          size="sm"
          onClick={onSave}
          disabled={isSaving}
          className="h-9 min-w-[120px] font-semibold shadow-md"
        >
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Guardar Viaje
        </Button>
      </div>
    </header>
  );
}
