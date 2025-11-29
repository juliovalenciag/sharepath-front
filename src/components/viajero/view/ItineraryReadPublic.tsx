"use client";
import { useEffect, useState, useRef } from "react";
import { Camera, MapPin, Calendar, Tag, Plus, X, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function ItineraryPublishView({ id }: { id: string }) {
  const router = useRouter();
  const [itinerario, setItinerario] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [descripcion, setDescripcion] = useState("");
  const [fotos, setFotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `https://harol-lovers.up.railway.app/itinerario/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("authToken") || "",
            },
          }
        );

        const data = await res.json();
        
        const actividadesOrdenadas = data.actividades?.sort(
          (a: any, b: any) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
        ) || [];

        // Agrupar por día
        const actividadesPorDia: Record<string, any[]> = {};

        actividadesOrdenadas.forEach((act: any) => {
          const fecha = new Date(act.fecha).toISOString().split("T")[0];
          if (!actividadesPorDia[fecha]) {
            actividadesPorDia[fecha] = [];
          }

          actividadesPorDia[fecha].push({
            id: act.id,
            titulo: act.lugar.nombre,
            descripcion: act.descripcionPersonal || "",
            imageUrl: act.fotoPersonal || act.lugar.foto_url,
            categoria: act.lugar.category,
            estado: act.lugar.mexican_state,
            lat: act.lugar.latitud,
            lng: act.lugar.longitud,
            calificacion: act.lugar.calificacion || 4,
            fecha: act.fecha,
            horario: "Todo el día",
            tags: [act.lugar.category]
          });
        });

        const dias = Object.keys(actividadesPorDia)
          .sort()
          .map((fecha, index) => ({
            dia: index + 1,
            fecha,
            lugares: actividadesPorDia[fecha],
          }));

        // Recopilar todas las fotos disponibles
        const todasLasFotos = actividadesOrdenadas
          .filter((act: any) => act.fotoPersonal || act.lugar.foto_url)
          .map((act: any) => act.fotoPersonal || act.lugar.foto_url);

        setItinerario({
          id: data.id,
          titulo: data.title,
          dias,
          resumen: {
            diasTotales: dias.length,
            totalLugares: actividadesOrdenadas.length,
            categorias: [...new Set(actividadesOrdenadas.map((a: any) => a.lugar.category))],
          }
        });

        setFotos(todasLasFotos);
        setDescripcion(data.descripcion || "");
      } catch (err) {
        console.error("Error cargando itinerario:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  // Manejar subida de fotos
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newPhotos: string[] = [];
    
    Array.from(files).forEach(file => {
      const imageUrl = URL.createObjectURL(file);
      newPhotos.push(imageUrl);
    });

    setFotos(prev => [...prev, ...newPhotos]);
  };

  // Eliminar foto
  const removePhoto = (index: number) => {
    setFotos(prev => prev.filter((_, i) => i !== index));
  };

  // Publicar itinerario
  const publicarItinerario = async () => {
    try {
      console.log("Publicando itinerario:", {
        descripcion,
        fotos: fotos.length,
        id: itinerario.id
      });
      
      alert('¡Itinerario publicado exitosamente!');
      router.push('/viajero/itinerarios');
    } catch (error) {
      console.error("Error publicando itinerario:", error);
      alert('Error al publicar el itinerario');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-lg">Cargando tu itinerario...</p>
      </div>
    </div>
  );

  if (!itinerario) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-xl">Itinerario no encontrado</p>
        <Button className="mt-4" onClick={() => router.push('/viajero/itinerarios')}>
          Volver a mis itinerarios
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Header minimalista */}
      <header className="sticky top-0 z-10 border-b backdrop-blur-sm bg-white/95">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => router.push('/viajero/itinerarios')}
            className="w-10 h-10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Crear Publicación</h1>
          <Button 
            onClick={publicarItinerario}
            disabled={!descripcion.trim() || fotos.length === 0}
          >
            Publicar
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Columna izquierda - Galería de fotos */}
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {/* Galería de fotos */}
                {fotos.length > 0 ? (
                  <div className="grid grid-cols-3 gap-1 p-1">
                    {fotos.map((foto, index) => (
                      <div key={index} className="relative aspect-square group">
                        <img
                          src={foto}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    
                    {/* Botón para añadir más fotos */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors"
                    >
                      <Plus className="w-8 h-8 mb-2" />
                      <span className="text-sm">Añadir más</span>
                    </button>
                  </div>
                ) : (
                  /* Estado vacío */
                  <div 
                    className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">Añade fotos de tu viaje</p>
                    <p className="text-sm opacity-70">Haz clic para seleccionar fotos</p>
                  </div>
                )}
                
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </CardContent>
            </Card>

            {/* Información del itinerario */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 mx-auto mb-2">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-bold">{itinerario.resumen.diasTotales}</p>
                    <p className="text-xs opacity-70">días</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 mx-auto mb-2">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-bold">{itinerario.resumen.totalLugares}</p>
                    <p className="text-xs opacity-70">lugares</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 mx-auto mb-2">
                      <Tag className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-bold">{itinerario.resumen.categorias.length}</p>
                    <p className="text-xs opacity-70">categorías</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna derecha - Información y descripción */}
          <div className="space-y-6">
            {/* Título del itinerario */}
            <div>
              <h1 className="text-2xl font-bold mb-4">{itinerario.titulo}</h1>
              
              {/* Descripción */}
              <div className="space-y-3">
                <Label htmlFor="descripcion" className="text-sm font-medium">
                  Comparte tu experiencia
                </Label>
                <Textarea
                  id="descripcion"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Cuenta la historia de tu viaje... ¿Qué hizo especial este itinerario? ¿Qué recomiendas a otros viajeros?"
                  rows={8}
                  className="resize-none"
                />
                <div className="flex justify-between items-center text-sm opacity-70">
                  <span>Esta descripción aparecerá en tu publicación</span>
                  <span>{descripcion.length}/500</span>
                </div>
              </div>
            </div>

            {/* Vista previa de días */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-bold mb-4">Tu itinerario</h3>
                <div className="space-y-4">
                  {itinerario.dias.map((dia: any) => (
                    <div key={dia.dia} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                        {dia.dia}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm mb-2">
                          Día {dia.dia}
                        </p>
                        <div className="space-y-1">
                          {dia.lugares.map((lugar: any, index: number) => (
                            <p key={index} className="text-sm opacity-70">
                              • {lugar.titulo}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
