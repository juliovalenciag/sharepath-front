"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  Map, 
  Trash2, 
  Eye, 
  Settings, 
  MoreVertical, 
  Image as ImageIcon, 
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  AlertCircle
} from "lucide-react"; // Usamos Lucide para consistencia con el primer diseño
import { ItinerariosAPI } from "@/api/ItinerariosAPI";
import { ItinerarioData } from "@/api/interfaces/ApiRoutes";

// --- Interfaces ---
type ItinerarioUI = ItinerarioData & {
  estado: "Reportado" | "No publicado" | "Publicado";
  autor?: {
    username?: string;
    correo?: string;
    nombre?: string;
  };
};

export default function ItinerariosPage() {
  // --- Estados ---
  const [busqueda, setBusqueda] = useState("");
  const [itinerariosData, setItinerariosData] = useState<ItinerarioUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  // Estados del Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [itinerarioSeleccionado, setItinerarioSeleccionado] = useState<ItinerarioUI | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  
  const api = useMemo(() => ItinerariosAPI.getInstance(), []);

  // --- Lógica de Carga (Intacta) ---
  useEffect(() => {
    loadItinerarios();
  }, [api]);

  const loadItinerarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const listResp = await api.getMyItinerarios();

      const fetchedItinerarios: any[] = Array.isArray(listResp)
        ? listResp
        : (listResp as any)?.itinerarios || (listResp as any)?.items || [];

      if (Array.isArray(fetchedItinerarios) && fetchedItinerarios.length > 0) {
        const mapped = fetchedItinerarios.map((it: any) => ({
          ...it,
          id: it.id ?? it.itinerario_id ?? it._id ?? it.Id,
          title: it.title ?? it.nombre ?? it.name ?? "Sin nombre",
          actividades: Array.isArray(it.actividades) ? it.actividades : (it.activities || []),
          createdAt: it.createdAt ?? it.fecha_creacion ?? it.created_at ?? new Date().toISOString(),
          estado: ((it.estado === "Aprobado" || it.estado === "aprobado") ? "Publicado" : it.estado) as ItinerarioUI["estado"] ?? "Publicado",
          autor: {
            username: it.usuario?.username || it.user?.username || it.owner?.username || it.autor?.username || it.username || "Anónimo",
            correo: it.usuario?.correo || it.user?.correo || it.owner?.correo || it.autor?.correo || it.correo || "",
            nombre: it.usuario?.nombre_completo || it.user?.nombre_completo || it.owner?.nombre_completo || it.autor?.nombre || it.nombre_usuario || "",
          },
          imagenes: it.imagenes || it.images || it.fotos || it.gallery || (it.cover ? [it.cover] : []),
          descripcion: it.descripcion ?? it.description ?? "Sin descripción disponible.",
          calificacion: it.calificacion ?? it.google_score ?? it.rating ?? 0,
        }));
        setItinerariosData(mapped);
      } else {
        setItinerariosData([]);
      }
    } catch (err: any) {
      const errorMsg = err?.message || "No se pudieron cargar los datos.";
      setError(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Filtrado ---
  const itinerariosFiltrados = useMemo(() => {
    return itinerariosData.filter(
      (item) =>
        String(item.id).includes(busqueda) ||
        (item.title && item.title.toLowerCase().includes(busqueda.toLowerCase())) ||
        (item.autor?.username && item.autor.username.toLowerCase().includes(busqueda.toLowerCase()))
    );
  }, [itinerariosData, busqueda]);

  // --- Helpers de UI ---
  const getInitials = (name: string) => name.slice(0, 2).toUpperCase();

  const handleVerItinerario = (id: number | string) => {
    const it = itinerariosData.find((i) => String(i.id) === String(id));
    if (!it) return;
    setItinerarioSeleccionado(it);
    setCarouselIndex(0);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setItinerarioSeleccionado(null);
  };

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!itinerarioSeleccionado) return;
    const total = (itinerarioSeleccionado as any).imagenes.length;
    setCarouselIndex((prev) => (prev + 1) % total);
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!itinerarioSeleccionado) return;
    const total = (itinerarioSeleccionado as any).imagenes.length;
    setCarouselIndex((prev) => (prev - 1 + total) % total);
  };

  const handleEliminar = async (id: number | string) => {
    if (!confirm("¿Eliminar este itinerario permanentemente?")) return;
    try {
      setDeletingId(Number(id));
      await api.deleteItinerario(id);
      setItinerariosData((prev) => prev.filter((item) => item.id !== id));
      alert("Itinerario eliminado.");
    } catch (err: any) {
      alert(`Error: ${err?.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  // --- Render Skeleton ---
  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
           <div className="space-y-2">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-64 bg-gray-100 rounded animate-pulse"></div>
           </div>
           <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center p-4 border-b border-gray-100 gap-4">
              <div className="h-16 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-1/4 bg-gray-100 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- Render Principal ---
  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gestión de Itinerarios</h1>
            <p className="text-sm text-gray-500 mt-1">
              Administra las rutas, guías y contenido de viaje creados por la comunidad.
            </p>
          </div>
          <div className="flex gap-3">
             <button 
                onClick={loadItinerarios}
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
             >
                <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
             </button>
             <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium border border-indigo-100 flex items-center">
                <Map size={16} className="mr-2" />
                Total: {itinerariosData.length}
             </div>
          </div>
        </div>

        {/* Toolbar de Filtros */}
        <div className="bg-white p-4 rounded-t-xl border border-b-0 border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center shadow-sm">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por título, ID o autor..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
             <Filter size={16} className="mr-2" />
             Filtros avanzados
          </button>
        </div>

        {/* Tabla */}
        <div className="bg-white border border-gray-200 rounded-b-xl shadow-sm overflow-hidden">
          
          {error && (
            <div className="bg-red-50 p-4 border-b border-red-100 flex items-center text-red-700 text-sm">
              <AlertCircle size={16} className="mr-2" />
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Itinerario</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Autor</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Detalles</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {itinerariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <Map size={48} className="text-gray-200 mb-4" />
                        <p className="text-lg font-medium text-gray-900">No se encontraron itinerarios</p>
                        <p className="text-sm">Intenta con otra búsqueda.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  itinerariosFiltrados.map((item) => (
                    <tr key={item.id} className="group hover:bg-gray-50/80 transition-colors">
                      {/* Columna Itinerario (Imagen + Título) */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-12 w-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative">
                             {(item as any).imagenes?.[0] ? (
                               <img 
                                 src={(item as any).imagenes[0]} 
                                 className="h-full w-full object-cover" 
                                 alt="Thumbnail" 
                               />
                             ) : (
                               <div className="flex items-center justify-center h-full text-gray-300">
                                 <ImageIcon size={20} />
                               </div>
                             )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900 truncate max-w-[200px]" title={item.title}>
                                {item.title}
                            </div>
                            <div className="text-xs text-gray-500 font-mono mt-0.5">ID: {item.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Columna Autor */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                           <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 mr-2">
                              {getInitials(item.autor?.username || "A")}
                           </div>
                           <div className="flex flex-col">
                             <span className="text-sm font-medium text-gray-900">{item.autor?.username || "Desconocido"}</span>
                             <span className="text-xs text-gray-500">{item.autor?.correo}</span>
                           </div>
                        </div>
                      </td>

                      {/* Columna Detalles */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center text-xs text-gray-600">
                             <MapPin size={12} className="mr-1.5 text-gray-400" />
                             {item.actividades?.length || 0} Paradas
                          </div>
                          <div className="flex items-center text-xs text-gray-600">
                             <Calendar size={12} className="mr-1.5 text-gray-400" />
                             {new Date(item.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </td>

                      {/* Columna Estado */}
                      <td className="px-6 py-4 whitespace-nowrap">
                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                            ${item.estado === 'Publicado' 
                              ? 'bg-green-50 text-green-700 border-green-100' 
                              : item.estado === 'Reportado'
                                ? 'bg-red-50 text-red-700 border-red-100'
                                : 'bg-gray-100 text-gray-700 border-gray-200'
                            }`}>
                            {item.estado === 'Publicado' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>}
                            {item.estado === 'Reportado' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>}
                            {item.estado}
                         </span>
                      </td>

                      {/* Columna Acciones */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleVerItinerario(item.id)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Configurar"
                          >
                            <Settings size={18} />
                          </button>
                          <button
                            onClick={() => handleEliminar(item.id)}
                            disabled={deletingId === Number(item.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
             <span className="text-xs text-gray-500">Mostrando {itinerariosFiltrados.length} resultados</span>
             {/* Paginación visual placeholder */}
             <div className="flex gap-1">
                <button disabled className="px-3 py-1 border border-gray-300 rounded text-xs text-gray-400 bg-white cursor-not-allowed">Anterior</button>
                <button disabled className="px-3 py-1 border border-gray-300 rounded text-xs text-gray-400 bg-white cursor-not-allowed">Siguiente</button>
             </div>
          </div>
        </div>

      </div>

      {/* --- MODAL DETALLE --- */}
      {modalAbierto && itinerarioSeleccionado && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          onClick={(e) => { if (e.target === e.currentTarget) cerrarModal(); }}
        >
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" />
          
          <div className="relative z-10 w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white z-20">
               <div>
                  <h3 className="text-lg font-bold text-gray-900">{itinerarioSeleccionado.title}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                     <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">ID: {itinerarioSeleccionado.id}</span>
                     <span>Creado por @{itinerarioSeleccionado.autor?.username}</span>
                  </p>
               </div>
               <button onClick={cerrarModal} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <span className="sr-only">Cerrar</span>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>

            <div className="flex flex-col md:flex-row h-full overflow-hidden">
               {/* Columna Izquierda: Galería */}
               <div className="w-full md:w-1/2 bg-gray-900 relative flex items-center justify-center min-h-[300px] md:min-h-full">
                  {(itinerarioSeleccionado as any).imagenes?.length > 0 ? (
                    <>
                       <img 
                          src={(itinerarioSeleccionado as any).imagenes[carouselIndex]} 
                          className="max-h-full max-w-full object-contain"
                          alt="Galería"
                       />
                       {(itinerarioSeleccionado as any).imagenes.length > 1 && (
                         <>
                            <button 
                              onClick={prevSlide}
                              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm"
                            >
                               <ChevronLeft size={24} />
                            </button>
                            <button 
                              onClick={nextSlide}
                              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm"
                            >
                               <ChevronRight size={24} />
                            </button>
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1 rounded-full text-xs text-white">
                               {carouselIndex + 1} / {(itinerarioSeleccionado as any).imagenes.length}
                            </div>
                         </>
                       )}
                    </>
                  ) : (
                     <div className="text-gray-500 flex flex-col items-center">
                        <ImageIcon size={48} className="opacity-30 mb-2" />
                        <span className="text-sm">Sin imágenes disponibles</span>
                     </div>
                  )}
               </div>

               {/* Columna Derecha: Información */}
               <div className="w-full md:w-1/2 overflow-y-auto p-6 bg-white">
                  
                  <div className="space-y-6">
                     {/* Descripción */}
                     <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Descripción</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                           {(itinerarioSeleccionado as any).descripcion}
                        </p>
                     </div>

                     {/* Métricas */}
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                           <span className="text-indigo-600 block text-xs font-bold uppercase">Calificación</span>
                           <span className="text-2xl font-bold text-indigo-900">{(itinerarioSeleccionado as any).calificacion.toFixed(1)}</span>
                        </div>
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                           <span className="text-emerald-600 block text-xs font-bold uppercase">Paradas</span>
                           <span className="text-2xl font-bold text-emerald-900">{itinerarioSeleccionado.actividades?.length || 0}</span>
                        </div>
                     </div>

                     {/* Lista de Actividades (Timeline simple) */}
                     <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Ruta de Actividades</h4>
                        <div className="space-y-0 border-l-2 border-gray-100 ml-2 pl-4">
                           {itinerarioSeleccionado.actividades?.length > 0 ? (
                              itinerarioSeleccionado.actividades.map((act: any, idx: number) => (
                                 <div key={idx} className="relative pb-6 last:pb-0">
                                    <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-gray-300 ring-4 ring-white"></div>
                                    <h5 className="text-sm font-semibold text-gray-900">{act.titulo || act.nombre || `Parada ${idx + 1}`}</h5>
                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{act.descripcion || "Sin descripción"}</p>
                                 </div>
                              ))
                           ) : (
                              <p className="text-sm text-gray-400 italic">No hay actividades registradas.</p>
                           )}
                        </div>
                     </div>
                  </div>

               </div>
            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
               <button 
                  onClick={cerrarModal}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
               >
                  Cerrar
               </button>
               <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-indigo-700 shadow-sm">
                  Editar Contenido
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}