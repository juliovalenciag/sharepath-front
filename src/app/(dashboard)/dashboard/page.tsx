"use client";

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
    estado: "CDMX",
    usuario: {
      nombre: "Carlos Rodríguez",
      fotoPerfil: "https://st5.depositphotos.com/18273866/65276/i/950/depositphotos_652763588-stock-photo-one-man-young-adult-caucasian.jpg",
    },
    itinerario: [
      {
        dia: 1,
        url: "https://cloudfront-us-east-1.images.arcpublishing.com/elfinanciero/JU4F6HNZGNHE5FKEJ55JESYTJQ.jpg",
        calificacion: 4.2,
        descripcion: "Desayuno en el Café de Tacuba, el aroma del café recién hecho es increíble.",
        ubicacion: "Café de Tacuba, Centro Histórico",
        tags: ["restaurante", "cafetería"],
        horario: "9:00 AM"
      },
      {
        dia: 1,
        url: "https://godinchilango.mx/wp-content/uploads/2024/12/museo-palacio-bellas-artes-murales-arte-centro-historico-ciudad-mexico-cdmx_1.jpg",
        calificacion: 4.8,
        descripcion: "Recorriendo el Palacio de Bellas Artes. La arquitectura es impresionante.",
        ubicacion: "Palacio de Bellas Artes, Centro",
        tags: ["museo", "arquitectura"],
        horario: "11:30 AM"
      },
      {
        dia: 1,
        url: "https://media.istockphoto.com/id/1190793837/es/foto/mexico-city-centro-historico-bellas-artes-sunset-alameda-central.jpg?s=612x612&w=0&k=20&c=g99rVHO_YOl5m_UPlfOy28TkizjzUShbJjVaRmVVg30=",
        calificacion: 4.5,
        descripcion: "Paseo por la Alameda Central al atardecer. El ambiente es mágico.",
        ubicacion: "Alameda Central, CDMX",
        tags: ["parque", "naturaleza"],
        horario: "5:00 PM"
      },
      {
        dia: 2,
        url: "https://sic.gob.mx/imagenes_cache/museo_476_g_73330.png",
        calificacion: 4.6,
        descripcion: "Visita al Templo Mayor para conocer la historia azteca.",
        ubicacion: "Templo Mayor, Centro Histórico",
        tags: ["museo", "historia"],
        horario: "10:00 AM"
      },
    ],
  },
  {
    id: 2,
    titulo: "Tour Gastronómico por la Roma-Condesa",
    estado: "CDMX",
    usuario: {
      nombre: "Ana Martínez",
      fotoPerfil: "https://b2472105.smushcdn.com/2472105/wp-content/uploads/2023/09/Poses-Perfil-Profesional-Mujeres-ago.-10-2023-1-819x1024.jpg?lossy=1&strip=1&webp=1",
    },
    itinerario: [
      {
        dia: 1,
        url: "https://i0.wp.com/foodandpleasure.com/wp-content/uploads/2021/03/brunch-condesa-lardomexico.jpg?resize=600%2C749&ssl=1",
        calificacion: 4.7,
        descripcion: "Brunch en la Condesa, el ambiente bohemio es único.",
        ubicacion: "Café Condesa, Roma-Condesa",
        tags: ["restaurante", "brunch"],
        horario: "11:00 AM"
      },
      {
        dia: 1,
        url: "https://mexiconewsdaily.com/wp-content/uploads/2025/03/parque-mexico-b02.jpg",
        calificacion: 4.3,
        descripcion: "Caminata por el Parque México, perfecto para un día soleado.",
        ubicacion: "Parque México, Condesa",
        tags: ["parque", "ejercicio"],
        horario: "2:00 PM"
      },
      {
        dia: 2,
        url: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/28/af/aa/5e/la-terraza-de-nuestro.jpg",
        calificacion: 4.9,
        descripcion: "Cena en un restaurante local de la zona, la comida es excepcional.",
        ubicacion: "Zona Rosa, CDMX",
        tags: ["restaurante", "cena"],
        horario: "8:00 PM"
      },
    ],
  },
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
    <div className="flex flex-col md:flex-row gap-6 mb-8 p-4 border rounded-lg">
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
                  <Card>
                    <CardContent className="flex aspect-square items-center justify-center p-2">
                      <img
                        src={foto.url}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10" />
          <CarouselNext className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10" />
        </Carousel>
      </div>

      {/* Información de la publicación */}
      <div className="md:w-1/2 space-y-4">
        {/* Título del itinerario */}
        <h2 className="text-xl font-semibold">{publicacion.titulo}</h2>

        {/* Header del usuario */}
        <div className="flex items-center gap-3">
          <img
            src={publicacion.usuario.fotoPerfil}
            alt="Foto de perfil"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="font-medium">{publicacion.usuario.nombre}</h3>
            <p className="text-sm text-muted-foreground">{publicacion.estado}</p>
          </div>
        </div>

        {/* Información de la actividad actual */}
        {actividadActual && (
          <div className="space-y-3">
            {/* Indicador de día */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
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
                <span className="font-semibold">Día {diaActual}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} de {publicacion.itinerario.length} actividades
              </span>
            </div>

            {/* Horario y ubicación */}
            <div className="flex flex-col sm:flex-row gap-4 text-sm">
              <div className="flex items-center gap-2 flex-1">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{actividadActual.horario}</span>
              </div>

              <div className="flex items-center gap-2 flex-1">
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
                <span className="truncate">{actividadActual.ubicacion}</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {actividadActual.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Descripción */}
            <p className="text-sm leading-relaxed">
              {actividadActual.descripcion}
            </p>

            {/* Calificación */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 17.27l6.18 3.73-1.64-7.03L21 9.24l-7.19-.61L12 2 10.19 8.63 3 9.24l4.46 4.73-1.64 7.03L12 17.27z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">{actividadActual.calificacion}</span>
              </div>
              <span className="text-sm text-muted-foreground">/5.0</span>
            </div>

            {/* Indicador de progreso general */}
            <div className="text-center text-xs text-muted-foreground pt-2 border-t">
              Desliza para ver {totalDias > 1 ? `más actividades (${totalDias} días en total)` : "más actividades"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente principal
export default function Publicacion() {
  const [query, setQuery] = useState("");
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("todos");

  const handleSearchChange = (e) => {
    setQuery(e.target.value);
  };
  const handleEstadoChange = (e) => {
    setEstadoSeleccionado(e.target.value);
  };

  const publicacionesFiltradas = publicaciones.filter((publicacion) => {
    const coincideTexto =
      publicacion.usuario.nombre.toLowerCase().includes(query.toLowerCase()) ||
      publicacion.titulo.toLowerCase().includes(query.toLowerCase()) ||
      publicacion.itinerario.some((item) =>
        item.ubicacion.toLowerCase().includes(query.toLowerCase())
      );

    const coincideEstado =
      estadoSeleccionado === "todos" ||
      publicacion.estado === estadoSeleccionado;

    return coincideTexto && coincideEstado;
  });


  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Itinerarios de Viaje</h1>
          <p className="text-muted-foreground">
            Descubre experiencias compartidas por viajeros
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Buscador */}
          <Input
            placeholder="Buscar itinerarios..."
            value={query}
            onChange={handleSearchChange}
            className="flex-1 sm:w-64"
          />
          {/* Selector de estado */}
          <Select value={estadoSeleccionado} onValueChange={setEstadoSeleccionado}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Selecciona un estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="CDMX">CDMX</SelectItem>
              <SelectItem value="EDOMEX">EDOMEX</SelectItem>
              <SelectItem value="Hidalgo">Hidalgo</SelectItem>
              <SelectItem value="Morelos">Morelos</SelectItem>
              <SelectItem value="Queretaro">Querétaro</SelectItem>
            </SelectContent>
          </Select>

          <Button type="button">Buscar</Button>
        </div>
      </div>

      <div className="space-y-6">
        {publicacionesFiltradas.length > 0 ? (
          publicacionesFiltradas.map((p) => (
            <PublicacionItem key={p.id} publicacion={p} />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No se encontraron itinerarios
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
