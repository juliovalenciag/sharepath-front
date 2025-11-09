"use client";
import React from "react";
import { useState } from "react";
import Mapa from "@/components/map";
import { TripHeader } from "@/components/viajero/editor/TripHeader";
import { Settings2} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import DiaDetalle from "@/components/DiaDetalle";
import LugarRecomendado from "@/components/LugarRecomendado";
import { ScrollArea } from "@radix-ui/react-scroll-area";
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
  { id: 4, nombre: "Monumento a la Revolución", lat: 19.4366, lng: -99.1548 },
  { id: 5, nombre: "Alameda Central", lat: 19.4361, lng: -99.1438 },
];
const dias = [
  { id: 1, nombre: "Día 1", lugares: [], calificacion: 4.5 },
  { id: 2, nombre: "Día 2", lugares: [], calificacion: 4.0 },
  { id: 3, nombre: "Día 3", lugares: [], calificacion: 5.0 },
];
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function SelectorDias() {
  const [activo, setActivo] = useState("Dia 1");
  return (
    <>
      <div className="space-y-4 p-3">
        <div className="flex gap-2">
          {dias.map((dia) => (
            <Button
              key={dia.id}
              variant={activo === dia.nombre ? "default" : "outline"}
              onClick={() => setActivo(dia.nombre)}
            >
              {dia.nombre}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
}
export default function page() {
  const posicionInicial: [number, number] = [19.5043, -99.147];
  const zoomInicial = 17;
  const [itinerario, defItinerario] = useState<lugar[]>([]);
  const agregarLugar = (lugar: lugar) => {
    if (!itinerario.find((elemento) => elemento.id === lugar.id)) {
      defItinerario((itinerarioAnt) => [...itinerarioAnt, lugar]);
    }
  };
  return (
    <>
      <div className="flex h-full">
        <div className="w-1/2">
        <ScrollArea className="h-[calc(100dvh-64px)]">
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
          {/* Aqui debería hacer el maping de cada dia y posteriormente hacer la logica para el active y que muestre cada uno los lugares que tiene */}
          <SelectorDias></SelectorDias>
          {/* Aqui debe ir la lista de lugares añadidos al itinerario, se debe utilizar un componente y mostrar una sugerencia por día  */}
          <LugarRecomendado></LugarRecomendado>
          <DiaDetalle></DiaDetalle>
          <DiaDetalle></DiaDetalle>
          <DiaDetalle></DiaDetalle>
          </ScrollArea>
        </div>
        
        <div className="w-1/2 bg-green-500 absoulute z-0">
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
