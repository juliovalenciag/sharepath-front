// src/app/(viajero)/viajero/itinerarios/[id]/editar/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format, addDays, differenceInCalendarDays } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

import { ItinerariosAPI } from "@/api/ItinerariosAPI";
import type { ItinerarioData, LugarData } from "@/api/interfaces/ApiRoutes";

import { ItineraryHeader } from "../crear/components/ItineraryHeader";
import { DaySelector, DayInfo } from "../crear/components/DaySelector";
import { ActivityListPanel } from "../crear/components/ActivityListPanel";
import { CinematicMap, MapActivity } from "../crear/components/CinematicMap";
import { MobileViewToggle } from "../crear/components/MobileViewToggle";
import { PlaceInfoDialog } from "../crear/components/PlaceInfoDialog";
import { PlaceSearchDialog } from "../crear/components/PlacesSearchDialog";
import { ItinerarySetupDialog } from "../crear/components/ItinerarySetupDialog";

import { useItineraryBuilderStore } from "@/lib/itinerary-builder-store";
import {
  buildMetaFromItinerario,
  buildBuilderActivitiesFromItinerario,
  buildRequestFromBuilder,
} from "@/lib/itinerary-mappers";

import type { BuilderActivity } from "@/lib/itinerary-builder-store";
import { DragEndEvent, DragStartEvent } from "@dnd-kit/core";

export default function EditItineraryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const api = ItinerariosAPI.getInstance();

  const {
    meta,
    actividades,
    setMeta,
    setAllActivities, // 👈 Necesitarás agregar esto en tu store
    reorderActivities, // 👈 Igual que en crear (reordenar dentro de un día)
    removeActivity,
    resetAll, // 👈 Limpia el builder (opcional pero útil)
  } = useItineraryBuilderStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [placeInfoId, setPlaceInfoId] = useState<string | null>(null);

  // ====== CARGA INICIAL DEL ITINERARIO ======
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const id = params.id;
        const it: ItinerarioData = await api.getItinerarioById(id);

        // 1) Traer info de lugares
        const lugaresIds = Array.from(
          new Set(it.actividades.map((a) => a.lugarId))
        );

        const lugaresResponses = await Promise.all(
          lugaresIds.map((lid) => api.getLugarById(lid))
        );

        const lugaresById: Record<string, LugarData> = {};
        lugaresResponses.forEach((l) => {
          lugaresById[l.id_api_place] = l;
        });

        // 2) Armar meta y actividades del builder
        const newMeta = buildMetaFromItinerario(
          it,
          it.actividades,
          lugaresById
        );
        const builderActs = buildBuilderActivitiesFromItinerario(
          it.actividades,
          lugaresById
        );

        // 3) Mandar al store
        setMeta(newMeta);
        setAllActivities(builderActs); // acción nueva que reemplaza todas las actividades

        // 4) Día seleccionado inicial
        const firstDayKey = format(newMeta.start, "yyyy-MM-dd");
        setSelectedDayKey(firstDayKey);
      } catch (err: any) {
        console.error(err);
        toast.error("No se pudo cargar el itinerario", {
          description: err?.message || "Intenta más tarde.",
        });
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    // Opcional: limpiar state previo
    resetAll?.();

    void load();
  }, [params.id]);

  // ====== DÍAS DEL ITINERARIO (DaySelector + CinematicMap) ======
  const days: DayInfo[] = useMemo(() => {
    if (!meta?.start || !meta?.end) return [];
    const diff = differenceInCalendarDays(meta.end, meta.start);
    const arr: DayInfo[] = [];

    for (let i = 0; i <= diff; i++) {
      const d = addDays(meta.start, i);
      arr.push({
        key: format(d, "yyyy-MM-dd"),
        date: d,
        label: `Día ${i + 1}`,
        subtitle: format(d, "d MMM", { locale: es }),
      });
    }

    return arr;
  }, [meta?.start, meta?.end]);

  // Día actual
  const currentDay = useMemo(
    () => days.find((d) => d.key === selectedDayKey) || null,
    [days, selectedDayKey]
  );

  // Actividades del día actual
  const currentDayActivities: BuilderActivity[] = useMemo(() => {
    if (!currentDay) return [];
    return actividades.filter(
      (a) => format(a.fecha, "yyyy-MM-dd") === currentDay.key
    );
  }, [actividades, currentDay]);

  // Datos para el mapa
  const mapActivities: MapActivity[] = useMemo(() => {
    return actividades.map((a) => ({
      id: a.id,
      nombre: a.lugar.nombre,
      lat: a.lugar.latitud,
      lng: a.lugar.longitud,
      fecha: a.fecha,
      start_time: a.start_time,
    }));
  }, [actividades]);

  // ====== HANDLERS DnD ======
  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);
    if (!over || active.id === over.id || !currentDay) return;

    reorderActivities?.(currentDay.key, String(active.id), String(over.id));
  };

  // ====== HANDLERS UI ======

  const handleReset = () => {
    // Este reset es solo del builder, no borra en backend
    if (confirm("¿Quieres limpiar el itinerario actual del editor?")) {
      resetAll?.();
      if (meta?.start) {
        setSelectedDayKey(format(meta.start, "yyyy-MM-dd"));
      }
    }
  };

  const handleOptimize = async () => {
    // Aquí reusas la lógica que ya tengas en la página de crear
    // (usar /itinerario/optimization + update en el store)
    // Por ahora solo disparo un toast para que sepas dónde conectar
    toast.info("Pendiente: integrar optimizeRoute en el editor.");
  };

  const handleSave = async () => {
    if (!meta) {
      toast.error("Falta configurar el itinerario.");
      setShowSetupDialog(true);
      return;
    }

    try {
      setIsSaving(true);
      const body = buildRequestFromBuilder(meta, actividades);
      await api.updateItinerario(params.id, body);
      toast.success("Itinerario actualizado correctamente.");
      router.push("/viajero/itinerarios"); // o a la vista de detalle
    } catch (err: any) {
      console.error(err);
      toast.error("No se pudo guardar el itinerario", {
        description: err?.message || "Intenta nuevamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPlaceClick = () => {
    if (!currentDay) {
      toast.error("Selecciona primero un día para agregar lugares.");
      return;
    }
    setShowSearchDialog(true);
  };

  const handleSelectDay = (key: string) => {
    setSelectedDayKey(key);
  };

  const handleAddLugarToDay = (lugar: LugarData) => {
    if (!currentDay) return;
    // Idealmente reusarías la misma acción que en crear:
    // p.ej. addActivityForDay(currentDay.key, lugar)
    useItineraryBuilderStore
      .getState()
      .addActivityForDay?.(currentDay.key, lugar);
  };

  // ====== RENDER ======

  if (isLoading || !meta) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando itinerario...</p>
      </div>
    );
  }

  return (
    <>
      {/* Modal de configuración (reutilizado) */}
      <ItinerarySetupDialog
        open={showSetupDialog}
        onOpenChange={setShowSetupDialog}
      />

      {/* Modal de búsqueda de lugares (reutilizado) */}
      <PlaceSearchDialog
        open={showSearchDialog}
        onOpenChange={setShowSearchDialog}
        currentDay={currentDay}
        onAddLugarToDay={handleAddLugarToDay}
      />

      {/* Modal de información del lugar (reutilizado) */}
      <PlaceInfoDialog
        isOpen={!!placeInfoId}
        onClose={() => setPlaceInfoId(null)}
        activityId={placeInfoId}
        allActivities={actividades}
        onUpdate={(id, patch) => {
          // Si en tu store ya tienes algo como updateActivity, úsalo aquí
          useItineraryBuilderStore.getState().updateActivity?.(id, patch);
        }}
      />

      {/* Toggle móvil lista/mapa */}
      <MobileViewToggle view={mobileView} onChange={setMobileView} />

      <div className="flex h-full flex-col">
        {/* HEADER */}
        <ItineraryHeader
          meta={meta}
          onEditSetup={() => setShowSetupDialog(true)}
          onReset={handleReset}
          onOptimize={handleOptimize}
          onSave={handleSave}
          isSaving={isSaving}
          canOptimize={actividades.length > 1}
        />

        {/* BODY */}
        <div className="flex flex-1 overflow-hidden">
          {/* COLUMNA IZQUIERDA: Días + Lista */}
          <div className="flex w-full flex-col md:w-[420px] lg:w-[460px] border-r bg-muted/10">
            <DaySelector
              days={days}
              selectedDayKey={selectedDayKey}
              onSelect={handleSelectDay}
            />
            <div className="flex-1 min-h-0">
              <ActivityListPanel
                activities={currentDayActivities}
                currentDayLabel={currentDay?.label ?? null}
                onAddPlace={handleAddPlaceClick}
                onRemoveActivity={removeActivity}
                onViewDetails={setPlaceInfoId}
                onDragEnd={handleDragEnd}
                onDragStart={handleDragStart}
                activeDragId={activeDragId}
              />
            </div>
          </div>

          {/* COLUMNA DERECHA: Mapa */}
          <div className="hidden md:block flex-1">
            <CinematicMap
              activities={mapActivities}
              days={days}
              selectedDayKey={selectedDayKey}
              onSelectDay={setSelectedDayKey}
            />
          </div>

          {/* En móvil, decide si mostrar mapa o lista (lista ya se muestra arriba) */}
          {mobileView === "map" && (
            <div className="md:hidden absolute inset-x-0 bottom-0 top-[56px]">
              <CinematicMap
                activities={mapActivities}
                days={days}
                selectedDayKey={selectedDayKey}
                onSelectDay={setSelectedDayKey}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
