// src/app/(viajero)/viajero/itinerarios/crear/components/EditDatesDialog.tsx
"use client";

import React, { useEffect, useState } from "react";
import { format, differenceInDays, addDays } from "date-fns";
import { es } from "date-fns/locale";

import {
  CalendarDays,
  ArrowRight,
  Check,
  Calendar as CalendarIcon,
  Moon,
  Sun,
  Info,
  AlertTriangle,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { BuilderMeta } from "@/lib/itinerary-builder-store";

type DateRange = {
  from?: Date;
  to?: Date;
};

type EditDatesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meta: BuilderMeta;
  onSaveRange: (start: Date, end: Date) => void;
};

// Constantes de configuración
const MAX_DAYS = 7;
const MIN_DAYS = 1;

export function EditDatesDialog({
  open,
  onOpenChange,
  meta,
  onSaveRange,
}: EditDatesDialogProps) {
  const [range, setRange] = useState<DateRange>({
    from: meta.start,
    to: meta.end,
  });

  // Control responsivo del calendario
  const [numMonths, setNumMonths] = useState(1);

  useEffect(() => {
    setRange({ from: meta.start, to: meta.end });
  }, [meta.start, meta.end, open]);

  useEffect(() => {
    const handleResize = () => {
      // Si es tablet o desktop (md: 768px), mostramos 2 meses, si no 1.
      setNumMonths(window.innerWidth >= 860 ? 2 : 1);
    };
    
    // Ejecutar al inicio y al cambiar tamaño
    if (open) {
      handleResize();
      window.addEventListener("resize", handleResize);
    }
    return () => window.removeEventListener("resize", handleResize);
  }, [open]);

  // --- VALIDACIONES ---
  const totalDays =
    range.from && range.to
      ? differenceInDays(range.to, range.from) + 1
      : 0;
  
  const nights = totalDays > 0 ? totalDays - 1 : 0;

  // Reglas de validación
  const exceedsMax = totalDays > MAX_DAYS;
  const isTooShort = totalDays < MIN_DAYS && range.from && range.to; // Raro, pero por seguridad
  const isValid = range.from && range.to && !exceedsMax && !isTooShort;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          w-auto max-w-[95vw] md:max-w-fit
          p-0 overflow-hidden 
          rounded-xl border-border/50
          shadow-2xl
          flex flex-col
          max-h-[90vh]
        "
      >
        {/* HEADER */}
        <DialogHeader className="shrink-0 px-6 py-5 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
               <CalendarDays className="h-5 w-5" />
            </div>
            <span>Configurar Fechas</span>
          </DialogTitle>
          <DialogDescription className="text-sm max-w-md">
            Selecciona el rango de tu viaje. El máximo permitido es de <span className="font-medium text-foreground">{MAX_DAYS} días</span>.
          </DialogDescription>
        </DialogHeader>

        {/* CONTENIDO PRINCIPAL (Scrollable si es necesario) */}
        <div className="flex flex-col md:flex-row overflow-y-auto">
          
          {/* --- ZONA CALENDARIO (Izquierda) --- */}
          <div className="flex-1 p-6 flex justify-center bg-background">
            <div className="p-1">
                <Calendar
                  mode="range"
                  numberOfMonths={numMonths}
                  selected={range}
                  onSelect={(value) => {
                    // Prevenir selección si el rango es inválido inmediatamente? 
                    // Mejor dejamos seleccionar y mostramos error para mejor UX.
                    setRange({
                      from: value?.from,
                      to: value?.to,
                    });
                  }}
                  locale={es}
                  defaultMonth={range.from}
                  className="p-0 border rounded-lg shadow-sm bg-card"
                  classNames={{
                     day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                     day_today: "bg-accent text-accent-foreground font-bold",
                     day_outside: "text-muted-foreground opacity-50",
                  }}
                  // Deshabilitar fechas pasadas (opcional, según tu lógica de negocio)
                  // disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} 
                />
            </div>
          </div>

          {/* --- ZONA RESUMEN Y VALIDACIÓN (Derecha) --- */}
          <div className="
            w-full md:w-[340px] 
            border-t md:border-t-0 md:border-l border-border/60
            bg-muted/30 dark:bg-card/20
            flex flex-col
          ">
            <div className="p-6 flex-1 space-y-6">
                
                {/* Resumen de Fechas */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <CalendarIcon className="h-3.5 w-3.5" /> 
                        Selección
                    </h4>
                    
                    <div className="flex flex-col gap-3">
                        {/* Fecha Inicio */}
                        <div className={cn(
                            "flex flex-col p-3 rounded-lg border transition-all",
                            range.from ? "bg-background border-primary/20 shadow-sm" : "bg-muted/50 border-dashed"
                        )}>
                            <span className="text-[10px] text-muted-foreground font-medium uppercase mb-1">Inicio</span>
                            {range.from ? (
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-foreground">
                                        {format(range.from, "d")}
                                    </span>
                                    <div className="flex flex-col leading-tight">
                                        <span className="text-xs font-semibold uppercase">{format(range.from, "MMM", { locale: es })}</span>
                                        <span className="text-[10px] text-muted-foreground">{format(range.from, "yyyy")}</span>
                                    </div>
                                </div>
                            ) : (
                                <span className="text-sm text-muted-foreground italic">-- / --</span>
                            )}
                        </div>

                        {/* Flecha conectora */}
                        {range.from && range.to && (
                            <div className="flex justify-center -my-3 z-10 relative">
                                <div className="bg-background border rounded-full p-1 shadow-sm">
                                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                </div>
                            </div>
                        )}

                        {/* Fecha Fin */}
                        <div className={cn(
                            "flex flex-col p-3 rounded-lg border transition-all",
                            range.to ? "bg-background border-primary/20 shadow-sm" : "bg-muted/50 border-dashed"
                        )}>
                            <span className="text-[10px] text-muted-foreground font-medium uppercase mb-1">Fin</span>
                            {range.to ? (
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-foreground">
                                        {format(range.to, "d")}
                                    </span>
                                    <div className="flex flex-col leading-tight">
                                        <span className="text-xs font-semibold uppercase">{format(range.to, "MMM", { locale: es })}</span>
                                        <span className="text-[10px] text-muted-foreground">{format(range.to, "yyyy")}</span>
                                    </div>
                                </div>
                            ) : (
                                <span className="text-sm text-muted-foreground italic">-- / --</span>
                            )}
                        </div>
                    </div>
                </div>

                <Separator className="bg-border/60" />

                {/* Resumen Duración y Alertas */}
                <div className="space-y-3">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Duración</h4>
                    
                    {range.from && range.to ? (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <div className={cn(
                                    "border rounded-lg p-3 text-center transition-colors",
                                    exceedsMax 
                                        ? "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400" 
                                        : "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400"
                                )}>
                                    <Sun className="h-4 w-4 mx-auto mb-1 opacity-80" />
                                    <div className="text-lg font-bold">{totalDays}</div>
                                    <div className="text-[10px] opacity-80">Días</div>
                                </div>
                                <div className={cn(
                                    "border rounded-lg p-3 text-center transition-colors",
                                    exceedsMax 
                                        ? "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400" 
                                        : "bg-indigo-500/10 border-indigo-500/20 text-indigo-700 dark:text-indigo-400"
                                )}>
                                    <Moon className="h-4 w-4 mx-auto mb-1 opacity-80" />
                                    <div className="text-lg font-bold">{nights}</div>
                                    <div className="text-[10px] opacity-80">Noches</div>
                                </div>
                            </div>

                            {/* ALERTA DE ERROR */}
                            {exceedsMax && (
                                <Alert variant="destructive" className="mt-2 py-2 px-3 border-red-500/50 bg-red-500/5 text-red-600 dark:text-red-400">
                                    <XCircle className="h-4 w-4" />
                                    <div className="ml-2">
                                        <AlertTitle className="text-xs font-bold">Límite excedido</AlertTitle>
                                        <AlertDescription className="text-[11px] leading-tight opacity-90">
                                            El viaje no puede durar más de {MAX_DAYS} días. Por favor ajusta las fechas.
                                        </AlertDescription>
                                    </div>
                                </Alert>
                            )}
                        </>
                    ) : (
                        <div className="text-sm text-muted-foreground italic text-center py-2 bg-muted/30 rounded-md">
                            Selecciona inicio y fin
                        </div>
                    )}
                </div>
            </div>

            {/* Footer interno del panel derecho */}
            <div className="p-4 bg-background border-t border-border/60 mt-auto">
                 {/* Nota Informativa */}
                {!exceedsMax && (
                    <div className="mb-4 rounded-md bg-muted p-2.5 flex gap-2 items-start">
                        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                            Si cambias las fechas, el itinerario se recalculará automáticamente.
                        </p>
                    </div>
                )}

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="flex-1"
                    >
                        Cancelar
                    </Button>
                    <Button
                        disabled={!isValid}
                        onClick={() => {
                            if (range.from && range.to) {
                                onSaveRange(range.from, range.to);
                            }
                        }}
                        className={cn(
                            "flex-1 shadow-lg",
                            isValid ? "shadow-primary/20" : ""
                        )}
                        variant={exceedsMax ? "destructive" : "default"}
                    >
                        {exceedsMax ? "Ajustar fechas" : "Confirmar"}
                    </Button>
                </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}