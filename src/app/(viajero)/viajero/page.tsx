"use client";

import { useState, useEffect } from "react";
import PublicacionItem from "@/components/viajero/PublicacionItem";
import SearchFilters from "@/components/viajero/SearchFilters";
import { Button } from "@/components/ui/button";
import { ItinerariosAPI } from "@/api/ItinerariosAPI";
import type { Publicacion } from "@/api/interfaces/ApiRoutes";
import { Loader2, AlertCircle, MapPin, X } from "lucide-react"; // Importamos iconos de lucide-react

const btn = {
  primary:
    "inline-flex items-center justify-center h-10 px-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 font-medium shadow-sm",
  ghost:
    "inline-flex items-center justify-center h-10 px-6 rounded-full border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-all duration-200 font-medium shadow-sm",
  link: "text-sm text-primary hover:underline font-medium p-0 h-auto",
};

export default function ViajeroLanding() {
  const [query, setQuery] = useState("");
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("todos");
  const [publicaciones, setPublicaciones] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Transformar publicación del backend al formato del componente
  const transformarPublicacion = (pub: Publicacion): any => {
    return {
      id: pub.id,
      titulo: pub.itinerario.title,
      calificacion: 4.4, // Valor por defecto, podrías calcularlo si tienes datos
      usuario: {
        nombre: pub.user_shared?.username || "Usuario",
        fotoPerfil: pub.user_shared?.foto_url || "",
      },
      descripcion: pub.descripcion,
      itinerarioId: pub.itinerario.id,
      // Aseguramos que itinerario tenga la estructura correcta para PublicacionItem
      // Si PublicacionItem espera fotos en 'itinerario', mantenemos esto.
      // Si espera otra estructura, ajusta aquí.
      itinerario: pub.fotos ? pub.fotos.map((foto) => ({
        id: foto.id,
        url: foto.foto_url,
      })) : [],
      // Añadimos datos útiles para el diseño si están disponibles en 'pub'
      fecha: new Date().toLocaleDateString(), // Ejemplo
      ubicacion: "CDMX", // Ejemplo, idealmente vendría del backend
    };
  };

  // Efecto para cargar publicaciones
  useEffect(() => {
    const cargarPublicaciones = async () => {
      try {
        setCargando(true);
        setError(null);
        const api = ItinerariosAPI.getInstance();
        const data = await api.getMyPublications();
        console.log("Publicaciones obtenidas del API:", data);
        if (data && Array.isArray(data)) {
          const publicacionesTransformadas = data.map(transformarPublicacion);
          setPublicaciones(publicacionesTransformadas);
        } else {
          setPublicaciones([]);
        }
      } catch (err) {
        console.error("Error cargando publicaciones:", err);
        setError("No se pudieron cargar las publicaciones. Por favor, intenta de nuevo más tarde.");
      } finally {
        setCargando(false);
      }
    };

    cargarPublicaciones();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleEstadoChange = (value: string) => {
    setEstadoSeleccionado(value);
  };

  const publicacionesFiltradas = publicaciones.filter((publicacion) => {
    const coincideTexto =
      publicacion.usuario.nombre.toLowerCase().includes(query.toLowerCase()) ||
      publicacion.titulo.toLowerCase().includes(query.toLowerCase()) ||
      (publicacion.descripcion?.toLowerCase().includes(query.toLowerCase()) || false);

    const coincideEstado =
      estadoSeleccionado === "todos" || estadoSeleccionado === "CDMX"; // Por ahora todos son de CDMX

    return coincideTexto && coincideEstado;
  });

  const resultadosCount = publicacionesFiltradas.length;
  const hayFiltrosActivos = query !== "" || estadoSeleccionado !== "todos";

  if (cargando) {
    return (
      <div className="min-h-[calc(100dvh-64px)] flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse">Cargando experiencias...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100dvh-64px)] flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Error al cargar</h3>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} className={btn.primary}>
            Intentar de nuevo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-background text-foreground transition-colors duration-300">
      {/* Hero Section / Header */}
      <section className="bg-muted/30 border-b border-border py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
              Descubre nuevas <span className="text-primary">aventuras</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Explora itinerarios únicos creados por viajeros apasionados. Encuentra inspiración para tu próximo viaje y comparte tus propias experiencias.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        
        {/* Filters & Search */}
        <div className="mb-10 space-y-6">
          <SearchFilters
            query={query}
            estadoSeleccionado={estadoSeleccionado}
            onQueryChange={handleSearchChange}
            onEstadoChange={handleEstadoChange}
          />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {resultadosCount}
              </span>
              <span className="text-sm text-muted-foreground">
                {resultadosCount === 1 ? "itinerario encontrado" : "itinerarios encontrados"}
              </span>
            </div>
            
            {hayFiltrosActivos && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setQuery("");
                  setEstadoSeleccionado("todos");
                }}
                className="text-muted-foreground hover:text-foreground h-auto px-2 py-1"
              >
                <X className="mr-2 h-3 w-3" />
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {resultadosCount > 0 ? (
            publicacionesFiltradas.map((p) => (
              <PublicacionItem key={p.id} publicacion={p} />
            ))
          ) : (
            <div className="col-span-full py-16 text-center">
              <div className="max-w-md mx-auto bg-card rounded-2xl border border-border p-8 shadow-sm">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No se encontraron resultados
                </h3>
                <p className="text-muted-foreground mb-6">
                  {hayFiltrosActivos
                    ? "Intenta ajustar tus términos de búsqueda o filtros para encontrar lo que buscas."
                    : "Aún no hay publicaciones disponibles. ¡Sé el primero en compartir tu viaje!"}
                </p>
                {hayFiltrosActivos && (
                  <Button
                    onClick={() => {
                      setQuery("");
                      setEstadoSeleccionado("todos");
                    }}
                    className={btn.primary}
                  >
                    Ver todos los itinerarios
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}