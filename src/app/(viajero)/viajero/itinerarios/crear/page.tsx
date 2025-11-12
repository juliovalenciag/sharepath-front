"use client";
import React from "react";
import dynamic from "next/dynamic";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CalendarDays,
  Map as MapIcon,
  Settings2,
  Trash2,
  X,
} from "lucide-react";
import { useItineraryStore } from "@/lib/useItineraryStore";
import {
  PLACES,
  suggestPlacesByRadius,
  centerForStates,
  Place,
} from "@/lib/constants/mock-itinerary-data";
import MapSearchBar from "@/components/viajero/map/MapSearchBar";
import { MapResultsPanel } from "@/components/viajero/map/MapResultsPanel";
import PlaceInfoPanel from "@/components/viajero/map/PlaceInfoPanel";
import DiaDetalle from "@/components/DiaDetalle";
import DaySummary from "@/components/viajero/editor/DaySummary";
import { Card } from "@/components/ui/card";
import { TripHeader } from "@/components/viajero/editor/TripHeader";

const Mapa = dynamic(() => import("@/components/viajero/map/Mapa"), {
  ssr: false,
});

function SortableDiaDetalle({ place }: { place: Place }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: place.id_api_place });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "none" as const,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <DiaDetalle place={place} />
    </div>
  );
}

export default function Page() {
  const {
    days,
    activeDayId,
    setActiveDay,
    addDay,
    removeActiveDay,
    optimizeDayOrder,
    suggestForActive,
    setSelectedPlace,
    selectedPlaceId,
    setFilters,
    filters,
    showMapOnMobile,
    toggleMapMobile,
    states,
    activeDay,
    initDraft,
  } = useItineraryStore();

  // init si no hay días
  React.useEffect(() => {
    if (!days.length) initDraft({ days: 2 });
  }, [days.length, initDraft]);

  const day = activeDay();
  const safePlaces = day?.places ?? [];

  // DnD
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  function onDragEnd(e: any) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = safePlaces.findIndex((p) => p.id_api_place === active.id);
    const newIndex = safePlaces.findIndex((p) => p.id_api_place === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    useItineraryStore
      .getState()
      .movePlaceWithinDay(activeDayId, oldIndex, newIndex);
  }

  // Búsqueda: results solo si hay query/filtro
  const hasQuery = Boolean(filters.q.trim() || filters.category);
  const center = centerForStates(states);
  const results = React.useMemo(() => {
    if (!hasQuery) return [];
    return suggestPlacesByRadius(
      states,
      filters.radiusKm,
      filters.q,
      filters.category as any
    ).slice(0, 60);
  }, [states, filters, hasQuery]);

  const markers = hasQuery ? results : []; // mapa limpio si no hay query
  const [placeOpen, setPlaceOpen] = React.useState<Place | null>(null);
  React.useEffect(() => {
    if (!selectedPlaceId) return setPlaceOpen(null);
    const p = PLACES.find((x) => x.id_api_place === selectedPlaceId) || null;
    setPlaceOpen(p);
  }, [selectedPlaceId]);

  return (
    <div className="flex h-[calc(100dvh-64px)] overflow-hidden">
      {/* IZQUIERDA: 55% para aire visual */}
      <div className="w-full lg:w-[55%] h-full overflow-y-auto">
        <TripHeader
          title="Editor de itinerario"
          subtitle="Ajusta tu plan por días"
        />

        {/* acciones */}
        <div className="flex items-center gap-2 justify-center p-3">
          <Button
            variant="secondary"
            className="hidden sm:inline-flex"
            onClick={() => suggestForActive()}
          >
            <CalendarDays className="size-4 mr-1" /> Sugerir ruta
          </Button>
          <Separator orientation="vertical" className="h-4 hidden sm:block" />
          <Button
            variant="secondary"
            className="hidden sm:inline-flex"
            onClick={() => optimizeDayOrder(activeDayId)}
          >
            <Settings2 className="size-4 mr-1" /> Optimizar orden
          </Button>
          <Separator orientation="vertical" className="h-4 hidden sm:block" />
          <Button variant="ghost" size="sm" onClick={() => addDay()}>
            + Añadir día
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (days.length > 1 && confirm("¿Eliminar el día activo?"))
                removeActiveDay();
            }}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-1" /> Eliminar día
          </Button>
          <div className="ml-auto lg:hidden">
            <Button
              size="sm"
              variant="outline"
              onClick={() => toggleMapMobile(true)}
            >
              <MapIcon className="w-4 h-4 mr-1" /> Ver mapa
            </Button>
          </div>
        </div>

        {/* selector de días */}
        <div className="px-3">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {days.map((d, i) => (
              <Button
                key={`${d.id}-${i}`}
                variant={activeDayId === d.id ? "default" : "outline"}
                onClick={() => setActiveDay(d.id)}
                className="shrink-0"
              >
                {d.nombre} ({d.places.length})
              </Button>
            ))}
          </div>
        </div>

        {/* resumen compacto */}
        <DaySummary />

        {/* lista DnD */}
        <div role="list" aria-label="Lugares del día">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={safePlaces.map((p) => p.id_api_place)}
              strategy={verticalListSortingStrategy}
            >
              {safePlaces.length ? (
                safePlaces.map((p) => (
                  <SortableDiaDetalle key={p.id_api_place} place={p} />
                ))
              ) : (
                <Card className="m-3 p-4 text-sm text-muted-foreground">
                  Día sin lugares. Busca en el mapa o usa <b>Sugerir ruta</b>.
                </Card>
              )}
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* DERECHA: mapa y búsqueda */}
      <div
        className={`fixed inset-0 z-40 bg-background lg:static lg:z-auto lg:w-[45%] lg:h-full ${
          showMapOnMobile ? "block" : "hidden lg:block"
        }`}
      >
        <div className="h-full relative">
          <MapSearchBar
            value={filters}
            onChange={(v) => setFilters(v as any)}
            onClear={() => setFilters({ q: "", category: null })}
            className="absolute left-1/2 top-3 -translate-x-1/2 w-[95%] z-[600]"
          />

          {/* resultados: columna sobre el mapa */}
          {hasQuery && (
            <div className="absolute left-4 top-[110px] z-[500]">
              <MapResultsPanel
                results={results}
                onOpenPlace={(id) => setSelectedPlace(id)}
              />
            </div>
          )}

          {/* cerrar mapa en móvil */}
          <div className="lg:hidden absolute right-3 top-3 z-[600]">
            <Button
              size="icon"
              variant="outline"
              onClick={() => toggleMapMobile(false)}
              aria-label="Cerrar mapa"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <Mapa
            center={[center.lat, center.lng]}
            zoom={12}
            markers={markers}
            selectedId={selectedPlaceId ?? undefined}
            onMarkerClick={(id) => setSelectedPlace(id)}
          />
        </div>
      </div>

      {/* panel de lugar */}
      {placeOpen && (
        <PlaceInfoPanel
          place={placeOpen}
          onClose={() => setSelectedPlace(null)}
        />
      )}
    </div>
  );
}
