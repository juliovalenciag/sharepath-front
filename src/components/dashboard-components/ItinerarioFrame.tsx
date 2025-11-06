// components/ItinerarioFrame.tsx
"use client";
import DiasCarousel from "./DiaCarousel";
import Link from "next/link";
import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { addDays, format } from "date-fns";
import { es } from "date-fns/locale"; // Para formatear la fecha en español
import { DateRange } from "react-day-picker";
interface ItinerarioFrameProps {
  itinerario: ItinerarioPrincipal; // Recibe la estructura completa
}
import { Star } from "lucide-react";

function Estrellas({ calificacion }: { calificacion: number }) {
  const totalEstrellas = 5;
  const estrellasLlenas = Math.floor(calificacion);
  const tieneMedia = calificacion - estrellasLlenas >= 0.5;

  return (
    <div className="flex gap-1 text-yellow-400">
      {Array.from({ length: totalEstrellas }).map((_, i) => {
        if (i < estrellasLlenas) {
          return <Star key={i} fill="currentColor" stroke="currentColor" />;
        } else if (i === estrellasLlenas && tieneMedia) {
          return <Star key={i} fill="currentColor" strokeWidth={1.5} />;
        } else {
          return <Star key={i} stroke="currentColor" />;
        }
      })}
    </div>
  );
}
const ItinerarioFrame: React.FC<ItinerarioFrameProps> = ({ itinerario }) => {
    const [showNewDialog, setShowNewDialog] = useState(false)
    const [showShareDialog, setShowShareDialog] = useState(false)
      const startDate = new Date(itinerario.fechaInicio);
  const numberOfDays = itinerario.dias.length;

  // Verificamos si la fecha de inicio es válida
  const isValidDate = !isNaN(startDate.getTime());

  // Calculamos la fecha de fin. Si la duración es 1 día, la fecha de fin es la misma que la de inicio.
  // addDays(startDate, 0) devuelve el mismo día.
  const endDate = isValidDate ? addDays(startDate, numberOfDays - 1) : new Date();

  // Creamos el objeto de rango para 'react-day-picker'
  const dateRange: DateRange | undefined = isValidDate
    ? {
        from: startDate,
        to: endDate,
      }
    : undefined;

  // Texto para mostrar en el botón
  const displayDateRange = isValidDate
    ? `${format(startDate, "dd 'de' LLL, yyyy", { locale: es })} - ${format(
        endDate,
        "dd 'de' LLL, yyyy",
        { locale: es }
      )}`
    : "Fechas no disponibles";
  // --- FIN LÓGICA CALENDARIO ---
  return (
    <>
        <div className="p-2 flex rounded-lg min-h-[300px] w-full">
            
            <div className="w-1/3 p-4 flex flex-col justify-center">
                <Estrellas calificacion={itinerario.calificacion} />
                <h1 className="text-3xl font-bold text-[var(--palette-blue)] mb-2">
                {itinerario.tituloPrincipal}
                </h1>
                <h2 className="text-xl font-semibold mb-6">
                {itinerario.subtitulo}
                </h2>
                {/* --- CALENDARIO DESPLEGABLE REEMPLAZA AL <p> --- */}
          <div className="mb-4">
            <Label className="text-sm font-medium">Fechas del viaje</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"ghost"}
                  className="w-full justify-start text-left font-normal mt-1"
                  disabled={!isValidDate} 
                >
                  <CalendarIcon className="h-4 w-4" />
                  {displayDateRange}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  defaultMonth={dateRange?.from} 
                  numberOfMonths={1} 
                  disabled={true}
                  className="rounded-md border"
                />
              </PopoverContent>
            </Popover>
          </div>
          {/* --- FIN DEL REEMPLAZO --- */}

                <p className="text-sm">
                Detalles del lugar: {itinerario.detallesLugar}
                </p>
            </div>

            <div className="w-2/3 flex items-center">
                <DiasCarousel dias={itinerario.dias} />
            </div>
        </div>

    </>
  );
};

export default ItinerarioFrame;
