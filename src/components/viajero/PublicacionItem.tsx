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
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  MessageCircle,
  ExternalLink,
  Trash2,
  Edit2,
  MoreHorizontal,
  Flag,
  Send,
  Loader2,
  Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import { ItinerariosAPI } from "@/api/ItinerariosAPI";
import { ReportModal } from "./Reportar";
import { Resena, CreateResenaRequest, UpdateResenaRequest } from "@/api/interfaces/ApiRoutes";

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
  itinerario: Array<{ id: number; url: string; }>;
}

// Componente de Estrellas Reutilizable
function RatingStars({ rating, onRate, interactive = false, size = "md" }: { rating: number; onRate?: (r: number) => void; interactive?: boolean; size?: "sm" | "md" }) {
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
          <Star className={`${sizeClasses} ${star <= rating ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted-foreground/30"}`} />
        </button>
      ))}
    </div>
  );
}

export default function PublicacionItem({ publicacion }: { publicacion: Publicacion }) {
  // Estado UI
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("detalles"); // 'detalles' | 'resenas'

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
    // Simulación auth user
    const userData = localStorage.getItem('user');
    if (userData) {
        try {
            const u = JSON.parse(userData);
            setCurrentUser(u.username || u.email?.split('@')[0]);
        } catch (e) { console.error(e); }
    }
  }, []);

  // Cargar reseñas solo cuando se abre la tab
  useEffect(() => {
    if (activeTab === "resenas") {
        loadResenas();
    }
  }, [activeTab]);

  const loadResenas = async () => {
    try {
        setLoadingResenas(true);
        const api = ItinerariosAPI.getInstance();
        const data = await api.getResenasByPublicacion(publicacion.id);
        setResenas(data);
        if (currentUser) {
            const existing = data.find(r => r.usuario.username === currentUser);
            if (existing) {
                setUserResena(existing);
                setUserRating(existing.score);
                setUserComment(existing.commentario || "");
            }
        }
    } catch (error) { console.error(error); } 
    finally { setLoadingResenas(false); }
  };

  const handleActionResena = async (action: 'create' | 'update' | 'delete', id?: number) => {
      setSubmittingResena(true);
      const api = ItinerariosAPI.getInstance();
      try {
          if (action === 'create') {
              if (userRating === 0) throw new Error("Califica primero");
              const req: CreateResenaRequest = { score: userRating, commentario: userComment };
              const res = await api.createResena(publicacion.id, req);
              setResenas([res, ...resenas]);
              setUserResena(res);
              toast.success("¡Gracias por tu opinión!");
          } else if (action === 'update' && id) {
               const req: UpdateResenaRequest = { score: userRating, commentario: userComment };
               const res = await api.updateResena(id, req);
               setResenas(resenas.map(r => r.id === id ? res : r));
               setUserResena(res);
               setEditingId(null);
               toast.success("Reseña actualizada");
          } else if (action === 'delete' && id) {
              await api.deleteResena(id);
              setResenas(resenas.filter(r => r.id !== id));
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

  const promedio = resenas.length > 0 
    ? (resenas.reduce((a, b) => a + b.score, 0) / resenas.length) 
    : publicacion.calificacion;

  return (
    <article className="group flex flex-col bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-[580px]">
      
      {/* 1. Header del Usuario (Minimalista) */}
      <div className="flex items-center justify-between p-4 bg-background z-10">
        <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.open(`/viajero/perfil/${publicacion.usuario.nombre}`, '_blank')}>
           <Avatar className="h-9 w-9 border">
              <AvatarImage src={publicacion.usuario.fotoPerfil} />
              <AvatarFallback>{publicacion.usuario.nombre.substring(0,2).toUpperCase()}</AvatarFallback>
           </Avatar>
           <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground leading-none">{publicacion.usuario.nombre}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Viajero Explorador</span>
           </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted" onClick={() => setReportModalOpen(true)}>
            <Flag className="h-4 w-4" />
        </Button>
      </div>

      {/* 2. Área Visual (Carrusel) */}
      <div className="relative w-full aspect-[4/3] bg-muted overflow-hidden">
         <Carousel className="w-full h-full">
            <CarouselContent className="h-full ml-0">
                {publicacion.itinerario.length > 0 ? publicacion.itinerario.map((foto, idx) => (
                    <CarouselItem key={idx} className="pl-0 h-full">
                        <img src={foto.url} alt="img" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </CarouselItem>
                )) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                        <ImageIcon className="h-10 w-10 opacity-20" />
                    </div>
                )}
            </CarouselContent>
            {publicacion.itinerario.length > 1 && (
                <>
                 <CarouselPrevious className="left-2 bg-black/30 border-0 text-white hover:bg-black/50" />
                 <CarouselNext className="right-2 bg-black/30 border-0 text-white hover:bg-black/50" />
                </>
            )}
         </Carousel>
         
         {/* Badge Flotante de Rating */}
         <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {promedio.toFixed(1)}
         </div>
      </div>

      {/* 3. Contenido Interactivo (Tabs) */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col bg-background">
         <div className="flex items-center px-4 pt-2 border-b">
            <TabsList className="bg-transparent h-10 p-0 w-full justify-start gap-4">
               <TabsTrigger value="detalles" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2 text-sm text-muted-foreground data-[state=active]:text-foreground transition-all">
                  Historia
               </TabsTrigger>
               <TabsTrigger value="resenas" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2 text-sm text-muted-foreground data-[state=active]:text-foreground transition-all">
                  Reseñas
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
                    className="w-full mt-4 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                    onClick={() => window.open(`/viajero/itinerarios/${publicacion.itinerarioId}/verPublicacion`, '_blank')}
                >
                    <ExternalLink className="mr-2 h-4 w-4" /> Ver Itinerario Completo
                </Button>
            </TabsContent>

            <TabsContent value="resenas" className="mt-0 space-y-4">
                {/* Formulario rápido */}
                <div className="bg-muted/30 p-3 rounded-xl space-y-2">
                    {userResena && !editingId ? (
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-medium">Tu calificación:</span>
                            <div className="flex items-center gap-2">
                                <RatingStars rating={userResena.score} />
                                <div className="flex gap-1">
                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { setEditingId(userResena.id); setUserRating(userResena.score); setUserComment(userResena.commentario || "") }}><Edit2 className="h-3 w-3" /></Button>
                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500" onClick={() => handleActionResena('delete', userResena.id)}><Trash2 className="h-3 w-3" /></Button>
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
                                <Button size="icon" className="h-[40px] w-[40px]" disabled={submittingResena || userRating === 0} onClick={() => handleActionResena(editingId ? 'update' : 'create', editingId || undefined)}>
                                    {submittingResena ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}
                                </Button>
                            </div>
                        </>
                    )}
                </div>

                {/* Lista */}
                <div className="space-y-3">
                   {loadingResenas ? (
                       <div className="flex justify-center py-4"><Loader2 className="animate-spin text-muted-foreground" /></div>
                   ) : resenas.length > 0 ? (
                       resenas.map((r) => (
                           <div key={r.id} className="text-sm border-b border-border/40 pb-2 last:border-0">
                               <div className="flex justify-between mb-1">
                                   <span className="font-semibold text-xs">{r.usuario.nombre_completo}</span>
                                   <RatingStars rating={r.score} size="sm" />
                               </div>
                               <p className="text-muted-foreground text-xs">{r.commentario}</p>
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
  );
}
