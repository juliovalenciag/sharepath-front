"use client";
import { useEffect, useState, useRef } from "react";
import { Camera, Star, MapPin, Calendar, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ItineraryPublishView({ id }: { id: string }) {
  const router = useRouter();
  const [itinerario, setItinerario] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dia-1");
  const fileInputRefs = useRef<{[key: string]: HTMLInputElement | null}>({});

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
            horario: "Todo el día", // Podrías obtener esto de tu API
            tags: [act.lugar.category] // Podrías agregar más tags
          });
        });

        const dias = Object.keys(actividadesPorDia)
          .sort()
          .map((fecha, index) => ({
            dia: index + 1,
            fecha,
            lugares: actividadesPorDia[fecha],
          }));

        setItinerario({
          id: data.id,
          titulo: data.title,
          dias,
          resumen: {
            diasTotales: dias.length,
            totalLugares: actividadesOrdenadas.length,
            categorias: [...new Set(actividadesOrdenadas.map((a: any) => a.lugar.category))],
          },
          usuario: {
            nombre: "Tu nombre", // Aquí podrías obtener el nombre del usuario
            fotoPerfil: "/placeholder-avatar.jpg"
          }
        });
      } catch (err) {
        console.error("Error cargando itinerario:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  // Guardar cambios
  const guardarCambios = async (lugarId: string, nuevosDatos: any) => {
    try {
      const res = await fetch(`https://harol-lovers.up.railway.app/actividad/${lugarId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("authToken") || "",
        },
        body: JSON.stringify({
          descripcionPersonal: nuevosDatos.descripcion,
          fotoPersonal: nuevosDatos.imageUrl,
        }),
      });

      if (res.ok) {
        setItinerario((prev: any) => ({
          ...prev,
          dias: prev.dias.map((d: any) => ({
            ...d,
            lugares: d.lugares.map((l: any) =>
              l.id === lugarId ? { ...l, ...nuevosDatos } : l
            ),
          })),
        }));
      }
    } catch (error) {
      console.error("Error guardando cambios:", error);
    }
  };

  // Subir imagen
  const handleImageUpload = (file: File, lugarId: string) => {
    const imageUrl = URL.createObjectURL(file);
    
    const lugar = itinerario.dias
      .flatMap((d: any) => d.lugares)
      .find((l: any) => l.id === lugarId);
    
    if (lugar) {
      const nuevosDatos = { ...lugar, imageUrl };
      setItinerario((prev: any) => ({
        ...prev,
        dias: prev.dias.map((d: any) => ({
          ...d,
          lugares: d.lugares.map((l: any) =>
            l.id === lugarId ? nuevosDatos : l
          ),
        })),
      }));
      guardarCambios(lugarId, nuevosDatos);
    }
  };

  // Trigger file input
  const triggerFileInput = (lugarId: string) => {
    fileInputRefs.current[lugarId]?.click();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
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
    <div className="min-h-screen bg-background">
      {/* Header sólido */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push('/viajero/itinerarios')}>
            ← Volver
          </Button>
          <h1 className="text-xl font-bold text-gray-900">Preparar Publicación</h1>
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => alert('¡Itinerario publicado!')}
          >
            Publicar
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Información del itinerario */}
        <Card className="mb-8 border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{itinerario.titulo}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{itinerario.resumen.diasTotales} días</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{itinerario.resumen.totalLugares} lugares</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    <span>{itinerario.resumen.categorias.length} categorías</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs para días */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full mb-8" style={{ gridTemplateColumns: `repeat(${itinerario.dias.length}, minmax(0, 1fr))` }}>
            {itinerario.dias.map((dia: any) => (
              <TabsTrigger key={dia.dia} value={`dia-${dia.dia}`} className="text-sm">
                Día {dia.dia}
              </TabsTrigger>
            ))}
          </TabsList>

          {itinerario.dias.map((dia: any) => (
            <TabsContent key={dia.dia} value={`dia-${dia.dia}`} className="space-y-6">
              {dia.lugares.map((lugar: any) => (
                <Card key={lugar.id} className="border border-gray-200 shadow-sm overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    {/* Columna de imagen */}
                    <div className="md:w-1/2 relative">
                      <img
                        src={lugar.imageUrl || "/placeholder.jpg"}
                        className="w-full h-64 md:h-80 object-cover"
                        alt={lugar.titulo}
                      />
                      <div className="absolute top-3 right-3">
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={el => fileInputRefs.current[lugar.id] = el}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file, lugar.id);
                          }}
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-white/90 hover:bg-white backdrop-blur-sm"
                          onClick={() => triggerFileInput(lugar.id)}
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Cambiar foto
                        </Button>
                      </div>
                    </div>
                    
                    {/* Columna de información */}
                    <div className="md:w-1/2 p-6 space-y-4">
                      {/* Header del lugar */}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{lugar.titulo}</h3>
                        
                        {/* Fila 1: Día y Horario */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>Día {dia.dia}</span>
                          </div>
                          <span className="text-sm text-gray-600">
                            {lugar.horario}
                          </span>
                        </div>

                        {/* Fila 2: Ubicación y Tags */}
                        <div className="flex flex-col sm:flex-row gap-3 text-sm mb-4">
                          <div className="flex items-center gap-2 flex-1">
                            <MapPin className="h-4 w-4 text-gray-600" />
                            <span className="text-gray-700">{lugar.estado}</span>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2">
                            {lugar.tags?.map((tag: string, index: number) => (
                              <span 
                                key={index} 
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Descripción */}
                      <div className="space-y-3">
                        <Label htmlFor={`desc-${lugar.id}`} className="text-sm font-medium text-gray-700">
                          Tu experiencia:
                        </Label>
                        <Textarea
                          id={`desc-${lugar.id}`}
                          value={lugar.descripcion}
                          onChange={(e) => {
                            setItinerario((prev: any) => ({
                              ...prev,
                              dias: prev.dias.map((d: any) => ({
                                ...d,
                                lugares: d.lugares.map((l: any) =>
                                  l.id === lugar.id 
                                    ? { ...l, descripcion: e.target.value }
                                    : l
                                ),
                              })),
                            }));
                          }}
                          onBlur={() => guardarCambios(lugar.id, lugar)}
                          placeholder="Comparte tu experiencia en este lugar... ¿Qué te pareció? ¿Qué recomiendas?"
                          rows={4}
                          className="resize-none border-gray-300 focus:border-primary"
                        />
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-gray-500">
                            Tu descripción se guarda automáticamente
                          </p>
                          <span className="text-xs text-gray-500">
                            {lugar.descripcion?.length || 0}/500
                          </span>
                        </div>
                      </div>

                      {/* Calificación */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-700">Calificación del lugar:</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{lugar.calificacion}/5</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}
