"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import Image from "next/image";
import dynamic from "next/dynamic";

// import Mapa from "@/components/map";
// import dynamic from "next/dynamic";
// const Mapa = dynamic(() => import("@/components/viajero/map/Mapa"), {
//   ssr: false,
// });

// Fechas
import { differenceInCalendarDays, eachDayOfInterval, format } from "date-fns";

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


import { Map as MapIcon, X } from "lucide-react";
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
  Wand2,
  List,
  GripVertical,
  Clock,
  Trash2,
  MoreHorizontal,
  Pencil,
  Sparkles,
  AlertCircle,
  Plus,
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
  DialogFooter,
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
import {
  getCategoryStyle,
  getDefaultImageForCategory,
} from "@/lib/category-utils";

// Sub-components
import { PlaceSearchDialog } from "./components/PlacesSearchDialog";
import { EditDatesDialog } from "./components/EditDatesDialog";
import type { DayInfo } from "./components/CinematicMap";

export interface Actividad {
  id: number | string;
  nombre: string;
  lat: number;
  lng: number;
  descripcion?: string; // <-- Campo para el backend
  foto_url?: string; // <-- NUEVO: Para la imagen
  start_time?: string; // <-- Campo para el backend
  end_time?: string; // <-- Campo para el backend
}
const CinematicMap = dynamic(
  () => import("./components/CinematicMap").then((mod) => mod.CinematicMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-muted/20 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando mapa...</span>
      </div>
    ),
  }
);

/* ======================================================================= */
/* Helpers & Config                                                        */
/* ======================================================================= */

const MAX_ACTIVITIES_PER_DAY = 5;

function dayKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function sameDayKey(date: Date, key: string) {
  return dayKey(date) === key;
}

function createActivityFromLugar(
  lugar: LugarData,
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
    descripcion: "descripcion" in lugar ? lugar.descripcion : undefined,
    mexican_state: "mexican_state" in lugar ? lugar.mexican_state : undefined,
    google_score: "google_score" in lugar ? lugar.google_score : undefined,
    total_reviews: "total_reviews" in lugar ? lugar.total_reviews : undefined,
  };

  return {
    id,
    fecha,
    descripcion: lugar.descripcion || "", // Usamos la descripción del lugar como valor inicial
    lugar: place,
    start_time: "10:00",
    end_time: "11:00",
  };
}

// <<<<<<< HEAD
// function SelectorDias({
//   dias,
//   diaActivoId,
//   setDiaActivoId,
// }: {
//   dias: Dia[];
//   diaActivoId: number | string;
//   setDiaActivoId: (id: number | string) => void;
// }) {
// =======
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
/* Activity Card (Sortable) - CORREGIDO TIEMPO                             */
/* ======================================================================= */

interface SortableActivityCardProps {
  activity: BuilderActivity;
  index: number;
  onChange: (id: string, patch: Partial<BuilderActivity>) => void;
  onDelete: (id: string) => void;
  onViewDetails: (activityId: string) => void; // Recibe ID ahora
}

function SortableActivityCard({
  activity,
  index,
  onChange,
  onDelete,
  onViewDetails,
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
    opacity: isDragging ? 0.8 : 1,
  };

  const foto =
    activity.lugar.foto_url ||
    getDefaultImageForCategory(activity.lugar.category);

  const descriptionToShow = activity.lugar.descripcion;
  const hasDescription = !!activity.lugar.descripcion;

  // >>>>>>> 9a2fa75a111f9b75ef6b07230ff32bd5a01f1637
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative flex gap-4 touch-none group"
    >
      {/* LINEA DE TIEMPO */}
      <div className="flex flex-col items-center">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground shadow-sm z-10 mt-3">
          {index + 1}
        </div>
        <div className="flex-1 w-px bg-border/60 -mb-3 mt-1 group-last:hidden" />
      </div>

      {/* TARJETA */}
      <Card className="flex-1 border-muted-foreground/20 bg-card hover:border-primary/30 transition-all shadow-sm mb-3 overflow-hidden">
        <div className="flex p-3 gap-3">
          {/* Drag Handle */}
          <div
            className="mt-2 cursor-grab flex flex-col items-center justify-start text-muted-foreground/30 hover:text-foreground py-1"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5" />
          </div>

          {/* Contenido */}
          <div className="flex-1 flex flex-col gap-3 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4
                  onClick={() => onViewDetails(activity.id)}
                  className="text-base font-semibold truncate cursor-pointer hover:text-primary transition-colors"
                >
                  {activity.lugar.nombre}
                </h4>
                <p
                  className={cn(
                    "text-xs font-medium mt-1 truncate",
                    getCategoryStyle(activity.lugar.category).color
                  )}
                >
                  {getCategoryStyle(activity.lugar.category).name}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 -mr-2 -mt-1 text-muted-foreground hover:text-foreground"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onViewDetails(activity.id)}>
                    <Info className="mr-2 h-3.5 w-3.5" /> Ver detalles completos
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => onDelete(activity.id)}
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" /> Eliminar lugar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* FIX: Inputs de Horario con shrink-0 y width auto/fijo mayor */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-muted/40 px-3 py-1.5 rounded-md border border-border/50 transition-colors hover:border-primary/30 hover:bg-muted/60">
                <Clock className="h-4 w-4 text-primary shrink-0" />
                <div className="flex items-center gap-1">
                  <input
                    type="time"
                    // FIX: w-auto y min-w para que no se aplaste
                    className="bg-transparent border-none p-0 w-auto min-w-[60px] focus:ring-0 font-medium text-sm text-foreground text-center cursor-pointer font-mono shrink-0"
                    value={activity.start_time ?? ""}
                    onChange={(e) =>
                      onChange(activity.id, { start_time: e.target.value })
                    }
                  />
                  <span className="text-muted-foreground font-medium mx-1 shrink-0">
                    –
                  </span>
                  <input
                    type="time"
                    // FIX: w-auto y min-w para que no se aplaste
                    className="bg-transparent border-none p-0 w-auto min-w-[60px] focus:ring-0 font-medium text-sm text-foreground text-center cursor-pointer font-mono shrink-0"
                    value={activity.end_time ?? ""}
                    onChange={(e) =>
                      onChange(activity.id, { end_time: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div
              className={cn("flex gap-3 mt-1", !hasDescription && "items-end")}
            >
              {hasDescription && (
                <div className="flex-1 relative">
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {activity.lugar.descripcion}
                  </p>
                </div>
              )}

              <div
                className={cn(
                  "relative shrink-0 overflow-hidden rounded-lg bg-muted cursor-pointer hover:opacity-90 transition-opacity shadow-sm border border-border/10",
                  hasDescription ? "h-24 w-32" : "h-32 w-full" // Se expande si no hay descripción
                )}
                onClick={() => onViewDetails(activity.id)}
              >
                {foto ? (
                  <Image
                    src={foto}
                    alt={activity.lugar.nombre}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 128px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground/30 bg-muted/50">
                    <MapPin className="h-6 w-6" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ======================================================================= */
/* Place Info Modal - CORREGIDO STATE BINDING                              */
/* ======================================================================= */

function PlaceInfoDialog({
  isOpen,
  onClose,
  activityId, // Recibimos ID, no objeto
  allActivities,
  onUpdate,
}: {
  isOpen: boolean;
  onClose: () => void;
  activityId: string | null;
  allActivities: BuilderActivity[];
  onUpdate: (id: string, patch: Partial<BuilderActivity>) => void;
}) {
  // FIX: Buscar la actividad "viva" desde el array global
  const liveActivity = useMemo(
    () => allActivities.find((a) => a.id === activityId),
    [allActivities, activityId]
  );

  const categoryStyle = getCategoryStyle(liveActivity?.lugar.category);

  if (!liveActivity) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl overflow-hidden p-0 gap-0 border-none shadow-2xl">
        <div className="relative h-56 w-full bg-muted">
          {liveActivity.lugar.foto_url ||
          getDefaultImageForCategory(liveActivity.lugar.category) ? (
            <Image
              src={
                liveActivity.lugar.foto_url ||
                getDefaultImageForCategory(liveActivity.lugar.category)
              }
              alt={liveActivity.lugar.nombre}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-slate-100 dark:bg-slate-800">
              <MapPin className="h-16 w-16 text-muted-foreground/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          <div className="absolute bottom-5 left-6 right-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Badge
                className={cn(
                  "border-0 backdrop-blur-md px-2 py-0.5 text-[10px] uppercase tracking-wider",
                  categoryStyle.bg,
                  categoryStyle.color
                )}
              >
                {categoryStyle.name}
              </Badge>

              {liveActivity.lugar.google_score && (
                <div className="flex items-center gap-1 text-amber-400 font-bold text-xs bg-black/30 backdrop-blur-md px-2 py-0.5 rounded-full">
                  ★ {liveActivity.lugar.google_score.toFixed(1)}
                </div>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight shadow-black drop-shadow-sm">
              {liveActivity.lugar.nombre}
            </h2>
            <p className="text-sm opacity-90 flex items-center gap-1.5 mt-1 text-gray-200">
              <MapPin className="h-3.5 w-3.5" />{" "}
              {liveActivity.lugar.mexican_state}
            </p>
          </div>

          <DialogClose className="absolute top-4 right-4 rounded-full bg-black/20 p-2 text-white hover:bg-white hover:text-black transition-all backdrop-blur-sm">
            <span className="sr-only">Cerrar</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </DialogClose>
        </div>

        <div className="p-6 bg-background max-h-[60vh] overflow-y-auto">
          {liveActivity.lugar.descripcion && (
            <>
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                <p>{liveActivity.lugar.descripcion}</p>
              </div>

              <Separator className="my-6 bg-border/50" />
            </>
          )}

          <div className="mb-6">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 block flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" /> Planificación del Tiempo
            </Label>
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border bg-muted/20">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Llegada
                </Label>
                <Input
                  type="time"
                  className="bg-background border-border/50 focus-visible:ring-primary/30 font-mono text-sm h-10"
                  value={liveActivity.start_time || ""}
                  onChange={(e) =>
                    onUpdate(liveActivity.id, { start_time: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Salida
                </Label>
                <Input
                  type="time"
                  className="bg-background border-border/50 focus-visible:ring-primary/30 font-mono text-sm h-10"
                  value={liveActivity.end_time || ""}
                  onChange={(e) =>
                    onUpdate(liveActivity.id, { end_time: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <Separator className="my-6 bg-border/50" />

          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2 text-sm text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Para completar tu día
            </h4>
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex gap-3 items-start">
              <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground">
                  ¿Buscas qué hacer cerca de{" "}
                  <strong>{liveActivity.lugar.nombre}</strong>?
                </p>
                <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
                  Usa el botón <strong>"+ Agregar Lugar"</strong> para buscar
                  más opciones.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 bg-muted/30 border-t border-border/50 flex justify-end">
          <Button
            onClick={onClose}
            className="px-6 rounded-full shadow-sm font-semibold"
          >
            Listo
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
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  const [isRedirecting, setIsRedirecting] = useState(false);
  // <<<<<<< HEAD
  //   const Mapa = useMemo(
  //     () =>
  //       dynamic(
  //         () => import("@/components/map"), // Ruta a tu componente de mapa
  //         {
  //           loading: () => <p>Cargando mapa...</p>, // Opcional: un loader
  //           ssr: false, // ¡ESTO EVITA EL ERROR 'window is not defined'!
  //         }
  //       ),
  //     []
  //   ); // El array vacío asegura que solo se cargue una vez
  // =======
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [datesDialogOpen, setDatesDialogOpen] = useState(false);

  const [infoModalOpen, setInfoModalOpen] = useState(false);
  // FIX: Guardamos solo el ID para asegurar que leemos el estado fresco
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    null
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    // FIX: Añadir condición para no ejecutar durante la redirección del guardado.
    if (!meta && !isRedirecting) {
      toast.info("Configura tu viaje para comenzar.");
      router.push("/viajero/itinerarios/nuevo");
    }
  }, [meta, router, isRedirecting]);

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

  useEffect(() => {
    if (!days.length) return;
    if (!selectedDayKey || !days.some((d) => d.key === selectedDayKey)) {
      setSelectedDayKey(days[0].key);
    }
  }, [days, selectedDayKey]);

  const currentDay = days.find((d) => d.key === selectedDayKey) ?? null;

  const activitiesForCurrentDay = useMemo(() => {
    if (!currentDay) return [];
    return actividades.filter((a) => sameDayKey(a.fecha, currentDay.key));
    // Ordenamos por hora si lo deseas, o por índice si usas DnD manual
    // Por ahora dejamos orden manual (tal como vienen en el array) para DnD
  }, [actividades, currentDay]);

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
    setActivities([...otherItems, ...reordered]);
  }

  function handleAddLugar(lugar: LugarData) {
    if (!currentDay) {
      toast.error("Selecciona un día primero.");
      return;
    }
    if (activitiesForCurrentDay.length >= MAX_ACTIVITIES_PER_DAY) {
      toast.error(`Límite alcanzado`, {
        description: `Solo puedes agregar hasta ${MAX_ACTIVITIES_PER_DAY} lugares por día.`,
      });
      return;
    }

    if (
      activitiesForCurrentDay.some(
        (a) => a.lugar.id_api_place === lugar.id_api_place
      )
    ) {
      toast.warning("Este lugar ya está en el día actual.");
      return;
    }

    const act = createActivityFromLugar(lugar, currentDay.date);
    addActivity(act);
  }

  function handleViewDetails(id: string) {
    setSelectedActivityId(id);
    setInfoModalOpen(true);
  }

  function handleOptimize() {
    if (!currentDay) return;
    const items = activitiesForCurrentDay;
    if (items.length <= 2) return;

    setOptimizing(true);
    const remaining = [...items];
    const ordered: BuilderActivity[] = [remaining.shift()!];

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

    const key = currentDay.key;
    const other = actividades.filter((a) => !sameDayKey(a.fecha, key));
    setActivities([...other, ...ordered]);

    setTimeout(() => {
      setOptimizing(false);
      toast.success("Ruta optimizada");
    }, 400);
  }

  async function handleSave() {
    if (!meta || !actividades.length) return;
    setSaving(true);
    try {
      const payload = buildItineraryPayload(meta, actividades);
      await ItinerariosAPI.getInstance().createItinerario(payload);

      setIsRedirecting(true); // 1. Avisamos que vamos a redirigir
      toast.success("¡Itinerario creado!");
      router.push("/viajero/itinerarios"); // 2. Iniciamos la redirección
      useItineraryBuilderStore.getState().clear?.(); // 3. Limpiamos el estado
    } catch (error: any) {
      toast.error("Error al guardar", { description: error.message });
    } finally {
      setSaving(false);
    }
  }

  if (!meta) return null;

  const totalDays = differenceInCalendarDays(meta.end, meta.start) + 1;
  const isDayFull = activitiesForCurrentDay.length >= MAX_ACTIVITIES_PER_DAY;

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: { opacity: "0.5" },
      },
    }),
  };

  return (
    <>
      <PlaceInfoDialog
        isOpen={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        activityId={selectedActivityId} // Pasamos el ID
        allActivities={actividades} // Pasamos la lista completa
        onUpdate={updateActivity}
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

      <div className="flex h-[calc(100vh-4rem)] flex-col bg-background">
        <header className="z-20 flex shrink-0 flex-col gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight">
              {meta.title}
            </h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <Badge
                variant="outline"
                className="font-normal gap-1 rounded-sm px-1.5 py-0 h-5"
              >
                <CalendarDays className="h-3 w-3" />
                {totalDays} días
              </Badge>
              <span className="hidden sm:inline">•</span>
              <span className="truncate">
                {format(meta.start, "d MMM yyyy", { locale: es })} -{" "}
                {format(meta.end, "d MMM yyyy", { locale: es })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDatesDialogOpen(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <CalendarDays className="mr-2 h-3.5 w-3.5" /> Ajustar Fechas
            </Button>
            <div className="h-4 w-px bg-border mx-1 hidden sm:block" />
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
              Optimizar Ruta
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="min-w-[100px] shadow-sm"
            >
              {saving ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="mr-2 h-3.5 w-3.5" />
              )}
              Guardar
            </Button>
          </div>
        </header>

        <div className="relative flex flex-1 overflow-hidden">
          <div
            className={cn(
              "flex w-full flex-col border-r bg-background transition-all duration-300 md:w-[480px] lg:w-[520px] md:translate-x-0 absolute md:relative inset-0 z-10",
              mobileView === "list" ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <div className="border-b bg-muted/30 py-3 shadow-inner">
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex px-4 gap-3">
                  {days.map((d) => {
                    const isSelected = selectedDayKey === d.key;
                    const count = actividades.filter((a) =>
                      sameDayKey(a.fecha, d.key)
                    ).length;
                    return (
                      <button
                        key={d.key}
                        onClick={() => setSelectedDayKey(d.key)}
                        className={cn(
                          "flex flex-col items-start justify-between rounded-xl px-4 py-3 text-sm transition-all border min-w-[110px] h-[72px] group relative",
                          isSelected
                            ? "bg-background border-primary text-foreground shadow-md ring-1 ring-primary/10"
                            : "bg-background/60 border-transparent text-muted-foreground hover:bg-background hover:text-foreground hover:border-border/50"
                        )}
                      >
                        <div>
                          <span className="block font-bold text-xs uppercase tracking-wider mb-0.5">
                            {d.label}
                          </span>
                          <span className="block text-[10px] opacity-70 font-medium">
                            {d.subtitle}
                          </span>
                        </div>

                        <div className="flex gap-1 mt-auto">
                          {count > 0 ? (
                            Array.from({ length: count }).map((_, i) => (
                              <div
                                key={i}
                                className="h-1.5 w-1.5 rounded-full bg-primary"
                              />
                            ))
                          ) : (
                            <span className="text-[9px] text-muted-foreground/50 italic">
                              Sin planes
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <ScrollBar orientation="horizontal" className="invisible" />
              </ScrollArea>
            </div>

            <div className="flex-1 overflow-hidden bg-muted/5 relative">
              <ScrollArea className="h-full">
                <div className="p-4 pb-32">
                  <div className="mb-5 flex items-center justify-between bg-background p-3 rounded-xl border shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                        {activitiesForCurrentDay.length}
                      </div>
                      <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Lugares en tu ruta
                      </span>
                    </div>

                    {isDayFull ? (
                      <span className="text-[10px] text-amber-600 font-medium flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                        <AlertCircle className="h-3 w-3" /> Día completo (
                        {MAX_ACTIVITIES_PER_DAY} máx)
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        className="h-9 text-xs font-semibold px-4 shadow-sm"
                        onClick={() => setSearchDialogOpen(true)}
                      >
                        <Plus className="mr-1.5 h-4 w-4" /> Agregar Lugar
                      </Button>
                    )}
                  </div>

                  {!activitiesForCurrentDay.length && !isDayFull ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center opacity-60">
                      <div className="p-4 rounded-full bg-muted mb-2">
                        <MapPin className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        Tu día está libre
                      </p>
                      <p className="text-xs text-muted-foreground max-w-[200px]">
                        Usa el botón de arriba para empezar a añadir lugares.
                      </p>
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
                        <div className="flex flex-col pb-4">
                          {activitiesForCurrentDay.map((act, index) => (
                            <SortableActivityCard
                              key={act.id}
                              activity={act}
                              index={index}
                              onChange={(id, patch) =>
                                updateActivity(id, patch)
                              }
                              onDelete={(id) => removeActivity(id)}
                              onViewDetails={handleViewDetails}
                            />
                          ))}
                        </div>
                      </SortableContext>
                      <DragOverlay dropAnimation={dropAnimation} />
                    </DndContext>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          <div
            className={cn(
              "absolute inset-0 z-0 w-full bg-muted transition-all duration-300 md:relative md:block",
              mobileView === "map"
                ? "translate-x-0 block"
                : "translate-x-full hidden md:translate-x-0"
            )}
          >
            <div className="h-full w-full">
              <CinematicMap
                activities={mapActivities}
                days={days}
                selectedDayKey={selectedDayKey}
                onSelectDay={(key) => setSelectedDayKey(key)}
              />
            </div>
          </div>

          <div className="absolute bottom-6 left-1/2 z-50 -translate-x-1/2 md:hidden">
            <div className="flex items-center rounded-full border bg-background/90 p-1 shadow-lg backdrop-blur-md">
              <button
                onClick={() => setMobileView("list")}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all",
                  mobileView === "list"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <List className="h-3.5 w-3.5" /> Lista
              </button>
              <button
                onClick={() => setMobileView("map")}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all",
                  mobileView === "map"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <MapIcon className="h-3.5 w-3.5" /> Mapa
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
