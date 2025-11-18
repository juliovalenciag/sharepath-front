"use client";

import DiaCard2 from "./DiaCard";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Trash2,
  Pencil,
  Share2,
} from "lucide-react";
import { useState } from "react";
import { ItinerariosAPI } from "@/api/ItinerariosAPI";
import { toast } from "sonner";

interface DiaDetalle {
  id: string | number; // Corregido para coincidir con ItinerarioFrame
  dia: string;
  categoria: string;
  titulo: string;
  urlImagen: string;
  calificacion: number; // Corregido para coincidir con ItinerarioFrame
}

interface DiasCarouselProps {
  dias: DiaDetalle[];
  idItinerario: string | number;
  onItinerarioDeleted: (id: string | number) => void;
}

const CarouselDias: React.FC<DiasCarouselProps> = ({
  dias,
  idItinerario,
  onItinerarioDeleted,
}: DiasCarouselProps) => {
  const [openConfirm, setOpenConfirm] = useState(false);

  const [alerta, setAlerta] = useState<{
    mensaje: string;
    error: boolean;
  } | null>(null);

  // Mostrar alerta flotante (parte superior derecha)
  const mostrarAlerta = (texto: string, esError = false) => {
    setAlerta({ mensaje: texto, error: esError });
    setTimeout(() => setAlerta(null), 2000);
  };

  const handleEliminar = () => {
    setOpenConfirm(true);
  };

  const confirmarEliminacion = () => {
    setOpenConfirm(false);
    eliminarItinerario();
  };

  const cancelarEliminacion = () => {
    setOpenConfirm(false);
    mostrarAlerta("Operación cancelada", true);
  };
  const api = ItinerariosAPI.getInstance();
  const eliminarItinerario = () => {
    if (!idItinerario) {
      toast.error("No se pudo encontrar el ID del itinerario para eliminar.");
      return;
    }

    const promise = api.deleteItinerario(idItinerario);
    console.log("Se esta tomando como referencia el", idItinerario);
    toast.promise(promise, {
      loading: "Eliminando itinerario...",
      success: (data) => {
        onItinerarioDeleted(idItinerario);
        return data.message || "Itinerario eliminado con éxito";
      },
      error: (err) => {
        return err.message || "Error al eliminar el itinerario";
      },
    });
  };
  return (
    <div className="relative w-full">
      {/* ALERTA PEQUEÑA FLOTANTE */}
      {alerta && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-2 rounded-md shadow-md text-sm flex items-center gap-2 border transition-all duration-300 ${
            alerta.error
              ? "bg-gray-100 text-gray-700 border-gray-300"
              : "bg-green-100 text-green-800 border-green-300"
          }`}
        >
          {alerta.error ? (
            <XCircle className="h-4 w-4 text-gray-600" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          )}
          <span>{alerta.mensaje}</span>
        </div>
      )}

      {/* DIÁLOGO DE CONFIRMACIÓN */}
      <Dialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Seguro que deseas eliminar este itinerario?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={cancelarEliminacion}
              className="w-24"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmarEliminacion}
              className="w-24"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Botón de los tres puntitos */}
      <div className="flex justify-end pr-6 pt-2 mb-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-full hover:bg-gray-100 transition">
              <MoreHorizontal className="h-6 w-6 text-gray-600 hover:text-black" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={() => {
                /* Editar sin alerta */
              }}
            >
              <Pencil />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                /* Compartir sin alerta */
              }}
            >
              <Share2 />
              Compartir
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:text-red-700"
              onClick={handleEliminar}
            >
              <Trash2 className="text-red-600" />
              Eliminar
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
                <DiaCard2 diaDetalle={dia} />
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
