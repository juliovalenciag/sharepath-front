"use client";

import { useState, useEffect } from "react";
import PublicacionItem from "@/components/viajero/PublicacionItem";
import SearchFilters from "@/components/viajero/SearchFilters";
import { Button } from "@/components/ui/button";
import { ItinerariosAPI } from "@/api/ItinerariosAPI";
import type { Publicacion } from "@/api/interfaces/ApiRoutes";

const btn = {
  primary:
    "inline-flex items-center justify-center h-11 px-6 rounded-lg bg-primary text-white hover:bg-blue-700 transition-all duration-200 font-medium",
  ghost:
    "inline-flex items-center justify-center h-11 px-6 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-all duration-200 font-medium"
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
      calificacion: 4.4, // Valor por defecto
      usuario: {
        nombre: pub.user_shared?.nombre_completo || "Usuario",
        fotoPerfil: pub.user_shared?.foto_url || ""
      },
      descripcion: pub.descripcion,
      itinerario: pub.fotos.map((foto, index) => ({
        id: foto.id,
        url: foto.foto_url,
      }))
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
        
        if (data && Array.isArray(data)) {
          const publicacionesTransformadas = data.map(transformarPublicacion);
          setPublicaciones(publicacionesTransformadas);
        } else {
          setPublicaciones([]);
        }
      } catch (err) {
        console.error("Error cargando publicaciones:", err);
        setError("No se pudieron cargar las publicaciones");
        setPublicaciones([]);
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
      estadoSeleccionado === "todos" ||
      estadoSeleccionado === "CDMX"; // Por ahora todos son de CDMX

    return coincideTexto && coincideEstado;
  });

  const resultadosCount = publicacionesFiltradas.length;

  if (cargando) {
    return (
      <div className="min-h-[calc(100dvh-64px)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando publicaciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100dvh-64px)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Error al cargar</h3>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-64px)]">
      <section className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Descubre
            </h2>
            <p>
              Descubre los itinerarios compartidos por viajeros y viajeras como tú.
            </p>
          </div>
          
          <SearchFilters 
            query={query}
            estadoSeleccionado={estadoSeleccionado}
            onQueryChange={handleSearchChange}
            onEstadoChange={handleEstadoChange}
          />

          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-600">
              {resultadosCount} {resultadosCount === 1 ? 'itinerario encontrado' : 'itinerarios encontrados'}
            </p>
            {query || estadoSeleccionado !== 'todos' ? (
              <button
                onClick={() => {
                  setQuery('');
                  setEstadoSeleccionado('todos');
                }}
                className="text-sm text-primary hover:text-secondary font-medium"
              >
                Limpiar filtros
              </button>
            ) : null}
          </div>

          <div className="grid gap-8">
            {resultadosCount > 0 ? (
              publicacionesFiltradas.map((p) => (
                <PublicacionItem 
                  key={p.id} 
                  publicacion={p}
                />
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No se encontraron itinerarios</h3>
                <p className="text-gray-600 mb-4 max-w-md mx-auto">
                  {query || estadoSeleccionado !== 'todos' 
                    ? "Intenta ajustar tus filtros de búsqueda para ver más resultados."
                    : "No hay publicaciones disponibles en este momento."
                  }
                </p>
                {(query || estadoSeleccionado !== 'todos') && (
                  <Button 
                    onClick={() => {
                      setQuery('');
                      setEstadoSeleccionado('todos');
                    }}
                    className={btn.primary}
                  >
                    Ver todos los itinerarios
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
