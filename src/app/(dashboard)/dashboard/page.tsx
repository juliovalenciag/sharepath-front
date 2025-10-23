"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
        descripcion:
          "Desayuno en el Café de Tacuba, el aroma del café recién hecho es increíble.",
        ubicacion: "Café de Tacuba, Centro Histórico",
      },
      {
        url: "/images/centro2.jpg",
        calificacion: 5,
        descripcion:
          "Recorriendo el Palacio de Bellas Artes. La arquitectura es impresionante.",
        ubicacion: "Palacio de Bellas Artes, Centro",
      },
      {
        url: "/images/centro3.jpg",
        calificacion: 4,
        descripcion:
          "Paseo por la Alameda Central al atardecer. El ambiente es mágico.",
        ubicacion: "Alameda Central, CDMX",
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
        ubicacion: "Café Condesa, Roma-Condesa",
      },
      {
        url: "/images/condesa2.jpg",
        calificacion: 4,
        descripcion:
          "Caminata por el Parque México, perfecto para un día soleado.",
        ubicacion: "Parque México, Condesa",
      },
      {
        url: "/images/condesa3.jpg",
        calificacion: 5,
        descripcion:
          "Cena en un restaurante local de la zona, la comida es excepcional.",
        ubicacion: "Zona Rosa, CDMX",
      },
    ],
  },
  {
    id: 3,
    usuario: {
      nombre: "Luis Hernández",
      fotoPerfil: "/images/profile3.jpg",
    },
    itinerario: [
      {
        url: "/images/chapultepec1.jpg",
        calificacion: 5,
        descripcion:
          "Explorando el Bosque de Chapultepec, la vista desde el Castillo es impresionante.",
        ubicacion: "Castillo de Chapultepec, CDMX",
      },
      {
        url: "/images/chapultepec2.jpg",
        calificacion: 5,
        descripcion:
          "Paseo en bote por el lago de Chapultepec, un lugar muy relajante.",
        ubicacion: "Lago de Chapultepec, CDMX",
      },
    ],
  },
  {
    id: 4,
    usuario: {
      nombre: "María López",
      fotoPerfil: "/images/profile4.jpg",
    },
    itinerario: [
      {
        url: "/images/xochimilco1.jpg",
        calificacion: 4,
        descripcion:
          "Un día en las trajineras de Xochimilco, ¡el ambiente es increíble!",
        ubicacion: "Xochimilco, CDMX",
      },
      {
        url: "/images/xochimilco2.jpg",
        calificacion: 4,
        descripcion:
          "Comiendo a bordo de una trajinera, la comida típica de México es deliciosa.",
        ubicacion: "Xochimilco, CDMX",
      },
      {
        url: "/images/xochimilco3.jpg",
        calificacion: 3,
        descripcion:
          "Un descanso en las orillas de Xochimilco, rodeados de naturaleza.",
        ubicacion: "Xochimilco, CDMX",
      },
      {
        url: "/images/xochimilco4.jpg",
        calificacion: 5,
        descripcion:
          "La música mariachi en Xochimilco le da un toque único al paseo.",
        ubicacion: "Xochimilco, CDMX",
      },
    ],
  },
  {
    id: 5,
    usuario: {
      nombre: "José Pérez",
      fotoPerfil: "/images/profile5.jpg",
    },
    itinerario: [
      {
        url: "/images/coyoacan1.jpg",
        calificacion: 5,
        descripcion:
          "Paseando por las calles de Coyoacán, el ambiente bohemio es muy agradable.",
        ubicacion: "Coyoacán, CDMX",
      },
      {
        url: "/images/coyoacan2.jpg",
        calificacion: 4,
        descripcion:
          "Visita al Museo Frida Kahlo, un lugar lleno de historia y arte.",
        ubicacion: "Museo Frida Kahlo, Coyoacán",
      },
      {
        url: "/images/coyoacan3.jpg",
        calificacion: 5,
        descripcion:
          "Cena en un restaurante local, la comida típica mexicana nunca decepciona.",
        ubicacion: "Coyoacán, CDMX",
      },
      {
        url: "/images/coyoacan4.jpg",
        calificacion: 4,
        descripcion:
          "Recorriendo la plaza central de Coyoacán, llena de vida y cultura.",
        ubicacion: "Plaza de Coyoacán, CDMX",
      },
    ],
  },
  {
    id: 6,
    usuario: {
      nombre: "Sofía Ruiz",
      fotoPerfil: "/images/profile6.jpg",
    },
    itinerario: [
      {
        url: "/images/santa_fe1.jpg",
        calificacion: 4,
        descripcion:
          "Un día en Santa Fe, el centro comercial es enorme y tiene de todo.",
        ubicacion: "Santa Fe, CDMX",
      },
      {
        url: "/images/santa_fe2.jpg",
        calificacion: 4,
        descripcion:
          "El parque de Santa Fe tiene un ambiente muy moderno y relajante.",
        ubicacion: "Santa Fe, CDMX",
      },
      {
        url: "/images/santa_fe3.jpg",
        calificacion: 3,
        descripcion:
          "Paseando por los alrededores de Santa Fe, ideal para tomar fotos.",
        ubicacion: "Santa Fe, CDMX",
      },
      {
        url: "/images/santa_fe4.jpg",
        calificacion: 5,
        descripcion:
          "El atardecer desde el mirador de Santa Fe es simplemente espectacular.",
        ubicacion: "Santa Fe, CDMX",
      },
    ],
  },
  {
    id: 7,
    usuario: {
      nombre: "Martín González",
      fotoPerfil: "/images/profile7.jpg",
    },
    itinerario: [
      {
        url: "/images/puebla1.jpg",
        calificacion: 5,
        descripcion:
          "El Zócalo de Puebla es impresionante, lleno de arquitectura colonial.",
        ubicacion: "Zócalo de Puebla",
      },
      {
        url: "/images/puebla2.jpg",
        calificacion: 5,
        descripcion:
          "Visitando la iglesia de Santo Domingo, una maravilla arquitectónica.",
        ubicacion: "Iglesia de Santo Domingo, Puebla",
      },
      {
        url: "/images/puebla3.jpg",
        calificacion: 5,
        descripcion:
          "Paseo por el mercado de artesanías de Puebla, lleno de colores y cultura.",
        ubicacion: "Mercado de Artesanías, Puebla",
      },
    ],
  },
];


// Componente para cada publicación individual
function PublicacionItem({ publicacion }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [emblaApi, setEmblaApi] = useState(null);

  // Detecta el cambio de slide
  useEffect(() => {
    if (!emblaApi) return;

    const handleSelect = () => {
      setCurrentIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", handleSelect);
    return () => emblaApi.off("select", handleSelect);
  }, [emblaApi]);

  return (
    <div className="flex flex-col md:flex-row gap-8 mb-12 last:mb-0 p-6 border-b">
      {/* Carrusel de fotos */}
      <div className="md:w-1/2">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          setApi={setEmblaApi} // ✅ Conectamos el API de embla aquí
          className="w-full"
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>{publicacion.itinerario[currentIndex].ubicacion}</span>
          </div>

          {/* Descripción */}
          <p className="text-lg leading-relaxed">
            {publicacion.itinerario[currentIndex].descripcion}
          </p>

          {/* Calificación */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, index) => (
                <svg
                  key={index}
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 ${
                    index < publicacion.itinerario[currentIndex].calificacion
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
              {publicacion.itinerario[currentIndex].calificacion}/5
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente principal que renderiza todas las publicaciones
export default function Publicacion() {
  const [query, setQuery] = useState("");

  const handleSearchChange = (e) => {
    setQuery(e.target.value);
  };

  return (
    <div className="py-8 px-4">
      {/* Formulario de búsqueda */}
      <div className="flex w-full max-w-sm items-center gap-2 mb-8">
        <Input
          placeholder="Busca a un amigo viajero"
          value={query}
          onChange={handleSearchChange}
        />
        <Button type="submit" variant="outline">
          Buscar
        </Button>
      </div>

      {/* Lista de publicaciones */}
      <div className="max-w-4xl mx-auto">
        {publicaciones
          .filter((publicacion) =>
            publicacion.usuario.nombre.toLowerCase().includes(query.toLowerCase())
          )
          .map((publicacion) => (
            <PublicacionItem key={publicacion.id} publicacion={publicacion} />
          ))}
      </div>
    </div>
  );
}

