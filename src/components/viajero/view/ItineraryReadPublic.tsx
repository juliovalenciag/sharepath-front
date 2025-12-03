"use client";
import { useEffect, useState, useRef } from "react";
import { Camera, MapPin, Calendar, Tag, Plus, X, ArrowLeft, Lock, Globe, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// Tipos para TypeScript
interface Lugar {
  id: string;
  titulo: string;
}

interface Dia {
  dia: number;
  fecha: string;
  lugares: Lugar[];
}

interface Itinerario {
  id: string;
  titulo: string;
  dias: Dia[];
  resumen: {
    diasTotales: number;
    totalLugares: number;
    categorias: string[];
  };
}

// Tipos para la API - IMPORTANTE: fotos es File[]
export interface ShareItineraryRequest {
  descripcion: string;
  privacity_mode: string;
  fotos: File[];
}

export interface Publicacion {
  id: number;
  descripcion: string;
  privacity_mode: boolean;
  itinerario: any;
  user_shared: Usuario;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

export default function ItineraryPublishView({ id }: { id: string }) {
  const router = useRouter();
  const [itinerario, setItinerario] = useState<Itinerario | null>(null);
  const [loading, setLoading] = useState(true);
  const [descripcion, setDescripcion] = useState("");
  const [fotos, setFotos] = useState<File[]>([]);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [publishing, setPublishing] = useState(false);
  const [privacityMode, setPrivacityMode] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_CARACTERES = 80;
  const MAX_FOTOS = 10;

  // Cargar datos del itinerario
  useEffect(() => {
    const fetchData = async () => {
      try {
        setError("");
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No hay token de autenticación");
        }

        const res = await fetch(
          `https://harol-lovers.up.railway.app/itinerario/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "token": token,
            },
          }
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Error al cargar el itinerario");
        }

        const data = await res.json();
        const actividadesOrdenadas = data.actividades?.sort(
          (a: any, b: any) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
        ) || [];

        // Agrupar por día
        const actividadesPorDia: Record<string, Lugar[]> = {};
        
        actividadesOrdenadas.forEach((act: any) => {
          const fecha = new Date(act.fecha).toISOString().split("T")[0];
          if (!actividadesPorDia[fecha]) {
            actividadesPorDia[fecha] = [];
          }

          actividadesPorDia[fecha].push({
            id: act.id,
            titulo: act.lugar.nombre,
          });
        });

        const dias = Object.keys(actividadesPorDia)
          .sort()
          .map((fecha, index) => ({
            dia: index + 1,
            fecha,
            lugares: actividadesPorDia[fecha],
          }));

        const itinerarioProcesado: Itinerario = {
          id: data.id,
          titulo: data.title,
          dias,
          resumen: {
            diasTotales: dias.length,
            totalLugares: actividadesOrdenadas.length,
            categorias: [...new Set(actividadesOrdenadas.map((a: any) => a.lugar.category))],
          }
        };

        setItinerario(itinerarioProcesado);
        setDescripcion(data.descripcion || "");
      } catch (err) {
        console.error("Error cargando itinerario:", err);
        setError(err instanceof Error ? err.message : "No se pudo cargar el itinerario. Por favor, intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Manejar subida de fotos
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const archivos = Array.from(files);
    
    // Verificar límite
    if (fotos.length + archivos.length > MAX_FOTOS) {
      setError(`Solo puedes subir un máximo de ${MAX_FOTOS} fotos.`);
      return;
    }

    // Verificar tipos de archivo
    const tiposValidos = archivos.every(file => 
      file.type.startsWith('image/jpeg') || 
      file.type.startsWith('image/png') || 
      file.type.startsWith('image/jpg') ||
      file.type.startsWith('image/gif')
    );
    if (!tiposValidos) {
      setError("Solo se permiten archivos de imagen (JPG, PNG, GIF).");
      return;
    }

    // Limitar tamaño (5MB por imagen)
    const tamañoValido = archivos.every(file => file.size <= 5 * 1024 * 1024);
    if (!tamañoValido) {
      setError("Algunas imágenes superan el tamaño máximo de 5MB.");
      return;
    }

    setFotos(prev => [...prev, ...archivos]);
    setError("");
    setSuccess(`Se agregaron ${archivos.length} foto(s) correctamente.`);
    
    // Resetear el input para permitir seleccionar las mismas fotos otra vez
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Eliminar foto
  const removePhoto = (index: number) => {
    setFotos(prev => prev.filter((_, i) => i !== index));
    setSuccess("Foto eliminada correctamente.");
  };

  // Eliminar todas las fotos
  const removeAllPhotos = () => {
    setFotos([]);
    setSuccess("Todas las fotos han sido eliminadas.");
  };

  // Vista previa de fotos
  const getImagePreview = (file: File) => {
    return URL.createObjectURL(file);
  };

  // Validar formulario
  const validarFormulario = (): boolean => {
    if (descripcion.length > MAX_CARACTERES) {
      setError(`La descripción no puede exceder los ${MAX_CARACTERES} caracteres.`);
      return false;
    }

    if (fotos.length === 0) {
      setError("Debes agregar al menos una foto para publicar.");
      return false;
    }

    if (privacityMode === null) {
      setError("Debes seleccionar un modo de privacidad para tu publicación.");
      return false;
    }

    setError("");
    return true;
  };

  // Función principal para publicar - MODIFICADA para enviar FormData con archivos File
  const publicarItinerario = async () => {
    if (!validarFormulario()) return;

    setPublishing(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No estás autenticado. Por favor, inicia sesión nuevamente.");
      }

      // Crear FormData para enviar archivos
      const formData = new FormData();
      
      // Agregar campos de texto
      formData.append('descripcion', descripcion.trim());
      formData.append('privacity_mode', privacityMode ? 'true' : 'false');
      
      // Agregar fotos como archivos File
      fotos.forEach((foto, index) => {
        formData.append('fotos', foto); // Enviar el archivo File directamente
      });

      // Mostrar contenido del FormData en consola para debug
      console.log("FormData contenido:");
      for (let pair of (formData as any).entries()) {
        console.log(pair[0], pair[1] instanceof File ? `File: ${pair[1].name}, ${pair[1].type}` : pair[1]);
      }

      // Llamar a la API de publicación con FormData
      const response = await fetch(
        `https://harol-lovers.up.railway.app/publicacion/share/${id}`,
        {
          method: "POST",
          body: formData, // Enviar FormData en lugar de JSON
          headers: {
            // NO incluir 'Content-Type': el navegador lo establecerá automáticamente
            // con el boundary correcto para FormData
            "token": token,
          },
        }
      );

      console.log('Response status:', response.status);

      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || `Error ${response.status}: No se pudo crear la publicación`);
      }

      // Verificar que la respuesta tenga la estructura esperada
      if (!responseData.id) {
        throw new Error("La respuesta del servidor no tiene la estructura esperada");
      }

      setSuccess(`¡Publicación ${privacityMode ? 'pública' : 'privada'} creada exitosamente! Redirigiendo...`);
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/viajero/itinerarios');
      }, 2000);

    } catch (error) {
      console.error("Error detallado al publicar:", error);
      
      // Manejar diferentes tipos de errores
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        setError("Error de conexión. Verifica tu internet e intenta nuevamente.");
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Error inesperado al publicar el itinerario. Intenta nuevamente.");
      }
    } finally {
      setPublishing(false);
    }
  };

  // Limpiar URLs de vista previa al desmontar
  useEffect(() => {
    return () => {
      fotos.forEach(file => {
        URL.revokeObjectURL(getImagePreview(file));
      });
    };
  }, [fotos]);

  // Componente de carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Preparando publicación...</p>
        </div>
      </div>
    );
  }

  // Componente de error
  if (error && !itinerario) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <p className="text-xl mb-4">{error}</p>
          <Button 
            className="mt-4" 
            onClick={() => router.push('/viajero/itinerarios')}
          >
            Volver a mis itinerarios
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky dark:bg-gray-500 bg-gray-50 top-0 left-0 right-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.push('/viajero/itinerarios')}
              className="rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Crear Publicación</h1>
              <p className="text-sm opacity-70">Comparte tu experiencia de viaje</p>
            </div>
          </div>
          <Button 
            onClick={publicarItinerario}
            disabled={publishing || fotos.length === 0 || privacityMode === null}
            className="px-6 font-medium"
          >
            {publishing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Publicando...
              </>
            ) : "Publicar"}
          </Button>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="pt-24 max-w-4xl mx-auto px-6 pb-12 space-y-10">
        {/* Mensajes */}
        {error && (
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5">
                <Info className="w-5 h-5" />
              </div>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Sección 1: Título y Descripción */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Comparte tu historia</h2>
            <p className="opacity-70">Cuenta a otros viajeros sobre tu experiencia (opcional)</p>
          </div>

          <div className="rounded-xl p-8 shadow-sm">
            <h1 className="text-3xl font-bold mb-6">{itinerario!.titulo}</h1>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="descripcion" className="block mb-3 text-lg font-medium">
                  ¿Qué hizo especial este viaje?
                </Label>
                <Textarea
                  id="descripcion"
                  value={descripcion}
                  onChange={(e) => {
                    setDescripcion(e.target.value);
                    setError("");
                  }}
                  placeholder="Comparte tus momentos más memorables, recomendaciones o aprendizajes. Este campo es opcional pero ayuda a otros viajeros."
                  rows={5}
                  className="resize-none text-base border-gray-300 focus:border-gray-400"
                  maxLength={MAX_CARACTERES}
                />
              </div>
              
              <div className="flex justify-between items-center pt-4">
                <div className="text-sm">
                  {descripcion.length === 0 ? (
                    <span className="opacity-70">Campo opcional - {MAX_CARACTERES} caracteres máximo</span>
                  ) : (
                    <span className={descripcion.length >= MAX_CARACTERES ? "text-red-600 font-medium" : "opacity-70"}>
                      {descripcion.length >= MAX_CARACTERES 
                        ? "Límite de caracteres alcanzado"
                        : `${MAX_CARACTERES - descripcion.length} caracteres disponibles`}
                    </span>
                  )}
                </div>
                <div className={`text-sm font-medium ${descripcion.length >= MAX_CARACTERES ? "text-red-600" : "opacity-70"}`}>
                  {descripcion.length}/{MAX_CARACTERES}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sección 2: Configuración de Privacidad */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Configura la privacidad</h2>
            <p className="opacity-70">Elige quién podrá ver tu publicación</p>
          </div>

          <div className="rounded-xl p-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Botón Público */}
              <button
                onClick={() => setPrivacityMode(true)}
                className={`p-6 border-2 rounded-xl text-left transition-all ${
                  privacityMode === true 
                    ? 'border-blue-500 shadow-sm' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center mt-1 flex-shrink-0 ${
                    privacityMode === true 
                      ? 'border-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {privacityMode === true && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-lg font-medium">Público</span>
                    </div>
                    <p className="text-sm opacity-70">
                      Todos los usuarios podrán ver tu publicación. Ideal para compartir con la comunidad.
                    </p>
                  </div>
                </div>
              </button>

              {/* Botón Privado */}
              <button
                onClick={() => setPrivacityMode(false)}
                className={`p-6 border-2 rounded-xl text-left transition-all ${
                  privacityMode === false 
                    ? 'border-purple-500 shadow-sm' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center mt-1 flex-shrink-0 ${
                    privacityMode === false 
                      ? 'border-purple-500 bg-purple-500' 
                      : 'border-gray-300'
                  }`}>
                    {privacityMode === false && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-purple-600" />
                      </div>
                      <span className="text-lg font-medium">Solo amigos</span>
                    </div>
                    <p className="text-sm opacity-70">
                      Solo tus amigos podrán ver tu publicación. Mantén tu viaje entre personas cercanas.
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {privacityMode !== null && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                <p className="text-center font-medium">
                  Modo seleccionado: <span className={`font-bold ${privacityMode ? 'text-blue-600' : 'text-purple-600'}`}>
                    {privacityMode ? "Público (todos pueden ver)" : "Solo amigos"}
                  </span>
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Sección 3: Fotos del Viaje */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Fotos de tu viaje</h2>
            <p className="opacity-70">Sube hasta {MAX_FOTOS} fotos para compartir tu experiencia (requerido)</p>
          </div>

          <div className="rounded-xl p-8 shadow-sm">
            {fotos.length === 0 ? (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center">
                  <Camera className="w-10 h-10 opacity-60" />
                </div>
                <h3 className="text-xl font-medium mb-3">Agrega fotos de tu viaje</h3>
                <p className="text-sm opacity-70 mb-6">Haz clic aquí para seleccionar fotos</p>
                <Button className="px-8">
                  Seleccionar fotos
                </Button>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-lg font-medium">Tus fotos</h3>
                    <p className="text-sm opacity-70">
                      {fotos.length} de {MAX_FOTOS} fotos seleccionadas
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={fotos.length >= MAX_FOTOS}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar más
                    </Button>
                    {fotos.length > 0 && (
                      <Button 
                        variant="ghost" 
                        onClick={removeAllPhotos}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Eliminar todas
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {fotos.map((foto, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={getImagePreview(foto)}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/80 rounded-full flex items-center justify-center hover:bg-black transition-colors"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
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
          </div>
        </section>

        {/* Sección 4: Resumen e Itinerario */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resumen del Viaje */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Resumen del viaje</h2>
            <div className="rounded-xl p-8 shadow-sm">
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm opacity-70">Duración total</p>
                    <p className="text-xl font-bold">{itinerario!.resumen.diasTotales} días</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm opacity-70">Lugares visitados</p>
                    <p className="text-xl font-bold">{itinerario!.resumen.totalLugares} lugares</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Tag className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm opacity-70">Categorías</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {itinerario!.resumen.categorias.map((cat, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vista del Itinerario */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Tu itinerario</h2>
            <div className="rounded-xl p-8 shadow-sm">
              <div className="space-y-6">
                {itinerario!.dias.map((dia) => (
                  <div key={dia.dia} className="pb-6 border-b last:border-0 last:pb-0">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-medium">
                        {dia.dia}
                      </div>
                      <div>
                        <p className="font-medium">Día {dia.dia}</p>
                        <p className="text-sm opacity-70">
                          {new Date(dia.fecha).toLocaleDateString('es-ES', { 
                            day: 'numeric', 
                            month: 'long' 
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="ml-4 space-y-3">
                      {dia.lugares.map((lugar, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                          <p className="opacity-80">{lugar.titulo}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Requisitos para Publicar */}
        <div className="p-6 rounded-xl border">
          <h3 className="text-lg font-bold mb-4">Requisitos para publicar</h3>
          <div className="space-y-3">
            <div className={`flex items-center gap-3 ${fotos.length > 0 ? 'text-green-600' : 'opacity-70'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${fotos.length > 0 ? 'bg-green-100 border border-green-300' : 'bg-gray-200'}`}>
                {fotos.length > 0 ? '✓' : '1'}
              </div>
              <span>Al menos una foto ({fotos.length}/{MAX_FOTOS})</span>
            </div>
            
            <div className={`flex items-center gap-3 ${privacityMode !== null ? 'text-green-600' : 'opacity-70'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${privacityMode !== null ? 'bg-green-100 border border-green-300' : 'bg-gray-200'}`}>
                {privacityMode !== null ? '✓' : '2'}
              </div>
              <span>Seleccionar modo de privacidad</span>
            </div>
            
            <div className="flex items-center gap-3 opacity-70">
              <div className="w-5 h-5 rounded-full flex items-center justify-center bg-gray-200">
                3
              </div>
              <span>Descripción (opcional - {descripcion.length}/{MAX_CARACTERES} caracteres)</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
