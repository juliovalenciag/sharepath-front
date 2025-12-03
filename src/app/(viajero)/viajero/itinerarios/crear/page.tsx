// src/app/(viajero)/viajero/itinerarios/crear/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import dynamic from "next/dynamic";
import { format, eachDayOfInterval } from "date-fns";
import { es } from "date-fns/locale";
import { arrayMove } from "@dnd-kit/sortable";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Imports Lógica
import {
  useItineraryBuilderStore,
  buildItineraryPayload,
  BuilderActivity,
} from "@/lib/itinerary-builder-store";
import { ItinerariosAPI } from "@/api/ItinerariosAPI";
import { REGIONS_DATA } from "@/lib/constants/regions";
import { cn } from "@/lib/utils";

// Componentes Presentacionales (Refactorizados)
import { ItineraryHeader } from "./components/ItineraryHeader";
import { DaySelector } from "./components/DaySelector";
import { ActivityListPanel } from "./components/ActivityListPanel";
import { MobileViewToggle } from "./components/MobileViewToggle";

// Modals
import { ItinerarySetupDialog } from "./components/ItinerarySetupDialog";
import { PlaceSearchDialog } from "./components/PlacesSearchDialog";
import { PlaceInfoDialog } from "./components/PlaceInfoDialog";

// Mapa Dinámico
const CinematicMap = dynamic(
  () => import("./components/CinematicMap").then((mod) => mod.CinematicMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-muted/20 animate-pulse flex flex-col items-center justify-center text-muted-foreground gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-sm">Inicializando mapa...</span>
      </div>
    ),
  }
);

// --- UTILIDADES ---
function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * R;
}

export default function CrearItinerarioPage() {
  const router = useRouter();

  // --- 1. STORE & ESTADO ---
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

  // Estados UI Locales
  const [setupOpen, setSetupOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    null
  );
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [saving, setSaving] = useState(false);

  // --- 2. EFECTOS & MEMOS ---

  // Inicializar Setup si no hay datos
  useEffect(() => {
    if (hasHydrated && !meta) setSetupOpen(true);
  }, [hasHydrated, meta]);

  // Generar lista de días
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
  }, [meta]);

  // Autoseleccionar primer día
  useEffect(() => {
    if (days.length > 0 && !selectedDayKey) setSelectedDayKey(days[0].key);
  }, [days, selectedDayKey]);

  // Filtrar actividades activas
  const currentDayActivities = useMemo(() => {
    if (!selectedDayKey) return [];
    return actividades.filter(
      (a) => format(a.fecha, "yyyy-MM-dd") === selectedDayKey
    );
  }, [actividades, selectedDayKey]);

  const currentDay = days.find((d) => d.key === selectedDayKey) || null;

  const initialMapCenter = useMemo(() => {
    if (!meta?.regions[0]) return undefined;
    const region = REGIONS_DATA[meta.regions[0]];
    return region ? { lat: region.lat, lng: region.lng } : undefined;
  }, [meta]);

  // --- 3. LOGICA DE NEGOCIO ---

  const handleReset = () => {
    if (confirm("¿Borrar todo el itinerario? Esta acción es irreversible.")) {
      reset();
      setSetupOpen(true);
    }
  };

  const handleSave = async () => {
    if (!meta) return;
    if (actividades.length === 0) {
      toast.error("Itinerario vacío", {
        description: "Agrega al menos un lugar.",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = buildItineraryPayload(meta, actividades);
      await ItinerariosAPI.getInstance().createItinerario(payload);
      toast.success("¡Guardado exitosamente!");
      reset();
      router.push("/viajero/itinerarios");
    } catch (error: any) {
      toast.error("Error al guardar", { description: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleOptimize = () => {
    if (!currentDay || currentDayActivities.length < 3) return;

    // Algoritmo Greedy
    const items = [...currentDayActivities];
    const optimized = [items.shift()!]; // Fija el primero

    while (items.length > 0) {
      const last = optimized[optimized.length - 1];
      let bestIdx = -1,
        minDist = Infinity;

      items.forEach((cand, i) => {
        const d = distanceKm(
          last.lugar.latitud,
          last.lugar.longitud,
          cand.lugar.latitud,
          cand.lugar.longitud
        );
        if (d < minDist) {
          minDist = d;
          bestIdx = i;
        }
      });

      if (bestIdx !== -1) optimized.push(items.splice(bestIdx, 1)[0]);
    }

    const others = actividades.filter(
      (a) => format(a.fecha, "yyyy-MM-dd") !== selectedDayKey
    );
    setActivities([...others, ...optimized]);
    toast.success("Ruta optimizada");
  };

  // --- 4. DRAG AND DROP ---
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

  if (!hasHydrated) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {/* MODALS GESTIONADOS POR EL PADRE */}
      <ItinerarySetupDialog open={setupOpen} onOpenChange={setSetupOpen} />

      <PlaceSearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        currentDay={currentDay}
        defaultState={meta?.regions[0]}
        onAddLugarToDay={(lugar) => {
          if (!currentDay) return;
          addActivity({
            id: crypto.randomUUID(),
            fecha: currentDay.date,
            descripcion: lugar.descripcion || "",
            lugar: lugar as any,
            start_time: null,
            end_time: null,
          });
          toast.success("Lugar agregado");
        }}
      />

      <PlaceInfoDialog
        isOpen={infoOpen}
        onClose={() => setInfoOpen(false)}
        activityId={selectedActivityId}
        allActivities={actividades}
        onUpdate={updateActivity}
      />

      <div className="flex h-[calc(100vh-4rem)] flex-col bg-background text-foreground">
        {/* 1. HEADER */}
        {meta && (
          <ItineraryHeader
            meta={meta}
            onEditSetup={() => setSetupOpen(true)}
            onReset={handleReset}
            onOptimize={handleOptimize}
            onSave={handleSave}
            isSaving={saving}
            canOptimize={currentDayActivities.length >= 3}
          />
        )}

        {/* 2. AREA DE TRABAJO */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* PANEL IZQUIERDO: LISTA */}
          <aside
            className={cn(
              "flex flex-col w-full md:w-[420px] lg:w-[480px] bg-background border-r transition-transform duration-300 absolute md:relative h-full z-10",
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

          {/* PANEL DERECHO: MAPA */}
          <main
            className={cn(
              "flex-1 relative transition-transform duration-300 absolute md:relative inset-0 bg-muted/20",
              mobileView === "map"
                ? "translate-x-0"
                : "translate-x-full md:translate-x-0"
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

          {/* 3. TOGGLE MÓVIL */}
          <MobileViewToggle view={mobileView} onChange={setMobileView} />
        </div>
      </div>
    </>
  );
}
