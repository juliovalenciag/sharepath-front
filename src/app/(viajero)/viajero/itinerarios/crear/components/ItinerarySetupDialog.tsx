"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  addDays,
  differenceInCalendarDays,
  format,
  isAfter,
  isBefore,
  startOfToday,
} from "date-fns";
import { es } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";

// Iconos (Lucide para consistencia con el proyecto)
import {
  MapPin,
  Calendar as CalendarIcon,
  Check,
  X,
  Info,
  AlertTriangle,
} from "lucide-react";

// UI Components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
import { cn } from "@/lib/utils";

// Lógica y Datos
import { REGIONS_DATA, RegionKey } from "@/lib/constants/regions";
import { useItineraryBuilderStore } from "@/lib/itinerary-builder-store";

// --- 1. ESQUEMA DE VALIDACIÓN (Idéntico a tu original + Ajustes TS) ---
const schema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(3, "El nombre debe tener al menos 3 caracteres válidos")
      .max(50, "El nombre es muy largo"),
    regions: z
      .array(z.string())
      .min(1, { message: "Selecciona al menos un destino" }),
    // Validamos que existan, la lógica de negocio va en el refine
    start: z.date(),
    end: z.date(),
  })
  .refine(
    (v) => {
      if (!v.start || !v.end) return false;
      if (isAfter(v.start, v.end)) return false;

      const days = differenceInCalendarDays(v.end, v.start) + 1;
      // Mantenemos tu validación original de 7 días (ajustable si deseas 15)
      return days >= 1 && days <= 7;
    },
    {
      message: "Selecciona un rango válido (1 a 7 días).",
      path: ["end"], // El error se asocia al campo final
    }
  );

type FormValues = z.infer<typeof schema>;

// --- 2. COMPONENTE PRINCIPAL ---

export function ItinerarySetupDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { meta, setMeta } = useItineraryBuilderStore();

  // Estados locales de UI
  const [openRegionPopover, setOpenRegionPopover] = useState(false);
  const [showRegionAlert, setShowRegionAlert] = useState(false);
  const [pendingRegion, setPendingRegion] = useState<RegionKey | null>(null);
  const [ack3Plus, setAck3Plus] = useState(false); // Aceptó la advertencia de 3+ estados

  // Estado para el calendario visual
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: "",
      regions: [],
      // @ts-ignore: Undefined inicial para obligar selección
      start: undefined,
      end: undefined,
    },
    mode: "onTouched",
  });

  const {
    watch,
    setValue,
    formState: { errors },
  } = form;

  // Observers
  const watchedRegions = watch("regions") as RegionKey[];
  const watchedStart = watch("start");
  const watchedEnd = watch("end");
  const watchedNombre = watch("nombre");

  // --- EFECTOS ---

  // 1. Cargar datos si estamos editando (meta existe)
  useEffect(() => {
    if (open && meta) {
      form.reset({
        nombre: meta.title,
        regions: meta.regions,
        start: meta.start,
        end: meta.end,
      });
      setDateRange({ from: meta.start, to: meta.end });
      // Si ya tenía más de 2 regiones, asumimos que ya aceptó la complejidad
      if (meta.regions.length >= 2) setAck3Plus(true);
    } else if (open && !meta) {
      form.reset({ nombre: "", regions: [], start: undefined, end: undefined });
      setDateRange(undefined);
      setAck3Plus(false);
    }
  }, [open, meta, form]);

  // 2. Sugerir nombre automáticamente (Tu lógica original)
  useEffect(() => {
    // Si el usuario ya escribió algo manualmente o estamos editando un título existente, no sobrescribir agresivamente
    if (meta && meta.title === watchedNombre) return;
    if (watchedNombre?.trim().length > 0 && !watchedNombre.startsWith("Trip"))
      return;

    if (!watchedRegions.length) return;

    const labels = watchedRegions.map((r) => REGIONS_DATA[r]?.short || r);
    const labelsStr =
      labels.slice(0, 3).join(", ") + (labels.length > 3 ? "..." : "");

    const rango =
      watchedStart && watchedEnd
        ? `${format(watchedStart, "d MMM", { locale: es })} – ${format(
            watchedEnd,
            "d MMM",
            { locale: es }
          )}`
        : "";

    const sugerido = `Trip ${labelsStr}${rango ? ` (${rango})` : ""}`;

    // Solo actualizamos si el campo está vacío o si ya tiene un nombre autogenerado
    setValue("nombre", sugerido, { shouldValidate: true });
  }, [watchedRegions, watchedStart, watchedEnd]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- HANDLERS ---

  function actuallyToggleRegion(val: RegionKey) {
    const current = form.getValues("regions") as RegionKey[];
    const isSelected = current.includes(val);

    const next = isSelected
      ? current.filter((v) => v !== val)
      : [...current, val];

    setValue("regions", next, { shouldValidate: true, shouldDirty: true });
  }

  function toggleRegion(val: RegionKey) {
    const current = form.getValues("regions") as RegionKey[];
    const isSelected = current.includes(val);

    if (isSelected) {
      actuallyToggleRegion(val);
      return;
    }

    // Lógica de alerta para 3+ estados
    if (!ack3Plus && current.length >= 2) {
      setPendingRegion(val);
      setShowRegionAlert(true);
      setOpenRegionPopover(false); // Cerramos el combo para mostrar la alerta
      return;
    }
    actuallyToggleRegion(val);
  }

  function handleDateRangeChange(range: DateRange | undefined) {
    if (!range?.from) {
      setDateRange(undefined);
      setValue("start", undefined as any);
      setValue("end", undefined as any);
      return;
    }

    let from = range.from;
    let to = range.to;

    // Tu lógica original de auto-corrección de rango
    if (from && to) {
      const diff = differenceInCalendarDays(to, from) + 1;
      if (diff > 7) {
        to = addDays(from, 6);
        toast.info("Ajustado a 7 días máximo", {
          description: "El rango seleccionado excedía el límite permitido.",
        });
      }
      if (diff < 1) {
        to = from;
      }
    }

    setDateRange({ from, to });
    if (from) setValue("start", from, { shouldValidate: true });
    if (to) setValue("end", to, { shouldValidate: true });
  }

  const onSubmit = (data: FormValues) => {
    if (data.start && isBefore(data.start, startOfToday())) {
      toast.warning("Nota: Estás planificando con fechas pasadas.");
    }

    setMeta({
      title: data.nombre,
      regions: data.regions as RegionKey[],
      start: data.start,
      end: data.end,
      companions: meta?.companions || [],
    });

    onOpenChange(false);
    toast.success(meta ? "Itinerario actualizado" : "¡Comencemos a planear!");
  };

  // Prevenir cierre si es obligatorio
  const handleOpenChange = (val: boolean) => {
    if (!meta && !val) return;
    onOpenChange(val);
  };

  return (
    <>
      {/* Alerta de 3+ estados (Fuera del Dialog principal para evitar z-index issues) */}
      <AlertDialog open={showRegionAlert} onOpenChange={setShowRegionAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Has elegido varios destinos
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">
                Con <b>3 o más estados</b> habrá que considerar <b>traslados</b>
                , tráfico y tiempos de llegada.
              </span>
              <span className="block">
                ¿Prefieres mantenerte en 1–2 o continuar igualmente?
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingRegion(null)}>
              Elegir menos
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-primary text-primary-foreground hover:opacity-90"
              onClick={() => {
                setAck3Plus(true);
                setShowRegionAlert(false);
                if (pendingRegion) {
                  actuallyToggleRegion(pendingRegion);
                  setPendingRegion(null);
                }
              }}
            >
              Continuar igualmente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* MODAL PRINCIPAL */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="sm:max-w-[500px] p-0 overflow-hidden gap-0"
          onPointerDownOutside={(e) => !meta && e.preventDefault()}
          onEscapeKeyDown={(e) => !meta && e.preventDefault()}
        >
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-xl font-extrabold tracking-tight dark:text-white">
              {meta ? "Editar Configuración" : "Crea tu Itinerario"}
            </DialogTitle>
            <DialogDescription>
              Elige destino y fechas para configurar el mapa.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 px-6 py-4"
          >
            {/* 1. NOMBRE */}
            <div className="space-y-2">
              <Label
                htmlFor="nombre"
                className="font-semibold text-sm dark:text-white"
              >
                Nombre del viaje
              </Label>
              <Input
                id="nombre"
                placeholder="p. ej. Mi primera visita en CDMX"
                maxLength={50}
                className="h-11 bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                {...form.register("nombre")}
              />
              {errors.nombre && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.nombre.message}
                </p>
              )}
            </div>

            {/* 2. REGIONES (Multi-select) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-sm dark:text-white">
                  Destinos
                </Label>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  {watchedRegions.length} Seleccionados
                </span>
              </div>

              <Popover
                open={openRegionPopover}
                onOpenChange={setOpenRegionPopover}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between text-left h-auto min-h-[44px] py-2 px-3",
                      !watchedRegions.length && "text-muted-foreground"
                    )}
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {watchedRegions.length === 0 ? (
                        <span className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 opacity-50" />
                          Selecciona estados...
                        </span>
                      ) : (
                        watchedRegions.map((val) => (
                          <span
                            key={val}
                            className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-inset ring-black/5 dark:ring-white/10"
                          >
                            {REGIONS_DATA[val]?.short || val}
                            <span
                              className="cursor-pointer ml-1 opacity-50 hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                actuallyToggleRegion(val);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </span>
                          </span>
                        ))
                      )}
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[400px]" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar estado..." />
                    <CommandList>
                      <CommandEmpty>No encontrado.</CommandEmpty>
                      <CommandGroup heading="Estados Disponibles">
                        {Object.keys(REGIONS_DATA).map((key) => {
                          const rKey = key as RegionKey;
                          const isSelected = watchedRegions.includes(rKey);
                          return (
                            <CommandItem
                              key={rKey}
                              value={REGIONS_DATA[rKey].label}
                              onSelect={() => toggleRegion(rKey)}
                              className="flex items-center justify-between cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={cn(
                                    "flex h-4 w-4 items-center justify-center rounded border border-primary/50",
                                    isSelected
                                      ? "bg-primary text-primary-foreground border-primary"
                                      : "opacity-50"
                                  )}
                                >
                                  {isSelected && <Check className="h-3 w-3" />}
                                </div>
                                <span>{REGIONS_DATA[rKey].label}</span>
                              </div>
                              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                {REGIONS_DATA[rKey].short}
                              </span>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {errors.regions && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.regions.message}
                </p>
              )}
            </div>

            {/* 3. FECHAS */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-sm dark:text-white">
                  Fechas
                </Label>
                {dateRange?.from && dateRange?.to && (
                  <span className="text-[10px] text-muted-foreground dark:text-white">
                    {differenceInCalendarDays(dateRange.to, dateRange.from) + 1}{" "}
                    días
                  </span>
                )}
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal h-11 dark:text-white",
                      !dateRange?.from &&
                        "text-muted-foreground dark:text-white"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-70 dark:text-white" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "d MMM yyyy", { locale: es })}{" "}
                          - {format(dateRange.to, "d MMM yyyy", { locale: es })}
                        </>
                      ) : (
                        format(dateRange.from, "d MMM yyyy", { locale: es })
                      )
                    ) : (
                      <span className="dark:text-white">
                        Selecciona un rango (máx. 7 días)
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={handleDateRangeChange}
                    numberOfMonths={1}
                    disabled={(date) => date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {(errors.start || errors.end) && (
                <div className="flex items-center gap-1.5 text-xs text-red-500 font-medium mt-1">
                  <Info className="h-3 w-3" />
                  {errors.end?.message || "Selecciona un rango válido."}
                </div>
              )}
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="submit"
                className="w-full h-12 text-base rounded-xl font-bold shadow-sm"
              >
                {meta ? "Guardar Cambios" : "Comenzar Planificación"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
