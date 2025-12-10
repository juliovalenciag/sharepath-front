"use client";

import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Star,
  MessageCircle,
  ChevronLeft,
  ExternalLink,
  Trash2,
  Edit2,
  X,
  Check,
  Loader2,
  Flag,
} from "lucide-react";
import { toast } from "sonner";
import { ItinerariosAPI } from "@/api/ItinerariosAPI";
import type { Publicacion } from "@/api/interfaces/ApiRoutes";
import { ReportModal } from "./Reportar";

// Tipos basados en tu interfaz
export interface Resena {
  id: number;
  score: number;
  commentario: string | null;
  usuario: {
    username: string;
    nombre_completo: string;
    foto_url: string | null;
  };
}

export interface CreateResenaRequest {
  score: number;
  commentario?: string;
}

export interface UpdateResenaRequest {
  score: number;
  commentario?: string;
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
  itinerarioId: number;
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
  interactive = false,
  size = "md"
}: { 
  rating: number; 
  onRate?: (rating: number) => void;
  interactive?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && onRate?.(star)}
          disabled={!interactive}
          className={`transition-transform ${interactive ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
        >
          <Star
            className={`${sizes[size]} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function PublicacionItem({ publicacion }: PublicacionItemProps) {
  const [view, setView] = useState<'main' | 'resenas'>('main');
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [reportModalOpen, setReportModalOpen] = useState(false);
  
  // Estados para reseñas reales
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [loadingResenas, setLoadingResenas] = useState(false);
  const [submittingResena, setSubmittingResena] = useState(false);
  const [editingResenaId, setEditingResenaId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  
  // Estado para la reseña del usuario actual (si existe)
  const [userResena, setUserResena] = useState<Resena | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  // Obtener usuario actual
  useEffect(() => {
    // Ajusta esto según cómo manejas la autenticación en tu app
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUsername(user.username || user.email?.split('@')[0]);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Cargar reseñas al montar el componente o cambiar vista
  useEffect(() => {
    if (view === 'resenas') {
      loadResenas();
    }
  }, [view, publicacion.id]);

  // Cargar reseñas usando tu API singleton
  const loadResenas = async () => {
    try {
      setLoadingResenas(true);
      const api = ItinerariosAPI.getInstance();
      const data = await api.getResenasByPublicacion(publicacion.id);
      setResenas(data);
      
      // Buscar la reseña del usuario actual
      if (currentUsername) {
        const userResena = data.find(r => r.usuario.username === currentUsername);
        setUserResena(userResena || null);
        if (userResena) {
          setUserRating(userResena.score);
          setUserComment(userResena.commentario || "");
        }
      }
    } catch (error: any) {
      console.error('Error al cargar reseñas:', error);
      toast.error(error.message || 'Error al cargar reseñas');
    } finally {
      setLoadingResenas(false);
    }
  };

  // Enviar nueva reseña usando tu API singleton
  const handleSubmitResena = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userRating === 0) {
      toast.error('Por favor selecciona una calificación');
      return;
    }
    
    try {
      setSubmittingResena(true);
      
      const createResenaRequest: CreateResenaRequest = {
        score: userRating,
      };
      
      if (userComment.trim()) {
        createResenaRequest.commentario = userComment.trim();
      }
      
      const api = ItinerariosAPI.getInstance();
      const newResena = await api.createResena(publicacion.id, createResenaRequest);
      
      // Actualizar lista de reseñas
      setResenas(prev => [newResena, ...prev]);
      setUserResena(newResena);
      
      // Mostrar mensaje de éxito
      toast.success('Reseña publicada exitosamente');
      
      // Resetear formulario
      setUserRating(0);
      setUserComment("");
      
    } catch (error: any) {
      console.error('Error al publicar reseña:', error);
      toast.error(error.message || 'Error al publicar reseña');
    } finally {
      setSubmittingResena(false);
    }
  };

  // Editar reseña existente usando tu API singleton
  const handleEditResena = async (resenaId: number) => {
    if (editRating === 0) {
      toast.error('Por favor selecciona una calificación');
      return;
    }
    
    try {
      setSubmittingResena(true);
      
      const updateResenaRequest: UpdateResenaRequest = {
        score: editRating,
      };
      
      if (editComment.trim()) {
        updateResenaRequest.commentario = editComment.trim();
      }
      
      const api = ItinerariosAPI.getInstance();
      const updatedResena = await api.updateResena(resenaId, updateResenaRequest);
      
      // Actualizar lista de reseñas
      setResenas(prev => prev.map(r => 
        r.id === resenaId ? updatedResena : r
      ));
      
      // Actualizar reseña del usuario
      setUserResena(updatedResena);
      
      // Salir del modo edición
      setEditingResenaId(null);
      setEditRating(0);
      setEditComment("");
      
      toast.success('Reseña actualizada exitosamente');
      
    } catch (error: any) {
      console.error('Error al actualizar reseña:', error);
      toast.error(error.message || 'Error al actualizar reseña');
    } finally {
      setSubmittingResena(false);
    }
  };

  // Eliminar reseña usando tu API singleton
  const handleDeleteResena = async (resenaId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta reseña?')) {
      return;
    }
    
    try {
      const api = ItinerariosAPI.getInstance();
      await api.deleteResena(resenaId);
      
      // Actualizar lista de reseñas
      setResenas(prev => prev.filter(r => r.id !== resenaId));
      
      // Resetear reseña del usuario
      setUserResena(null);
      setUserRating(0);
      setUserComment("");
      
      toast.success('Reseña eliminada exitosamente');
      
    } catch (error: any) {
      console.error('Error al eliminar reseña:', error);
      toast.error(error.message || 'Error al eliminar reseña');
    }
  };

  // Iniciar edición de reseña
  const startEditResena = (resena: Resena) => {
    setEditingResenaId(resena.id);
    setEditRating(resena.score);
    setEditComment(resena.commentario || "");
  };

  // Cancelar edición
  const cancelEdit = () => {
    setEditingResenaId(null);
    setEditRating(0);
    setEditComment("");
  };

  const handleVerDetalles = () => {
    window.open(`/viajero/itinerarios/${publicacion.itinerarioId}/verPublicacion`, '_blank');
  };

  const handleVerUsuario = () => {
    // Aquí también podrías usar getOtherUserInfo si necesitas más datos
    window.open(`/viajero/perfil/${publicacion.usuario.nombre}`, '_blank');
  };

  // Función para obtener información del usuario si la necesitas
  const handleGetUserInfo = async (username: string) => {
    try {
      const api = ItinerariosAPI.getInstance();
      const userInfo = await api.getOtherUserInfo(username);
      console.log('Información del usuario:', userInfo);
      // Haz algo con la información del usuario
    } catch (error) {
      console.error('Error al obtener información del usuario:', error);
    }
  };

  // Calcular promedio real de reseñas
  const promedioReal = resenas.length > 0 
    ? resenas.reduce((sum, r) => sum + r.score, 0) / resenas.length
    : publicacion.calificacion;

  // Verificar si el usuario puede editar/eliminar una reseña
  const canUserEditResena = (resena: Resena) => {
    return currentUsername && resena.usuario.username === currentUsername;
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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={publicacion.usuario.fotoPerfil}
                    alt={publicacion.usuario.nombre}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div onClick={handleVerUsuario} className="cursor-pointer hover:underline">
                    <h3 className="font-semibold">{publicacion.usuario.nombre}</h3>
                  </div>
                </div>
                {/* Boton de reportar */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 h-8 w-8"
                  title="Reportar publicación"
                  onClick={() => setReportModalOpen(true)}
                  >
                    <Flag className="w-4 h-4" />
                </Button>
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
                    <RatingStars rating={promedioReal} />
                    <span className="font-bold">
                      {promedioReal.toFixed(1)}
                    </span>
                    <span>
                      • {resenas.length} reseñas
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Calificación promedio basada en {resenas.length} reseñas
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
                  <span>Reseñas</span>
                </Button>
                
                <Button
                  onClick={handleVerDetalles}
                  className="flex-1 flex items-center justify-center gap-2 py-3"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Ver Itinerario</span>
                </Button>
              </div>
            </>
          ) : (
            /* Vista de reseñas */
            <div className="flex flex-col h-full">
              {/* Header de reseñas */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setView('main')}
                    className="p-1 hover:bg-gray-50 rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h3 className="font-semibold">Reseñas</h3>
                    <p className="text-sm text-gray-600">
                      {resenas.length} reseñas • {promedioReal.toFixed(1)} promedio
                    </p>
                  </div>
                </div>
              </div>

              {/* Formulario para nueva/editar reseña */}
              <div className="mb-4 p-4 rounded-lg">
                {userResena ? (
                  // Modo edición o visualización de reseña existente
                  <div>
                    {editingResenaId === userResena.id ? (
                      // Modo edición
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Tu calificación</label>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={cancelEdit}
                              className="h-8 px-2"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleEditResena(userResena.id)}
                              disabled={submittingResena || editRating === 0}
                              className="h-8 px-2"
                            >
                              {submittingResena ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <RatingStars 
                          rating={editRating} 
                          onRate={setEditRating} 
                          interactive 
                        />
                        <Textarea
                          placeholder="Tu comentario (opcional)"
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                          className="min-h-[80px] text-sm"
                        />
                      </div>
                    ) : (
                      // Visualización de reseña existente
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <RatingStars rating={userResena.score} />
                            <span className="text-sm font-medium">Tu reseña</span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEditResena(userResena)}
                              className="h-7 px-2"
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteResena(userResena.id)}
                              className="h-7 px-2 text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        {userResena.commentario && (
                          <p className="text-sm bg-white p-2 rounded border">
                            {userResena.commentario}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  // Formulario para nueva reseña
                  <form onSubmit={handleSubmitResena} className="space-y-3">
                    <label className="text-sm font-medium block">Deja tu reseña</label>
                    <div className="flex items-center gap-3 mb-2">
                      <RatingStars 
                        rating={userRating} 
                        onRate={setUserRating} 
                        interactive 
                      />
                      <Button 
                        type="submit"
                        disabled={submittingResena || userRating === 0}
                        size="sm"
                        className="ml-auto"
                      >
                        {submittingResena ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Publicando...
                          </>
                        ) : (
                          'Publicar'
                        )}
                      </Button>
                    </div>
                    <Textarea
                      placeholder="Comparte tu experiencia (opcional)"
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                      className="min-h-[80px] text-sm"
                    />
                  </form>
                )}
              </div>

              {/* Lista de reseñas con scroll */}
              <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                {loadingResenas ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                ) : resenas.length > 0 ? (
                  resenas.map((resena) => (
                    <div key={resena.id} className="pb-4 border-b last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={resena.usuario.foto_url || `https://ui-avatars.com/api/?name=${resena.usuario.nombre_completo}&background=random`}
                            alt={resena.usuario.nombre_completo}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-medium text-sm">
                              {resena.usuario.nombre_completo}
                            </div>
                            <RatingStars rating={resena.score} size="sm" />
                          </div>
                        </div>
                        {/* Mostrar botones de edición/eliminación solo para la reseña del usuario actual */}
                        {canUserEditResena(resena) && (
                          <div className="flex gap-1">
                            {editingResenaId !== resena.id && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => startEditResena(resena)}
                                  className="h-7 px-2"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteResena(resena.id)}
                                  className="h-7 px-2 text-red-500 hover:text-red-600"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      {resena.commentario && (
                        <p className="text-sm text-gray-700 pl-10">
                          {resena.commentario}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-600">
                      Sé el primero en dejar una reseña
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <ReportModal
        open={reportModalOpen}
        onClose={setReportModalOpen}
        publicationId={publicacion.id}
      />
    </article>
  );
}
