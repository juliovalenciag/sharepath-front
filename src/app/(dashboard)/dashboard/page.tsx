"use client"

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Datos de ejemplo con itinerarios en México
const publicaciones = [
  {
    id: 1,
    usuario: {
      nombre: "Carlos Rodríguez",
      fotoPerfil: "/images/profile1.jpg",
    },
    itinerario: [
      {
        url: "/images/centro1.jpg",
        calificacion: 4,
        descripcion: "Desayuno en el Café de Tacuba, el aroma del café recién hecho es increíble.",
        ubicacion: "Café de Tacuba, Centro Histórico"
      },
      {
        url: "/images/centro2.jpg",
        calificacion: 5,
        descripcion: "Recorriendo el Palacio de Bellas Artes. La arquitectura es impresionante.",
        ubicacion: "Palacio de Bellas Artes, Centro"
      },
      {
        url: "/images/centro3.jpg",
        calificacion: 4,
        descripcion: "Paseo por la Alameda Central al atardecer. El ambiente es mágico.",
        ubicacion: "Alameda Central, CDMX"
      },
    ],
  },
  {
    id: 2,
    usuario: {
      nombre: "Ana Martínez",
      fotoPerfil: "/images/profile2.jpg",
    },
    itinerario: [
      {
        url: "/images/condesa1.jpg",
        calificacion: 5,
        descripcion: "Brunch en la Condesa, el ambiente bohemio es único.",
        ubicacion: "Café Condesa, Roma-Condesa"
      },
      {
        url: "/images/condesa2.jpg",
        calificacion: 4,
        descripcion: "Caminata por el Parque México, perfecto para un día soleado.",
        ubicacion: "Parque México, Condesa"
      },
      {
        url: "/images/condesa3.jpg",
        calificacion: 5,
        descripcion: "Cena en un restaurante local de la zona, la comida es excepcional.",
        ubicacion: "Zona Rosa, CDMX"
      },
    ],
  },
];

// Componente para cada publicación individual
function PublicacionItem({ publicacion }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const fotoActual = publicacion.itinerario[currentIndex];

  const handleSlideChange = (api) => {
    const index = api.selectedScrollSnap();
    setCurrentIndex(index);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 mb-12 last:mb-0 p-6 border-b">
      
      {/* Carrusel de fotos */}
      <div className="md:w-1/2">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
          onSlideChange={handleSlideChange}
        >
          <CarouselContent>
            {publicacion.itinerario.map((foto, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card>
                    <CardContent className="flex aspect-square items-center justify-center p-2">
                      <img
                        src={foto.url}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      {/* Información de la publicación */}
      <div className="md:w-1/2 space-y-6">
        
        {/* Header del usuario */}
        <div className="flex items-center gap-4">
          <img
            src={publicacion.usuario.fotoPerfil}
            alt="Foto de perfil"
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h2 className="text-xl font-semibold">
              {publicacion.usuario.nombre}
            </h2>
          </div>
        </div>

        {/* Información de la foto actual */}
        <div className="space-y-4">
          
          {/* Ubicación */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{fotoActual.ubicacion}</span>
          </div>

          {/* Descripción */}
          <p className="text-lg leading-relaxed">
            {fotoActual.descripcion}
          </p>

          {/* Calificación */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, index) => (
                <svg
                  key={index}
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 ${
                    index < fotoActual.calificacion 
                      ? "text-yellow-500" 
                      : "text-gray-300"
                  }`}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 17.27l6.18 3.73-1.64-7.03L21 9.24l-7.19-.61L12 2 10.19 8.63 3 9.24l4.46 4.73-1.64 7.03L12 17.27z"
                    clipRule="evenodd"
                  />
                </svg>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {fotoActual.calificacion}/5
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}

// Componente principal que renderiza todas las publicaciones
export default function Publicacion() {
  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {publicaciones.map((publicacion) => (
          <PublicacionItem 
            key={publicacion.id} 
            publicacion={publicacion} 
          />
        ))}
      </div>
    </div>
  );
}
