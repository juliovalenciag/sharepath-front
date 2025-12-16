"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import dynamic from "next/dynamic";
import { format, eachDayOfInterval } from "date-fns";
import { es } from "date-fns/locale";
import { arrayMove } from "@dnd-kit/sortable";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";

// Imports Lógica
import {
  useItineraryBuilderStore,
  buildItineraryPayload,
  BuilderActivity,
} from "@/lib/itinerary-builder-store";
import { ItinerariosAPI } from "@/api/ItinerariosAPI";
import { REGIONS_DATA } from "@/lib/constants/regions";
import { cn } from "@/lib/utils";

// Componentes UI
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
import { Progress } from "@/components/ui/progress";

// Componentes Presentacionales
import { ItineraryHeader } from "./components/ItineraryHeader";
import { DaySelector } from "./components/DaySelector";
import { ActivityListPanel } from "./components/ActivityListPanel";
import { MobileViewToggle } from "./components/MobileViewToggle";

// Modals
import { ItinerarySetupDialog } from "./components/ItinerarySetupDialog";
import { PlaceSearchDialog } from "./components/PlacesSearchDialog";
import { PlaceInfoDialog } from "./components/PlaceInfoDialog";

// Mapa Dinámico (Lazy Loading Optimizado)
const CinematicMap = dynamic(
  () => import("./components/CinematicMap").then((mod) => mod.CinematicMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-muted/10 animate-pulse flex flex-col items-center justify-center text-muted-foreground gap-3">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          <Loader2 className="h-10 w-10 animate-spin text-primary relative z-10" />
        </div>
        <span className="text-xs font-medium tracking-widest uppercase opacity-70">
          Cargando Mapa...
        </span>
      </div>
    ),
  }
);

// --- UTILIDADES (TSP Greedy) ---
function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * R;
}

export default function CrearItinerarioPage() {
  const router = useRouter();

  // --- 1. STORE & ESTADO GLOBAL ---
  const {
    meta,
    actividades,
    hasHydrated,
    setActivities,
    addActivity,
    removeActivity,
    updateActivity,
    reset,
  } = useItineraryBuilderStore(useShallow((s) => s));

  // --- 2. ESTADOS UI LOCALES ---
  const [setupOpen, setSetupOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [saveAlertOpen, setSaveAlertOpen] = useState(false); // Alerta para días vacíos

  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    null
  );
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  // Procesos
  const [saving, setSaving] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // --- 3. EFECTOS DE INICIALIZACIÓN ---

  // Efecto: Hidratación y Setup Inicial
  useEffect(() => {
    if (hasHydrated) {
      // Pequeño delay para transiciones suaves de entrada
      setTimeout(() => setIsReady(true), 100);
      if (!meta) setSetupOpen(true);
    }
  }, [hasHydrated, meta]);

  // Memo: Generación de Días
  const days = useMemo(() => {
    if (!meta?.start || !meta?.end) return [];
    try {
      return eachDayOfInterval({ start: meta.start, end: meta.end }).map(
        (date, idx) => ({
          key: format(date, "yyyy-MM-dd"),
          date,
          label: `Día ${idx + 1}`,
          subtitle: format(date, "d MMM", { locale: es }),
        })
      );
    } catch {
      return [];
    }
  }, [meta?.start, meta?.end]);

  // Efecto: Autoselección de día
  useEffect(() => {
    if (
      days.length > 0 &&
      (!selectedDayKey || !days.find((d) => d.key === selectedDayKey))
    ) {
      setSelectedDayKey(days[0].key);
    }
  }, [days, selectedDayKey]);

  // Memo: Actividades filtradas por día
  const currentDayActivities = useMemo(() => {
    if (!selectedDayKey) return [];
    return actividades.filter(
      (a) => format(a.fecha, "yyyy-MM-dd") === selectedDayKey
    );
  }, [actividades, selectedDayKey]);

  const currentDay = useMemo(
    () => days.find((d) => d.key === selectedDayKey) || null,
    [days, selectedDayKey]
  );

  // Memo: Centro del Mapa
  const initialMapCenter = useMemo(() => {
    if (!meta?.regions || meta.regions.length === 0) return undefined;
    const regionKey = meta.regions[0];
    // @ts-ignore
    const regionData = REGIONS_DATA[regionKey];
    return regionData
      ? { lat: regionData.lat, lng: regionData.lng }
      : undefined;
  }, [meta?.regions]);

  // Memo: Progreso del Viaje (Días con al menos 1 actividad)
  const tripProgress = useMemo(() => {
    if (days.length === 0) return 0;
    const filledDays = new Set(
      actividades.map((a) => format(a.fecha, "yyyy-MM-dd"))
    ).size;
    return (filledDays / days.length) * 100;
  }, [days, actividades]);

  // --- 4. LÓGICA DE NEGOCIO ---

  const handleResetDraft = useCallback(() => {
    reset();
    setSelectedActivityId(null);
    setInfoOpen(false);
    setSearchOpen(false);
    setSelectedDayKey(null);

    // opcional: reabrir setup para que sea “empezar de cero”
    setSetupOpen(true);

    toast.info("Borrador borrado. Puedes empezar de nuevo.");
  }, [reset]);

  // Pre-validación antes de guardar
  const handlePreSave = () => {
    if (!meta) return;

    // 1. Validar vacío total
    if (actividades.length === 0) {
      toast.error("Tu viaje está vacío", {
        description: "Agrega al menos un lugar para poder guardar.",
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      });
      return;
    }

    // 2. Validar días vacíos (Smart Check)
    const filledDaysCount = new Set(
      actividades.map((a) => format(a.fecha, "yyyy-MM-dd"))
    ).size;
    if (filledDaysCount < days.length) {
      setSaveAlertOpen(true); // Abrir modal de confirmación
    } else {
      executeSave(); // Todo lleno, guardar directo
    }
  };

  const executeSave = async () => {
    if (!meta) return;
    setSaveAlertOpen(false);
    setSaving(true);

    try {
      const payload = buildItineraryPayload(meta, actividades);
      await ItinerariosAPI.getInstance().createItinerario(payload);

      toast.success("¡Itinerario creado con éxito!", {
        description: "Redirigiendo a tu perfil...",
        duration: 3000,
      });

      // Delay para UX
      setTimeout(() => {
        reset();
        router.push("/viajero/itinerarios");
      }, 1500);
    } catch (error: any) {
      console.error(error);
      toast.error("No se pudo guardar", {
        description: error.message || "Error de conexión con el servidor.",
      });
      setSaving(false);
    }
  };
  const handleRuta = useCallback(async () => {
    console.log("Generando ruta automática...");
    const toastId = toast.loading("Buscando recomendaciones...");

    try {
      // 1. Calcular cuántos lugares faltan para tener 5 por día
      const dailyCounts: Record<string, number> = {};
      for (const day of days) {
        dailyCounts[day.key] = 0;
      }
      for (const activity of actividades) {
        const dayKey = format(activity.fecha, "yyyy-MM-dd");
        if (dayKey in dailyCounts) {
          dailyCounts[dayKey]++;
        }
      }

      let neededPlaces = 0;
      const slotsToFill: Date[] = [];
      for (const day of days) {
        const count = dailyCounts[day.key] || 0;
        if (count < 5) {
          const diff = 5 - count;
          neededPlaces += diff;
          for (let i = 0; i < diff; i++) {
            slotsToFill.push(day.date);
          }
        }
      }

      if (neededPlaces === 0) {
        toast.info("¡Itinerario completo!", {
          id: toastId,
          description: "Todos los días tienen 5 o más lugares.",
        });
        return;
      }

      // 2. Pedir recomendaciones
      const api = ItinerariosAPI.getInstance();
      const existingLugarIds = actividades.map((a) => a.lugar.id_api_place);

      const recommendations = await api.getRecommendations({
        lugarIds: existingLugarIds,
        limit: neededPlaces,
      });

      if (!recommendations || recommendations.length === 0) {
        toast.warning("No se encontraron recomendaciones", {
          id: toastId,
          description:
            "Intenta agregar más lugares para mejorar las sugerencias.",
        });
        return;
      }

      // 3. Asignar las recomendaciones a los días que faltan
      const newActivities: BuilderActivity[] = recommendations
        .slice(0, neededPlaces) // Asegurarse de no agregar más de lo necesario
        .map((lugar, index) => {
          const dateForActivity = slotsToFill[index];
          const newActivity: BuilderActivity = {
            id: crypto.randomUUID(),
            fecha: dateForActivity,
            descripcion: "Lugar recomendado automáticamente.",
            lugar: lugar as any, // RecommendedLugar es compatible con BuilderPlace
            start_time: null,
            end_time: null,
          };
          return newActivity;
        });

      // 4. Actualizar el store
      setActivities([...actividades, ...newActivities]);

      toast.success("Itinerario completado", {
        id: toastId,
        description: `Se agregaron ${newActivities.length} nuevos lugares.`,
      });
    } catch (error: any) {
      toast.error("Error al buscar recomendaciones", {
        id: toastId,
        description: error?.message || "No se pudo conectar con el servidor.",
      });
    }
  }, [days, actividades, setActivities]);
  const handleOptimize = useCallback(async () => {
    if (!currentDay || currentDayActivities.length < 3) {
      toast.warning("Optimización no disponible", {
        description:
          "Necesitas al menos 3 lugares en este día para calcular una ruta.",
      });
      return;
    }

    const toastId = toast.loading("Calculando mejor ruta...");

    // Simular cálculo complejo (UX)
    await new Promise((r) => setTimeout(r, 800));

    try {
      const items = [...currentDayActivities];
      // Algoritmo: Mantiene el primer lugar fijo (Hotel/Punto de partida)
      const startNode = items.shift()!;
      const optimizedPath: BuilderActivity[] = [startNode];

      while (items.length > 0) {
        const current = optimizedPath[optimizedPath.length - 1];
        let bestIdx = -1;
        let minDist = Infinity;

        items.forEach((cand, i) => {
          const d = distanceKm(
            current.lugar.latitud,
            current.lugar.longitud,
            cand.lugar.latitud,
            cand.lugar.longitud
          );
          if (d < minDist) {
            minDist = d;
            bestIdx = i;
          }
        });

        if (bestIdx !== -1) {
          optimizedPath.push(items.splice(bestIdx, 1)[0]);
        }
      }

      const others = actividades.filter(
        (a) => format(a.fecha, "yyyy-MM-dd") !== selectedDayKey
      );
      setActivities([...others, ...optimizedPath]);

      toast.success("Ruta Optimizada", {
        id: toastId,
        description: "Ordenamos los lugares por cercanía.",
      });
    } catch (e) {
      toast.error("Error al optimizar", { id: toastId });
    }
  }, [
    currentDay,
    currentDayActivities,
    actividades,
    selectedDayKey,
    setActivities,
  ]);

  // --- 5. DRAG & DROP ---
  const handleDragEnd = (event: any) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over || active.id === over.id || !currentDay) return;

    const oldIndex = currentDayActivities.findIndex((a) => a.id === active.id);
    const newIndex = currentDayActivities.findIndex((a) => a.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(currentDayActivities, oldIndex, newIndex);
      const others = actividades.filter(
        (a) => format(a.fecha, "yyyy-MM-dd") !== selectedDayKey
      );
      setActivities([...others, ...reordered]);
    }
  };

  // --- RENDER ---

  if (!hasHydrated || !isReady) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Preparando tu estudio de viaje...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* --- MODALS & DIALOGS --- */}

      {/* 1. Setup Inicial */}
      <ItinerarySetupDialog open={setupOpen} onOpenChange={setSetupOpen} />

      {/* 2. Búsqueda de Lugares */}
      <PlaceSearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        currentDay={currentDay}
        allDays={days}
        onSelectDay={setSelectedDayKey}
        defaultState={meta?.regions[0]}
        onAddLugarToDay={(lugar) => {
          if (!currentDay) return;
          addActivity({
            id: crypto.randomUUID(),
            fecha: currentDay.date,
            descripcion: "",
            lugar: lugar as any,
            start_time: null,
            end_time: null,
          });
          toast.success("Agregado al plan", { icon: "📍" });
        }}
      />

      {/* 3. Detalles de Lugar */}
      <PlaceInfoDialog
        isOpen={infoOpen}
        onClose={() => setInfoOpen(false)}
        activityId={selectedActivityId}
        allActivities={actividades}
        onUpdate={updateActivity}
      />

      {/* 4. Alerta de Guardado (Días Vacíos) */}
      <AlertDialog open={saveAlertOpen} onOpenChange={setSaveAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-5 w-5" /> Tienes días libres
            </AlertDialogTitle>
            <AlertDialogDescription>
              Algunos días de tu itinerario no tienen actividades asignadas.
              ¿Deseas guardar el itinerario así o prefieres seguir editando?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>
              Seguir editando
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeSave}
              disabled={saving}
              className="bg-primary"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Guardar de todos modos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- LAYOUT PRINCIPAL --- */}
      <div className="flex h-[calc(100vh-4rem)] flex-col bg-background text-foreground overflow-hidden animate-in fade-in duration-500">
        {/* Barra de Progreso (Sutil) */}
        <div className="w-full bg-muted h-1">
          <div
            className="h-full bg-primary transition-all duration-1000 ease-out"
            style={{ width: `${tripProgress}%` }}
          />
        </div>

        {/* Header */}
        {meta && (
          <ItineraryHeader
            meta={meta}
            mode="create"
            onEditSetup={() => setSetupOpen(true)}
            onResetDraft={handleResetDraft}
            onOptimize={handleOptimize}
            onSave={handlePreSave}
            onRuta={handleRuta}
            isSaving={saving}
            canOptimize={currentDayActivities.length >= 3}
          />
        )}
        {/* Workspace Split */}
        <div className="flex flex-1 overflow-hidden relative group/canvas">
          {/* PANEL IZQUIERDO */}
          <aside
            className={cn(
              "flex flex-col w-full md:w-[440px] lg:w-[500px] bg-background border-r transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] absolute md:relative h-full z-20 shadow-2xl md:shadow-none",
              mobileView === "list"
                ? "translate-x-0"
                : "-translate-x-full md:translate-x-0"
            )}
          >
            <DaySelector
              days={days}
              selectedDayKey={selectedDayKey}
              onSelect={setSelectedDayKey}
            />

            <ActivityListPanel
              activities={currentDayActivities}
              currentDayLabel={currentDay?.label || null}
              onAddPlace={() => setSearchOpen(true)}
              onRemoveActivity={removeActivity}
              onViewDetails={(id) => {
                setSelectedActivityId(id);
                setInfoOpen(true);
              }}
              onDragStart={(e) => setActiveDragId(e.active.id as string)}
              onDragEnd={handleDragEnd}
              activeDragId={activeDragId}
            />
          </aside>

          {/* PANEL DERECHO (MAPA) */}
          <main
            className={cn(
              "flex-1 relative transition-all duration-500 ease-in-out absolute md:relative inset-0 bg-muted/10 z-10",
              mobileView === "map"
                ? "translate-x-0 opacity-100"
                : "translate-x-full opacity-0 md:translate-x-0 md:opacity-100"
            )}
          >
            <CinematicMap
              activities={actividades.map((a) => ({
                id: a.id,
                nombre: a.lugar.nombre,
                lat: a.lugar.latitud,
                lng: a.lugar.longitud,
                fecha: a.fecha,
                start_time: null,
              }))}
              days={days}
              selectedDayKey={selectedDayKey}
              onSelectDay={setSelectedDayKey}
              // @ts-ignore
              initialCenter={initialMapCenter}
            />
          </main>

          {/* Toggle Móvil */}
          <MobileViewToggle view={mobileView} onChange={setMobileView} />
        </div>
      </div>
    </>
  );
}
