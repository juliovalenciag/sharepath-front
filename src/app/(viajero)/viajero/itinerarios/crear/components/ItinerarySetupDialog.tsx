"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Importar useRouter
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

// Iconos
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

// --- 1. ESQUEMA DE VALIDACIÓN ---
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
    start: z.date(),
    end: z.date(),
  })
  .refine(
    (v) => {
      if (!v.start || !v.end) return false;
      if (isAfter(v.start, v.end)) return false;

      const days = differenceInCalendarDays(v.end, v.start) + 1;
      return days >= 1 && days <= 15; // Ajustado a 15 días para flexibilidad
    },
    {
      message: "Selecciona un rango válido (1 a 15 días).",
      path: ["end"],
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
  const router = useRouter(); // Hook de navegación
  const { meta, setMeta } = useItineraryBuilderStore();

  // Estados locales
  const [openRegionPopover, setOpenRegionPopover] = useState(false);
  const [showRegionAlert, setShowRegionAlert] = useState(false);
  const [pendingRegion, setPendingRegion] = useState<RegionKey | null>(null);
  const [ack3Plus, setAck3Plus] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: "",
      regions: [],
      // @ts-ignore: Inicialización intencional
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

  const watchedRegions = watch("regions") as RegionKey[];
  const watchedStart = watch("start");
  const watchedEnd = watch("end");
  const watchedNombre = watch("nombre");

  // --- EFECTOS ---

  // 1. Cargar datos si es edición
  useEffect(() => {
    if (open && meta) {
      form.reset({
        nombre: meta.title,
        regions: meta.regions,
        start: meta.start,
        end: meta.end,
      });
      setDateRange({ from: meta.start, to: meta.end });
      if (meta.regions.length >= 2) setAck3Plus(true);
    } else if (open && !meta) {
      form.reset({ nombre: "", regions: [], start: undefined, end: undefined });
      setDateRange(undefined);
      setAck3Plus(false);
    }
  }, [open, meta, form]);

  // 2. Sugerir nombre
  useEffect(() => {
    if (meta && meta.title === watchedNombre) return;
    if (watchedNombre?.trim().length > 0 && !watchedNombre.startsWith("Viaje a"))
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

    const sugerido = `Viaje a ${labelsStr}${rango ? ` (${rango})` : ""}`;
    setValue("nombre", sugerido, { shouldValidate: true });
  }, [watchedRegions, watchedStart, watchedEnd]);

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
    if (current.includes(val)) {
      actuallyToggleRegion(val);
      return;
    }

    if (!ack3Plus && current.length >= 2) {
      setPendingRegion(val);
      setShowRegionAlert(true);
      setOpenRegionPopover(false);
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

    let { from, to } = range;
    if (from && to) {
      const diff = differenceInCalendarDays(to, from) + 1;
      if (diff > 15) {
        to = addDays(from, 14);
        toast.info("Ajustado a 15 días máximo");
      } else if (diff < 1) {
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
    toast.success(meta ? "Configuración actualizada" : "¡A planear!");
  };

  // --- LÓGICA DE CIERRE / REDIRECCIÓN ---
  const handleOpenChange = (val: boolean) => {
    // Si se intenta cerrar (val === false) y NO existe meta (no se ha creado el itinerario)
    if (!val && !meta) {
      router.push("/viajero"); // Redirigir a la lista
      return;
    }
    onOpenChange(val);
  };

  return (
    <>
      <AlertDialog open={showRegionAlert} onOpenChange={setShowRegionAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Varios destinos
            </AlertDialogTitle>
            <AlertDialogDescription>
              Con 3 o más estados considera tiempos de traslado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingRegion(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setAck3Plus(true);
                setShowRegionAlert(false);
                if (pendingRegion) {
                  actuallyToggleRegion(pendingRegion);
                  setPendingRegion(null);
                }
              }}
            >
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0 dark:bg-zinc-950 dark:border-zinc-800">
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
            {/* NOMBRE */}
            <div className="space-y-2">
              <Label htmlFor="nombre" className="font-semibold text-sm dark:text-white">
                Nombre del viaje
              </Label>
              <Input
                id="nombre"
                placeholder="Ej. Mi primera visita en CDMX"
                maxLength={50}
                className="h-11 dark:text-gray-100"
                {...form.register("nombre")}
              />
              {errors.nombre && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.nombre.message}
                </p>
              )}
            </div>

            {/* DESTINOS */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-sm dark:text-white">Destinos</Label>
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
                        <span className="flex items-center gap-2 opacity-50">
                          <MapPin className="h-4 w-4" />
                          Selecciona estados...
                        </span>
                      ) : (
                        watchedRegions.map((val) => (
                          <span
                            key={val}
                            className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-inset ring-black/5 dark:ring-white/10"
                          >
                            {REGIONS_DATA[val]?.short || val}
                            <span
                              className="cursor-pointer ml-1 opacity-50 hover:opacity-100 p-0.5"
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
                                    "flex h-4 w-4 items-center justify-center rounded border",
                                    isSelected
                                      ? "bg-primary text-primary-foreground border-primary"
                                      : "border-primary/30 opacity-50"
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

            {/* FECHAS */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-sm dark:text-white">Fechas</Label>
                {dateRange?.from && dateRange?.to && (
                  <span className="text-[10px] text-muted-foreground">
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
                      !dateRange?.from && "text-muted-foreground"
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
                      <span>Selecciona un rango (máx. 15 días)</span>
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
                  <Info className="h-3 w-3 " />
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
