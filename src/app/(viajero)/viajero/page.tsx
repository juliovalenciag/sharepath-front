"use client";

import * as React from "react";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  MapPin,
  Calendar,
  Search,
  Filter,
  MoreVertical,
  Heart,
  Share2,
  Star,
  Map as MapIcon,
  Compass,
  ArrowRight,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// --- MOCK DATA (Mantenemos tus datos) ---
const publicaciones = [
  {
    id: 1,
    titulo: "Fin de Semana Cultural en el Centro Histórico",
    calificacion: 4.5,
    usuario: {
      nombre: "Carlos Rodríguez",
      fotoPerfil:
        "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80",
    },
    descripcion:
      "Desayuno en el Café de Tacuba, el aroma del café recién hecho es increíble. Un recorrido por la historia viva de la ciudad.",
    ubicacion: "CDMX",
    dias: 4,
    lugares: 8,
    itinerario: [
      {
        url: "https://cloudfront-us-east-1.images.arcpublishing.com/elfinanciero/JU4F6HNZGNHE5FKEJ55JESYTJQ.jpg",
      },
      {
        url: "https://godinchilango.mx/wp-content/uploads/2024/12/museo-palacio-bellas-artes-murales-arte-centro-historico-ciudad-mexico-cdmx_1.jpg",
      },
      {
        url: "https://media.istockphoto.com/id/1190793837/es/foto/mexico-city-centro-historico-bellas-artes-sunset-alameda-central.jpg?s=612x612&w=0&k=20&c=g99rVHO_YOl5m_UPlfOy28TkizjzUShbJjVaRmVVg30=",
      },
    ],
    tags: ["Cultura", "Historia", "Comida"],
  },
  {
    id: 2,
    titulo: "Tour Gastronómico por la Roma-Condesa",
    calificacion: 4.8,
    usuario: {
      nombre: "Ana Martínez",
      fotoPerfil:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
    },
    descripcion:
      "Explorando los sabores únicos de la ciudad, desde tacos callejeros hasta alta cocina. ¡Imperdible!",
    ubicacion: "CDMX",
    dias: 1,
    lugares: 5,
    itinerario: [
      {
        url: "https://i0.wp.com/foodandpleasure.com/wp-content/uploads/2021/03/brunch-condesa-lardomexico.jpg?resize=600%2C749&ssl=1",
      },
      {
        url: "https://mexiconewsdaily.com/wp-content/uploads/2025/03/parque-mexico-b02.jpg",
      },
    ],
    tags: ["Gastronomía", "Lifestyle", "Pareja"],
  },
  {
    id: 3,
    titulo: "Aventura en las Pirámides de Teotihuacán",
    calificacion: 4.9,
    usuario: {
      nombre: "Miguel Ángel",
      fotoPerfil:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
    },
    descripcion:
      "Subida a la Pirámide del Sol al amanecer. Las vistas valen cada escalón. Energía pura.",
    ubicacion: "Edomex",
    dias: 1,
    lugares: 3,
    itinerario: [
      {
        url: "https://images.unsplash.com/photo-1706536610031-56776c5bb10a?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        url: "https://cdn2.cocinadelirante.com/sites/default/files/images/2023/11/receta-de-maguey-de-teotihuacan.jpg",
      },
    ],
    tags: ["Arqueología", "Aventura", "Senderismo"],
  },
  {
    id: 4,
    titulo: "Fin de Semana Mágico en Huasca",
    calificacion: 4.7,
    usuario: {
      nombre: "Laura Mendoza",
      fotoPerfil:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80",
    },
    descripcion:
      "Pueblo Mágico con encanto. Los Prismas Basálticos son una maravilla natural que te dejará sin palabras.",
    ubicacion: "Hidalgo",
    dias: 2,
    lugares: 4,
    itinerario: [
      {
        url: "https://images.unsplash.com/photo-1565746088991-b45229ba4981?q=80&w=1289&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        url: "https://images.unsplash.com/photo-1565746088991-b45229ba4981?q=80&w=1289&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
    ],
    tags: ["Naturaleza", "Pueblo Mágico", "Familia"],
  },
  {
    id: 5,
    titulo: "Ruta del Vino y Queso",
    calificacion: 4.6,
    usuario: {
      nombre: "Roberto Silva",
      fotoPerfil:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80",
    },
    descripcion:
      "Degustación en viñedos boutique y queserías artesanales. Un deleite para el paladar en Querétaro.",
    ubicacion: "Querétaro",
    dias: 2,
    lugares: 6,
    itinerario: [
      {
        url: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?q=80&w=2673&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        url: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?q=80&w=2673&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
    ],
    tags: ["Vino", "Gastronomía", "Relax"],
  },
  {
    id: 7,
    titulo: "Escapada Romántica a Tepoztlán",
    calificacion: 4.8,
    usuario: {
      nombre: "Diego Herrera",
      fotoPerfil:
        "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=100&q=80",
    },
    descripcion:
      "Calles empedradas, plata y vistas increíbles desde el Cristo Monumental.",
    ubicacion: "Morelos",
    dias: 2,
    lugares: 5,
    itinerario: [
      {
        url: "https://images.unsplash.com/photo-1674216436927-8d5475f83eeb?q=80&w=2000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        url: "https://images.unsplash.com/photo-1674216436927-8d5475f83eeb?q=80&w=2000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
    ],
    tags: ["Pueblo Mágico", "Arquitectura", "Fotos"],
  },
];

// --- COMPONENTE DE TARJETA MEJORADO ---
function PublicacionCard({ publicacion }: { publicacion: any }) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <Card className="group overflow-hidden border-border/60 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col h-full bg-card">
      {/* HEADER: Usuario */}
      <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border cursor-pointer hover:opacity-80 transition-opacity">
            <AvatarImage
              src={publicacion.usuario.fotoPerfil}
              alt={publicacion.usuario.nombre}
            />
            <AvatarFallback>{publicacion.usuario.nombre[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-none cursor-pointer hover:underline">
              {publicacion.usuario.nombre}
            </span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" /> {publicacion.ubicacion}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </CardHeader>

      {/* CARRUSEL DE IMÁGENES */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        <Carousel setApi={setApi} className="w-full h-full">
          <CarouselContent>
            {publicacion.itinerario.map((foto: any, index: number) => (
              <CarouselItem key={index}>
                <div className="relative w-full h-full aspect-[4/3]">
                  <img
                    src={foto.url}
                    alt={`${publicacion.titulo} - foto ${index + 1}`}
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Gradiente inferior para texto sobre imagen si fuera necesario */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Controles de Carrusel (Solo visibles en hover) */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <CarouselPrevious className="left-2 bg-black/30 hover:bg-black/50 border-0 text-white backdrop-blur-sm h-8 w-8" />
            <CarouselNext className="right-2 bg-black/30 hover:bg-black/50 border-0 text-white backdrop-blur-sm h-8 w-8" />
          </div>

          {/* Indicador de Páginas */}
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-full pointer-events-none">
            {current}/{count}
          </div>
        </Carousel>
      </div>

      {/* CONTENIDO */}
      <CardContent className="p-4 flex-1 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors cursor-pointer">
            {publicacion.titulo}
          </h3>
          <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded text-xs font-bold shrink-0">
            <Star className="h-3 w-3 fill-current" />
            {publicacion.calificacion}
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {publicacion.descripcion}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {publicacion.tags.slice(0, 3).map((tag: string) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-[10px] px-2 h-5 font-medium bg-muted/50 hover:bg-muted"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>

      <Separator className="bg-border/50" />

      {/* FOOTER */}
      <CardFooter className="p-3 bg-muted/5 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" /> {publicacion.dias} días
          </span>
          <span className="flex items-center gap-1.5">
            <MapIcon className="h-3.5 w-3.5" /> {publicacion.lugares} lugares
          </span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full"
          >
            <Heart className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-full"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            className="h-8 text-xs px-3 rounded-full ml-1"
            asChild
          >
            <Link href={`/viajero/itinerarios/ver`}>Ver Plan</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

// --- FILTROS (STICKY HEADER) ---
function FilterBar({
  query,
  onQueryChange,
  activeTag,
  onTagChange,
  activeState,
  onStateChange,
}: any) {
  const TAGS = [
    "Todos",
    "Gastronomía",
    "Cultura",
    "Naturaleza",
    "Aventura",
    "Pueblo Mágico",
    "Pareja",
    "Familia",
  ];

  return (
    <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/60 pb-2">
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        {/* Fila Superior: Búsqueda y Filtros Principales */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="¿A dónde quieres ir? Ej. Tacos en CDMX..."
              className="pl-9 bg-muted/40 border-border/60 focus-visible:bg-background transition-all h-10 rounded-xl"
              value={query}
              onChange={onQueryChange}
            />
          </div>

          <div className="flex gap-2">
            <Select value={activeState} onValueChange={onStateChange}>
              <SelectTrigger className="w-[140px] md:w-[180px] h-10 rounded-xl bg-muted/40 border-border/60">
                <div className="flex items-center gap-2 truncate">
                  <MapPin className="h-3.5 w-3.5 opacity-70" />
                  <SelectValue placeholder="Estado" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todo México</SelectItem>
                <SelectItem value="CDMX">Ciudad de México</SelectItem>
                <SelectItem value="EDOMEX">Estado de México</SelectItem>
                <SelectItem value="Hidalgo">Hidalgo</SelectItem>
                <SelectItem value="Querétaro">Querétaro</SelectItem>
                <SelectItem value="Morelos"> Morelos</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl border-border/60 bg-muted/40"
              title="Más filtros"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Fila Inferior: Tags (Scrollable) */}
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2 pb-1">
            {TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagChange(tag === "Todos" ? "" : tag)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-medium transition-all border",
                  activeTag === tag || (tag === "Todos" && activeTag === "")
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background border-border hover:border-primary/50 hover:bg-muted text-muted-foreground"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      </div>
    </div>
  );
}

// --- PÁGINA PRINCIPAL ---
export default function ViajeroLanding() {
  const [query, setQuery] = useState("");
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("todos");
  const [tagSeleccionado, setTagSeleccionado] = useState("");

  // Lógica de filtrado
  const publicacionesFiltradas = publicaciones.filter((pub) => {
    const searchLower = query.toLowerCase();

    // 1. Texto
    const matchText =
      pub.titulo.toLowerCase().includes(searchLower) ||
      pub.descripcion.toLowerCase().includes(searchLower) ||
      pub.usuario.nombre.toLowerCase().includes(searchLower);

    // 2. Estado
    const matchState =
      estadoSeleccionado === "todos" ||
      pub.ubicacion.toLowerCase().includes(estadoSeleccionado.toLowerCase());

    // 3. Tag
    const matchTag =
      tagSeleccionado === "" ||
      pub.tags.some((t) => t.toLowerCase() === tagSeleccionado.toLowerCase());

    return matchText && matchState && matchTag;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* HERO SECTION */}
      <section className="relative bg-muted/20 border-b border-border/40 pt-10 pb-6 md:pt-16 md:pb-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center p-2 bg-background rounded-full shadow-sm border mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Badge
              variant="secondary"
              className="rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider mr-2 bg-primary/10 text-primary hover:bg-primary/20"
            >
              Nuevo
            </Badge>
            <span className="text-xs font-medium pr-2">
              Explora itinerarios de la comunidad
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-balance mb-4">
            Descubre tu próxima <span className="text-primary">aventura</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
            Inspírate con itinerarios creados por viajeros como tú y planifica
            el viaje perfecto.
          </p>
        </div>

        {/* Elementos decorativos de fondo */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-40">
          <div className="absolute top-10 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        </div>
      </section>

      {/* FILTROS STICKY */}
      <FilterBar
        query={query}
        onQueryChange={(e: any) => setQuery(e.target.value)}
        activeState={estadoSeleccionado}
        onStateChange={setEstadoSeleccionado}
        activeTag={tagSeleccionado}
        onTagChange={setTagSeleccionado}
      />

      {/* GRID DE RESULTADOS */}
      <div className="max-w-7xl mx-auto px-4 py-8 pb-20">
        {/* Header de Resultados */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Compass className="h-5 w-5 text-primary" />
            Explorar
          </h2>
          <span className="text-sm text-muted-foreground">
            Mostrando <strong>{publicacionesFiltradas.length}</strong>{" "}
            {publicacionesFiltradas.length === 1 ? "viaje" : "viajes"}
          </span>
        </div>

        {publicacionesFiltradas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicacionesFiltradas.map((pub, idx) => (
              <div
                key={pub.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <PublicacionCard publicacion={pub} />
              </div>
            ))}
          </div>
        ) : (
          // EMPTY STATE
          <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-muted rounded-3xl bg-muted/5">
            <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              No encontramos viajes
            </h3>
            <p className="text-muted-foreground max-w-sm mt-2 mb-6">
              Intenta ajustar tus filtros de búsqueda o prueba con otros
              términos.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                setEstadoSeleccionado("todos");
                setTagSeleccionado("");
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
