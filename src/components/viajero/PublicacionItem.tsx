"use client";

import { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Star,
  MessageCircle,
  ChevronLeft,
  ExternalLink,
} from "lucide-react";

interface Publicacion {
  id: number;
  titulo: string;
  calificacion: number;
  usuario: {
    nombre: string;
    fotoPerfil: string;
  };
  descripcion?: string;
  itinerario: Array<{
    id: number;
    url: string;
  }>;
}

interface PublicacionItemProps {
  publicacion: Publicacion;
}

// Componente de estrellas
function RatingStars({ 
  rating, 
  onRate, 
  interactive = false 
}: { 
  rating: number; 
  onRate?: (rating: number) => void;
  interactive?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && onRate?.(star)}
          disabled={!interactive}
          className="w-6 h-6 transition-transform cursor-pointer"
        >
          <Star
            className={`w-5 h-5 ${
              star <= rating
                ? 'fill-current'
                : 'fill-gray-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// Interfaz para reseñas
interface Resena {
  id: number;
  usuario: {
    nombre: string;
    fotoPerfil: string;
  };
  calificacion: number;
  comentario?: string;
}

export default function PublicacionItem({ publicacion }: PublicacionItemProps) {
  const [view, setView] = useState<'main' | 'resenas'>('main');
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");

  // Datos de ejemplo para reseñas
  const [resenas, setResenas] = useState<Resena[]>([
    {
      id: 1,
      usuario: {
        nombre: "María García",
        fotoPerfil: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100",
      },
      calificacion: 5,
      comentario: "Perfecta organización de tiempo, lo recomiendo mucho.",
    },
    {
      id: 2,
      usuario: {
        nombre: "Carlos López",
        fotoPerfil: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      },
      calificacion: 4,
      comentario: "Segui este itinerario al pie de la letra y fue increíble.",
    },
    {
      id: 3,
      usuario: {
        nombre: "Ana Martínez",
        fotoPerfil: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
      },
      calificacion: 5,
      comentario: "Las fotos no le hacen justicia, es mucho mejor en persona.",
    },
    {
      id: 4,
      usuario: {
        nombre: "Pedro Sánchez",
        fotoPerfil: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
      },
      calificacion: 4,
      comentario: "Excelente ruta, solo recomiendo llevar agua suficiente.",
    },
    {
      id: 5,
      usuario: {
        nombre: "Laura Gómez",
        fotoPerfil: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100",
      },
      calificacion: 5,
      comentario: "Lo hice con mi familia y todos quedamos encantados.",
    },
  ]);

  const handleSubmitResena = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userRating === 0) return;
    
    const newResena: Resena = {
      id: resenas.length + 1,
      usuario: {
        nombre: "Tú",
        fotoPerfil: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100",
      },
      calificacion: userRating,
      comentario: userComment.trim() || undefined,
    };

    setResenas([newResena, ...resenas]);
    setUserRating(0);
    setUserComment("");
  };

  const handleVerDetalles = () => {
    window.open(`/itinerario/${publicacion.id}`, '_blank');
  };

  return (
    <article className="rounded-xl shadow-lg mb-8 overflow-hidden border h-[500px]">
      <div className="flex flex-col lg:flex-row h-full">
        {/* Columna izquierda - Carrusel */}
        <div className="lg:w-3/5 relative group h-full">
          <Carousel
            opts={{ align: "start", loop: true }}
            className="w-full h-full"
          >
            <CarouselContent className="h-full">
              {publicacion.itinerario.map((foto, index) => (
                <CarouselItem key={index} className="h-full">
                  <div className="h-full">
                    <img
                      src={foto.url}
                      alt={`Actividad ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-10 w-10 rounded-full shadow-lg border" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-10 w-10 rounded-full shadow-lg border" />
          </Carousel>
        </div>

        {/* Columna derecha - Contenido */}
        <div className="lg:w-2/5 p-6 lg:p-8 h-full flex flex-col">
          {view === 'main' ? (
            <>
              {/* Header con foto y nombre */}
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={publicacion.usuario.fotoPerfil}
                  alt={publicacion.usuario.nombre}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold">{publicacion.usuario.nombre}</h3>
                  <p>Viajero</p>
                </div>
              </div>

              {/* Título y descripción */}
              <div className="flex-grow">
                <h2 className="text-xl font-bold mb-3">
                  {publicacion.titulo}
                </h2>
                
                {publicacion.descripcion && (
                  <div className="mb-6">
                    <p className="leading-relaxed line-clamp-4">
                      {publicacion.descripcion}
                    </p>
                  </div>
                )}
                
                {/* Calificación promedio */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <RatingStars rating={publicacion.calificacion} />
                    <span className="font-bold">
                      {publicacion.calificacion.toFixed(1)}
                    </span>
                    <span>
                      • {resenas.length} reseñas
                    </span>
                  </div>
                  <p>
                    Calificación promedio
                  </p>
                </div>
              </div>
              
              {/* Botones */}
              <div className="flex items-center gap-4 pt-4 border-t">
                <Button
                  onClick={() => setView('resenas')}
                  variant="outline"
                  className="flex-1 flex items-center justify-center gap-2 py-3"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Reseña</span>
                </Button>
                
                <Button
                  onClick={handleVerDetalles}
                  className="flex-1 flex items-center justify-center gap-2 py-3"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Ver detalles</span>
                </Button>
              </div>
            </>
          ) : (
            /* Vista de reseñas */
            <div className="flex flex-col h-full">
              {/* Header de reseñas */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setView('main')}
                  className="p-1 hover:bg-gray-50 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="font-semibold">Reseñas</h3>
                  <p>
                    {resenas.length} reseñas • {publicacion.calificacion.toFixed(1)} promedio
                  </p>
                </div>
              </div>

              {/* Formulario para nueva reseña - COMPACTO */}
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <RatingStars 
                    rating={userRating} 
                    onRate={setUserRating} 
                    interactive 
                  />
                  <Button 
                    onClick={handleSubmitResena}
                    disabled={userRating === 0}
                    className="py-1 px-3 text-sm"
                  >
                    Publicar
                  </Button>
                </div>
                <Input
                  type="text"
                  placeholder="Comentario (opcional)"
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  className="w-full text-sm py-1"
                />
              </div>

              {/* Lista de reseñas con scroll */}
              <div className="flex-grow overflow-y-auto pr-2">
                {resenas.map((resena) => (
                  <div key={resena.id} className="mb-3 pb-3 border-b last:border-b-0 last:mb-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={resena.usuario.fotoPerfil}
                        alt={resena.usuario.nombre}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="font-medium text-sm">
                          {resena.usuario.nombre}
                        </div>
                        <RatingStars rating={resena.calificacion} />
                      </div>
                    </div>
                    {resena.comentario && (
                      <p className="text-sm">
                        {resena.comentario}
                      </p>
                    )}
                  </div>
                ))}
                
                {resenas.length === 0 && (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm">
                      Sé el primero en dejar una reseña
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
