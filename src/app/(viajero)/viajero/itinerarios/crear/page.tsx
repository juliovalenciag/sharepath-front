"use client";
import * as React from "react";
import dynamic from "next/dynamic";
import { useState, useEffect, Suspense } from "react"; // <-- Importa useEffect y Suspense
import { useSearchParams } from "next/navigation"; // <-- Importa useSearchParams
import {useMemo } from "react"; 
import { TripHeader } from "@/components/viajero/editor/TripHeader";
import { Button } from "@/components/ui/button";
import DiaDetalle from "@/components/DiaDetalle2";
import { CalendarDays, Settings2, Save } from "lucide-react"; // <-- Importa Save
import { Separator } from "@/components/ui/separator";
import LugarRecomendado from "@/components/LugarRecomendado";
import { differenceInDays, format, addDays } from "date-fns";
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

const Mapa = dynamic(() => import("@/components/viajero/map/Mapa"), {
  ssr: false,
});


export interface Actividad {
  id: number | string;
  nombre: string;
  lat: number;
  lng: number;
  description?: string; // <-- Campo para el backend
  foto_url?: string; // <-- NUEVO: Para la imagen
  start_time?: string; // <-- Campo para el backend
  end_time?: string; // <-- Campo para el backend
}

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
    value: any
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
  const [diasData, setDiasData] = useState<Dia[]>([]);
  const [diaActivoId, setDiaActivoId] = useState<number | string>(1);

  const [itinerario, defItinerario] = useState<Actividad[]>([]);
  const posicionInicial: [number, number] = [19.5043, -99.147];
  const zoomInicial = 17;
  const [isLoading, setIsLoading] = useState(false);

    const Mapa = useMemo(() => dynamic(
    () => import("@/components/map"), // Ruta a tu componente de mapa
    { 
      loading: () => <p>Cargando mapa...</p>, // Opcional: un loader
      ssr: false // ¡ESTO EVITA EL ERROR 'window is not defined'!
    }
  ), []); // El array vacío asegura que solo se cargue una vez

  useEffect(() => {
    const nombre = searchParams.get("nombre") || "Mi Nuevo Itinerario";
    const startStr = searchParams.get("start");
    const endStr = searchParams.get("end");

    setPageTitle(nombre);

    if (startStr && endStr) {
      const startDate = new Date(startStr);
      const endDate = new Date(endStr);
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

    // (Aquí también podrías leer 'regions' y centrar el mapa)
    // const regions = searchParams.get('regions')?.split(',');
  }, [searchParams]); // Se ejecuta 1 vez cuando los params están listos

  // --- Lógica de DND (Drag and Drop) ---
  const diaActual = diasData.find((d) => d.id === diaActivoId);
  const lugaresActivos = diaActual ? diaActual.lugares : [];
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;
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
    value: any // El nuevo valor
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

  // --- 4. LÓGICA DE AGREGAR LUGAR (MODIFICADA) ---
  const agregarLugar = async (lugar: Actividad) => {
    // 1. Buscar si el lugar ya existe en el día activo para evitar duplicados
    const diaActual = diasData.find((d) => d.id === diaActivoId);
    if (diaActual?.lugares.some((l) => l.id === lugar.id)) {
      toast.info(`${lugar.nombre} ya está en el día actual.`);
      return; // No hacer nada si ya existe
    }

    // 2. Obtener detalles completos del lugar desde la API
    let lugarConDetalles = { ...lugar };
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

    // 1. Transformar los datos al formato que el backend espera
    const actividades = diasData.flatMap((dia) =>
      dia.lugares.map((lugar) => ({
        fecha: format(dia.fecha, "yyyy-MM-dd"),
        description: lugar.description || `Visita a ${lugar.nombre}`, // Fallback
        lugarId: String(lugar.id), // Aseguramos que sea string
      }))
    );

    // 2. Crear el payload final para la API
    const requestBody = {
      title: pageTitle,
      actividades: actividades,
    };

    console.log("Enviando al backend:", JSON.stringify(requestBody, null, 2));

    // 3. Llamar a la API usando una promesa con toast
    const promise = ItinerariosAPI.getInstance().createItinerario(requestBody);

    toast.promise(promise, {
      loading: "Guardando itinerario...",
      success: (data) => {
        router.push("/viajero/itinerarios");
        return data.message || "¡Itinerario guardado con éxito!";
      },
      error: (err) => err.message || "Ocurrió un error al guardar.",
      finally: () => setIsLoading(false),
    });
  };

  // --- RENDER ---
  return (
    <>
      <div className="flex flex-col md:flex-row h-[calc(100svh-3rem)] overflow-hidden">
        <div className="w-full md:w-1/2 h-1/2 md:h-full overflow-y-auto">
          {/* Usamos el título del estado */}
          <TripHeader title={pageTitle} subtitle="Modifica tu itinerario" />
          <div className="flex items-center gap-2 text-sm justify-center p-2">
            <h2 className="font-bold p-2">Plan de viaje</h2>

            {/* ... Tus botones de 'Sugerir' y 'Optimizar' ... */}

            {/* --- 7. BOTÓN DE GUARDAR --- */}
            <Separator orientation="vertical" className="h-4 hidden sm:block" />
            <Button
              variant="default" // <-- Lo ponemos como principal
              className="h-auto p-2"
              onClick={handleSaveItinerary}
              disabled={isLoading}
            >
              <Save className="size-4 mr-1" />
              Guardar
            </Button>
          </div>

          <SelectorDias
            dias={diasData}
            diaActivoId={diaActivoId}
            setDiaActivoId={setDiaActivoId}
          />
          <LugarRecomendado />
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
          {/*<div className="h-full relative">
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
            /
          </div> */}
          <Mapa
            posicion={posicionInicial}
            zoom={zoomInicial}
            itinerario={itinerario}
            onAddLugar={agregarLugar}
          />
        </div>
      </div>
    </>

  );
}
