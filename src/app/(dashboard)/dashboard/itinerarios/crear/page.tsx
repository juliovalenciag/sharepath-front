"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import dynamic from "next/dynamic";
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
  Save,
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
  const router = useRouter();
  // init (sólo 1 vez por si venías con store vacío)
  const initializedRef = React.useRef(false);
  const initDraft = useItineraryStore((s) => s.initDraft);
  React.useEffect(() => {
    if (!initializedRef.current) {
      initDraft();
      initializedRef.current = true;
    }
  }, [initDraft]);

  const {
    title,
    days,
    activeDayId,
    setActiveDay,
    addDay,
    removeActiveDay,
    optimizeDayOrder,
    suggestForActive,
    saveItinerary,
    setSelectedPlace,
    selectedPlaceId,
    setFilters,
    filters,
    showMapOnMobile,
    toggleMapMobile,
    states,
    activeDay,
    clearFilters,
    setShowRoute,
    showRoute,
  } = useItineraryStore();

  const current = activeDay(); // puede ser null al primer render
  const center = centerForStates(states);

  // búsqueda (se muestran resultados/markers solo si hay búsqueda activa)
  const searchActive = Boolean(filters.q || filters.category);
  const [results, setResults] = React.useState<Place[]>([]);

  React.useEffect(() => {
    const fetchResults = async () => {
      if (!searchActive) {
        setResults([]);
        return;
      }
      const places = await suggestPlacesByRadius(
        states,
        filters.radiusKm,
        filters.q,
        filters.category as any
      );
      setResults(places);
    };
    fetchResults();
  }, [states, filters, searchActive]);

  const markers = searchActive ? results : [];

  // DnD
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  function onDragEnd(e: any) {
    const { active, over } = e;
    if (!over || !current) return;
    if (active.id === over.id) return;
    const oldIndex = current.places.findIndex(
      (p) => p.id_api_place === active.id
    );
    const newIndex = current.places.findIndex(
      (p) => p.id_api_place === over.id
    );
    if (oldIndex < 0 || newIndex < 0) return;
    useItineraryStore
      .getState()
      .movePlaceWithinDay(activeDayId, oldIndex, newIndex);
  }

  const [placeOpen, setPlaceOpen] = React.useState<Place | null>(null);
  React.useEffect(() => {
    if (!selectedPlaceId) return setPlaceOpen(null);
    const p = PLACES.find((x) => x.id_api_place === selectedPlaceId) || null;
    setPlaceOpen(p);
  }, [selectedPlaceId]);

  const [isSaving, setIsSaving] = React.useState(false);
  const handleSave = () => {
    setIsSaving(true);
    const promise = saveItinerary();

    toast.promise(promise, {
      loading: "Guardando itinerario...",
      success: (data) => {
        router.push("/viajero/itinerarios"); // Redirige a la lista de itinerarios
        return data.message || "¡Itinerario guardado con éxito!";
      },
      error: (err) => {
        return err.message || "Ocurrió un error al guardar.";
      },
      finally: () => {
        setIsSaving(false);
      },
    });
  };

  return (
    <div className="flex h-[calc(100dvh-64px)] overflow-hidden">
      {/* IZQUIERDA – editor (menos ancho) */}
      <div className="w-full xl:w-[52%] h-full overflow-y-auto relative z-10">
        <TripHeader title={title} subtitle="Ajusta tu plan por días" />

        {/* Acciones */}
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
            onClick={() => optimizeDayOrder(activeDayId, 0)}
          >
            <Settings2 className="size-4 mr-1" /> Optimizar orden
          </Button>
          <Separator orientation="vertical" className="h-4 hidden sm:block" />
          <Button
            variant="default"
            onClick={handleSave}
            disabled={isSaving}
            className="h-auto p-2"
          >
            <Save className="size-4 mr-1" />
            Guardar
          </Button>
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

          {/* Toggle mapa móvil */}
          <div className="ml-auto xl:hidden">
            <Button
              size="sm"
              variant="outline"
              onClick={() => toggleMapMobile(true)}
            >
              <MapIcon className="w-4 h-4 mr-1" /> Ver mapa
            </Button>
          </div>
        </div>

        {/* Tabs de días */}
        <div className="px-3">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {days.map((d, i) => (
              <Button
                key={d.id}
                variant={activeDayId === d.id ? "default" : "outline"}
                onClick={() => setActiveDay(d.id)}
                className="shrink-0"
              >
                {d.nombre} ({d.places.length})
              </Button>
            ))}
          </div>
        </div>

        {/* Resumen compacto horizontal */}
        <DaySummary />

        {/* Lista del día (DnD) */}
        <div role="list" aria-label="Lugares del día">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={(current?.places ?? []).map((p) => p.id_api_place)}
              strategy={verticalListSortingStrategy}
            >
              {current?.places?.length ? (
                current.places.map((p) => (
                  <SortableDiaDetalle key={p.id_api_place} place={p} />
                ))
              ) : (
                <Card className="m-3 p-4 text-sm text-muted-foreground">
                  Día sin lugares. Busca a la derecha o usa <b>Sugerir ruta</b>.
                </Card>
              )}
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* DERECHA – mapa + búsqueda */}
      <div
        className={`fixed inset-0 z-40 bg-background xl:static xl:z-auto xl:w-[48%] xl:h-full ${
          showMapOnMobile ? "block" : "hidden xl:block"
        }`}
      >
        <div className="h-full relative">
          <MapSearchBar
            value={filters}
            onChange={(v) => setFilters(v)}
            onClear={() => {
              clearFilters();
              setShowRoute(false);
            }}
            className="absolute left-1/2 top-3 -translate-x-1/2 w-[95%] sm:w-[680px] z-[600]"
          />

          <div className="hidden 2xl:block absolute left-4 top-[132px] z-[500]">
            <MapResultsPanel
              results={results}
              onOpenPlace={(id) => setSelectedPlace(id)}
              hidden={!searchActive}
            />
          </div>

          {/* Mapa */}
          <Mapa
            center={[center.lat, center.lng]}
            zoom={12}
            markers={markers}
            path={showRoute ? current?.places ?? [] : undefined}
            onMarkerClick={(id) => setSelectedPlace(id)}
          />
          {/* </div> */}
        </div>

        {/* Modal de lugar */}
        {!!placeOpen && (
          <PlaceInfoPanel
            place={placeOpen}
            onClose={() => setSelectedPlace(null)}
          />
        )}
      </div>
    </div>
  );
}
