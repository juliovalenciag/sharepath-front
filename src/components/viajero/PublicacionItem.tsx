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
          className="w-6 h-6 hover:scale-110 transition-transform cursor-pointer"
        >
          <Star
            className={`${
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

export default function PublicacionItem({ publicacion }: PublicacionItemProps) {
  console.log ("PublicacionItem renderizado con datos:", publicacion);
  const [view, setView] = useState<'main' | 'rating' | 'comments'>('main');
  const [userRating, setUserRating] = useState(0);
  const [newComment, setNewComment] = useState("");

  // Datos de ejemplo para comentarios
  const [comentarios, setComentarios] = useState([
    {
      id: 1,
      usuario: {
        nombre: "María García",
        fotoPerfil: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100",
      },
      texto: "Perfecta organización de tiempo",
    },
    {
      id: 2,
      usuario: {
        nombre: "Carlos López",
        fotoPerfil: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      },
      texto: "Segui este itinerario al pie de la letra",
    },
  ]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    const newCommentObj = {
      id: comentarios.length + 1,
      usuario: {
        nombre: "Tú",
        fotoPerfil: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100",
      },
      texto: newComment,
    };

    setComentarios([...comentarios, newCommentObj]);
    setNewComment("");
  };

  const handleVerDetalles = () => {
    window.open(`/itinerario/${publicacion.id}`, '_blank');
  };

  return (
    <article className="rounded-xl shadow-lg mb-8 overflow-hidden border">
      <div className="flex flex-col lg:flex-row">
        {/* Columna izquierda - Carrusel */}
        <div className="lg:w-3/4 relative group">
          <Carousel
            opts={{ align: "start", loop: true }}
            className="w-full"
          >
            <CarouselContent>
              {publicacion.itinerario.map((foto, index) => (
                <CarouselItem key={index}>
                  <div className="aspect-square lg:aspect-[4/3]">
                    <img
                      src={foto.url}
                      alt={`Actividad ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Flechas solo visibles en hover */}
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-10 w-10 rounded-full shadow-lg border" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-10 w-10 rounded-full shadow-lg border" />
          </Carousel>
        </div>

        {/* Columna derecha - Contenido */}
        <div className="lg:w-1/2 p-6 lg:p-8">
          {/* Header con foto y nombre */}
          <div className="flex items-center gap-3 mb-6">
            <img
              src={publicacion.usuario.fotoPerfil}
              alt={publicacion.usuario.nombre}
              className="w-12 h-12 rounded-full object-cover border"
            />
            <div>
              <h3 className="font-bold">{publicacion.usuario.nombre}</h3>
            </div>
          </div>

          {/* Contenido según la vista */}
          {view === 'main' ? (
            <>
              {/* Título */}
              <h2 className="text-2xl font-bold mb-3">{publicacion.titulo}</h2>
              
              {/* Descripción */}
              {publicacion.descripcion && (
                <div className="mb-6">
                  <p className="leading-relaxed">{publicacion.descripcion}</p>
                </div>
              )}
              
              {/* Calificación del itinerario */}
              <div className="flex items-center gap-3 mb-8">
                <RatingStars rating={publicacion.calificacion} />
                <span className="text-lg font-bold">
                  {publicacion.calificacion.toFixed(1)}
                </span>
              </div>
              
              {/* Botones */}
              <div className="flex items-center gap-4 pt-6 border-t">
                <button
                  onClick={() => setView('rating')}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Star className="w-5 h-5" />
                  <span>Calificar</span>
                </button>
                
                <button
                  onClick={() => setView('comments')}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Comentar</span>
                </button>
                
                <button
                  onClick={handleVerDetalles}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span>Ver detalles</span>
                </button>
              </div>
            </>
          ) : view === 'rating' ? (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView('main')}
                  className="p-1 hover:bg-gray-50 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="font-semibold">Calificar itinerario</h3>
              </div>
              
              <div className="flex flex-col items-center justify-center py-8">
                <RatingStars 
                  rating={userRating} 
                  onRate={setUserRating} 
                  interactive 
                />
                <p className="mt-4">
                  {userRating === 0 
                    ? "Selecciona las estrellas para calificar" 
                    : `Tu calificación: ${userRating}.0`}
                </p>
                <Button 
                  onClick={() => {
                    console.log(`Calificación enviada: ${userRating}`);
                    setView('main');
                  }}
                  disabled={userRating === 0}
                  className="mt-6"
                >
                  Enviar calificación
                </Button>
              </div>
            </div>
          ) : view === 'comments' ? (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView('main')}
                  className="p-1 hover:bg-gray-50 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="font-semibold">Comentarios</h3>
              </div>
              
              {/* Lista de comentarios */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto">
                {comentarios.map((comentario) => (
                  <div key={comentario.id} className="flex gap-3">
                    <img
                      src={comentario.usuario.fotoPerfil}
                      alt={comentario.usuario.nombre}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                    <div>
                      <div className="font-semibold text-sm">
                        {comentario.usuario.nombre}
                      </div>
                      <p className="text-sm">{comentario.texto}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Formulario para nuevo comentario */}
              <form onSubmit={handleAddComment} className="pt-4 border-t">
                <div className="mb-3">
                  <Input
                    type="text"
                    placeholder="Escribe tu comentario..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button 
                  type="submit"
                  disabled={!newComment.trim()}
                >
                  Publicar comentario
                </Button>
              </form>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
