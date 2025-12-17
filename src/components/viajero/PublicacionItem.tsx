"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  ExternalLink,
  Trash2,
  Edit2,
  Flag,
  Send,
  Loader2,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import { toast } from "sonner";
import { ItinerariosAPI } from "@/api/ItinerariosAPI";
import { ReportModal } from "./Reportar";
import { Resena, CreateResenaRequest, UpdateResenaRequest } from "@/api/interfaces/ApiRoutes";
import { useRouter } from "next/navigation";

// Interfaces reutilizadas
interface Publicacion {
  id: number;
  titulo: string;
  calificacion: number;
  usuario: {
    nombre: string;
    fotoPerfil: string;
    nombre_completo?: string;
  };
  descripcion?: string;
  itinerarioId: number;
  itinerario: Array<{ id: number; url: string }>;
}

// Componente de Estrellas Reutilizable
function RatingStars({
  rating,
  onRate,
  interactive = false,
  size = "md",
}: {
  rating: number;
  onRate?: (r: number) => void;
  interactive?: boolean;
  size?: "sm" | "md";
}) {
  const sizeClasses = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRate?.(star)}
          className={`${interactive ? "hover:scale-125 transition-transform cursor-pointer" : "cursor-default"}`}
        >
          <Star
            className={`${sizeClasses} ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

/**
 * Detecta si el click ocurrió dentro de un elemento interactivo
 * (para NO navegar al detalle cuando se presiona un botón, textarea, tab, etc.)
 */
function isFromInteractiveElement(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;

  return Boolean(
    el.closest(
      [
        "button",
        "a",
        "input",
        "textarea",
        "select",
        "[role='button']",
        "[role='menuitem']",
        "[data-prevent-card-nav='true']",
      ].join(",")
    )
  );
}

export default function PublicacionItem({ publicacion }: { publicacion: Publicacion }) {
  const router = useRouter();

  // Estado UI
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("detalles"); // 'detalles' | 'resenas'

  // Estados para el carrusel en grande
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Estados Lógica Reseñas
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [loadingResenas, setLoadingResenas] = useState(false);
  const [submittingResena, setSubmittingResena] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  // Usuario Actual
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userResena, setUserResena] = useState<Resena | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const u = JSON.parse(userData);
        setCurrentUser(u.username || u.email?.split("@")[0]);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Cargar reseñas solo cuando se abre la tab
  useEffect(() => {
    if (activeTab === "resenas") {
      loadResenas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadResenas = async () => {
    try {
      setLoadingResenas(true);
      const api = ItinerariosAPI.getInstance();
      const data = await api.getResenasByPublicacion(publicacion.id);
      setResenas(data);

      if (currentUser) {
        const existing = data.find((r) => r.usuario.username === currentUser);
        if (existing) {
          setUserResena(existing);
          setUserRating(existing.score);
          setUserComment(existing.commentario || "");
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingResenas(false);
    }
  };

  const handleActionResena = async (action: "create" | "update" | "delete", id?: number) => {
    setSubmittingResena(true);
    const api = ItinerariosAPI.getInstance();

    try {
      if (action === "create") {
        if (userRating === 0) throw new Error("Califica primero");
        const req: CreateResenaRequest = { score: userRating, commentario: userComment };
        const res = await api.createResena(publicacion.id, req);

        const updatedResenas = [res, ...resenas];
        setResenas(updatedResenas);
        setUserResena(res);
        setUserRating(res.score);
        setUserComment(res.commentario || "");
        toast.success("¡Gracias por tu opinión!");
      } else if (action === "update" && id) {
        const req: UpdateResenaRequest = { score: userRating, commentario: userComment };
        const res = await api.updateResena(id, req);

        const updatedResenas = resenas.map((r) => (r.id === id ? res : r));
        setResenas(updatedResenas);
        setUserResena(res);
        setEditingId(null);
        toast.success("Reseña actualizada");
      } else if (action === "delete" && id) {
        await api.deleteResena(id);

        const updatedResenas = resenas.filter((r) => r.id !== id);
        setResenas(updatedResenas);
        setUserResena(null);
        setUserRating(0);
        setUserComment("");
        toast.success("Reseña eliminada");
      }
    } catch (e: any) {
      toast.error(e.message || "Error en la operación");
    } finally {
      setSubmittingResena(false);
    }
  };

  // Lightbox (solo desde botón “Maximize” para no pelear con la navegación)
  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const goToPrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? publicacion.itinerario.length - 1 : prev - 1));
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prev) => (prev === publicacion.itinerario.length - 1 ? 0 : prev + 1));
  };

  // Navegación
  const navigateToProfile = (username: string) => {
    router.push(`/viajero/perfil/${username}`);
  };

  const navigateToItinerario = (itinerarioId: number) => {
    router.push(`/viajero/itinerarios/${itinerarioId}/verPublicacion`);
  };

  const navigateToPublicacionDetail = useCallback(() => {
    router.push(`/viajero/publicaciones/${publicacion.id}`);
  }, [router, publicacion.id]);

  // Manejo teclado para el lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;

      switch (e.key) {
        case "Escape":
          closeLightbox();
          break;
        case "ArrowLeft":
          goToPrevImage();
          break;
        case "ArrowRight":
          goToNextImage();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen]);

  // Si es Unsplash, normaliza tamaño
  const formatImageUrl = (url: string) => {
    if (url.includes("unsplash.com")) {
      return `${url}&w=800&h=600&fit=crop&crop=center`;
    }
    return url;
  };

  const promedio =
    resenas.length > 0 ? resenas.reduce((a, b) => a + b.score, 0) / resenas.length : publicacion.calificacion;

  /**
   * Click/teclado en tarjeta:
   * - Navega a detalle si no se clickeó un elemento interactivo.
   * - Accesible con Enter / Space.
   */
  const onCardClick = (e: React.MouseEvent<HTMLElement>) => {
    if (isFromInteractiveElement(e.target)) return;
    navigateToPublicacionDetail();
  };

  const onCardKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (isFromInteractiveElement(e.target)) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigateToPublicacionDetail();
    }
  };

  return (
    <>
      <article
        role="link"
        tabIndex={0}
        aria-label={`abrir publicación: ${publicacion.titulo}`}
        onClick={onCardClick}
        onKeyDown={onCardKeyDown}
        className="group flex flex-col bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-[580px] outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
      >
        {/* 1. Header del Usuario */}
        <div className="flex items-center justify-between p-4 bg-background z-10">
          <div
            data-prevent-card-nav="true"
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigateToProfile(publicacion.usuario.nombre)}
          >
            <Avatar className="h-9 w-9 border">
              <AvatarImage src={publicacion.usuario.fotoPerfil} />
              <AvatarFallback>{publicacion.usuario.nombre.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground leading-none hover:text-primary transition-colors">
                {publicacion.usuario.nombre}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Viajero Explorador</span>
            </div>
          </div>

          <Button
            data-prevent-card-nav="true"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:bg-muted"
            onClick={() => setReportModalOpen(true)}
          >
            <Flag className="h-4 w-4" />
          </Button>
        </div>

        {/* 2. Área Visual (Carrusel) */}
        <div className="relative w-full aspect-[4/3] bg-muted overflow-hidden cursor-pointer">
          <Carousel className="w-full h-full">
            <CarouselContent className="h-full ml-0">
              {publicacion.itinerario.length > 0 ? (
                publicacion.itinerario.map((foto, idx) => (
                  <CarouselItem
                    key={idx}
                    className="pl-0 h-full"
                    // OJO: ya NO abrimos lightbox al click de la imagen,
                    // aquí lo dejamos para navegar al detalle (comportamiento “feed”)
                    onClick={navigateToPublicacionDetail}
                  >
                    <div className="w-full h-full relative overflow-hidden">
                      <img
                        src={formatImageUrl(foto.url)}
                        alt={`Imagen ${idx + 1} de ${publicacion.titulo}`}
                        className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                        style={{ aspectRatio: "4/3" }}
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/800x600?text=Imagen+no+disponible";
                        }}
                      />
                    </div>
                  </CarouselItem>
                ))
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground cursor-default">
                  <ImageIcon className="h-10 w-10 opacity-20" />
                </div>
              )}
            </CarouselContent>

            {publicacion.itinerario.length > 1 && (
              <>
                <CarouselPrevious
                  data-prevent-card-nav="true"
                  className="left-2 bg-black/30 border-0 text-white hover:bg-black/50"
                />
                <CarouselNext
                  data-prevent-card-nav="true"
                  className="right-2 bg-black/30 border-0 text-white hover:bg-black/50"
                />
              </>
            )}
          </Carousel>

          {/* Botón para abrir lightbox (sin navegar) */}
          <button
            type="button"
            data-prevent-card-nav="true"
            onClick={(e) => {
              e.stopPropagation();
              openLightbox(0);
            }}
            className="absolute top-3 right-3 z-10 h-8 w-8 bg-black/60 text-white rounded-lg flex items-center justify-center hover:bg-black/80 transition-colors"
            aria-label="ver fotos en grande"
            title="ver fotos en grande"
          >
            <Maximize2 className="h-4 w-4" />
          </button>

          {/* Badge rating */}
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {promedio.toFixed(1)}
            <span className="text-xs font-normal opacity-80 ml-1">({resenas.length})</span>
          </div>
        </div>

        {/* 3. Contenido Interactivo (Tabs) */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col bg-background">
          <div className="flex items-center px-4 pt-2 border-b">
            <TabsList className="bg-transparent h-10 p-0 w-full justify-start gap-4">
              <TabsTrigger
                data-prevent-card-nav="true"
                value="detalles"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2 text-sm text-muted-foreground data-[state=active]:text-foreground transition-all"
              >
                Historia
              </TabsTrigger>
              <TabsTrigger
                data-prevent-card-nav="true"
                value="resenas"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2 text-sm text-muted-foreground data-[state=active]:text-foreground transition-all"
              >
                Reseñas ({resenas.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <TabsContent value="detalles" className="mt-0 h-full flex flex-col">
              <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-1" title={publicacion.titulo}>
                {publicacion.titulo}
              </h3>

              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                {publicacion.descripcion || "Sin descripción disponible."}
              </p>

              <Button
                data-prevent-card-nav="true"
                className="w-full mt-4 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                onClick={() => navigateToItinerario(publicacion.itinerarioId)}
              >
                <ExternalLink className="mr-2 h-4 w-4" /> Ver Itinerario Completo
              </Button>

              {/* CTA secundaria: ir al detalle explícitamente */}
              <Button
                data-prevent-card-nav="true"
                variant="secondary"
                className="w-full mt-2 rounded-xl"
                onClick={navigateToPublicacionDetail}
              >
                ver publicación completa
              </Button>
            </TabsContent>

            <TabsContent value="resenas" className="mt-0 space-y-4">
              {/* Formulario rápido */}
              <div className="bg-muted/30 p-3 rounded-xl space-y-2" data-prevent-card-nav="true">
                {userResena && !editingId ? (
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">Tu calificación:</span>
                    <div className="flex items-center gap-2">
                      <RatingStars rating={userResena.score} />
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => {
                            setEditingId(userResena.id);
                            setUserRating(userResena.score);
                            setUserComment(userResena.commentario || "");
                          }}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-red-500 hover:text-red-600"
                          onClick={() => handleActionResena("delete", userResena.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold uppercase text-muted-foreground">Tu Opinión</span>
                      <RatingStars rating={userRating} onRate={setUserRating} interactive />
                    </div>
                    <div className="flex gap-2">
                      <Textarea
                        value={userComment}
                        onChange={(e) => setUserComment(e.target.value)}
                        placeholder="¿Qué opinas?"
                        className="min-h-[40px] h-[40px] resize-none text-xs py-2"
                      />
                      <Button
                        size="icon"
                        className="h-[40px] w-[40px]"
                        disabled={submittingResena || userRating === 0}
                        onClick={() => handleActionResena(editingId ? "update" : "create", editingId || undefined)}
                      >
                        {submittingResena ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                  </>
                )}
              </div>

              {/* Lista de reseñas */}
              <div className="space-y-3" data-prevent-card-nav="true">
                {loadingResenas ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin text-muted-foreground" />
                  </div>
                ) : resenas.length > 0 ? (
                  resenas.map((r) => (
                    <div key={r.id} className="text-sm border-b border-border/40 pb-2 last:border-0">
                      <div className="flex justify-between mb-1">
                        <button
                          onClick={() => navigateToProfile(r.usuario.username)}
                          className="font-semibold text-xs hover:text-primary transition-colors"
                        >
                          {r.usuario.username}
                        </button>
                        <RatingStars rating={r.score} size="sm" />
                      </div>
                      <p className="text-muted-foreground text-xs mt-1">{r.commentario}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-xs text-muted-foreground">Sé el primero en opinar.</div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <ReportModal open={reportModalOpen} onClose={setReportModalOpen} publicationId={publicacion.id} />
      </article>

      {/* Lightbox / Modal para ver imagen en grande */}
      {lightboxOpen && publicacion.itinerario.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" data-prevent-card-nav="true">
          <div className="relative w-full max-w-6xl max-h-[90vh]">
            {/* Botón cerrar */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-10 right-0 text-white hover:bg-white/20 z-50"
              onClick={closeLightbox}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Imagen principal */}
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={formatImageUrl(publicacion.itinerario[currentImageIndex].url)}
                alt={`Imagen ${currentImageIndex + 1} de ${publicacion.titulo}`}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/800x600?text=Imagen+no+disponible";
                }}
              />

              {/* Botones de navegación */}
              {publicacion.itinerario.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                    onClick={goToPrevImage}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                    onClick={goToNextImage}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}
            </div>

            {/* Contador y título */}
            <div className="text-white text-center mt-4">
              <div className="text-sm font-medium mb-1">
                {currentImageIndex + 1} / {publicacion.itinerario.length}
              </div>
              <div className="text-xs text-white/70">{publicacion.titulo}</div>
            </div>

            {/* Miniaturas */}
            {publicacion.itinerario.length > 1 && (
              <div className="mt-4 flex justify-center gap-2 overflow-x-auto py-2">
                {publicacion.itinerario.map((foto, idx) => (
                  <button
                    key={idx}
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex ? "border-primary" : "border-transparent hover:border-white/50"
                    }`}
                    onClick={() => setCurrentImageIndex(idx)}
                  >
                    <img src={formatImageUrl(foto.url)} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
