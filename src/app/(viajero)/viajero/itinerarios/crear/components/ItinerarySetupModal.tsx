// src/app/(viajero)/viajero/itinerarios/crear/components/ItinerarySetupModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  differenceInCalendarDays,
  format,
  isBefore,
  startOfToday,
} from "date-fns";
import { es } from "date-fns/locale";
import { DateRange } from "react-day-picker";

import {
  MapPin,
  Calendar as CalendarIcon,
  Users,
  Check,
  X,
  ArrowRight,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

import { useItineraryBuilderStore } from "@/lib/itinerary-builder-store";
import { REGION_OPTIONS, RegionKey } from "@/lib/constants/regions";

// --- ESQUEMA DE VALIDACIÓN CORREGIDO ---
const formSchema = z.object({
  title: z
    .string()
    .min(3, "El título es muy corto")
    .max(60, "Máximo 60 caracteres"),
  regions: z.array(z.string()).min(1, "Selecciona al menos un destino"),
  dateRange: z
    .object({
      // CORRECCIÓN: Quitamos { required_error: ... } ya que z.date() es requerido por defecto
      // y causaba conflicto de tipos.
      from: z.date(),
      to: z.date(),
    })
    .refine(
      (data) => {
        if (!data.from || !data.to) return false;
        const days = differenceInCalendarDays(data.to, data.from) + 1;
        return days >= 1 && days <= 7; // Regla de negocio: Máximo 7 días
      },
      { message: "El viaje debe durar entre 1 y 7 días." }
    ),
  visibility: z.enum(["private", "friends", "public"]),
  companions: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ItinerarySetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing?: boolean; // Para saber si mostramos botón de cancelar
}

export function ItinerarySetupModal({
  open,
  onOpenChange,
  isEditing = false,
}: ItinerarySetupModalProps) {
  const { meta, setMeta } = useItineraryBuilderStore();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [step, setStep] = useState(1);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      regions: [],
      visibility: "public",
      companions: [],
      dateRange: { from: undefined, to: undefined }, // Inicializamos undefined para forzar selección
    },
    mode: "onChange",
  });

  // Cargar datos si estamos editando
  useEffect(() => {
    if (open && meta) {
      form.reset({
        title: meta.title,
        regions: meta.regions,
        visibility: meta.visibility,
        companions: meta.companions,
        dateRange: { from: meta.start, to: meta.end },
      });
    }
  }, [open, meta, form]);

  // --- HANDLERS ---

  const onSubmit = (values: FormValues) => {
    setMeta({
      title: values.title,
      regions: values.regions as RegionKey[],
      start: values.dateRange.from,
      end: values.dateRange.to,
      visibility: values.visibility,
      companions: values.companions || [],
    });
    onOpenChange(false);
  };

  // Helper para selección de regiones
  const toggleRegion = (regionValue: string) => {
    const current = form.getValues("regions");
    if (current.includes(regionValue)) {
      form.setValue(
        "regions",
        current.filter((r) => r !== regionValue),
        { shouldValidate: true }
      );
    } else {
      if (current.length >= 3) return; // Límite visual de 3
      form.setValue("regions", [...current, regionValue], {
        shouldValidate: true,
      });
    }
  };

  // Helper para compañeros
  const [companionInput, setCompanionInput] = useState("");
  const addCompanion = () => {
    if (!companionInput.trim()) return;
    const current = form.getValues("companions") || [];
    if (!current.includes(companionInput.trim())) {
      form.setValue("companions", [...current, companionInput.trim()]);
    }
    setCompanionInput("");
  };

  // Evitar cerrar el modal si no es modo edición (Setup Inicial Obligatorio)
  const handleInteractOutside = (e: Event) => {
    if (!isEditing && !meta) {
      e.preventDefault();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        // Solo permitir cerrar si estamos editando o si ya existe meta
        if (!val && !isEditing && !meta) return;
        onOpenChange(val);
      }}
    >
      <DialogContent
        className="sm:max-w-[600px] overflow-hidden p-0 gap-0 border-none shadow-2xl"
        onInteractOutside={handleInteractOutside}
        onEscapeKeyDown={(e) => {
          if (!isEditing && !meta) e.preventDefault();
        }}
      >
        {/* Header Visual */}
        <div className="bg-gradient-to-r from-primary/90 to-primary/70 p-6 text-primary-foreground">
          <DialogTitle className="text-2xl font-bold">
            {meta ? "Ajustar Itinerario" : "¡Comencemos tu Aventura!"}
          </DialogTitle>
          <DialogDescription className="text-primary-foreground/80 mt-1">
            {meta
              ? "Modifica los detalles básicos de tu viaje."
              : "Define el destino y las fechas para preparar tu mapa."}
          </DialogDescription>
        </div>

        <div className="p-6 bg-background max-h-[75vh] overflow-y-auto">
          <form
            id="setup-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* 1. Título */}
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-sm font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Nombre del Viaje
              </Label>
              <Input
                {...form.register("title")}
                placeholder="Ej. Escapada de Fin de Semana a Querétaro"
                className="h-11 bg-muted/30"
              />
              {form.formState.errors.title && (
                <span className="text-xs text-destructive">
                  {form.formState.errors.title.message}
                </span>
              )}
            </div>

            {/* 2. Regiones y Fechas (Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Regiones */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Destinos (Máx 3)
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between h-11 bg-muted/30 font-normal"
                    >
                      <span className="truncate">
                        {form.watch("regions").length > 0
                          ? `${form.watch("regions").length} seleccionados`
                          : "Seleccionar estados..."}
                      </span>
                      <MapPin className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar estado..." />
                      <CommandList>
                        <CommandEmpty>No encontrado.</CommandEmpty>
                        <CommandGroup>
                          {REGION_OPTIONS.map((region) => {
                            const isSelected = form
                              .watch("regions")
                              .includes(region.value);
                            return (
                              <CommandItem
                                key={region.value}
                                onSelect={() => toggleRegion(region.value)}
                              >
                                <div
                                  className={cn(
                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                    isSelected
                                      ? "bg-primary text-primary-foreground"
                                      : "opacity-50 [&_svg]:invisible"
                                  )}
                                >
                                  <Check className="h-3 w-3" />
                                </div>
                                {region.label}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* Tags de regiones seleccionadas */}
                <div className="flex flex-wrap gap-1.5 min-h-[24px]">
                  {form.watch("regions").map((r) => (
                    <Badge
                      key={r}
                      variant="secondary"
                      className="text-[10px] h-6 gap-1 pl-2 pr-1"
                    >
                      {r}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => toggleRegion(r)}
                      />
                    </Badge>
                  ))}
                </div>
                {form.formState.errors.regions && (
                  <span className="text-xs text-destructive">
                    {form.formState.errors.regions.message}
                  </span>
                )}
              </div>

              {/* Fechas */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Fechas
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start h-11 bg-muted/30 text-left font-normal",
                        !form.watch("dateRange")?.from &&
                          "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.watch("dateRange")?.from ? (
                        form.watch("dateRange")?.to ? (
                          <>
                            {format(form.watch("dateRange").from, "d MMM", {
                              locale: es,
                            })}{" "}
                            -{" "}
                            {format(form.watch("dateRange").to, "d MMM", {
                              locale: es,
                            })}
                          </>
                        ) : (
                          format(form.watch("dateRange").from, "d MMM", {
                            locale: es,
                          })
                        )
                      ) : (
                        <span>Seleccionar días</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={form.watch("dateRange")?.from}
                      selected={form.watch("dateRange")}
                      onSelect={(range) =>
                        form.setValue("dateRange", range as any, {
                          shouldValidate: true,
                        })
                      }
                      numberOfMonths={1}
                      disabled={(date) => isBefore(date, startOfToday())}
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
                {form.formState.errors.dateRange && (
                  <span className="text-xs text-destructive">
                    {/* @ts-ignore - Zod custom error handling puede ser complejo de tipar estrictamente aquí */}
                    {form.formState.errors.dateRange.message ||
                      form.formState.errors.dateRange.root?.message}
                  </span>
                )}
              </div>
            </div>

            {/* 3. Extras (Compañeros y Privacidad) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Compañeros (Opcional)
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={companionInput}
                    onChange={(e) => setCompanionInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addCompanion())
                    }
                    placeholder="Nombre..."
                    className="h-9 bg-muted/30"
                  />
                  <Button
                    type="button"
                    onClick={addCompanion}
                    size="sm"
                    variant="secondary"
                    className="px-3"
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {form.watch("companions")?.map((c) => (
                    <Badge
                      key={c}
                      variant="outline"
                      className="text-[10px] h-5 gap-1"
                    >
                      {c}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => {
                          const current = form.getValues("companions") || [];
                          form.setValue(
                            "companions",
                            current.filter((item) => item !== c)
                          );
                        }}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Visibilidad
                </Label>
                <div className="flex gap-2">
                  {(["public", "friends", "private"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => form.setValue("visibility", v)}
                      className={cn(
                        "flex-1 py-2 text-xs font-medium rounded-md border transition-all",
                        form.watch("visibility") === v
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-input hover:bg-accent"
                      )}
                    >
                      {v === "public" && "Público"}
                      {v === "friends" && "Amigos"}
                      {v === "private" && "Privado"}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-1">
                  <Globe className="h-3 w-3" />
                  {form.watch("visibility") === "public" &&
                    "Cualquiera puede ver este viaje."}
                  {form.watch("visibility") === "friends" &&
                    "Solo tus amigos verán esto."}
                  {form.watch("visibility") === "private" &&
                    "Solo tú puedes ver esto."}
                </div>
              </div>
            </div>
          </form>
        </div>

        <DialogFooter className="p-6 bg-muted/20 border-t">
          {isEditing && (
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          )}
          <Button
            form="setup-form"
            type="submit"
            className="w-full sm:w-auto gap-2"
            disabled={!form.formState.isValid}
          >
            {meta ? "Guardar Cambios" : "Crear Itinerario"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
