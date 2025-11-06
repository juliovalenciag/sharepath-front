"use client";

import ItinerarioFrame from "@/components/dashboard-components/ItinerarioFrame";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import { useToast } from "@/components/ui/use-toast"; // Importar hook para alertas (toasts)

const datosPublicacion = {
  id: "t1",
  tituloPrincipal: "Tepoztlan, Morelos",
  subtitulo: "Pueblo Mágico de Tepoztlan",
  calificacion: 2.5,
  fechaInicio: "2024-08-01",
  detallesLugar: "Este lugar es conocido por su rica cultura y hermosos paisajes.",
  dias: [
    {
      id: 1,
      dia: "Día 1",
      categoria: "Hotel",
      titulo: "Posada del Tepozteco",
      urlImagen: "/img/tepozteco1.jpg",
      calificacion: "3.2",
    },
    {
      id: 2,
      dia: "Día 2",
      categoria: "Cultura",
      titulo: "Cerro del Tepozteco",
      urlImagen: "/img/tepozteco2.jpg",
      calificacion: "2.2",
    },
    {
      id: 3,
      dia: "Día 3",
      categoria: "Comida",
      titulo: "Mercado de Tepoztlán",
      urlImagen: "/img/tepozteco3.jpg",
      calificacion: "5.0",
    },
    {
      id: 4,
      dia: "Día 4",
      categoria: "Descanso",
      titulo: "Balneario de Atongo",
      urlImagen: "/img/tepozteco4.jpg",
      calificacion: "2.4",
    },
  ],
};

export default function PublicacionPage() {
  const publicaciones = Array(6).fill(datosPublicacion);
  const { toast } = useToast(); // Inicializamos el sistema de alertas

  // Función para mostrar confirmación
  const handleAccion = (accion: string) => {
    toast({
      title:"",
      description: `Has elegido ${accion.toLowerCase()} la publicación.`,
      variant: "default",
    });
  };

  //Función para mostrar error simulado
  const handleError = (mensaje: string) => {
    toast({
      title:"",
      description: mensaje,
      variant: "destructive", // estilo rojo
    });
  };

  return (
    <div className="relative">
      {/* Botón azul marino con menú */}
      <div className="fixed top-24 right-10 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="default"
              className="bg-blue-900 hover:bg-blue-800 text-white rounded-full p-2 shadow-lg"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => handleAccion("Editar")}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                confirm("¿Seguro que deseas eliminar esta publicación?")
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

      {/* Contenido de las publicaciones */}
      <div className="space-y-10 mt-16">
        {publicaciones.map((pub, index) => (
          <div key={index} className="p-10 flex flex-col items-center">
            <ItinerarioFrame itinerario={pub} />

            {/* Botón inferior */}
            {index === publicaciones.length - 1 && (
              <Button
                className="mt-6 bg-blue-900 hover:bg-blue-800 text-white px-6 py-2 rounded-lg shadow-md"
                onClick={() => handleAccion("Ver detalles")}
              >
                Ver detalles
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
