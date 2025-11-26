"use client";

import * as React from "react";
import Link from "next/link";
import { SUGGESTIONS } from "@/lib/constants/mock";
import { any } from "zod";

export interface PlaceResponse {
  id_api_place:  string;
  category:      string;
  mexican_state: string;
  nombre:        string;
  latitud:       number;
  longitud:      number;
  foto_url:      null | string;
  google_score:  number;
  total_reviews: number;
}

import Estrellas from "@/components/dashboard-components/estrellas";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


// Datos mejorados
const publicaciones = [
  {
    id: 1,
    titulo: "Fin de Semana Cultural en el Centro Histórico",
    calificacion: 4.5,
    usuario: {
      nombre: "Carlos Rodríguez",
      fotoPerfil: "https://st5.depositphotos.com/18273866/65276/i/950/depositphotos_652763588-stock-photo-one-man-young-adult-caucasian.jpg",
    },
    itinerario: [
      {
        dia: 1,
        url: "https://cloudfront-us-east-1.images.arcpublishing.com/elfinanciero/JU4F6HNZGNHE5FKEJ55JESYTJQ.jpg",
        descripcion: "Desayuno en el Café de Tacuba, el aroma del café recién hecho es increíble.",
        ubicacion: "Café de Tacuba, Centro Histórico",
        tags: ["restaurante"],
        horario: "9:00 AM"
      },
      {
        dia: 2,
        url: "https://godinchilango.mx/wp-content/uploads/2024/12/museo-palacio-bellas-artes-murales-arte-centro-historico-ciudad-mexico-cdmx_1.jpg",
        descripcion: "Recorriendo el Palacio de Bellas Artes. La arquitectura es impresionante.",
        ubicacion: "Palacio de Bellas Artes, Centro",
        tags: ["museo"],
        horario: "11:30 AM"
      },
      {
        dia: 3,
        url: "https://media.istockphoto.com/id/1190793837/es/foto/mexico-city-centro-historico-bellas-artes-sunset-alameda-central.jpg?s=612x612&w=0&k=20&c=g99rVHO_YOl5m_UPlfOy28TkizjzUShbJjVaRmVVg30=",
        descripcion: "Paseo por la Alameda Central al atardecer. El ambiente es mágico.",
        ubicacion: "Alameda Central, CDMX",
        tags: ["parque"],
        horario: "5:00 PM"
      },
      {
        dia: 4,
        url: "https://sic.gob.mx/imagenes_cache/museo_476_g_73330.png",
        descripcion: "Visita al Templo Mayor para conocer la historia azteca.",
        ubicacion: "Templo Mayor, Centro Histórico",
        tags: ["museo"],
        horario: "10:00 AM"
      },
    ],
  },
  {
    id: 2,
    titulo: "Tour Gastronómico por la Roma-Condesa",
    calificacion: 2.1,
    usuario: {
      nombre: "Ana Martínez",
      fotoPerfil: "https://b2472105.smushcdn.com/2472105/wp-content/uploads/2023/09/Poses-Perfil-Profesional-Mujeres-ago.-10-2023-1-819x1024.jpg?lossy=1&strip=1&webp=1",
    },
    itinerario: [
      {
        dia: 1,
        url: "https://i0.wp.com/foodandpleasure.com/wp-content/uploads/2021/03/brunch-condesa-lardomexico.jpg?resize=600%2C749&ssl=1",
        descripcion: "Brunch en la Condesa, el ambiente bohemio es único.",
        ubicacion: "Café Condesa, Roma-Condesa",
        tags: ["restaurante"],
        horario: "11:00 AM"
      },
      {
        dia: 1,
        url: "https://mexiconewsdaily.com/wp-content/uploads/2025/03/parque-mexico-b02.jpg",
        descripcion: "Caminata por el Parque México, perfecto para un día soleado.",
        ubicacion: "Parque México, Condesa",
        tags: ["parque"],
        horario: "2:00 PM"
      },
      {
        dia: 1,
        url: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/28/af/aa/5e/la-terraza-de-nuestro.jpg",
        descripcion: "Cena en un restaurante local de la zona, la comida es excepcional.",
        ubicacion: "Zona Rosa, CDMX",
        tags: ["restaurante"],
        horario: "8:00 PM"
      },
    ],
  },
  {
    id: 3,
    titulo: "Aventura en las Pirámides de Teotihuacán",
    calificacion: 4.8,
    usuario: {
      nombre: "Miguel Ángel Torres",
      fotoPerfil: "https://plus.unsplash.com/premium_photo-1689539137236-b68e436248de?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8cGVyc29uYXxlbnwwfHwwfHx8MA%3D%3D&fm=jpg&q=60&w=3000",
    },
    itinerario: [
      {
        dia: 1,
        url: "https://www.mexicodesconocido.com.mx/wp-content/uploads/2024/04/piramides-teotihuacan-1.jpg",
        descripcion: "Subida a la Pirámide del Sol al amanecer. Las vistas valen cada escalón.",
        ubicacion: "Zona Arqueológica de Teotihuacán, Edomex",
        tags: ["arqueología"],
        horario: "6:00 AM"
      },
      {
        dia: 1,
        url: "https://cdn2.cocinadelirante.com/sites/default/files/images/2023/11/receta-de-maguey-de-teotihuacan.jpg",
        descripcion: "Degustación de pulque artesanal en el mercado local.",
        ubicacion: "Mercado de San Juan, Teotihuacán",
        tags: ["gastronomía"],
        horario: "1:00 PM"
      },
      {
        dia: 1,
        url: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/33/f7/3e/photo0jpg.jpg",
        descripcion: "Visita al Museo de la Cultura Teotihuacana para entender mejor esta civilización.",
        ubicacion: "Museo de Sitio, Teotihuacán",
        tags: ["museo"],
        horario: "4:00 PM"
      },
    ],
  },
  {
    id: 4,
    titulo: "Fin de Semana Mágico en Huasca de Ocampo",
    calificacion: 4.9,
    usuario: {
      nombre: "Laura Mendoza",
      fotoPerfil: "https://i.pinimg.com/236x/9e/1b/7c/9e1b7c47a76007963af0f968a309def7.jpg",
    },
    itinerario: [
      {
        dia: 1,
        url: "https://www.mexicodesconocido.com.mx/wp-content/uploads/2019/09/prismas-basaticos-huasca-de-ocampo-hidalgo-1.jpg",
        descripcion: "Los Prismas Basálticos son una maravilla natural que te dejará sin palabras.",
        ubicacion: "Prismas Basálticos, Huasca de Ocampo",
        tags: ["naturaleza"],
        horario: "10:00 AM"
      },
      {
        dia: 1,
        url: "https://www.eluniversal.com.mx/resizer/5zN2dZ1r4cL8J1vZkC6G3q8Q9_c=/1100x666/cloudfront-us-east-1.images.arcpublishing.com/eluniversal/5SXBKJ5Y2RCJXKQ6A5JXWJ5H3I.jpg",
        descripcion: "Comida típica en una hacienda del siglo XVI con vistas increíbles.",
        ubicacion: "Hacienda Santa María Regla, Hidalgo",
        tags: ["gastronomía"],
        horario: "2:00 PM"
      },
      {
        dia: 2,
        url: "https://www.mexicodesconocido.com.mx/wp-content/uploads/2019/09/pueblo-magico-huasca-de-ocampo-hidalgo-1.jpg",
        descripcion: "Recorrido por las calles empedradas de este Pueblo Mágico lleno de encanto.",
        ubicacion: "Centro de Huasca de Ocampo, Hidalgo",
        tags: ["pueblo mágico"],
        horario: "11:00 AM"
      },
    ],
  },
  {
    id: 5,
    titulo: "Ruta del Vino y Queso en Querétaro",
    calificacion: 4.6,
    usuario: {
      nombre: "Roberto Silva",
      fotoPerfil: "https://plus.unsplash.com/premium_photo-1679769911227-429b4e1b184b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cmV0cmF0byUyMGRlJTIwYW5jaWFub3xlbnwwfHwwfHx8MA%3D%3D&fm=jpg&q=60&w=3000",
    },
    itinerario: [
      {
        dia: 1,
        url: "https://www.queretaro.travel/wp-content/uploads/2023/05/vinicola-la-redonda.jpg",
        descripcion: "Tour y degustación en una vinícola boutique. Los vinos son excelentes.",
        ubicacion: "Viñedo Freixenet, Ezequiel Montes",
        tags: ["gastronomía"],
        horario: "11:00 AM"
      },
      {
        dia: 1,
        url: "https://mediaim.expedia.com/destination/1/aa99b0b6c8c4f6a0e9b3c9c9c9c9c9c9.jpg",
        descripcion: "Visita a una quesería artesanal para probar los famosos quesos de la región.",
        ubicacion: "Quesería artesanal, Tequisquiapan",
        tags: ["gastronomía"],
        horario: "3:00 PM"
      },
      {
        dia: 2,
        url: "https://i.pinimg.com/236x/9e/1b/7c/9e1b7c47a76007963af0f968a309def7.jpg",
        descripcion: "Ascenso a la Peña de Bernal, el tercer monolito más grande del mundo.",
        ubicacion: "Peña de Bernal, Querétaro",
        tags: ["naturaleza"],
        horario: "9:00 AM"
      },
    ],
  },
  {
    id: 7,
    titulo: "Explorando Taxco: La Ciudad de la Plata",
    calificacion: 4.7,
    usuario: {
      nombre: "Diego Herrera",
      fotoPerfil: "https://www.lavanguardia.com/files/content_image_mobile_filter/uploads/2018/07/25/5fa43c9755611.jpeg",
    },
    itinerario: [
      {
        dia: 1,
        url: "https://www.mexicodesconocido.com.mx/wp-content/uploads/2019/09/taxco-guerrero-1.jpg",
        descripcion: "Recorrido por las calles empinadas y pintorescas del centro histórico.",
        ubicacion: "Centro Histórico, Taxco",
        tags: ["arquitectura"],
        horario: "9:00 AM"
      },
      {
        dia: 1,
        url: "https://www.mexicodesconocido.com.mx/wp-content/uploads/2019/09/iglesia-santa-prisca-taxco-1.jpg",
        descripcion: "Visita a la imponente Iglesia de Santa Prisca, joya del barroco mexicano.",
        ubicacion: "Santa Prisca, Taxco",
        tags: ["iglesia"],
        horario: "11:00 AM"
      },
      {
        dia: 1,
        url: "https://cdn2.cocinadelirante.com/sites/default/files/images/2023/11/pozole-taxqueno.jpg",
        descripcion: "Comida tradicional en un restaurante familiar con pozole excepcional.",
        ubicacion: "Mercado de Taxco, Guerrero",
        tags: ["gastronomía"],
        horario: "2:00 PM"
      },
      {
        dia: 2,
        url: "https://www.mexicodesconocido.com.mx/wp-content/uploads/2019/09/plateria-taxco-1.jpg",
        descripcion: "Compras de artesanías en plata en los talleres locales de platería.",
        ubicacion: "Talleres de Platería, Taxco",
        tags: ["artesanías"],
        horario: "10:00 AM"
      },
    ],
  }
];

// Componente para cada publicación individual
function PublicacionItem({ publicacion }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [emblaApi, setEmblaApi] = useState(null);

  // Obtener información del día actual basado en el slide
  const actividadActual = publicacion.itinerario[currentIndex];
  const diaActual = actividadActual?.dia || 1;
  
  // Obtener el rango de días del itinerario completo
  const diasUnicos = [...new Set(publicacion.itinerario.map(item => item.dia))];
  const totalDias = Math.max(...diasUnicos);

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
  <div className="flex flex-col md:flex-row gap-6 mb-8 p-4 border rounded-lg shadow-sm">
    {/* Carrusel de fotos */}
    <div className="md:w-1/2 relative">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        setApi={setEmblaApi}
        className="w-full"
      >
        <CarouselContent>
          {publicacion.itinerario.map((foto, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card className="overflow-hidden">
                  <CardContent className="flex aspect-square items-center justify-center p-0">
                    <img
                      src={foto.url}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white" />
        <CarouselNext className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white" />
      </Carousel>
      
    </div>
    
    {/* Información de la publicación */}
    <div className="md:w-1/2 space-y-4 relative">
      
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
      <div className="flex items-center gap-3">
        <img
          src={publicacion.usuario.fotoPerfil}
          alt="Foto de perfil"
          className="w-10 h-10 rounded-full object-cover border border-gray-200"
        />
        <div>
          <h3 className="text-base font-semibold text-xl">{publicacion.usuario.nombre}</h3>
        </div>
      </div>

      {/* Título del itinerario */}
      <h2 className="text-2xl font-bold">{publicacion.titulo}</h2>

      {/* Contenedor con altura fija para evitar movimiento */}
      <div className="min-h-[180px]">
        {/* Información de la actividad actual */}
        {actividadActual && (
          <div className="space-y-4">
            {/* Fila 1: Día y Horario */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm">Día {diaActual}</span>
              </div>
              <span className="text-sm">
                {actividadActual.horario}
              </span>
            </div>

            {/* Fila 2: Ubicación y Tags */}
            <div className="flex flex-col sm:flex-row gap-4 text-sm">
              <div className="flex items-center gap-2 flex-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
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
                <span className="truncate text-sm">{actividadActual.ubicacion}</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {actividadActual.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border border-gray-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Descripción - Texto más grande pero no como título */}
            <p className="text-base leading-relaxed text-xl">
              {actividadActual.descripcion}
            </p>
          </div>
        )}
      </div>

      {/* Calificación - Fijo en la parte inferior */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Calificar:</span>
          <Estrellas
            initial={0}
            onRate={(valor) => console.log("Nueva calificación:", valor)}
            size="sm"
          />
         <span className="text-2sm">{publicacion.calificacion}</span>
        </div>
      </div>
    </div>
  </div>
);
}

// Utilidades mejoradas
function Section({
  children,
  className = "",
  ...rest
}: React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>) {
  return (
    <section {...rest} className={`max-w-7xl mx-auto px-4 md:px-6 ${className}`}>
      {children}
    </section>
  );
}

const btn = {
  primary:
    "inline-flex items-center justify-center h-11 px-6 rounded-lg bg-primary text-white hover:bg-blue-700 transition-all duration-200 font-medium",
  ghost:
    "inline-flex items-center justify-center h-11 px-6 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-all duration-200 font-medium"
};

// Tarjeta de sugerencia mejorada
function PlaceCard({
  name,
  city,
  tag,
  img,
}: {
  name: string;
  city: string;
  tag: string;
  img: string;
}) {
  return (
    <article className="group snap-start min-w-[260px] rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="relative h-[160px] overflow-hidden">
        <img 
          src={img} 
          alt={name} 
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" 
        />
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-700">
            {tag}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h4 className="font-semibold text-gray-900 line-clamp-2 mb-1">{name}</h4>
        <p className="text-sm text-gray-600 mb-3">
          {city}
        </p>
        <Link
          href="/viajero/itinerarios/crear"
          className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2.5 hover:bg-gray-50 text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Añadir al itinerario
        </Link>
      </div>
    </article>
  );
}

// Componente de búsqueda mejorado
function SearchFilters({ query, estadoSeleccionado, onQueryChange, onEstadoChange }) {
  // Tags más comunes de las publicaciones
  const commonTags = [
    "restaurante", "museo", "parque", "historia", "gastronomía", 
    "naturaleza", "cultura", "aventura", "playa", "arquitectura"
  ];

  return (
    <div className="rounded-xl border border-gray-200 p-6 mb-8">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end justify-between">
        <div className="flex-1 min-w-0">
          <label htmlFor="search" className="block text-sm font-medium mb-2">
            Buscar itinerarios
          </label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input
              id="search"
              placeholder="Buscar por destino, usuario o actividad..."
              value={query}
              onChange={onQueryChange}
              className="pl-10 w-full"
            />
          </div>
        </div>
        
        <div className="w-full lg:w-auto">
          <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por estado
          </label>
          <Select value={estadoSeleccionado} onValueChange={onEstadoChange}>
            <SelectTrigger className="w-full lg:w-[200px]">
              <SelectValue placeholder="Selecciona un estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="CDMX">Ciudad de México</SelectItem>
              <SelectItem value="EDOMEX">Estado de México</SelectItem>
              <SelectItem value="Hidalgo">Hidalgo</SelectItem>
              <SelectItem value="Guerrero">Guerrero</SelectItem>
              <SelectItem value="Queretaro">Querétaro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full lg:w-auto pt-2 lg:pt-0">
          <Button 
            type="button" 
            className="w-full lg:w-auto bg-primary hover:bg-secondary"
            onClick={() => {
              onQueryChange({ target: { value: '' } });
              onEstadoChange('todos');
            }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reiniciar
          </Button>
        </div>
      </div>
      
      {/* Filtros rápidos con tags reales */}
      <div className="flex flex-wrap gap-2 mt-4">
        {commonTags.map(tag => (
          <button
            key={tag}
            onClick={() => onQueryChange({ target: { value: tag } })}
            className="px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-medium text-gray-700 capitalize"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ViajeroLanding() {
  const [query, setQuery] = useState("");
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("todos");

  const handleSearchChange = (e) => {
    setQuery(e.target.value);
  };

  const handleEstadoChange = (value) => {
    setEstadoSeleccionado(value);
  };

  // Añadir estado a las publicaciones existentes
  const publicacionesConEstado = publicaciones.map(pub => ({
    ...pub,
    estado: pub.itinerario[0]?.ubicacion?.includes('CDMX') ? 'CDMX' :
            pub.itinerario[0]?.ubicacion?.includes('Edomex') ? 'EDOMEX' :
            pub.itinerario[0]?.ubicacion?.includes('Hidalgo') ? 'Hidalgo' :
            pub.itinerario[0]?.ubicacion?.includes('Guerrero') ? 'Guerrero' :
            pub.itinerario[0]?.ubicacion?.includes('Querétaro') ? 'Queretaro' : 'CDMX'
  }));

  const publicacionesFiltradas = publicacionesConEstado.filter((publicacion) => {
    const coincideTexto =
      publicacion.usuario.nombre.toLowerCase().includes(query.toLowerCase()) ||
      publicacion.titulo.toLowerCase().includes(query.toLowerCase()) ||
      publicacion.itinerario.some((item) =>
        item.ubicacion.toLowerCase().includes(query.toLowerCase()) ||
        item.descripcion.toLowerCase().includes(query.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );

    const coincideEstado =
      estadoSeleccionado === "todos" ||
      publicacion.estado === estadoSeleccionado;

    return coincideTexto && coincideEstado;
  });

  const resultadosCount = publicacionesFiltradas.length;

  return (
    <div className="min-h-[calc(100dvh-64px)]">
      {/* SECCIÓN DE ITINERARIOS MEJORADA */}
      <Section id="itinerarios">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Descubre
            </h2>
            <p className="text-gray-600">
              Descubre los itinerarios compartidos por viajeros y viajeras como tú.
            </p>
          </div>
          <SearchFilters 
            query={query}
            estadoSeleccionado={estadoSeleccionado}
            onQueryChange={handleSearchChange}
            onEstadoChange={handleEstadoChange}
          />

          {/* Contador de resultados */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-600">
              {resultadosCount} {resultadosCount === 1 ? 'itinerario encontrado' : 'itinerarios encontrados'}
            </p>
            {query || estadoSeleccionado !== 'todos' ? (
              <button
                onClick={() => {
                  setQuery('');
                  setEstadoSeleccionado('todos');
                }}
                className="text-sm text-primary hover:text-secondary font-medium"
              >
                Limpiar filtros
              </button>
            ) : null}
          </div>

          {/* Grid de publicaciones */}
          <div className="grid gap-8">
            {publicacionesFiltradas.length > 0 ? (
              publicacionesFiltradas.map((p) => (
                <PublicacionItem key={p.id} publicacion={p} />
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No se encontraron itinerarios</h3>
                <p className="text-gray-600 mb-4 max-w-md mx-auto">
                  {query || estadoSeleccionado !== 'todos' 
                    ? "Intenta ajustar tus filtros de búsqueda para ver más resultados."
                    : "Pronto habrá más itinerarios disponibles."
                  }
                </p>
                {(query || estadoSeleccionado !== 'todos') && (
                  <Button 
                    onClick={() => {
                      setQuery('');
                      setEstadoSeleccionado('todos');
                    }}
                    className={btn.primary}
                  >
                    Ver todos los itinerarios
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </Section>


      {/* BLOQUE SOCIAL SIMPLIFICADO */}
      <Section id="feed" className="py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">
              De la comunidad
            </h3>
          </div>
          <Link 
            href="/viajero/itinerarios/nuevo" 
            className="mt-2 md:mt-0 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            Publicar mi viaje
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SUGGESTIONS.slice(0, 3).map((p, i) => (
            <article
              key={`feed-${p.id}`}
              className="rounded-xl border border-gray-200 overflow-hidden bg-white hover:shadow-lg transition-all duration-300"
            >
              <div className="relative h-[160px] overflow-hidden">
                <img
                  src={p.img}
                  alt={p.name}
                  className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-700 ">
                    Itinerario
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <span>@{p.id}</span>
                </div>
                <h4 className="font-semibold text-gray-900 line-clamp-2 mb-3">{p.name}</h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{p.city}</span>
                  <div className="flex items-center gap-1 text-sm text-yellow-600 ">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {4.2 + i * 0.3}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* FOOTER CTA SIMPLIFICADO */}
      <Section className="py-16">
        <div className="rounded-xl border border-gray-200 p-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            ¿Listo para tu próxima aventura?
          </h2>
          <p className="text-gray-600">
            Empieza a planificar tu viaje perfecto en segundos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link href="/viajero/itinerarios/nuevo" className={btn.primary}>
              Crear mi itinerario
            </Link>
            <Link href="#itinerarios" className={btn.ghost}>
              Explorar más ideas
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
