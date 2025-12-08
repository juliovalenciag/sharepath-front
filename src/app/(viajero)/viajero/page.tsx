"use client";

import { useState } from "react";
import PublicacionItem from "@/components/viajero/PublicacionItem";
import SearchFilters from "@/components/viajero/SearchFilters";
import { Button } from "@/components/ui/button";

// Definición de tipos
interface ItinerarioItem {
  dia: number;
  url: string;
  descripcion?: string;
  ubicacion: string;
  tags: string[];
  horario: string;
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
  itinerario: ItinerarioItem[];
}

// Datos temporales (después vendrán de una función)
const publicacionesTemporales: Publicacion[] = [
  {
    id: 1,
    titulo: "Fin de Semana Cultural en el Centro Histórico",
    calificacion: 4.5,
    usuario: {
      nombre: "Carlos Rodríguez",
      fotoPerfil: "https://st5.depositphotos.com/18273866/65276/i/950/depositphotos_652763588-stock-photo-one-man-young-adult-caucasian.jpg",
    },
    descripcion: "Desayuno en el Café de Tacuba, el aroma del café recién hecho es increíble.",
    itinerario: [
      {
        dia: 1,
        url: "https://cloudfront-us-east-1.images.arcpublishing.com/elfinanciero/JU4F6HNZGNHE5FKEJ55JESYTJQ.jpg",
        ubicacion: "Café de Tacuba, Centro Histórico",
        tags: ["restaurante"],
        horario: "9:00 AM"
      },
      {
        dia: 2,
        url: "https://godinchilango.mx/wp-content/uploads/2024/12/museo-palacio-bellas-artes-murales-arte-centro-historico-ciudad-mexico-cdmx_1.jpg",
        descripcion: "Recorriendo el Palacio de Bellas Artes. La arquitectura es impresionante.",
        ubicacion: "Palacio de Bellas Artes, Centro",
        tags: ["museo"],
        horario: "11:30 AM"
      },
      {
        dia: 3,
        url: "https://media.istockphoto.com/id/1190793837/es/foto/mexico-city-centro-historico-bellas-artes-sunset-alameda-central.jpg?s=612x612&w=0&k=20&c=g99rVHO_YOl5m_UPlfOy28TkizjzUShbJjVaRmVVg30=",
        descripcion: "Paseo por la Alameda Central al atardecer. El ambiente es mágico.",
        ubicacion: "Alameda Central, CDMX",
        tags: ["parque"],
        horario: "5:00 PM"
      },
      {
        dia: 4,
        url: "https://sic.gob.mx/imagenes_cache/museo_476_g_73330.png",
        descripcion: "Visita al Templo Mayor para conocer la historia azteca.",
        ubicacion: "Templo Mayor, Centro Histórico",
        tags: ["museo"],
        horario: "10:00 AM"
      },
    ],
  },
  {
    id: 2,
    titulo: "Tour Gastronómico por la Roma-Condesa",
    calificacion: 2.1,
    usuario: {
      nombre: "Ana Martínez",
      fotoPerfil: "https://b2472105.smushcdn.com/2472105/wp-content/uploads/2023/09/Poses-Perfil-Profesional-Mujeres-ago.-10-2023-1-819x1024.jpg?lossy=1&strip=1&webp=1",
    },
    descripcion: "Un recorrido por los mejores restaurantes y cafés de la Roma y Condesa.",
    itinerario: [
      {
        dia: 1,
        url: "https://i0.wp.com/foodandpleasure.com/wp-content/uploads/2021/03/brunch-condesa-lardomexico.jpg?resize=600%2C749&ssl=1",
        descripcion: "Brunch en la Condesa, el ambiente bohemio es único.",
        ubicacion: "Café Condesa, Roma-Condesa",
        tags: ["restaurante"],
        horario: "11:00 AM"
      },
      {
        dia: 1,
        url: "https://mexiconewsdaily.com/wp-content/uploads/2025/03/parque-mexico-b02.jpg",
        descripcion: "Caminata por el Parque México, perfecto para un día soleado.",
        ubicacion: "Parque México, Condesa",
        tags: ["parque"],
        horario: "2:00 PM"
      },
      {
        dia: 1,
        url: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/28/af/aa/5e/la-terraza-de-nuestro.jpg",
        descripcion: "Cena en un restaurante local de la zona, la comida es excepcional.",
        ubicacion: "Zona Rosa, CDMX",
        tags: ["restaurante"],
        horario: "8:00 PM"
      },
    ],
  },
];

// Función que después obtendrá las publicaciones del backend
async function obtenerPublicacionesBackend() {
  // Aquí irá la llamada a tu API/backend
  // Por ahora retorna los datos temporales
  return publicacionesTemporales;
}

const btn = {
  primary:
    "inline-flex items-center justify-center h-11 px-6 rounded-lg bg-primary text-white hover:bg-blue-700 transition-all duration-200 font-medium",
  ghost:
    "inline-flex items-center justify-center h-11 px-6 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-all duration-200 font-medium"
};

export default function ViajeroLanding() {
  const [query, setQuery] = useState("");
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("todos");
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [cargando, setCargando] = useState(true);

  // Efecto para cargar publicaciones (simulación)
  useState(() => {
    // Temporalmente usa los datos locales
    // Después cambiarás esto por:
    // obtenerPublicacionesBackend().then(data => setPublicaciones(data))
    setPublicaciones(publicacionesTemporales);
    setCargando(false);
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleEstadoChange = (value: string) => {
    setEstadoSeleccionado(value);
  };

  // Añadir estado a las publicaciones
  const publicacionesConEstado = publicaciones.map(pub => ({
    ...pub,
    estado: pub.itinerario[0]?.ubicacion?.includes('CDMX') ? 'CDMX' :
            pub.itinerario[0]?.ubicacion?.includes('Edomex') ? 'EDOMEX' :
            pub.itinerario[0]?.ubicacion?.includes('Hidalgo') ? 'Hidalgo' :
            pub.itinerario[0]?.ubicacion?.includes('Guerrero') ? 'Guerrero' :
            pub.itinerario[0]?.ubicacion?.includes('Querétaro') ? 'Queretaro' : 'CDMX'
  }));

  const publicacionesFiltradas = publicacionesConEstado.filter((publicacion) => {
    const coincideTexto =
      publicacion.usuario.nombre.toLowerCase().includes(query.toLowerCase()) ||
      publicacion.titulo.toLowerCase().includes(query.toLowerCase()) ||
      publicacion.itinerario.some((item) =>
        item.ubicacion.toLowerCase().includes(query.toLowerCase()) ||
        item.descripcion?.toLowerCase().includes(query.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );

    const coincideEstado =
      estadoSeleccionado === "todos" ||
      publicacion.estado === estadoSeleccionado;

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
            {publicacionesFiltradas.length > 0 ? (
              publicacionesFiltradas.map((p) => (
                <PublicacionItem key={p.id} publicacion={p} />
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
                    : "Pronto habrá más itinerarios disponibles."
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
