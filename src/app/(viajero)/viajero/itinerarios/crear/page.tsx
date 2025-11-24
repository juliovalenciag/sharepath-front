// src/app/(viajero)/viajero/itinerarios/crear/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import Image from "next/image";

// Fechas
import {
  addMinutes,
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
} from "date-fns";
import { es } from "date-fns/locale";

// Drag & Drop
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  type DropAnimation,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Iconos
import {
  CalendarDays,
  Info,
  Loader2,
  MapPin,
  Save,
  Search,
  Wand2,
  Map as MapIcon,
  List,
  GripVertical,
  Clock,
  Trash2,
  MoreHorizontal,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";

// Stores & API
import type { LugarData } from "@/api/interfaces/ApiRoutes";
import {
  useItineraryBuilderStore,
  buildItineraryPayload,
  type BuilderActivity,
  type BuilderPlace,
} from "@/lib/itinerary-builder-store";
import { ItinerariosAPI } from "@/api/ItinerariosAPI";

// UI Components
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Sub-components (Importados)
import { CinematicMap, type DayInfo } from "./components/CinematicMap";
import { PlaceSearchDialog } from "./components/PlacesSearchDialog"; // Asegúrate de que el nombre del archivo coincida
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
/* Activity Card (Sortable)                                                */
/* ======================================================================= */

type ActivityModalState = {
  open: boolean;
  activity: BuilderActivity | null;
};

interface SortableActivityCardProps {
  activity: BuilderActivity;
  onChange: (id: string, patch: Partial<BuilderActivity>) => void;
  onDelete: (id: string) => void;
  onOpenModal: (activity: BuilderActivity) => void;
}

function SortableActivityCard({
  activity,
  onChange,
  onDelete,
  onOpenModal,
}: SortableActivityCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.3 : 1,
  };

  const foto = activity.lugar.foto_url;

  return (
    <div ref={setNodeRef} style={style} className="group relative mb-3">
      <Card className="border-border/60 bg-card transition-colors hover:border-primary/30">
        <div className="flex gap-3 p-3">
          {/* Drag Handle */}
          <button
            type="button"
            className="mt-1 hidden h-6 w-6 cursor-grab items-center justify-center rounded text-muted-foreground/40 hover:bg-muted hover:text-foreground group-hover:flex"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>

          {/* Foto */}
          <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-md bg-muted shadow-sm">
            {foto ? (
              <Image
                src={foto}
                alt={activity.lugar.nombre}
                fill
                className="object-cover"
                sizes="96px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted text-[10px] text-muted-foreground">
                <MapPin className="h-5 w-5 opacity-20" />
              </div>
            )}
          </div>

          {/* Contenido */}
          <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h4 className="truncate text-sm font-semibold text-foreground">
                  {activity.lugar.nombre}
                </h4>
                {/* Menú de acciones móvil/desktop */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onOpenModal(activity)}>
                      <Pencil className="mr-2 h-3.5 w-3.5" /> Editar detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onClick={() => onDelete(activity.id)}
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" /> Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {activity.description || "Sin descripción"}
              </p>
            </div>

            {/* Inputs de Horario Inline */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-md bg-muted/40 px-2 py-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <Input
                  type="time"
                  className="h-5 w-[4.5rem] border-0 bg-transparent p-0 text-xs focus-visible:ring-0"
                  value={activity.start_time ?? ""}
                  onChange={(e) =>
                    onChange(activity.id, { start_time: e.target.value })
                  }
                />
                <span className="text-xs text-muted-foreground">-</span>
                <Input
                  type="time"
                  className="h-5 w-[4.5rem] border-0 bg-transparent p-0 text-xs focus-visible:ring-0"
                  value={activity.end_time ?? ""}
                  onChange={(e) =>
                    onChange(activity.id, { end_time: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ======================================================================= */
/* Activity Details Modal                                                  */
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
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Parada</DialogTitle>
          <DialogDescription>
            Detalles para <span className="font-medium text-foreground">{local.lugar.nombre}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label>Notas / Descripción</Label>
            <Textarea
              className="min-h-[100px] resize-none text-sm"
              placeholder="Ej. Comprar tickets en la entrada..."
              value={local.description}
              onChange={(e) => update({ description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Inicio</Label>
              <div className="relative">
                <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  className="pl-9"
                  value={local.start_time ?? ""}
                  onChange={(e) => update({ start_time: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Fin</Label>
              <div className="relative">
                <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  className="pl-9"
                  value={local.end_time ?? ""}
                  onChange={(e) => update({ end_time: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button
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
/* Main Page Component                                                     */
/* ======================================================================= */

export default function CrearItinerarioPage() {
  const router = useRouter();

  // --- ZUSTAND ---
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

  // --- LOCAL STATE ---
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  
  // Mobile View Toggle: 'list' | 'map'
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  // Dialogs
  const [activityModal, setActivityModal] = useState<ActivityModalState>({
    open: false,
    activity: null,
  });
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [datesDialogOpen, setDatesDialogOpen] = useState(false);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // Distancia para evitar clicks accidentales
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // --- EFFECTS ---

  // Validación inicial
  useEffect(() => {
    if (!meta) {
      toast.info("Configura tu viaje para comenzar.");
      router.push("/viajero/itinerarios/nuevo");
    }
  }, [meta, router]);

  // Construcción de días
  const days: DayInfo[] = useMemo(() => {
    if (meta?.start && meta?.end) {
      const interval = eachDayOfInterval({ start: meta.start, end: meta.end });
      return interval.map((date, index) => ({
        key: dayKey(date),
        date,
        label: `Día ${index + 1}`,
        subtitle: format(date, "d MMM", { locale: es }),
      }));
    }
    return [];
  }, [meta?.start, meta?.end]);

  // Selección de día inicial
  useEffect(() => {
    if (!days.length) return;
    // Si no hay seleccionado o el seleccionado ya no existe (cambio de fechas), poner el primero
    if (!selectedDayKey || !days.some((d) => d.key === selectedDayKey)) {
      setSelectedDayKey(days[0].key);
    }
  }, [days, selectedDayKey]);

  const currentDay = days.find((d) => d.key === selectedDayKey) ?? null;

  // Filtrado de actividades
  const activitiesForCurrentDay = useMemo(() => {
    if (!currentDay) return [];
    return actividades
      .filter((a) => sameDayKey(a.fecha, currentDay.key))
      .sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""));
  }, [actividades, currentDay]);

  // Mapa
  const mapActivities = useMemo(
    () =>
      [...actividades]
        .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
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

  // --- HANDLERS ---

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id || !currentDay) return;

    const key = currentDay.key;
    const currentItems = actividades.filter((a) => sameDayKey(a.fecha, key));
    const otherItems = actividades.filter((a) => !sameDayKey(a.fecha, key));

    const oldIndex = currentItems.findIndex((a) => a.id === active.id);
    const newIndex = currentItems.findIndex((a) => a.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(currentItems, oldIndex, newIndex);

    // Lógica simple de reajuste horario (opcional)
    // Simplemente reordenamos en el array global
    setActivities([...otherItems, ...reordered]);
  }

  function handleAddLugar(lugar: LugarData) {
    if (!currentDay) {
      toast.error("Selecciona un día primero.");
      return;
    }
    // Verificar duplicados en el día
    if (activitiesForCurrentDay.some((a) => a.lugar.id_api_place === lugar.id_api_place)) {
      toast.warning("Este lugar ya está en el día actual.");
      return;
    }
    
    const act = createActivityFromLugar(lugar, currentDay.date);
    addActivity(act);
    toast.success("Lugar añadido", {
      description: `${lugar.nombre} agregado al ${currentDay.label}.`,
    });
  }

  function handleOptimize() {
    if (!currentDay) return;
    const items = activitiesForCurrentDay;
    if (items.length <= 2) return;

    setOptimizing(true);
    // Algoritmo "Greedy" simple (Vecino más cercano)
    const remaining = [...items];
    const ordered: BuilderActivity[] = [remaining.shift()!]; // Empezar con el primero (o el que sea hotel/inicio)

    while (remaining.length) {
      const current = ordered[ordered.length - 1];
      let bestIdx = 0;
      let minDst = Infinity;

      remaining.forEach((cand, i) => {
        const dst = distanceKm(current.lugar, cand.lugar);
        if (dst < minDst) {
          minDst = dst;
          bestIdx = i;
        }
      });
      ordered.push(remaining.splice(bestIdx, 1)[0]);
    }

    // Actualizar store
    const key = currentDay.key;
    const other = actividades.filter((a) => !sameDayKey(a.fecha, key));
    setActivities([...other, ...ordered]);

    setTimeout(() => {
      setOptimizing(false);
      toast.success("Ruta optimizada", { description: "Ordenado por cercanía." });
    }, 400);
  }

  async function handleSave() {
    if (!meta || !actividades.length) return;
    setSaving(true);
    try {
      const payload = buildItineraryPayload(meta, actividades);
      await ItinerariosAPI.getInstance().createItinerario(payload);
      toast.success("¡Itinerario creado!", {
        description: "Redirigiendo a tus viajes...",
      });
      useItineraryBuilderStore.getState().clear?.();
      router.push("/viajero/itinerarios");
    } catch (error: any) {
      toast.error("Error al guardar", { description: error.message });
    } finally {
      setSaving(false);
    }
  }

  // --- RENDER ---

  if (!meta) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Preparando el viaje...
      </div>
    );
  }

  const totalDays = differenceInCalendarDays(meta.end, meta.start) + 1;
  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.5" } } }),
  };

  return (
    <>
      {/* --- DIALOGS --- */}
      <ActivityDetailsDialog
        state={activityModal}
        onOpenChange={(open) => setActivityModal((prev) => ({ ...prev, open }))}
        onSave={(updated) => {
          updateActivity(updated.id, updated);
          setActivityModal({ open: false, activity: null });
        }}
      />
      <PlaceSearchDialog
        open={searchDialogOpen}
        onOpenChange={setSearchDialogOpen}
        currentDay={currentDay}
        onAddLugarToDay={handleAddLugar}
        defaultState={meta.regions?.[0]}
      />
      <EditDatesDialog
        open={datesDialogOpen}
        onOpenChange={setDatesDialogOpen}
        meta={meta}
        onSaveRange={(start, end) => {
          setMeta({ ...meta, start, end });
          setDatesDialogOpen(false);
          toast.success("Fechas actualizadas");
        }}
      />

      {/* --- MAIN LAYOUT --- */}
      <div className="flex h-[calc(100vh-4rem)] flex-col bg-background">
        
        {/* HEADER TOOLBAR */}
        <header className="z-20 flex shrink-0 flex-col gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight">{meta.title}</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>
                {format(meta.start, "d MMM", { locale: es })} -{" "}
                {format(meta.end, "d MMM", { locale: es })}
              </span>
              <span>•</span>
              <span>{totalDays} días</span>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <Button variant="outline" size="sm" onClick={() => setDatesDialogOpen(true)}>
              <CalendarDays className="mr-2 h-3.5 w-3.5" /> Fechas
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSearchDialogOpen(true)}>
              <Search className="mr-2 h-3.5 w-3.5" /> Agregar lugar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOptimize}
              disabled={optimizing || activitiesForCurrentDay.length < 3}
              title="Reordenar por distancia"
            >
              {optimizing ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-3.5 w-3.5" />
              )}
              Optimizar
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving} className="min-w-[100px]">
              {saving ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-2 h-3.5 w-3.5" />}
              Guardar
            </Button>
          </div>
        </header>

        {/* WORKSPACE */}
        <div className="relative flex flex-1 overflow-hidden">
          
          {/* --- LEFT PANEL: LISTA (Visible en desktop o si mobileView='list') --- */}
          <div
            className={cn(
              "flex w-full flex-col border-r bg-background transition-all duration-300 md:w-[480px] lg:w-[520px] md:translate-x-0 absolute md:relative inset-0 z-10",
              mobileView === "list" ? "translate-x-0" : "-translate-x-full"
            )}
          >
            {/* Day Selector (Horizontal Scroll) */}
            <div className="border-b bg-muted/30 py-2">
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex px-4 gap-2">
                  {days.map((d) => {
                    const isSelected = selectedDayKey === d.key;
                    return (
                      <button
                        key={d.key}
                        onClick={() => setSelectedDayKey(d.key)}
                        className={cn(
                          "flex flex-col items-center justify-center rounded-lg px-4 py-2 text-sm transition-all border",
                          isSelected
                            ? "bg-background border-primary text-primary shadow-sm"
                            : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                      >
                        <span className="font-semibold">{d.label}</span>
                        <span className="text-[10px] opacity-80">{d.subtitle}</span>
                      </button>
                    );
                  })}
                </div>
                <ScrollBar orientation="horizontal" className="invisible" />
              </ScrollArea>
            </div>

            {/* Activities List */}
            <div className="flex-1 overflow-hidden bg-muted/5">
              <ScrollArea className="h-full">
                <div className="p-4 pb-24">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Itinerario · {currentDay?.label}
                    </h3>
                    <Badge variant="default" className="text-xs">
                      {activitiesForCurrentDay.length} paradas
                    </Badge>
                  </div>

                  {!activitiesForCurrentDay.length ? (
                    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-12 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <MapPin className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                      <div className="max-w-[200px] space-y-1">
                        <p className="font-medium">Día libre</p>
                        <p className="text-xs text-muted-foreground">
                          No hay actividades. Usa "Agregar lugar" para empezar.
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setSearchDialogOpen(true)}>
                        Explorar Lugares
                      </Button>
                    </div>
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
                        {activitiesForCurrentDay.map((act) => (
                          <SortableActivityCard
                            key={act.id}
                            activity={act}
                            onChange={(id, patch) => updateActivity(id, patch)}
                            onDelete={(id) => removeActivity(id)}
                            onOpenModal={(activity) => setActivityModal({ open: true, activity })}
                          />
                        ))}
                      </SortableContext>
                      <DragOverlay dropAnimation={dropAnimation} />
                    </DndContext>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* --- RIGHT PANEL: MAPA (Visible en desktop o si mobileView='map') --- */}
          <div
            className={cn(
              "absolute inset-0 z-0 w-full bg-muted transition-all duration-300 md:relative md:block",
              mobileView === "map" ? "translate-x-0 block" : "translate-x-full hidden md:translate-x-0"
            )}
          >
            {/* Cinematic Map toma el 100% del contenedor padre */}
            <div className="h-full w-full">
               <CinematicMap
                activities={mapActivities}
                days={days}
                selectedDayKey={selectedDayKey}
                onSelectDay={(key) => setSelectedDayKey(key)}
              />
            </div>
          </div>

          {/* --- MOBILE TOGGLE BUTTON (Solo visible en pantallas pequeñas) --- */}
          <div className="absolute bottom-6 left-1/2 z-50 -translate-x-1/2 md:hidden">
             <div className="flex items-center rounded-full border bg-background/90 p-1 shadow-lg backdrop-blur-md">
                <button
                   onClick={() => setMobileView("list")}
                   className={cn(
                      "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all",
                      mobileView === "list" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
                   )}
                >
                   <List className="h-3.5 w-3.5" />
                   Lista
                </button>
                <button
                   onClick={() => setMobileView("map")}
                   className={cn(
                      "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all",
                      mobileView === "map" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
                   )}
                >
                   <MapIcon className="h-3.5 w-3.5" />
                   Mapa
                </button>
             </div>
          </div>

        </div>
      </div>
    </>
  );
}