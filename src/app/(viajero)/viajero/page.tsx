"use client";

import * as React from "react";
import Link from "next/link";
import { SUGGESTIONS } from "@/lib/constants/mock";

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
    estado: "CDMX",
    calificacion:5,
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
    calificacion: 4.7,
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
       <Estrellas
                initial={Number(publicacion.calificacion) || 0}
                onRate={(valor) => console.log("Nueva calificación:", valor)}/>
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
// Utilidades
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
    "inline-flex items-center justify-center h-11 px-5 rounded-[var(--radius)] bg-[var(--palette-blue)] text-[var(--primary-foreground)] hover:opacity-90 transition",
  ghost:
    "inline-flex items-center justify-center h-11 px-5 rounded-[var(--radius)] border hover:bg-muted transition",
};



// Tarjeta de sugerencia (desde mock)
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
    <article className="snap-start min-w-[240px] md:min-w-[280px] rounded-xl border bg-card overflow-hidden hover:shadow-sm transition">
      <div className="relative h-[150px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt={name} className="object-cover w-full h-full" />
      </div>
      <div className="p-3">
        <h4 className="font-medium line-clamp-2">{name}</h4>
        <p className="text-xs text-muted-foreground">
          {city} • {tag}
        </p>
        <Link
          href="/viajero/itinerarios/crear"
          className="mt-2 w-full block text-center border rounded-md py-2 hover:bg-muted text-sm"
        >
          Añadir al itinerario
        </Link>
      </div>
    </article>
  );
}

export default function ViajeroLanding() {
  const [query, setQuery] = useState("");
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("todos");

  const handleSearchChange = (e) => {
    setQuery(e.target.value);
  };
  const handleEstadoChange = (e) => {
    setEstadoSeleccionado(e.target.value);
  };
  const destacados = SUGGESTIONS.slice(0, 6);
  const naturaleza = SUGGESTIONS.filter((x) => x.tag === "Naturaleza");
  const cultura = SUGGESTIONS.filter((x) => x.tag === "Cultura");

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
    <div className="min-h-[calc(100dvh-64px)] bg-background text-foreground">
      {/* HERO */}
      <div className="relative">
        <div className="absolute inset-0 opacity-[.12] bg-[url('https://images.pexels.com/photos/14071000/pexels-photo-14071000.jpeg')] bg-cover bg-center" />
        <Section className="relative pt-10 md:pt-16 pb-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 text-xs md:text-sm px-2.5 py-1 rounded-full border bg-card/70 backdrop-blur">
              ✈️ Social + Planner • Comparte, sigue y planifica en equipo
            </span>
            <h1 className="mt-3 text-3xl md:text-5xl font-extrabold tracking-tight">
              Tu viaje,{" "}
              <span className="text-[var(--palette-blue)]">perfectamente</span>{" "}
              planificado.
            </h1>
            <p className="mt-3 text-muted-foreground max-w-prose">
              Crea itinerarios bellos y prácticos, descubre lugares confiables y
              comparte tu plan con amigos. Todo sincronizado con mapa, tiempos y
              recomendaciones.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link href="/viajero/itinerarios/nuevo" className={btn.primary}>
                Crear mi itinerario
              </Link>
              <a href="#feed" className={btn.ghost}>
                Ver comunidad
              </a>
            </div>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="rounded-xl border p-3 bg-card/60">
                <b>Itinerarios</b>
                <div className="text-muted-foreground">por día, con mapa</div>
              </div>
              <div className="rounded-xl border p-3 bg-card/60">
                <b>Colaboración</b>
                <div className="text-muted-foreground">invita a tus amigos</div>
              </div>
              <div className="rounded-xl border p-3 bg-card/60">
                <b>Explorar</b>
                <div className="text-muted-foreground">lugares verificados</div>
              </div>
              <div className="rounded-xl border p-3 bg-card/60">
                <b>Red social</b>
                <div className="text-muted-foreground">sigue y comenta</div>
              </div>
            </div>
          </div>
        </Section>
      </div>

      <Section className="py-2 md:py-4">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border p-4 bg-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Naturaleza que impresiona</h3>
              <Link
                href="/viajero/itinerarios/nuevo"
                className="text-sm underline"
              >
                Armar ruta
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border p-4 bg-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Joyas culturales</h3>
              <Link
                href="/viajero/itinerarios/nuevo"
                className="text-sm underline"
              >
                Armar ruta
              </Link>
            </div>
          </div>
        </div>
      </Section>
      <Section className="py-2">
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
      </Section>
      {/* LLAMADO INTERMEDIO */}
      <Section className="py-10">
        <div className="relative overflow-hidden rounded-2xl border">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "color-mix(in oklch, var(--palette-blue) 18%, transparent)",
            }}
          />
          <div className="relative p-6 md:p-10 grid md:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">
                Planifica con tu equipo
              </h2>
              <p className="text-muted-foreground max-w-prose mt-2">
                Crea listas compartidas, comenta, vota y asigna lugares por día.
                Todo se ve en el mapa y se puede optimizar la ruta.
              </p>
            </div>
            <Link href="/viajero/itinerarios/nuevo" className={btn.primary}>
              Empezar ahora
            </Link>
          </div>
        </div>
      </Section>

      {/* BLOQUE SOCIAL (feed preview) */}
      <Section id="feed" className="py-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg md:text-xl font-semibold">De la comunidad</h3>
          <Link href="/viajero/itinerarios/nuevo" className="text-sm underline">
            Publicar mi viaje
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUGGESTIONS.slice(0, 3).map((p, i) => (
            <article
              key={`feed-${p.id}`}
              className="rounded-xl border overflow-hidden bg-card hover:shadow-sm transition"
            >
              <div className="relative h-[160px]">
                <img
                  src={p.img}
                  alt=""
                  className="object-cover w-full h-full"
                />
                <div className="absolute left-2 top-2 text-xs px-2 py-0.5 rounded-full bg-[var(--palette-blue)] text-[var(--primary-foreground)]">
                  Itinerario
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <span className="size-6 rounded-full bg-muted grid place-content-center">
                    🧑‍💻
                  </span>
                  <span>@kelo</span>
                  <span>·</span>
                  <span>{["Ayer", "Hoy", "Hace 2 d"][i % 3]}</span>
                </div>
                <h4 className="font-semibold line-clamp-1">{p.name}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {p.city} • {p.tag} — día {i + 1} del viaje
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    ❤️ 248 · 💬 32
                  </div>
                  <Link
                    href="/viajero/itinerarios/nuevo"
                    className="text-sm underline"
                  >
                    Duplicar
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* FOOT CTA */}
      <Section className="py-12">
        <div className="rounded-2xl border p-6 md:p-10 bg-card text-center">
          <h2 className="text-2xl md:text-3xl font-bold">
            ¿Listo para tu próximo viaje?
          </h2>
          <p className="text-muted-foreground mt-2">
            Empieza tu itinerario en segundos. Es gratis.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <Link href="/viajero/itinerarios/nuevo" className={btn.primary}>
              Crear itinerario
            </Link>
            <Link href="/viajero/itinerarios/nuevo" className={btn.ghost}>
              Explorar ideas
            </Link>
          </div>
        </div>
      </Section>

      <div className="h-8" />
    </div>
  );
}
