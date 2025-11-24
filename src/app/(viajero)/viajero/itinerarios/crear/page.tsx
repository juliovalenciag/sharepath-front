// src/app/(viajero)/viajero/itinerarios/crear/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useShallow } from "zustand/react/shallow";

import {
  addMinutes,
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
} from "date-fns";
import { es } from "date-fns/locale";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  CalendarDays,
  Info,
  Loader2,
  MapPin,
  Save,
  Search,
  Wand2,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import type { LugarData } from "@/api/interfaces/ApiRoutes";
import {
  useItineraryBuilderStore,
  buildItineraryPayload,
  type BuilderActivity,
  type BuilderPlace,
} from "@/lib/itinerary-builder-store";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { CinematicMap, type DayInfo } from "./components/CinematicMap";
import { PlaceSearchDialog } from "./components/PlacesSearchDialog";
import { EditDatesDialog } from "./components/EditDatesDialog";

/* ======================================================================= */
/* Helpers                                                                 */
/* ======================================================================= */

function dayKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function sameDayKey(date: Date, key: string) {
  return dayKey(date) === key;
}

function createActivityFromLugar(
  lugar: LugarData | BuilderPlace,
  fecha: Date
): BuilderActivity {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const place: BuilderPlace = {
    id_api_place: (lugar as any).id_api_place,
    nombre: lugar.nombre,
    latitud: lugar.latitud,
    longitud: lugar.longitud,
    foto_url: "foto_url" in lugar ? lugar.foto_url ?? null : null,
    category: "category" in lugar ? lugar.category : undefined,
    mexican_state: "mexican_state" in lugar ? lugar.mexican_state : undefined,
    google_score: "google_score" in lugar ? lugar.google_score : undefined,
    total_reviews: "total_reviews" in lugar ? lugar.total_reviews : undefined,
  };

  return {
    id,
    fecha,
    description: `Visita a ${place.nombre}`,
    lugar: place,
    start_time: "10:00",
    end_time: "11:00",
  };
}

function distanceKm(
  a: { latitud: number; longitud: number },
  b: { latitud: number; longitud: number }
) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.latitud - a.latitud);
  const dLon = toRad(b.longitud - a.longitud);
  const lat1 = toRad(a.latitud);
  const lat2 = toRad(b.latitud);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/* ======================================================================= */
/* Activity Card sortable (col izquierda)                                  */
/* ======================================================================= */

type ActivityModalState = {
  open: boolean;
  activity: BuilderActivity | null;
};

function SortableActivityCard({
  activity,
  onChange,
  onDelete,
  onOpenModal,
}: {
  activity: BuilderActivity;
  onChange: (id: string, patch: Partial<BuilderActivity>) => void;
  onDelete: (id: string) => void;
  onOpenModal: (activity: BuilderActivity) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: activity.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const foto = activity.lugar.foto_url;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="group relative mb-3 border-border/70 bg-card/95 shadow-sm"
      {...attributes}
    >
      <div className="flex gap-3 p-3 sm:p-4">
        {/* Handle drag */}
        <button
          type="button"
          className="mt-4 hidden cursor-grab text-muted-foreground/70 hover:text-foreground sm:inline-flex"
          {...listeners}
        >
          ⋮⋮
        </button>

        {/* Foto */}
        <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
          {foto ? (
            <Image
              src={foto}
              alt={activity.lugar.nombre}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
              Sin foto
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="truncate">{activity.lugar.nombre}</span>
            </div>
            <div className="flex gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {format(activity.fecha, "d MMM", { locale: es })}
              </div>
              {activity.start_time && activity.end_time && (
                <div className="flex items-center gap-1">
                  <span>
                    {activity.start_time} – {activity.end_time}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Textarea
            value={activity.description}
            className="min-h-[60px] text-xs sm:text-sm"
            onChange={(e) =>
              onChange(activity.id, { description: e.target.value })
            }
            placeholder="Añade una nota rápida (tour guiado, comer aquí, ver el atardecer...)"
          />

          <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <div className="flex items-center gap-1">
                <span>Inicio</span>
                <Input
                  type="time"
                  className="h-7 w-24 text-xs"
                  value={activity.start_time ?? ""}
                  onChange={(e) =>
                    onChange(activity.id, { start_time: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center gap-1">
                <span>Fin</span>
                <Input
                  type="time"
                  className="h-7 w-24 text-xs"
                  value={activity.end_time ?? ""}
                  onChange={(e) =>
                    onChange(activity.id, { end_time: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-7 rounded-full px-3 text-[11px]"
                onClick={() => onOpenModal(activity)}
              >
                Detalles
              </Button>
              <button
                type="button"
                onClick={() => onDelete(activity.id)}
                className="ml-auto text-xs font-medium text-red-500 hover:underline"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ======================================================================= */
/* Modal de detalles de actividad                                          */
/* ======================================================================= */

function ActivityDetailsDialog({
  state,
  onOpenChange,
  onSave,
}: {
  state: ActivityModalState;
  onOpenChange: (open: boolean) => void;
  onSave: (activity: BuilderActivity) => void;
}) {
  const activity = state.activity;
  const [local, setLocal] = useState<BuilderActivity | null>(activity);

  useEffect(() => {
    setLocal(activity);
  }, [activity]);

  if (!local) return null;

  function update(patch: Partial<BuilderActivity>) {
    setLocal((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  return (
    <Dialog open={state.open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalles de la parada</DialogTitle>
          <DialogDescription>
            Ajusta notas y horarios para{" "}
            <span className="font-semibold">{local.lugar.nombre}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 grid gap-4 md:grid-cols-[3fr_2fr]">
          {/* Col izquierda */}
          <div className="space-y-3">
            <div>
              <Label>Descripción</Label>
              <Textarea
                className="mt-1 min-h-[120px] text-sm"
                value={local.description}
                onChange={(e) => update({ description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <Label>Hora de inicio</Label>
                <Input
                  type="time"
                  className="mt-1 h-8 text-xs"
                  value={local.start_time ?? ""}
                  onChange={(e) => update({ start_time: e.target.value })}
                />
              </div>
              <div>
                <Label>Hora de fin</Label>
                <Input
                  type="time"
                  className="mt-1 h-8 text-xs"
                  value={local.end_time ?? ""}
                  onChange={(e) => update({ end_time: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Col derecha */}
          <Card className="space-y-3 border-border/70 bg-muted/40 p-3 text-xs">
            <div className="flex items-start gap-2">
              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                {local.lugar.foto_url && (
                  <Image
                    src={local.lugar.foto_url}
                    alt={local.lugar.nombre}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="space-y-1">
                <div className="text-sm font-semibold">
                  {local.lugar.nombre}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {local.lugar.category} • {local.lugar.mexican_state}
                </div>
                {typeof local.lugar.google_score === "number" && (
                  <div className="text-[11px] text-muted-foreground">
                    ⭐ {local.lugar.google_score.toFixed(1)} ·{" "}
                    {local.lugar.total_reviews} reseñas
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Info className="h-3 w-3" />
                <span>Tip rápido</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Usa esta descripción para guardar horarios de ticket, puntos de
                encuentro o cualquier detalle logístico importante.
              </p>
            </div>
          </Card>
        </div>

        <DialogFooter className="mt-3 flex items-center justify-between">
          <DialogClose asChild>
            <Button variant="outline" size="sm">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            size="sm"
            onClick={() => {
              if (local) onSave(local);
            }}
          >
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ======================================================================= */
/* Página principal                                                        */
/* ======================================================================= */

export default function CrearItinerarioPage() {
  const router = useRouter();

  const {
    meta,
    actividades,
    addActivity,
    updateActivity,
    removeActivity,
    setActivities,
    setMeta,
  } = useItineraryBuilderStore(
    useShallow((s) => ({
      meta: s.meta,
      actividades: s.actividades,
      addActivity: s.addActivity,
      updateActivity: s.updateActivity,
      removeActivity: s.removeActivity,
      setActivities: s.setActivities,
      setMeta: s.setMeta,
    }))
  );

  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [optimizing, setOptimizing] = useState(false);

  const [activityModal, setActivityModal] = useState<ActivityModalState>({
    open: false,
    activity: null,
  });

  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [datesDialogOpen, setDatesDialogOpen] = useState(false);

  // Si entra directo sin meta, lo mandamos al paso anterior
  useEffect(() => {
    if (!meta) {
      toast.info("Primero define la información básica de tu viaje.");
      router.push("/viajero/itinerarios/nuevo");
    }
  }, [meta, router]);

  // Construir días desde meta
  const days: DayInfo[] = useMemo(() => {
    if (meta?.start && meta?.end) {
      const interval = eachDayOfInterval({
        start: meta.start,
        end: meta.end,
      });
      return interval.map((date, index) => ({
        key: dayKey(date),
        date,
        label: `Día ${index + 1}`,
        subtitle: format(date, "d MMM", { locale: es }),
      }));
    }
    return [];
  }, [meta?.start, meta?.end]);

  // Día seleccionado inicial
  useEffect(() => {
    if (!days.length) return;
    if (!selectedDayKey || !days.some((d) => d.key === selectedDayKey)) {
      setSelectedDayKey(days[0].key);
    }
  }, [days, selectedDayKey]);

  const currentDay = days.find((d) => d.key === selectedDayKey) ?? null;

  const activitiesForCurrentDay: BuilderActivity[] = useMemo(() => {
    if (!currentDay) return [];
    return actividades
      .filter((a) => sameDayKey(a.fecha, currentDay.key))
      .sort((a, b) => {
        const at = a.start_time ?? "";
        const bt = b.start_time ?? "";
        return at.localeCompare(bt);
      });
  }, [actividades, currentDay]);

  // Actividades para el mapa: todas ordenadas por fecha/hora
  const mapActivities = useMemo(
    () =>
      [...actividades]
        .sort((a, b) => {
          if (a.fecha.getTime() === b.fecha.getTime()) {
            const at = a.start_time ?? "";
            const bt = b.start_time ?? "";
            return at.localeCompare(bt);
          }
          return a.fecha.getTime() - b.fecha.getTime();
        })
        .map((a) => ({
          id: a.id,
          nombre: a.lugar.nombre,
          lat: a.lugar.latitud,
          lng: a.lugar.longitud,
          fecha: a.fecha,
          start_time: a.start_time,
        })),
    [actividades]
  );

  // DnD
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id || !currentDay) return;

    const key = currentDay.key;

    setActivities((prev) => {
      const dayItems = prev.filter((a) => sameDayKey(a.fecha, key));
      const otherItems = prev.filter((a) => !sameDayKey(a.fecha, key));

      const oldIndex = dayItems.findIndex((a) => a.id === active.id);
      const newIndex = dayItems.findIndex((a) => a.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;

      const reordered = arrayMove(dayItems, oldIndex, newIndex);

      // Reajustar horarios ligeramente
      let currentTime = reordered[0].start_time || "09:00";
      const withTimes = reordered.map((a) => {
        const [hStr, mStr] = currentTime.split(":");
        const dateWithTime = new Date(a.fecha);
        dateWithTime.setHours(Number(hStr), Number(mStr));
        const nextTime = format(addMinutes(dateWithTime, 90), "HH:mm");

        const res = {
          ...a,
          start_time: currentTime,
          end_time: format(addMinutes(dateWithTime, 60), "HH:mm"),
        };
        currentTime = nextTime;
        return res;
      });

      return [...otherItems, ...withTimes];
    });
  }

  function handleAddLugarToCurrentDay(lugar: LugarData) {
    if (!currentDay) {
      toast.error("Primero selecciona un día en tu itinerario.");
      return;
    }
    const already = activitiesForCurrentDay.some(
      (a) => a.lugar.id_api_place === lugar.id_api_place
    );
    if (already) {
      toast.info("Ese lugar ya está en el día actual.");
      return;
    }
    const activity = createActivityFromLugar(lugar, currentDay.date);
    addActivity(activity);
    toast.success(`"${lugar.nombre}" añadido al ${currentDay.label}.`);
  }

  function optimizeDayOrder() {
    if (!currentDay) return;
    const items = activitiesForCurrentDay;
    if (items.length <= 2) return;

    setOptimizing(true);

    const remaining = [...items];
    const ordered: BuilderActivity[] = [];
    let current = remaining.shift()!;
    ordered.push(current);

    while (remaining.length) {
      let bestIndex = 0;
      let bestDist = distanceKm(current.lugar, remaining[0].lugar);
      for (let i = 1; i < remaining.length; i++) {
        const d = distanceKm(current.lugar, remaining[i].lugar);
        if (d < bestDist) {
          bestDist = d;
          bestIndex = i;
        }
      }
      current = remaining.splice(bestIndex, 1)[0];
      ordered.push(current);
    }

    setActivities((prev) => {
      const key = currentDay.key;
      const other = prev.filter((a) => !sameDayKey(a.fecha, key));
      return [...other, ...ordered];
    });

    setTimeout(() => {
      setOptimizing(false);
      toast.success(`Ruta del ${currentDay.label} optimizada.`);
    }, 250);
  }

  async function handleSaveItinerary() {
    const state = useItineraryBuilderStore.getState();

    if (!state.meta) {
      toast.error("Falta la información básica del itinerario.");
      return;
    }
    if (!state.actividades.length) {
      toast.error("Agrega al menos una parada antes de guardar.");
      return;
    }

    setSaving(true);
    try {
      const payload = buildItineraryPayload(state.meta, state.actividades);
      const promise = ItinerariosAPI.getInstance().createItinerario(payload);

      await toast.promise(promise, {
        loading: "Guardando itinerario...",
        success: (data: any) =>
          data?.message || "¡Itinerario guardado con éxito!",
        error: (err: any) => err?.message || "Ocurrió un error al guardar.",
      });

      useItineraryBuilderStore.getState().clear?.();
      router.push("/viajero/itinerarios");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "No se pudo guardar el itinerario.");
    } finally {
      setSaving(false);
    }
  }

  function handleSaveDates(start: Date, end: Date) {
    if (!meta) return;
    setMeta({ ...meta, start, end });
    setDatesDialogOpen(false);
  }

  if (!meta) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando información del viaje...
        </div>
      </div>
    );
  }

  const totalDays =
    meta.start && meta.end
      ? differenceInCalendarDays(meta.end, meta.start) + 1
      : null;

  return (
    <>
      {/* Modal detalles de actividad */}
      <ActivityDetailsDialog
        state={activityModal}
        onOpenChange={(open) => setActivityModal((prev) => ({ ...prev, open }))}
        onSave={(updated) => {
          updateActivity(updated.id, updated);
          setActivityModal({ open: false, activity: null });
        }}
      />

      {/* Modal de búsqueda de lugares */}
      <PlaceSearchDialog
        open={searchDialogOpen}
        onOpenChange={setSearchDialogOpen}
        currentDay={currentDay}
        onAddLugarToDay={handleAddLugarToCurrentDay}
        defaultState={meta.regions?.[0] ?? undefined}
      />

      {/* Modal para editar fechas */}
      <EditDatesDialog
        open={datesDialogOpen}
        onOpenChange={setDatesDialogOpen}
        meta={meta}
        onSaveRange={handleSaveDates}
      />

      <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-background">
        {/* Header */}
        <div className="border-b bg-background/95 px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-base font-semibold sm:text-lg">
                {meta.title}
              </h1>
              <p className="text-xs text-muted-foreground sm:text-sm">
                {meta.start && meta.end ? (
                  <>
                    {format(meta.start, "d MMM", { locale: es })} –{" "}
                    {format(meta.end, "d MMM", { locale: es })} · {totalDays}{" "}
                    día{(totalDays ?? 0) > 1 ? "s" : ""} · {actividades.length}{" "}
                    parada
                    {actividades.length === 1 ? "" : "s"} en total
                  </>
                ) : (
                  "Ajusta los días y las paradas de tu viaje."
                )}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-full text-xs sm:text-sm"
                onClick={() => setDatesDialogOpen(true)}
              >
                <CalendarDays className="mr-2 h-3 w-3" />
                Editar fechas
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full text-xs sm:text-sm"
                onClick={() => setSearchDialogOpen(true)}
              >
                <Search className="mr-2 h-3 w-3" />
                Buscar lugares
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full text-xs sm:text-sm"
                onClick={optimizeDayOrder}
                disabled={optimizing || activitiesForCurrentDay.length <= 2}
              >
                {optimizing ? (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-3 w-3" />
                )}
                Optimizar día actual
              </Button>
              <Button
                size="sm"
                className="rounded-full text-xs sm:text-sm"
                onClick={handleSaveItinerary}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                ) : (
                  <Save className="mr-2 h-3 w-3" />
                )}
                Guardar itinerario
              </Button>
            </div>
          </div>
        </div>

        {/* Layout principal */}
        <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
          {/* Izquierda: días + actividades */}
          <div className="flex w-full flex-col border-b md:w-[47%] md:border-b-0 md:border-r">
            {/* Tabs de día */}
            <div className="border-b bg-background/95 px-3 py-2 sm:px-4">
              <Tabs
                value={selectedDayKey ?? undefined}
                onValueChange={(value) => setSelectedDayKey(value)}
                className="w-full"
              >
                <TabsList className="flex max-w-full flex-wrap justify-start gap-1 bg-muted/60 p-1">
                  {days.map((day) => (
                    <TabsTrigger
                      key={day.key}
                      value={day.key}
                      className="h-8 rounded-full px-3 text-xs sm:text-[13px]"
                    >
                      {day.label}
                      <span className="ml-1 hidden text-[11px] text-muted-foreground sm:inline">
                        {day.subtitle}
                      </span>
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TabsContent value={selectedDayKey ?? ""} />
              </Tabs>

              <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="rounded-full">
                    {actividades.length} paradas totales
                  </Badge>
                  {currentDay && (
                    <span>
                      {activitiesForCurrentDay.length} parada
                      {activitiesForCurrentDay.length === 1 ? "" : "s"} en{" "}
                      {currentDay.label}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  <span className="hidden sm:inline">
                    Arrastra para reordenar tus paradas.
                  </span>
                </div>
              </div>
            </div>

            {/* Lista de actividades */}
            <ScrollArea className="flex-1">
              <div className="p-3 sm:p-4">
                {!currentDay ? (
                  <p className="text-sm text-muted-foreground">
                    Define un rango de fechas en el paso anterior para comenzar
                    a planificar los días.
                  </p>
                ) : activitiesForCurrentDay.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Aún no has agregado paradas para este día. Usa el botón{" "}
                    <span className="font-medium">“Buscar lugares”</span> en la
                    parte superior para encontrarlas.
                  </p>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={activitiesForCurrentDay.map((a) => a.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {activitiesForCurrentDay.map((activity) => (
                        <SortableActivityCard
                          key={activity.id}
                          activity={activity}
                          onChange={(id, patch) => updateActivity(id, patch)}
                          onDelete={(id) => removeActivity(id)}
                          onOpenModal={(activity) =>
                            setActivityModal({ open: true, activity })
                          }
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Derecha: solo mapa, sin panel apretado */}
          <div className="flex w-full flex-col md:w-[53%]">
            <div className="border-b bg-background/95 px-3 py-2 sm:px-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium">Vista del mapa</span>
                <span>
                  Haz clic en las paradas de la izquierda para verlas sobre el
                  mapa.
                </span>
              </div>
            </div>
            <div className="flex-1">
              <CinematicMap
                activities={mapActivities}
                days={days}
                selectedDayKey={selectedDayKey}
                onSelectDay={(key) => setSelectedDayKey(key)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
