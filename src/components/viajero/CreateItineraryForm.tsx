"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import {
  IconMapPinFilled,
  IconCalendar,
  IconUsersGroup,
  IconCheck,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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
import { Card } from "@/components/ui/card";

import DateRangePicker from "@/components/ui/date-range-picker";

/* ----------------------------- Datos y esquema ----------------------------- */

const REGIONS = [
  { value: "cdmx", label: "Ciudad de México", hint: "CDMX" },
  { value: "edomex", label: "Estado de México", hint: "Edo. Méx." },
  { value: "hgo", label: "Hidalgo", hint: "HGO" },
  { value: "mor", label: "Morelos", hint: "MOR" },
  { value: "qro", label: "Querétaro", hint: "QRO" },
] as const;
type RegionValue = (typeof REGIONS)[number]["value"];
const regionValues: [RegionValue, ...RegionValue[]] = [
  REGIONS[0].value,
  ...REGIONS.slice(1).map((r) => r.value),
];
const schema = z.object({
  nombre: z
    .string()
    .min(3, "El nombre es muy corto")
    .max(50, "El nombre es muy largo"),
  regions: z
    .array(z.enum(regionValues), {
      errorMap: () => ({
        message: "Selecciona al menos un destino válido",
      }),
    })
    .min(1, "Selecciona al menos un destino"),

  start: z.date().optional(),
  end: z.date().optional(),
  visibility: z.enum(["private", "friends", "public"]).default("friends"),
  companions: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

/* --------------------------------- Componente -------------------------------- */

export default function CreateItineraryForm() {
  const router = useRouter();
  const [openRegion, setOpenRegion] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      regions: [],
      start: undefined,
      end: undefined,
      visibility: "friends",
      companions: "",
    } as any,
  });

  const regions = watch("regions");
  const start = watch("start");
  const end = watch("end");
  const visibility = watch("visibility");

  function onSubmit(values: FormValues) {
    const params = new URLSearchParams();
    params.set("nombre", values.nombre);
    params.set("regions", values.regions.join(","));
    if (values.start) params.set("start", values.start.toISOString());
    if (values.end) params.set("end", values.end.toISOString());
    params.set("visibility", values.visibility);

    const companions = values.companions
      ?.split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (companions?.length) params.set("companions", companions.join(","));

    router.push(`/viajero/itinerarios/crear?${params.toString()}`);
  }

  return (
    <Card className="mx-auto max-w-3xl border-border/60 bg-card/70 backdrop-blur-sm shadow-sm p-5 md:p-4 h-full">
      {/* Encabezado con acento */}
      <div className="mb-2 text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          Crea un nuevo itinerario
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Elige destino, fechas y privacidad. Luego ajustamos el itinerario.
        </p>
        <div className="mt-3 h-1 w-24 mx-auto rounded-full bg-blue-600/90 dark:bg-palette-blue" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Nombre del itinerario */}
        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="nombre">
            ¿Cómo se llamará tu itinerario?
          </label>
          <Input
            id="nombre"
            type="text"
            placeholder="p. ej. Mi primera visita en CDMX"
            maxLength={50}
            className="h-12 w-full justify-between text-left rounded-lg"
            {...register("nombre")}
          />
        </div>
        {/* ¿A dónde? */}
        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="lugar">
            ¿A dónde?
          </label>

          <Popover open={openRegion} onOpenChange={setOpenRegion}>
            <PopoverTrigger asChild>
              <Button
                id="lugar"
                type="button"
                variant="outline"
                role="combobox"
                className={cn(
                  "h-12 w-full justify-between text-left rounded-lg",
                  !regions.length && "text-muted-foreground"
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <IconMapPinFilled className="size-4 opacity-70" />
                  {regions.length === 0
                    ? "p. ej. CDMX, EdoMex..."
                    : regions.length === 1
                    ? REGIONS.find((r) => r.value === regions[0])?.label
                    : `${regions.length} estados seleccionados`}
                </span>
              </Button>
            </PopoverTrigger>

            <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
              <Command>
                <CommandList className="max-h-60 overflow-y-auto">
                  <CommandGroup heading="Estados disponibles">
                    {REGIONS.map((r) => {
                      const isSelected = regions.includes(r.value);
                      return (
                        <CommandItem
                          key={r.value}
                          value={`${r.label} ${r.hint}`}
                          onSelect={() => {
                            let newSelectedRegions = [];
                            if (isSelected) {
                              newSelectedRegions = regions.filter(
                                (val) => val !== r.value
                              );
                            } else {
                              newSelectedRegions = [...regions, r.value];
                            }
                            setValue("regions", newSelectedRegions, {
                              shouldValidate: true,
                            });
                          }}
                          className="flex items-center justify-between"
                        >
                          <span className="flex items-center gap-2">
                            <div
                              className={cn(
                                "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "opacity-50 [&_svg]:invisible"
                              )}
                            >
                              <IconCheck className={cn("h-3 w-3")} />
                            </div>
                            {r.label}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                            {r.hint}
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
            <p className="text-sm text-red-600">{errors.regions.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Actualmente soportamos itinerarios en CDMX, Estado de México,
            Hidalgo, Morelos y Querétaro.
          </p>
        </div>

        {/* Fechas + Visibilidad */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
          {/* Calendario (rango) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Fechas</label>

            <DateRangePicker
              value={{ start, end }}
              onChange={(v) => {
                const newStart = v.start ?? undefined;
                let newEnd = v.end ?? undefined;

                if (newStart && newEnd) {
                  const diffInTime = newEnd.getTime() - newStart.getTime();
                  const diffInDays = diffInTime / (1000 * 3600 * 24);

                  if (diffInDays > 6) {
                    newEnd = addDays(newStart, 6);
                  }
                }
                setValue("start", newStart, {
                  shouldValidate: false,
                });
                setValue("end", newEnd, {
                  shouldValidate: false,
                });
              }}
              trigger={({ open, setOpen }) => (
                <button
                  type="button"
                  onClick={() => setOpen(!open)}
                  className="h-12 w-full justify-start rounded-lg border px-3 inline-flex items-center gap-2 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-palette-blue/60 transition"
                >
                  <IconCalendar className="size-4 opacity-70" />
                  <span
                    className={cn(!start && !end && "text-muted-foreground")}
                  >
                    {start
                      ? `${format(start, "d 'de' MMM", { locale: es })} — ${
                          end ? format(end, "d 'de' MMM", { locale: es }) : "…"
                        }`
                      : "Fecha de inicio — Fecha final"}
                  </span>
                </button>
              )}
            />

            <p className="text-xs text-muted-foreground">
              Puedes escoger hasta 7 días para tu itinerario.
            </p>
          </div>

          {/* Visibilidad (segmented) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Privacidad</label>
            <div className="grid grid-cols-3 rounded-lg border overflow-hidden">
              {[
                { key: "private", label: "Privado" },
                { key: "friends", label: "Amigos" },
                { key: "public", label: "Público" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setValue("visibility", opt.key as any)}
                  className={cn(
                    "px-3 py-2 text-sm transition-colors",
                    visibility === opt.key
                      ? "bg-blue-600 text-primary-foreground"
                      : "bg-background hover:bg-muted"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Define la privacidad de tu itinerario.
            </p>
          </div>
        </div>

        <Separator />

        {/* CTA */}
        <div className="flex flex-col items-center gap-3">
          <Button
            type="submit"
            className="h-12 px-8 text-base rounded-full bg-blue-600 hover:opacity-90 text-primary-foreground"
          >
            Comienza a planificar
          </Button>
        </div>
      </form>
    </Card>
  );
}
