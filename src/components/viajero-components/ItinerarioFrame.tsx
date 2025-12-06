// components/ItinerarioFrame.tsx
"use client";
import DiasCarousel from "./DiaCarousel";
import Link from "next/link";
import { useState } from "react";
import { CalendarIcon, Ghost } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { Textarea } from "@/components/ui/textarea";
import Estrellas from "@/components/ui/Estrellas";
import { Loader2 } from "lucide-react"; //  Icono de carga animado

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { addDays, format } from "date-fns";
import { es } from "date-fns/locale"; // Para formatear la fecha en español
import { DateRange } from "react-day-picker";
import { useRouter } from "next/navigation"; // Importa el hook
export interface DiaDetalle {
  id: string | number;
  dia: string;
  categoria: string;
  titulo: string;
  urlImagen: string;
  calificacion: number;
}

export interface ItinerarioPrincipal {
  id: string | number;
  tituloPrincipal: string;
  subtitulo: string;
  calificacion: number;
  fechaInicio: string;
  detallesLugar: string;
  dias: DiaDetalle[]; // <-- Usa la interfaz de arriba
}
interface ItinerarioFrameProps {
  itinerario: ItinerarioPrincipal;
  onItinerarioDeleted: (id: string | number) => void;
}
import { Star } from "lucide-react";

const ItinerarioFrame: React.FC<ItinerarioFrameProps> = ({
  itinerario,
  onItinerarioDeleted,
}: ItinerarioFrameProps) => {
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const startDate = new Date(itinerario.fechaInicio);

  const numberOfDays = itinerario.dias.length;

  const isValidDate = !isNaN(startDate.getTime());

  const endDate = isValidDate
    ? addDays(startDate, numberOfDays - 2)
    : new Date();

  const dateRange: DateRange | undefined = isValidDate
    ? {
        from: startDate,
        to: endDate,
      }
    : undefined;

  const displayDateRange = isValidDate
    ? `${format(startDate, "dd 'de' LLL, yyyy", { locale: es })} - ${format(
        endDate,
        "dd 'de' LLL, yyyy",
        { locale: es }
      )}`
    : "Fechas no disponibles";
  const router = useRouter();

  const handleVerDetalles = (id: number) => {
    setMostrarAlerta(true);
    setTimeout(() => {
      setMostrarAlerta(false);
      router.push(`/viajero/itinerarios/${id}/ver`);
    }, 2000);
  };

  const handlePublicar = (id: number) => {
    setMostrarAlerta(true);
    setTimeout(() => {
      setMostrarAlerta(false);
      router.push(`/viajero/itinerarios/${id}/publicar`);
    }, 2000);
  };

  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  // --- FIN LÓGICA CALENDARIO ---

  return (
    <>
      {mostrarAlerta && (
        <div className="fixed top-4 right-4 bg-gray-100 text-gray-800 text-sm px-4 py-2 rounded-lg shadow-md flex items-center gap-2 z-50 border border-gray-300">
          <Loader2 className="animate-spin h-4 w-4 text-gray-600" />
          <div className="flex flex-col">
            <p className="font-semibold">Redirigiendo...</p>
            <p className="text-xs text-gray-500">
              Abriendo los detalles del itinerario
            </p>
          </div>
        </div>
      )}
      <div className="p-2 flex rounded-lg min-h-[300px] w-full">
        <div className="w-1/3 p-4 flex flex-col justify-center">
        {/* Las estrellas solo se van a ver cuando sea un itinerario publicado */}
          {/* <Estrellas value={itinerario.calificacion} /> */}

          <h2 className="text-3xl font-bold text-shadow-primary mb-2">
            {itinerario.tituloPrincipal}
          </h2>
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
                  <span className="hidden sm:inline">{displayDateRange}</span>
                  <span className="inline sm:hidden">Ver</span>
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

            {/* <p className="text-sm">
                    Detalles del lugar: {itinerario.detallesLugar}
                    </p> */}
            <div className="flex gap-5 justify-center">
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 hover:text-blue-600 px-3 py-2 rounded-lg w-auto h-auto text-base"
                onClick={() => handleVerDetalles(Number(itinerario.id))} // Pasa el id dinámicamente
              >
                Ver detalles
              </Button>
              <Button
              variant="ghost"
                size="sm"
                className="mt-4 hover:text-blue-600 px-3 py-2 rounded-lg w-auto h-auto text-base border-1"
                onClick={() => handlePublicar(Number(itinerario.id))} // Pasa el id dinámicamente
              >
                Publicar
              </Button>
            </div>
          </div>
        </div>
        <div className="w-2/3 flex items-center">
          <DiasCarousel
            dias={itinerario.dias}
            idItinerario={itinerario.id}
            onItinerarioDeleted={onItinerarioDeleted}
          />
        </div>
      </div>
    </>
  );
};

export default ItinerarioFrame;
