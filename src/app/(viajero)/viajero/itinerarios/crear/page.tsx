"use client";
import * as React from "react";
import dynamic from "next/dynamic";
import {
  useState,
  useEffect,
  Suspense,
  useMemo,
  useCallback,
} from "react";
import { useSearchParams } from "next/navigation";
import { TripHeader } from "@/components/viajero/editor/TripHeader";
import { Button } from "@/components/ui/button";
import DiaDetalle from "@/components/DiaDetalle2";
import { Save } from "lucide-react"; // <-- Importa Save
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { differenceInDays, format, addDays } from "date-fns";
import { es } from "date-fns/locale";
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { ItinerariosAPI } from "@/api/ItinerariosAPI";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LugarData } from "@/api/interfaces/ApiRoutes";
import { PlaceCatalog } from "@/components/viajero/PlaceCatalog";
import { Actividad } from "@/types/itinerarios";
import { getDefaultImageForCategory } from "@/components/dashboard-components/category-utils";

const Mapa = dynamic(() => import("@/components/map"), {
  ssr: false,
});


interface Dia {
  id: number | string;
  nombre: string;
  fecha: Date; // <-- Guardamos la fecha real del día
  lugares: Actividad[]; // <-- Ahora usa la interfaz 'Actividad'
}

function SortableDiaDetalle({
  lugar,
  onActivityChange,
  onDelete,
}: {
  lugar: Actividad;
  onActivityChange: (
    id: string | number,
    field: keyof Actividad,
    value: string | number | null
  ) => void;
  onDelete: (id: string | number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: lugar.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    // Quitamos {...listeners} de aquí
    <div ref={setNodeRef} style={style} {...attributes}>
      {/* 3. PASA las props a DiaDetalle */}
      <DiaDetalle
        lugar={lugar}
        onActivityChange={onActivityChange}
        onDelete={onDelete}
        dragListeners={listeners} // Pasamos los listeners como una prop
      />
    </div>
  );
}

          
function SelectorDias({
  dias,
  diaActivoId,
  setDiaActivoId,
}: {
  dias: Dia[];
  diaActivoId: number | string;
  setDiaActivoId: (id: number | string) => void;
}) {
  return (
    <div className="space-y-4 p-3 ">
      <div className="flex flex-wrap gap-3 justify-center">
        {dias.map((dia) => (
          <Button
            key={dia.id}
            variant={diaActivoId === dia.id ? "default" : "outline"}
            onClick={() => setDiaActivoId(dia.id)}
          >
            {dia.nombre}
          </Button>
        ))}
      </div>
    </div>
  );
}
export default function PageWrapper() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <Page />
    </Suspense>
  );
}

function Page() {
  const router = useRouter();
  const searchParams = useSearchParams(); // <-- Hook para leer URL params

  const [pageTitle, setPageTitle] = useState("Nuevo Itinerario");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [diasData, setDiasData] = useState<Dia[]>([]);
  const [diaActivoId, setDiaActivoId] = useState<number | string>(1);

  const [itinerario, defItinerario] = useState<Actividad[]>([]);
  const posicionInicial: [number, number] = [19.5043, -99.147];
  const zoomInicial = 17;
  const [isLoading, setIsLoading] = useState(false);
  const [places, setPlaces] = useState<LugarData[]>([]);
  const [placePage, setPlacePage] = useState(1);
  const [placesTotal, setPlacesTotal] = useState(0);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [placesError, setPlacesError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    state: "",
    category: "",
    search: "",
  });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [knownStates, setKnownStates] = useState<string[]>([]);
  const [knownCategories, setKnownCategories] = useState<string[]>([]);
  const [manualActivity, setManualActivity] = useState({
    nombre: "",
    description: "",
    lat: "",
    lng: "",
  });

  useEffect(() => {
    const nombre = searchParams.get("nombre") || "Mi Nuevo Itinerario";
    const startStr = searchParams.get("start");
    const endStr = searchParams.get("end");

    setPageTitle(nombre);

    if (startStr && endStr) {
      const startDate = new Date(startStr);
      const endDate = new Date(endStr);
      setStartDate(startDate);
      setEndDate(endDate);
      const numDias = differenceInDays(endDate, startDate) + 1;

      const nuevosDias: Dia[] = [];
      for (let i = 0; i < numDias; i++) {
        const fechaDia = addDays(startDate, i);
        nuevosDias.push({
          id: i + 1,
          nombre: format(fechaDia, "d MMM", { locale: es }),
          fecha: fechaDia,
          lugares: [],
        });
      }
      setDiasData(nuevosDias);
      setDiaActivoId(1);
    }

  }, [searchParams]); // Se ejecuta 1 vez cuando los params están listos

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedFilters(filters), 350);
    return () => clearTimeout(timer);
  }, [filters]);

  useEffect(() => {
    loadPlaces(true).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFilters.state, debouncedFilters.category, debouncedFilters.search]);

  // --- Lógica de DND (Drag and Drop) ---
  const diaActual = diasData.find((d) => d.id === diaActivoId);
  const lugaresActivos = diaActual ? diaActual.lugares : [];
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const totalActividades = useMemo(
    () => diasData.reduce((acc, dia) => acc + dia.lugares.length, 0),
    [diasData]
  );

  const dateRangeLabel = useMemo(() => {
    if (startDate && endDate) {
      return `${format(startDate, "d MMM", { locale: es })} - ${format(
        endDate,
        "d MMM yyyy",
        { locale: es }
      )}`;
    }
    return "Fechas no definidas";
  }, [startDate, endDate]);

  const mapItinerary = useMemo(
    () =>
      itinerario.filter(
        (item): item is Actividad & { lat: number; lng: number } =>
          typeof item.lat === "number" && typeof item.lng === "number"
      ),
    [itinerario]
  );

  const mapCenter = useMemo<[number, number]>(
    () =>
      mapItinerary.length
        ? [mapItinerary[0].lat, mapItinerary[0].lng]
        : posicionInicial,
    [mapItinerary, posicionInicial]
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      setDiasData((dias) => {
        const diaIndex = dias.findIndex((d) => d.id === diaActivoId);
        if (diaIndex === -1) return dias;
        const oldIndex = dias[diaIndex].lugares.findIndex(
          (l) => l.id === active.id
        );
        const newIndex = dias[diaIndex].lugares.findIndex(
          (l) => l.id === over.id
        );
        const nuevosLugares = arrayMove(
          dias[diaIndex].lugares,
          oldIndex,
          newIndex
        );
        const nuevosDiasData = [...dias];
        nuevosDiasData[diaIndex] = {
          ...nuevosDiasData[diaIndex],
          lugares: nuevosLugares,
        };
        return nuevosDiasData;
      });
    }
  }
  // ... (tu función handleSaveItinerary)
  const handleActivityChange = (
    lugarId: string | number,
    field: keyof Actividad, // El campo a cambiar ('description', 'start_time', etc.)
    value: string | number | null // El nuevo valor
  ) => {
    setDiasData((currentDias) => {
      const diaIndex = currentDias.findIndex((d) => d.id === diaActivoId);
      if (diaIndex === -1) return currentDias;

      const nuevosDias = [...currentDias];
      const nuevosLugares = nuevosDias[diaIndex].lugares.map((lugar) =>
        lugar.id === lugarId
          ? { ...lugar, [field]: value } // Actualiza el campo dinámicamente
          : lugar
      );

      nuevosDias[diaIndex] = {
        ...nuevosDias[diaIndex],
        lugares: nuevosLugares,
      };
      return nuevosDias;
    });
  };

  const handleManualFieldChange = useCallback(
    (field: "nombre" | "description" | "lat" | "lng", value: string) => {
      setManualActivity((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // --- 4. LÓGICA DE AGREGAR LUGAR (MODIFICADA) ---
  const agregarLugar = async (lugar: Actividad) => {
    // 1. Buscar si el lugar ya existe en el día activo para evitar duplicados
    const diaActual = diasData.find((d) => d.id === diaActivoId);
    if (diaActual?.lugares.some((l) => l.id === lugar.id)) {
      toast.info(`${lugar.nombre} ya está en el día actual.`);
      return; // No hacer nada si ya existe
    }

    // 2. Obtener detalles completos del lugar desde la API
    const lugarConDetalles = { ...lugar };
    try {
      const api = ItinerariosAPI.getInstance();
      // Usamos el ID del lugar para obtener su información completa
      const detalles = await api.getLugarById(String(lugar.id));
      if (detalles) {
        lugarConDetalles.foto_url = detalles.foto_url;
        // También podrías poblar otros campos si lo necesitas
        // lugarConDetalles.description = detalles.short_desc;
      }
    } catch (error) {
      console.warn("No se pudieron obtener los detalles del lugar:", error);
      toast.error("No se pudieron cargar los detalles de la imagen.");
    }

    if (typeof lugarConDetalles.lat !== "number" || typeof lugarConDetalles.lng !== "number") {
      toast.error("El lugar no tiene coordenadas válidas para el mapa.");
      return;
    }

    // 3. Añadir el lugar (con detalles) al día activo
    setDiasData((currentDias) => {
      const diaIndex = currentDias.findIndex((d) => d.id === diaActivoId);
      if (diaIndex === -1) return currentDias;

      const nuevosDias = [...currentDias];
      nuevosDias[diaIndex] = {
        ...nuevosDias[diaIndex],
        lugares: [...nuevosDias[diaIndex].lugares, lugarConDetalles],
      };
      return nuevosDias;
    });

    // 4. Añadir el lugar al mapa para el marcador
    if (!itinerario.find((elemento) => elemento.id === lugarConDetalles.id)) {
      defItinerario((itinerarioAnt) => [...itinerarioAnt, lugarConDetalles]);
    }
    toast.success(`${lugar.nombre} añadido al itinerario.`);
  };

  const handleManualAdd = useCallback(() => {
    if (!manualActivity.nombre.trim()) {
      toast.error("Agrega un nombre para la actividad");
      return;
    }

    const latNum = Number(manualActivity.lat);
    const lngNum = Number(manualActivity.lng);

    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
      toast.error("Ingresa coordenadas válidas para situar la actividad en el mapa");
      return;
    }

    const nuevaActividad: Actividad = {
      id: `manual-${Date.now()}`,
      nombre: manualActivity.nombre.trim(),
      description: manualActivity.description.trim(),
      lat: latNum,
      lng: lngNum,
      category: "personalizado",
    };

    agregarLugar(nuevaActividad);
    setManualActivity({ nombre: "", description: "", lat: "", lng: "" });
  }, [agregarLugar, manualActivity]);

  const loadPlaces = async (reset = false) => {
    setLoadingPlaces(true);
    setPlacesError(null);
    const nextPage = reset ? 1 : placePage;
    try {
      const api = ItinerariosAPI.getInstance();
      const response = await api.getLugares(
        nextPage,
        9,
        debouncedFilters.state || undefined,
        debouncedFilters.category || undefined,
        debouncedFilters.search || undefined
      );

      setPlaces((prev) => (reset ? response.lugares : [...prev, ...response.lugares]));
      setPlacesTotal(response.total);
      setPlacePage(nextPage + 1);

      setKnownStates((prev) => {
        const merged = new Set([...prev, ...response.lugares.map((l) => l.mexican_state)]);
        return Array.from(merged).filter(Boolean) as string[];
      });

      setKnownCategories((prev) => {
        const merged = new Set([...prev, ...response.lugares.map((l) => l.category)]);
        return Array.from(merged).filter(Boolean) as string[];
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        setPlacesError(error.message);
      } else {
        setPlacesError("No se pudo cargar el catálogo de lugares");
      }
    } finally {
      setLoadingPlaces(false);
    }
  };

  const handleAddFromCatalog = (place: LugarData) => {
    const actividad: Actividad = {
      id: place.id_api_place,
      nombre: place.nombre,
      lat: place.latitud,
      lng: place.longitud,
      foto_url: place.foto_url || getDefaultImageForCategory(place.category),
      category: place.category,
      mexican_state: place.mexican_state,
    };

    agregarLugar(actividad);
  };

  const handleDelete = (lugarId: string | number) => {
    setDiasData((currentDias) => {
      // Encuentra el día activo
      const diaIndex = currentDias.findIndex((d) => d.id === diaActivoId);
      if (diaIndex === -1) return currentDias;

      // Crea una copia inmutable de los días
      const nuevosDias = [...currentDias];

      // Filtra el array de 'lugares' para QUITAR el que tiene el 'lugarId'
      const nuevosLugares = nuevosDias[diaIndex].lugares.filter(
        (lugar) => lugar.id !== lugarId
      );

      // Actualiza el día con la nueva lista de lugares
      nuevosDias[diaIndex] = {
        ...nuevosDias[diaIndex],
        lugares: nuevosLugares,
      };

      return nuevosDias;
    });

    // Opcional: También puedes quitarlo del estado 'itinerario' del mapa
    defItinerario((itinerarioAnt) =>
      itinerarioAnt.filter((lugar) => lugar.id !== lugarId)
    );
  };

  // --- 6. FUNCIÓN PARA GUARDAR EN EL BACKEND ---
  const handleSaveItinerary = async () => {
    setIsLoading(true);

    const actividades = diasData.flatMap((dia) =>
      dia.lugares.map((lugar) => ({
        fecha: format(dia.fecha, "yyyy-MM-dd"),
        description: lugar.description || `Visita a ${lugar.nombre}`,
        lugarId: String(lugar.id),
      }))
    );

    if (!actividades.length) {
      toast.error("Agrega al menos una actividad antes de guardar");
      setIsLoading(false);
      return;
    }

    const requestBody = {
      title: pageTitle,
      actividades: actividades,
    };

    try {
      await toast.promise(
        ItinerariosAPI.getInstance().createItinerario(requestBody),
        {
          loading: "Guardando itinerario...",
          success: (data) => {
            router.push("/viajero/itinerarios");
            return data.message || "¡Itinerario guardado con éxito!";
          },
          error: (err) => err.message || "Ocurrió un error al guardar.",
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER ---
  return (
    <>
      <div className="flex flex-col md:flex-row h-[calc(100svh-3rem)] overflow-hidden">
        <div className="w-full md:w-1/2 h-1/2 md:h-full overflow-y-auto">
          <TripHeader title={pageTitle} subtitle="Modifica tu itinerario" />

          <div className="px-3 space-y-4">
            <Card className="p-4 border-muted/70 bg-card/70 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <Label className="text-xs uppercase text-muted-foreground">
                    Título del viaje
                  </Label>
                  <Input
                    value={pageTitle}
                    onChange={(e) => setPageTitle(e.target.value)}
                    placeholder="Aventura en CDMX"
                  />
                  <p className="text-sm text-muted-foreground">{dateRangeLabel}</p>
                  <p className="text-xs text-muted-foreground">
                    {diasData.length} día(s) • {totalActividades} actividad(es)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Separator orientation="vertical" className="hidden h-14 sm:block" />
                  <Button
                    variant="default"
                    className="h-auto px-4"
                    onClick={handleSaveItinerary}
                    disabled={isLoading}
                  >
                    <Save className="size-4 mr-2" />
                    Guardar
                  </Button>
                </div>
              </div>
            </Card>

            <SelectorDias
              dias={diasData}
              diaActivoId={diaActivoId}
              setDiaActivoId={setDiaActivoId}
            />

            <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
              <PlaceCatalog
                places={places}
                filters={filters}
                onFiltersChange={setFilters}
                loading={loadingPlaces}
                onAdd={handleAddFromCatalog}
                onLoadMore={() => loadPlaces(false)}
                hasMore={places.length < placesTotal}
                states={knownStates}
                categories={knownCategories}
                error={placesError}
              />

              <Card className="m-1 p-4 border-muted/60 bg-card/70">
                <div className="space-y-2">
                  <p className="text-xs uppercase text-muted-foreground">Añadir manual</p>
                  <h4 className="text-lg font-semibold">Actividad personalizada</h4>
                  <p className="text-sm text-muted-foreground">
                    Si el servidor no tiene un lugar, puedes fijarlo manualmente con sus coordenadas.
                  </p>
                  <Label className="text-sm">Nombre</Label>
                  <Input
                    placeholder="Senderismo al amanecer"
                    value={manualActivity.nombre}
                    onChange={(e) => handleManualFieldChange("nombre", e.target.value)}
                  />
                  <Label className="text-sm">Descripción</Label>
                  <Textarea
                    placeholder="Punto de encuentro en la entrada principal"
                    value={manualActivity.description}
                    onChange={(e) =>
                      handleManualFieldChange("description", e.target.value)
                    }
                    rows={3}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm">Latitud</Label>
                      <Input
                        value={manualActivity.lat}
                        onChange={(e) => handleManualFieldChange("lat", e.target.value)}
                        placeholder="19.4326"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Longitud</Label>
                      <Input
                        value={manualActivity.lng}
                        onChange={(e) => handleManualFieldChange("lng", e.target.value)}
                        placeholder="-99.1332"
                      />
                    </div>
                  </div>
                  <Button className="w-full" variant="secondary" onClick={handleManualAdd}>
                    Añadir al día activo
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={lugaresActivos.map((lugar) => lugar.id)}
              strategy={verticalListSortingStrategy}
            >
              {lugaresActivos.map((lugar) => (
                <SortableDiaDetalle
                  key={lugar.id}
                  lugar={lugar}
                  onActivityChange={handleActivityChange}
                  onDelete={handleDelete}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
        <div className="w-full md:w-1/2 h-1/2 md:h-full relative">
          <Mapa
            posicion={mapCenter}
            zoom={zoomInicial}
            itinerario={mapItinerary}
            onAddLugar={agregarLugar}
          />
        </div>
      </div>
    </>

  );
}
