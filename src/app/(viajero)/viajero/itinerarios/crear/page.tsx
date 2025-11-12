"use client";
import React, { useState, useEffect, Suspense } from "react"; // <-- Importa useEffect y Suspense
import { useSearchParams } from "next/navigation"; // <-- Importa useSearchParams
import Mapa from "@/components/map";
import { TripHeader } from "@/components/viajero/editor/TripHeader";
import { Button } from "@/components/ui/button";
import DiaDetalle from "@/components/DiaDetalle";
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

// --- 1. INTERFAZ MODIFICADA ---
// Esta es la interfaz que SÍ necesitas. Combina los datos del
// mapa (lugar) con los datos que pide tu backend (actividad).
export interface Actividad {
  id: number | string;
  nombre: string;
  lat: number;
  lng: number;
  description?: string; // <-- Campo para el backend
  start_time?: string; // <-- Campo para el backend
  end_time?: string;   // <-- Campo para el backend
}

interface Dia {
  id: number | string;
  nombre: string;
  fecha: Date; // <-- Guardamos la fecha real del día
  lugares: Actividad[]; // <-- Ahora usa la interfaz 'Actividad'
}

// --- Componentes (SelectorDias, SortableDiaDetalle) ---
// (Los componentes SelectorDias y SortableDiaDetalle se quedan como los tenías,
// pero 'SortableDiaDetalle' ahora recibe 'lugar' que es de tipo 'Actividad')

// En /crear/page.tsx

function SortableDiaDetalle({
  lugar,
  onActivityChange, // <-- 1. ACEPTA la prop
  onDelete,         // <-- 2. Acepta onDelete (para el próximo paso)
}: {
  lugar: Actividad;
  onActivityChange: (id: string | number, field: keyof Actividad, value: any) => void;
  onDelete: (id: string | number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: lugar.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "none",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {/* 3. PASA las props a DiaDetalle */}
      <DiaDetalle 
        lugar={lugar} 
        onActivityChange={onActivityChange} 
        onDelete={onDelete}
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
    <div className="space-y-4 p-3">
      <div className="flex gap-2">
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
  const searchParams = useSearchParams(); // <-- Hook para leer URL params

  const [pageTitle, setPageTitle] = useState("Nuevo Itinerario");
  const [diasData, setDiasData] = useState<Dia[]>([]);
  const [diaActivoId, setDiaActivoId] = useState<number | string>(1);
  
  const [itinerario, defItinerario] = useState<Actividad[]>([]);
  const posicionInicial: [number, number] = [19.5043, -99.147];
  const zoomInicial = 17;

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
        const nuevosLugares = arrayMove(dias[diaIndex].lugares, oldIndex, newIndex);
        const nuevosDiasData = [...dias];
        nuevosDiasData[diaIndex] = {
          ...nuevosDiasData[diaIndex],
          lugares: nuevosLugares,
        };
        return nuevosDiasData;
      });
    }}
    // ... (tu función handleSaveItinerary)
    const handleActivityChange = (
      lugarId: string | number,
      field: keyof Actividad, // El campo a cambiar ('description', 'start_time', etc.)
      value: any // El nuevo valor
    ) => {
      setDiasData(currentDias => {
        const diaIndex = currentDias.findIndex(d => d.id === diaActivoId);
        if (diaIndex === -1) return currentDias;

        const nuevosDias = [...currentDias];
        const nuevosLugares = nuevosDias[diaIndex].lugares.map(lugar =>
          lugar.id === lugarId
            ? { ...lugar, [field]: value } // Actualiza el campo dinámicamente
            : lugar
        );
        
        nuevosDias[diaIndex] = { ...nuevosDias[diaIndex], lugares: nuevosLugares };
        return nuevosDias;
      });
    };  

  // --- 4. LÓGICA DE AGREGAR LUGAR (MODIFICADA) ---
  const agregarLugar = (lugar: Actividad) => {
    // Añade el lugar al DÍA ACTIVO
    setDiasData(currentDias => {
      const diaIndex = currentDias.findIndex(d => d.id === diaActivoId);
      if (diaIndex === -1) return currentDias; // No hacer nada si no hay día activo

      // Evitar duplicados en ESE día
      const lugarYaExiste = currentDias[diaIndex].lugares.find(l => l.id === lugar.id);
      if (lugarYaExiste) return currentDias;

      // Añadir lugar al día activo (inmutable)
      const nuevosDias = [...currentDias];
      nuevosDias[diaIndex] = {
        ...nuevosDias[diaIndex],
        lugares: [...nuevosDias[diaIndex].lugares, lugar],
      };
      return nuevosDias;
    });

    // Añade el lugar al MAPA (para el marcador)
    if (!itinerario.find((elemento) => elemento.id === lugar.id)) {
      defItinerario((itinerarioAnt) => [...itinerarioAnt, lugar]);
    }
  };
  
  const handleDelete = (lugarId: string | number) => {
    setDiasData(currentDias => {
      // Encuentra el día activo
      const diaIndex = currentDias.findIndex(d => d.id === diaActivoId);
      if (diaIndex === -1) return currentDias;

      // Crea una copia inmutable de los días
      const nuevosDias = [...currentDias];
      
      // Filtra el array de 'lugares' para QUITAR el que tiene el 'lugarId'
      const nuevosLugares = nuevosDias[diaIndex].lugares.filter(
        (lugar) => lugar.id !== lugarId
      );
      
      // Actualiza el día con la nueva lista de lugares
      nuevosDias[diaIndex] = { ...nuevosDias[diaIndex], lugares: nuevosLugares };
      
      return nuevosDias;
    });
    
    // Opcional: También puedes quitarlo del estado 'itinerario' del mapa
    defItinerario(itinerarioAnt => 
      itinerarioAnt.filter(lugar => lugar.id !== lugarId)
    );
  };

  // --- 6. FUNCIÓN PARA GUARDAR EN EL BACKEND ---
  const handleSaveItinerary = async () => {
    console.log("Estado final:", diasData);

    // Transformamos el estado 'diasData' al JSON del backend
    const actividades = diasData.flatMap(dia => 
      dia.lugares.map(lugar => ({
        // Asignamos la fecha del día como 'start_time'
        start_time: format(dia.fecha, "yyyy-MM-dd"), 
        end_time: format(dia.fecha, "yyyy-MM-dd"), // Opcional, puedes ajustarlo
        description: lugar.description || `Visita a ${lugar.nombre}`, // Fallback
        lugarId: String(lugar.id) // Aseguramos que sea string
      }))
    );

    const payload = {
      title: pageTitle,
      actividades: actividades
    };

    console.log("Enviando al backend:", JSON.stringify(payload, null, 2));

    try {
      const response = await fetch('/api/itinerarios/registro', { // <-- USA TU RUTA REAL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // ¡¡IMPORTANTE!! Recuerda añadir tu token
          'token': localStorage.getItem('authToken') || '' 
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Error al guardar el itinerario');
      }

      const result = await response.json();
      console.log("Itinerario guardado:", result);
      // Aquí puedes redirigir al usuario
      // router.push(`/viajero/itinerarios/${result.id}`);

    } catch (error) {
      console.error(error);
      // Aquí deberías mostrar un error al usuario (ej. un Toast)
    }
  };

  // --- RENDER ---
  return (
    <>
      <div className="flex flex-col md:flex-row h-[calc(100svh-3rem)] overflow-hidden">
        <div className="w-full md:w-1/2 h-1/2 md:h-full overflow-y-auto">
          {/* Usamos el título del estado */}
          <TripHeader
            title={pageTitle}
            subtitle="Modifica tu itinerario"
          />
          <div className="flex items-center gap-2 text-sm justify-center p-2">
            <h2 className="font-bold p-2">Plan de viaje</h2>
            
            {/* ... Tus botones de 'Sugerir' y 'Optimizar' ... */}

            {/* --- 7. BOTÓN DE GUARDAR --- */}
            <Separator orientation="vertical" className="h-4 hidden sm:block" />
            <Button
              variant="default" // <-- Lo ponemos como principal
              className="h-auto p-2"
              onClick={handleSaveItinerary}
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
                  onDelete= {handleDelete}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
        <div className="w-full md:w-1/2 h-1/2 md:h-full relative">
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