"use client";

import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Definición de tipos (o puedes importarlos de un archivo común)
interface ItinerarioItem {
  dia: number;
  url: string;
  descripcion?: string;
  ubicacion: string;
  tags: string[];
  horario: string;
}

interface Publicacion {
  id: number;
  titulo: string;
  calificacion: number;
  usuario: {
    nombre: string;
    fotoPerfil: string;
  };
  descripcion?: string;
  itinerario: ItinerarioItem[];
}

interface PublicacionItemProps {
  publicacion: Publicacion;
}

export default function PublicacionItem({ publicacion }: PublicacionItemProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [emblaApi, setEmblaApi] = useState<any>(null);

  useEffect(() => {
    if (!emblaApi) return;

    const handleSelect = () => {
      setCurrentIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", handleSelect);
    return () => emblaApi.off("select", handleSelect);
  }, [emblaApi]);

  // Obtener estado de la ubicación
  const getEstado = () => {
    const ubicacion = publicacion.itinerario[0]?.ubicacion || "";
    if (ubicacion.includes('CDMX')) return 'CDMX';
    if (ubicacion.includes('Edomex')) return 'EDOMEX';
    if (ubicacion.includes('Hidalgo')) return 'Hidalgo';
    if (ubicacion.includes('Guerrero')) return 'Guerrero';
    if (ubicacion.includes('Querétaro')) return 'Queretaro';
    return 'CDMX';
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 mb-10 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
      {/* Carrusel de fotos */}
      <div className="md:w-1/2 relative group">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          setApi={setEmblaApi}
          className="w-full rounded-xl overflow-hidden"
        >
          <CarouselContent>
            {publicacion.itinerario.map((foto, index) => (
              <CarouselItem key={index}>
                <div className="p-0">
                  <div className="overflow-hidden rounded-lg">
                    <div className="flex aspect-square items-center justify-center p-0">
                      <img
                        src={foto.url}
                        alt={`Foto ${index + 1} del itinerario`}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          <CarouselPrevious className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/40 hover:bg-black/70 h-12 w-12 rounded-full transition-all duration-300 opacity-70 hover:opacity-100 shadow-lg" />
          <CarouselNext className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/40 hover:bg-black/70 h-12 w-12 rounded-full transition-all duration-300 opacity-70 hover:opacity-100 shadow-lg" />
        </Carousel>
        
        {/* Indicadores de posición */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
          {publicacion.itinerario.map((_, index) => (
            <button
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-white w-8 shadow-md' : 'bg-white/60 w-2 hover:bg-white/80'
              }`}
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`Ir a la imagen ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Contador de imágenes */}
        <div className="absolute top-4 right-4 bg-black/50 text-white text-sm px-2 py-1 rounded-full backdrop-blur-sm">
          {currentIndex + 1} / {publicacion.itinerario.length}
        </div>
      </div>
      
      {/* Información de la publicación */}
      <div className="md:w-1/2 space-y-5 relative">
        
        {/* Botón de reporte */}
        <button 
          className="absolute top-0 right-0 p-2 hover:text-red-500 transition-colors"
          aria-label="Reportar publicación"
          onClick={() => console.log("Reportar publicación:", publicacion.id)}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
        </button>

        {/* Header del usuario */}
        <div className="flex items-center gap-4">
          <img
            src={publicacion.usuario.fotoPerfil}
            alt={`Foto de perfil de ${publicacion.usuario.nombre}`}
            className="w-14 h-14 rounded-full object-cover shadow-md"
          />
          <div>
            <h3 className="text-lg font-semibold">{publicacion.usuario.nombre}</h3>
          </div>
        </div>

        {/* Título del itinerario */}
        <h2 className="text-2xl font-bold leading-tight">{publicacion.titulo}</h2>

        {/* Descripción del itinerario */}
        {publicacion.descripcion && (
          <div className="pt-2">
            <p className="text-lg leading-relaxed">
              {publicacion.descripcion}
            </p>
          </div>
        )}

        {/* Información adicional */}
        <div className="flex items-center gap-4 pt-4 text-sm border-t border-gray-100">
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{publicacion.itinerario.length} días</span>
          </div>
          
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{publicacion.itinerario.length} actividades</span>
          </div>
          
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{getEstado()}</span>
          </div>

          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>{publicacion.calificacion}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
