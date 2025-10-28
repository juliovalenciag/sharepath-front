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
// --- (INICIO) Mejoras de importación ---
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
// --- (FIN) Mejoras de importación ---

import DateRangePicker from "@/components/ui/date-range-picker"; // <-- Asumiendo que usas el componente mejorado del paso anterior

/* ----------------------------- Datos y esquema ----------------------------- */

const REGIONS = [
  { value: "cdmx", label: "Ciudad de México", hint: "CDMX" },
  { value: "edomex", label: "Estado de México", hint: "Edo. Méx." },
  { value: "hgo", label: "Hidalgo", hint: "HGO" },
  { value: "mor", label: "Morelos", hint: "MOR" },
  { value: "qro", label: "Querétaro", hint: "QRO" },
] as const;

const schema = z.object({
  region: z.enum(["cdmx", "edomex", "hgo", "mor", "qro"], {
    errorMap: () => ({
      message: "Selecciona un destino válido dentro de la zona soportada",
    }),
  }),
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

  // <-- Mejora: Renombrado a 'form' para seguir la convención de shadcn
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      region: undefined,
      start: undefined,
      end: undefined,
      visibility: "friends",
      companions: "",
    },
  });

  // <-- Mejora: Obtenemos 'watch' y 'setValue' directamente de 'form'
  const { watch, setValue } = form;

  // Observamos 'start' y 'end' para el DateRangePicker, ya que es un campo compuesto
  const start = watch("start");
  const end = watch("end");

  function onSubmit(values: FormValues) {
    const params = new URLSearchParams();
    params.set("region", values.region);
    if (values.start) params.set("start", values.start.toISOString());
    if (values.end) params.set("end", values.end.toISOString());
    params.set("visibility", values.visibility);
    if (values.companions) params.set("companions", values.companions.trim());

    router.push(`/viajero/itinerarios/constructor?${params.toString()}`);
  }

  return (
    <Card className="mx-auto max-w-3xl border-border/60 bg-card/70 backdrop-blur-sm shadow-sm p-5 md:p-7">
      {/* Encabezado (sin cambios, ya estaba bien) */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          Crea un nuevo itinerario
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Elige destino, (opcional) fechas y privacidad. Luego ajustamos el
          itinerario.
        </p>
        <div className="mt-3 h-1 w-24 mx-auto rounded-full bg-palette-blue/90 dark:bg-palette-blue" />
      </div>

      {/* <-- Mejora: Envolvemos todo en el componente <Form> de shadcn */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* ¿A dónde? */}
          {/* <-- Mejora: Usamos FormField para vincular el estado y los errores */}
          <FormField
            control={form.control}
            name="region"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>¿A dónde?</FormLabel>
                <Popover open={openRegion} onOpenChange={setOpenRegion}>
                  <PopoverTrigger asChild>
                    {/* <-- Mejora: FormControl envuelve el 'trigger' */}
                    <FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "h-12 w-full justify-between text-left rounded-lg",
                          !field.value && "text-muted-foreground" // <-- Usa field.value
                        )}
                      >
                        <span className="inline-flex items-center gap-2">
                          <IconMapPinFilled className="size-4 opacity-70" />
                          {field.value // <-- Usa field.value
                            ? REGIONS.find((r) => r.value === field.value)
                                ?.label
                            : "p. ej. CDMX, EdoMex..."}
                        </span>
                      </Button>
                    </FormControl>
                  </PopoverTrigger>

                  <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
                    <Command>
                      <div className="px-2 pt-2 pb-1">
                        <CommandInput placeholder="Buscar destino..." />
                      </div>
                      <CommandList className="max-h-60 overflow-y-auto">
                        <CommandEmpty>No hay coincidencias</CommandEmpty>
                        <CommandGroup heading="Estados disponibles">
                          {REGIONS.map((r) => (
                            <CommandItem
                              key={r.value}
                              value={`${r.label} ${r.hint}`}
                              onSelect={() => {
                                field.onChange(r.value); // <-- Usa field.onChange
                                setOpenRegion(false);
                              }}
                              className="flex items-center justify-between"
                            >
                              <span className="flex items-center gap-2">
                                <span className="inline-flex size-2.5 rounded-full bg-palette-pink/90" />
                                {r.label}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                                {r.hint}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                <FormDescription>
                  Actualmente soportamos itinerarios en CDMX, Estado de México,
                  Hidalgo, Morelos y Querétaro.
                </FormDescription>
                {/* <-- Mejora: FormMessage maneja los errores automáticamente */}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Fechas + Visibilidad */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
            {/* <-- Mejora: Usamos FormField para la estructura (label/description) */}
            <FormField
              control={form.control}
              name="start" // Lo "colgamos" del campo 'start'
              render={() => (
                <FormItem className="space-y-2">
                  <FormLabel>Fechas (opcional)</FormLabel>
                  {/* <-- Mejora: DateRangePicker ahora recibe el trigger como hijo */}
                  <DateRangePicker
                    value={{ start, end }}
                    onChange={(v) => {
                      // El picker maneja dos campos, así que usamos setValue
                      setValue("start", v.start ?? undefined);
                      setValue(
                        "end",
                        v.end ??
                          (v.start
                            ? addDays(v.start as Date, 1) // Tu lógica original
                            : undefined)
                      );
                    }}
                    trigger={
                      // <-- Mejora: Este es ahora el 'trigger'
                      // Ya no es una función, es un nodo de React
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "h-12 w-full justify-start rounded-lg font-normal",
                          !start && !end && "text-muted-foreground"
                        )}
                      >
                        <IconCalendar className="mr-2 size-4 opacity-70" />
                        <span>
                          {start
                            ? `${format(start, "d 'de' MMM", {
                                locale: es,
                              })} — ${
                                end
                                  ? format(end, "d 'de' MMM", { locale: es })
                                  : "…"
                              }`
                            : "Fecha de inicio — Fecha final"}
                        </span>
                      </Button>
                    }
                  />
                  <FormDescription>
                    Puedes omitir fechas y definirlas más adelante.
                  </FormDescription>
                </FormItem>
              )}
            />

            {/* Visibilidad (segmented) */}
            {/* <-- Mejora: Usamos FormField para 'visibility' */}
            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Privacidad</FormLabel>
                  <FormControl>
                    {/* <-- Mejora: Botones dentro de FormControl */}
                    <div className="grid grid-cols-3 rounded-lg border overflow-hidden">
                      {[
                        { key: "private", label: "Privado" },
                        { key: "friends", label: "Amigos" },
                        { key: "public", label: "Público" },
                      ].map((opt) => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => field.onChange(opt.key as any)} // <-- Usa field.onChange
                          className={cn(
                            "px-3 text-sm transition-colors flex items-center justify-center",
                            "h-12", // <-- Mejora: Altura consistente
                            field.value === opt.key // <-- Usa field.value
                              ? "bg-palette-blue text-primary-foreground"
                              : "bg-background hover:bg-muted"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Define quién podrá ver tu itinerario.
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>

          {/* Invitaciones */}
          {/* <-- Mejora: Usamos FormField para 'companions' */}
          <FormField
            control={form.control}
            name="companions"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>
                  Invitar a compañeros de viaje (opcional)
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <IconUsersGroup className="absolute left-3 top-1/2 -translate-y-1/2 size-4 opacity-60" />
                    <Input
                      placeholder="Correos separados por coma"
                      className="pl-9 h-12 rounded-lg" // <-- Mejora: Altura consistente y más padding
                      {...field} // <-- Mejora: Pasamos el 'field' completo
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Ej.: ana@mail.com, luis@mail.com
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator />

          {/* CTA (sin cambios) */}
          <div className="flex flex-col items-center gap-3 pt-2">
            <Button
              type="submit" // <-- Mejora: 'type="submit"' explícito
              className="h-12 px-8 text-base rounded-full bg-palette-blue hover:opacity-90 text-primary-foreground"
            >
              Comienza a planificar
            </Button>
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-foreground hover:underline"
              onClick={() => router.push("/viajero/guias/nueva")}
            >
              o escribir una nueva guía
            </button>
          </div>
        </form>
      </Form>
    </Card>
  );
}