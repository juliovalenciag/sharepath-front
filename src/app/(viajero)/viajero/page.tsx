"use client";

import { useState, useEffect } from "react";
import PublicacionItem from "@/components/viajero/PublicacionItem";
import SearchFilters from "@/components/viajero/SearchFilters";
import { Button } from "@/components/ui/button";
import { ItinerariosAPI } from "@/api/ItinerariosAPI";
import type { Publicacion } from "@/api/interfaces/ApiRoutes";
import { Loader2, MapPin, Compass, SearchX } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ViajeroLanding() {
  const [query, setQuery] = useState("");
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("todos");
  const [publicaciones, setPublicaciones] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Transformar publicación
  const transformarPublicacion = (pub: Publicacion): any => {
    return {
      id: pub.id,
      titulo: pub.itinerario.title,
      calificacion: 4.4,
      usuario: {
        nombre: pub.user_shared?.username || "Viajero Anónimo",
        fotoPerfil: pub.user_shared?.foto_url || "",
        nombre_completo: pub.user_shared?.nombre_completo, // Añadido si existe
      },
      descripcion: pub.descripcion,
      itinerarioId: pub.itinerario.id,
      itinerario: pub.fotos
        ? pub.fotos.map((foto) => ({
            id: foto.id,
            url: foto.foto_url,
          }))
        : [],
      fecha: new Date().toLocaleDateString(),
      ubicacion: "México", // Placeholder o dato real
    };
  };

  useEffect(() => {
    const cargarPublicaciones = async () => {
      try {
        setCargando(true);
        setError(null);
        const api = ItinerariosAPI.getInstance();
        const data = await api.getMyPublications();

        if (data && Array.isArray(data)) {
          const publicacionesTransformadas = data.map(transformarPublicacion);
          setPublicaciones(publicacionesTransformadas);
        } else {
          setPublicaciones([]);
        }
      } catch (err) {
        console.error(err);
        setError("No pudimos conectar con el servidor de viajes.");
      } finally {
        // Pequeño delay artificial para que la UI no parpadee demasiado rápido
        setTimeout(() => setCargando(false), 500);
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
      publicacion.descripcion?.toLowerCase().includes(query.toLowerCase()) ||
      false;

    const coincideEstado =
      estadoSeleccionado === "todos" || estadoSeleccionado === "CDMX";

    return coincideTexto && coincideEstado;
  });

  const resultadosCount = publicacionesFiltradas.length;
  const hayFiltrosActivos = query !== "" || estadoSeleccionado !== "todos";

  return (
    <div className="min-h-screen bg-muted/5 pb-20">
      {/* --- HERO SECTION --- */}
      <div className="relative bg-background border-b border-border/60">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900 opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20 text-center md:text-left">
          <div className="max-w-2xl">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-4 backdrop-blur-sm">
              <Compass className="mr-2 h-4 w-4" /> Comunidad de Viajeros
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground mb-4">
              Inspírate con <br className="hidden md:block" /> rutas reales.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Descubre itinerarios creados por expertos locales y viajeros
              apasionados. Encuentra tu próxima aventura.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-8 relative z-10">
        {/* --- FILTROS --- */}
        <SearchFilters
          query={query}
          estadoSeleccionado={estadoSeleccionado}
          onQueryChange={handleSearchChange}
          onEstadoChange={handleEstadoChange}
        />

        {/* --- RESULTADOS INFO --- */}
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-xl font-bold text-foreground">
            Explorar Itinerarios
          </h2>
          <span className="text-sm text-muted-foreground font-medium bg-background px-3 py-1 rounded-full border shadow-sm">
            {resultadosCount}{" "}
            {resultadosCount === 1 ? "resultado" : "resultados"}
          </span>
        </div>

        {/* --- GRID DE CONTENIDO --- */}
        {error ? (
          <ErrorState message={error} />
        ) : cargando ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : resultadosCount > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 auto-rows-fr">
            {publicacionesFiltradas.map((p) => (
              <PublicacionItem key={p.id} publicacion={p} />
            ))}
          </div>
        ) : (
          <EmptyState
            hasFilters={hayFiltrosActivos}
            onReset={() => {
              setQuery("");
              setEstadoSeleccionado("todos");
            }}
          />
        )}
      </div>
    </div>
  );
}

// Subcomponentes visuales para mantener limpio el código
function CardSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[250px] w-full rounded-xl" />
      <div className="space-y-2 px-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

function EmptyState({
  hasFilters,
  onReset,
}: {
  hasFilters: boolean;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-muted rounded-3xl bg-muted/10">
      <div className="bg-background p-4 rounded-full shadow-sm mb-4">
        <SearchX className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-bold text-foreground">
        No encontramos aventuras
      </h3>
      <p className="text-muted-foreground max-w-sm mt-2 mb-6">
        {hasFilters
          ? "Intenta con otros términos o limpia los filtros para ver más resultados."
          : "Aún no hay publicaciones."}
      </p>
      {hasFilters && (
        <Button onClick={onReset} variant="outline" className="rounded-full">
          Limpiar búsqueda
        </Button>
      )}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
        <MapPin className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-bold">Algo salió mal</h3>
      <p className="text-muted-foreground mb-4">{message}</p>
      <Button onClick={() => window.location.reload()}>Reintentar</Button>
    </div>
  );
}
