"use client";
import React from "react";
import { useState } from "react";
import Mapa from "@/components/map";
import { TripHeader } from "@/components/viajero/editor/TripHeader";
import { Button } from "@/components/ui/button";
import DiaDetalle from "@/components/DiaDetalle2";
import { CalendarDays, Settings2} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import LugarRecomendado from "@/components/LugarRecomendado";

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
// ---

export interface lugar {
  id: number | string; 
  nombre: string;
  lat: number;
  lng: number;
}


const lugaresTuristicos: lugar[] = [
  { id: 1, nombre: "Museo de Antropología", lat: 19.426, lng: -99.1863 },
  { id: 2, nombre: "Palacio de Bellas Artes", lat: 19.4352, lng: -99.1412 },
  { id: 3, nombre: "Castillo de Chapultepec", lat: 19.4204, lng: -99.1816 },
];

interface Dia {
  id: number | string;
  nombre: string;
  lugares: lugar[];
  calificacion: number;
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

function SortableDiaDetalle({ lugar }: { lugar: lugar }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: lugar.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: 'none' 
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <DiaDetalle lugar={lugar} />
    </div>
  );
}

export default function Page() {
  const posicionInicial: [number, number] = [19.5043, -99.147];
  const zoomInicial = 17;
  const [itinerario, defItinerario] = useState<lugar[]>([]);
  const [diasData, setDiasData] = useState<Dia[]>([
    {
      id: 1,
      nombre: "Día 1",
      lugares: [lugaresTuristicos[0], lugaresTuristicos[1]],
      calificacion: 4.5,
    },
    { id: 2, nombre: "Día 2", lugares: [lugaresTuristicos[2]], calificacion: 4.0 },
    { id: 3, nombre: "Día 3", lugares: [], calificacion: 5.0 },
  ]);
  
  const [diaActivoId, setDiaActivoId] = useState<number | string>(1);

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
    }
  }

  const agregarLugar = (lugar: lugar) => {
    setDiasData(dias => {
        // (Aquí falta la lógica para agregar 'lugar'
        // a 'dias[diaActivoIndex].lugares' si no existe)
        console.log("Añadir", lugar, "a día", diaActivoId);
        // Esta es solo una demo, la lógica de 'defItinerario'
        // para el mapa puede ser separada.
        return dias;
    });

    if (!itinerario.find((elemento) => elemento.id === lugar.id)) {
      defItinerario((itinerarioAnt) => [...itinerarioAnt, lugar]);
    }
  };

  return (
    <>
      <div className="flex h-[calc(100dvh-64px)] overflow-hidden">
        <div className="w-1/2 h-full overflow-y-auto">
          <TripHeader
            title="Mi primer itinerario con Iker"
            subtitle="No entiendo por que subtitulo"
          ></TripHeader>
          <div className="flex items-center gap-2 text-sm justify-center p-2">
          <h2 className="text- p-2">Plan de viaje</h2>
          {/* Botones de acción del día */}
          <Button
            variant="ghost"
            className="h-auto p-2 text-primary hover:text-primary/80 transition-colors hidden sm:inline-flex"
          >
            <CalendarDays className="size-4 mr-1" />
            Sugerir ruta
          </Button>
          <Separator orientation="vertical" className="h-4 hidden sm:block" />
          <Button
            variant="ghost"
            className="h-auto p-2 text-primary hover:text-primary/80 transition-colors hidden sm:inline-flex"
          >
            <Settings2 className="size-4 mr-1" />
            Optimizar ruta{" "}
            
          </Button>
          </div>

          <SelectorDias
            dias={diasData}
            diaActivoId={diaActivoId}
            setDiaActivoId={setDiaActivoId}
          />

          <LugarRecomendado></LugarRecomendado>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={lugaresActivos.map(lugar => lugar.id)}
              strategy={verticalListSortingStrategy}
            >
              {lugaresActivos.map((lugar) => (
                <SortableDiaDetalle key={lugar.id} lugar={lugar} />
              ))}
            </SortableContext>
          </DndContext>
          
        </div>

        <div className="w-1/2 h-full relative">
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