"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import {
  MapPin,
  Star,
  X,
  AlignLeft,
  Map as MapIcon,
  Navigation,
  ExternalLink,
} from "lucide-react";

import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Imports de utilidades
import {
  getCategoryStyle,
  getDefaultImageForCategory,
} from "@/lib/category-utils";
import type { BuilderActivity } from "@/lib/itinerary-builder-store";

interface PlaceInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  activityId: string | null;
  allActivities: BuilderActivity[];
  onUpdate: (id: string, patch: Partial<BuilderActivity>) => void;
}

export function PlaceInfoDialog({
  isOpen,
  onClose,
  activityId,
  allActivities,
  onUpdate,
}: PlaceInfoDialogProps) {
  // 1. Encontrar la actividad activa en tiempo real
  const activity = useMemo(
    () => allActivities.find((a) => a.id === activityId),
    [allActivities, activityId]
  );

  if (!activity) return null;

  const { lugar } = activity;

  // 2. Obtener estilos según categoría
  const categoryStyle = getCategoryStyle(lugar.category);
  const CategoryIcon = categoryStyle.icon;

  // 3. Imagen (Prioridad: Foto real -> Default Categoría)
  const imageUrl = lugar.foto_url || getDefaultImageForCategory(lugar.category);

  // Helper para abrir en Google Maps
  const handleOpenMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lugar.latitud},${lugar.longitud}`;
    window.open(url, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl bg-background flex flex-col max-h-[90vh]">
        {/* === HERO SECTION (Imagen de fondo) === */}
        <div className="relative h-64 w-full shrink-0 bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={lugar.nombre}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 800px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-800">
              <MapPin className="h-16 w-16 text-muted-foreground/20" />
            </div>
          )}

          {/* Gradiente para legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Botón Cerrar Flotante */}
          <DialogClose className="absolute top-4 right-4 rounded-full bg-black/20 p-2 text-white hover:bg-white hover:text-black transition-all backdrop-blur-md z-10">
            <X className="h-5 w-5" />
            <span className="sr-only">Cerrar</span>
          </DialogClose>

          {/* Info superpuesta */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Badge
                className={cn(
                  "border-0 backdrop-blur-md px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold shadow-sm",
                  categoryStyle.bg,
                  categoryStyle.color
                )}
              >
                <CategoryIcon className="h-3 w-3 mr-1.5" />
                {categoryStyle.name}
              </Badge>

              {lugar.google_score && (
                <div className="flex items-center gap-1 text-amber-400 font-bold text-xs bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                  <Star className="h-3 w-3 fill-current" />
                  {lugar.google_score.toFixed(1)}
                  <span className="text-white/60 font-normal ml-0.5">
                    ({lugar.total_reviews || 0})
                  </span>
                </div>
              )}
            </div>

            <h2 className="text-3xl font-extrabold leading-tight text-balance shadow-black drop-shadow-md">
              {lugar.nombre}
            </h2>

            {lugar.mexican_state && (
              <p className="text-sm font-medium text-white/80 flex items-center gap-1.5 mt-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {lugar.mexican_state}, México
              </p>
            )}
          </div>
        </div>

        {/* === BODY SCROLLABLE === */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-8">
            {/* 1. NOTAS PERSONALES (Editable) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="notes"
                  className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2"
                >
                  <AlignLeft className="h-4 w-4" /> Tus Notas del Lugar
                </Label>
                <span className="text-[10px] text-muted-foreground italic">
                  Lo que escribas aquí se guardará
                </span>
              </div>

              <Textarea
                id="notes"
                placeholder="Escribe aquí tus planes: 'Llegar temprano para fotos', 'Comprar tickets en taquilla', etc."
                className="resize-none min-h-[100px] bg-muted/30 focus:bg-background transition-colors border-muted-foreground/20"
                value={activity.descripcion || ""}
                onChange={(e) =>
                  onUpdate(activity.id, { descripcion: e.target.value })
                }
              />
            </div>

            <Separator />

            {/* 2. INFORMACIÓN DEL LUGAR (Read Only) */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Descripción original (si existe) */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2 text-sm text-foreground">
                  <MapIcon className="h-4 w-4 text-primary" />
                  Acerca del lugar
                </h4>
                {lugar.descripcion ? (
                  <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                    {lugar.descripcion}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No hay descripción detallada disponible para este lugar.
                  </p>
                )}
              </div>

              {/* Datos técnicos */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2 text-sm text-foreground">
                  <Navigation className="h-4 w-4 text-primary" />
                  Ubicación
                </h4>

                <div className="bg-muted/30 rounded-xl p-4 border border-border/50 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Latitud</span>
                    <span className="font-mono text-xs">
                      {lugar.latitud.toFixed(6)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Longitud</span>
                    <span className="font-mono text-xs">
                      {lugar.longitud.toFixed(6)}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 gap-2 text-xs h-8"
                    onClick={handleOpenMaps}
                  >
                    <ExternalLink className="h-3 w-3" /> Ver en Google Maps
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer simple (opcional, ya que se guarda al escribir) */}
        <div className="p-4 bg-muted/20 border-t flex justify-end">
          <Button
            onClick={onClose}
            size="sm"
            className="px-6 rounded-full font-semibold"
          >
            Listo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
