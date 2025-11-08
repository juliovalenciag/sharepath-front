"use client";

import ItinerarioFrame from "@/components/dashboard-components/ItinerarioFrame";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react"; //  Icono de carga animado
import { useRouter } from "next/navigation";
import { useState } from "react";

const datosPublicacion = {
  id: 1,
  tituloPrincipal: "Tepoztlan, Morelos",
  subtitulo: "Pueblo Mágico de Tepoztlan",
  calificacion: 2.5,
  fechaInicio: "2024-08-01",
  detallesLugar: "Este lugar es conocido por su rica cultura y hermosos paisajes.",
  dias: [
    { id: 1, dia: "Día 1", categoria: "Hotel", titulo: "Posada del Tepozteco", urlImagen: "/img/tepozteco1.jpg", calificacion: "3.2" },
    { id: 2, dia: "Día 2", categoria: "Cultura", titulo: "Cerro del Tepozteco", urlImagen: "/img/tepozteco2.jpg", calificacion: "2.2" },
    { id: 3, dia: "Día 3", categoria: "Comida", titulo: "Mercado de Tepoztlán", urlImagen: "/img/tepozteco3.jpg", calificacion: "5.0" },
    { id: 4, dia: "Día 4", categoria: "Descanso", titulo: "Balneario de Atongo", urlImagen: "/img/tepozteco4.jpg", calificacion: "2.4" },
  ],
};

export default function PublicacionPage() {
  const publicaciones = Array(6).fill(datosPublicacion);
  const router = useRouter();
  const [mostrarAlerta, setMostrarAlerta] = useState(false);

  const handleVerDetalles = (id: number) => {
    setMostrarAlerta(true);
    setTimeout(() => {
      setMostrarAlerta(false);
      router.push(`/viajero/itinerarios/${id}/ver`);
    }, 2000);
  };

  return (
    <div className="relative">
      {/* ALERTA SUPERIOR DERECHA */}
      {mostrarAlerta && (
        <div
          className="fixed top-4 right-4 bg-gray-100 text-gray-800 text-sm px-4 py-2 rounded-lg shadow-md flex items-center gap-2 z-50 border border-gray-300"
        >
          <Loader2 className="animate-spin h-4 w-4 text-gray-600" />
          <div className="flex flex-col">
            <p className="font-semibold text-gray-700">Redirigiendo...</p>
            <p className="text-xs text-gray-500">
              Abriendo los detalles del itinerario
            </p>
          </div>
        </div>
      )}

      {/* PUBLICACIONES */}
      <div className="space-y-10 mt-16">
        {publicaciones.map((pub, index) => (
          <div key={index} className="p-10 flex flex-col items-start">
            <ItinerarioFrame itinerario={pub} />
            <div className="mt-4">
              <Button
                className="mt-4 bg-blue-900 hover:bg-blue-800 text-white px-6 py-2 rounded-lg shadow-md"
                onClick={() => handleVerDetalles(pub.id)}
              >
                Ver detalles
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
