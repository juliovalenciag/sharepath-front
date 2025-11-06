// components/DiasCarousel.tsx

import DiaCard from "./DiaCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface DiaDetalle {
  id: number;
  dia: string;
  categoria: string;
  titulo: string;
  urlImagen: string;
  calificacion: string;
}

interface DiasCarouselProps {
  dias: DiaDetalle[];
  tituloItinerario?: string;
}

const CarouselDias: React.FC<DiasCarouselProps> = ({
  dias,
  tituloItinerario,
}) => {
  const { toast } = useToast();

  const handleAccion = (accion: string) => {
    toast({
      title: "",
      description: `Has elegido ${accion.toLowerCase()} el itinerario${
        tituloItinerario ? ` "${tituloItinerario}"` : ""
      }.`,
      variant: "default",
    });
  };

  const handleError = (mensaje: string) => {
    toast({
      title: "",
      description: mensaje,
      variant: "destructive",
    });
  };

  return (
    <div className="relative w-full">
      {/* Botón de los tres puntitos, bien separado arriba */}
      <div className="flex justify-end pr-6 pt-2 mb-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-full hover:bg-gray-100 transition">
              <MoreHorizontal className="h-6 w-6 text-gray-600 hover:text-black" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => handleAccion("Editar")}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:text-red-700"
              onClick={() =>
                confirm("¿Seguro que deseas eliminar este itinerario?")
                  ? handleAccion("Eliminar")
                  : handleError("Operación cancelada")
              }
            >
              Eliminar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAccion("Compartir")}>
              Compartir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Carrusel de los días */}
      <Carousel opts={{ align: "start" }} className="w-full">
        <CarouselContent>
          {dias.map((dia) => (
            <CarouselItem key={dia.id} className="md:basis-1/3">
              <div className="p-1">
                <DiaCard diaDetalle={dia} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default CarouselDias;
