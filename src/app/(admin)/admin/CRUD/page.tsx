"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconEye,
  IconTrash,
  IconSettings,
  IconSearch,
  IconRoute,
} from "@tabler/icons-react";
import { ItinerariosAPI } from "@/api/ItinerariosAPI";
import { ItinerarioData } from "@/api/interfaces/ApiRoutes";

type ItinerarioUI = ItinerarioData & {
  estado: "Reportado" | "No publicado" | "Publicado";
  autor?: {
    username?: string;
    correo?: string;
    nombre?: string;
  };
};

export default function Page() {
  const [busqueda, setBusqueda] = useState("");
  const [itinerariosData, setItinerariosData] = useState<ItinerarioUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [itinerarioSeleccionado, setItinerarioSeleccionado] = useState<ItinerarioUI | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  
  const api = useMemo(() => ItinerariosAPI.getInstance(), []);

// Cargar itinerarios del backend
useEffect(() => {
  const loadItinerarios = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("📥 Cargando itinerarios desde el endpoint de lista /itinerario...");

      // *** ÚNICO PASO: Usar el endpoint de lista /itinerario ***
      const listResp = await api.getMyItinerarios();

      // Aceptar múltiples formatos de respuesta: array directo o objeto con propiedad
      const fetchedItinerarios: any[] = Array.isArray(listResp)
        ? listResp
        : (listResp as any)?.itinerarios || (listResp as any)?.items || [];

      if (Array.isArray(fetchedItinerarios) && fetchedItinerarios.length > 0) {
        const mapped = fetchedItinerarios.map((it: any) => ({
          ...it,
          // Normaliza propiedades comunes para el UI
          id: it.id ?? it.itinerario_id ?? it._id ?? it.Id,
          title: it.title ?? it.nombre ?? it.name ?? "Sin nombre",
          actividades: Array.isArray(it.actividades) ? it.actividades : (it.activities || []),
          createdAt: it.createdAt ?? it.fecha_creacion ?? it.created_at ?? "",
          estado: ((it.estado === "Aprobado" || it.estado === "aprobado") ? "Publicado" : it.estado) as ItinerarioUI["estado"] ?? "Publicado",
          autor: {
            username:
              it.usuario?.username || it.user?.username || it.owner?.username || it.autor?.username || it.username || undefined,
            correo:
              it.usuario?.correo || it.user?.correo || it.owner?.correo || it.autor?.correo || it.correo || undefined,
            nombre:
              it.usuario?.nombre_completo || it.user?.nombre_completo || it.owner?.nombre_completo || it.autor?.nombre || it.nombre_usuario || undefined,
          },
          imagenes:
            it.imagenes || it.images || it.fotos || it.gallery || (it.cover ? [it.cover] : []),
          descripcion: it.descripcion ?? it.description ?? "Sin descripción",
          calificacion: it.calificacion ?? it.google_score ?? it.rating ?? 0,
        }));

        setItinerariosData(mapped);
        console.log(`✅ Cargados ${mapped.length} itinerarios vía lista directa (/itinerario)`);
      } else {
        // Esto cubre el caso de que la API responde 200 OK pero sin datos
        setError("No se encontraron itinerarios en el sistema (La lista está vacía).");
        console.warn("⚠️ Endpoint /itinerario respondió con 0 itinerarios");
        setItinerariosData([]);
      }
      
    } catch (err: any) {
      // Esto cubre errores de conexión, 4xx, 5xx del endpoint /itinerario
      const errorMsg = err?.message || "Error al cargar los itinerarios desde el backend. Revisa el endpoint /itinerario.";
      setError(errorMsg);
      console.error("❌ Error al cargar itinerarios:", err);
      setItinerariosData([]); // Limpiar datos si hay error
    } finally {
      setLoading(false);
    }
  };

  loadItinerarios();
}, [api]); // Dependencia 'api' // Dependencia 'api'

  // Filtrar itinerarios según la búsqueda
  const itinerariosFiltrados = useMemo(() => {
    return itinerariosData.filter(
      (item) =>
        String(item.id).includes(busqueda) ||
        (item.title && item.title.toLowerCase().includes(busqueda.toLowerCase()))
    );
  }, [itinerariosData, busqueda]);

  // Función para determinar el color del badge según el estado
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Publicado":
        return (
          <Badge className="rounded-full bg-green-100 text-green-700 hover:bg-green-100">
            Publicado
          </Badge>
        );
      case "No publicado":
        return (
          <Badge className="rounded-full bg-gray-100 text-gray-700 hover:bg-gray-100">
            No publicado
          </Badge>
        );
      case "Reportado":
        return (
          <Badge className="rounded-full bg-red-100 text-red-700 hover:bg-red-100">
            Reportado
          </Badge>
        );
      default:
        return <Badge variant="secondary">{estado}</Badge>;
    }
  };

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
    setCarouselIndex(0);
  };

  const nextSlide = () => {
    if (!itinerarioSeleccionado) return;
    const total = Array.isArray((itinerarioSeleccionado as any).imagenes)
      ? (itinerarioSeleccionado as any).imagenes.length
      : 0;
    if (total === 0) return;
    setCarouselIndex((prev) => (prev + 1) % total);
  };

  const prevSlide = () => {
    if (!itinerarioSeleccionado) return;
    const total = Array.isArray((itinerarioSeleccionado as any).imagenes)
      ? (itinerarioSeleccionado as any).imagenes.length
      : 0;
    if (total === 0) return;
    setCarouselIndex((prev) => (prev - 1 + total) % total);
  };

  const handleEliminar = async (id: number | string) => {
    const confirmDelete = confirm("¿Estás seguro de que deseas eliminar este itinerario?");
    if (!confirmDelete) return;

    try {
      setDeletingId(Number(id));
      console.log(`🗑️ Eliminando itinerario ${id}...`);
      await api.deleteItinerario(id);
      
      // Actualizar la lista eliminando el itinerario
      setItinerariosData((prev) => prev.filter((item) => item.id !== id));
      console.log(`✅ Itinerario ${id} eliminado correctamente`);
      alert("Itinerario eliminado correctamente");
    } catch (err: any) {
      const errorMsg = err?.message || "Error al eliminar el itinerario";
      console.error("❌ Error al eliminar:", err);
      alert(`Error: ${errorMsg}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleConfiguracion = (id: number | string) => {
    console.log("Configurar itinerario:", id);
    // Aquí puedes agregar la lógica para configuración
  };

  const handleVerDetalle = (id: number | string) => {
    console.log("Ver detalle del itinerario:", id);
    // Aquí puedes agregar la lógica para ver detalle
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header con título y buscador */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">CRUD de Itinerarios</h1>
                <p className="text-muted-foreground mt-1">
                  Gestiona y administra todos los itinerarios de la plataforma
                </p>
              </div>
            </div>

            {/* Buscador */}
            <div className="flex items-center gap-2 max-w-md">
              <div className="relative flex-1">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar itinerario..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              ⚠️ {error}
            </div>
          )}

          {/* Mensaje de carga */}
          {loading && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
              ⏳ Descubriendo automáticamente los itinerarios disponibles en el sistema...
            </div>
          )}

          {/* Tabla de itinerarios */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <IconRoute className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Itinerarios</CardTitle>
                  <p className="text-sm text-muted-foreground">Listado general de itinerarios</p>
                </div>
              </div>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                disabled={loading}
              >
                {loading ? "Cargando..." : "Recargar"}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="border-0">
                  <TableHeader className="bg-slate-50">
                    <TableRow className="border-0">
                      <TableHead className="w-[80px] border-0 text-xs font-semibold uppercase tracking-wide text-indigo-500">ID</TableHead>
                      <TableHead className="border-0 text-xs font-semibold uppercase tracking-wide text-indigo-500">Nombre</TableHead>
                      <TableHead className="border-0 text-xs font-semibold uppercase tracking-wide text-indigo-500">Autor</TableHead>
                      <TableHead className="border-0 text-xs font-semibold uppercase tracking-wide text-indigo-500">Actividades</TableHead>
                      <TableHead className="border-0 text-xs font-semibold uppercase tracking-wide text-indigo-500">Itinerario</TableHead>
                      <TableHead className="border-0 text-xs font-semibold uppercase tracking-wide text-indigo-500">Estado</TableHead>
                      <TableHead className="border-0 text-right text-xs font-semibold uppercase tracking-wide text-indigo-500">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!loading && itinerariosFiltrados.length > 0 ? (
                      itinerariosFiltrados.map((itinerario) => (
                        <TableRow key={itinerario.id} className="border-0 hover:bg-slate-50/60">
                          <TableCell className="border-0 font-mono text-sm">
                            {itinerario.id}
                          </TableCell>
                          <TableCell className="border-0 font-medium">
                            {itinerario.title || "Sin nombre"}
                          </TableCell>
                          <TableCell className="border-0 max-w-xs truncate">
                            {itinerario.autor?.username || itinerario.autor?.nombre || itinerario.autor?.correo || "Desconocido"}
                          </TableCell>
                          <TableCell className="border-0 max-w-xs truncate text-muted-foreground">
                            {itinerario.actividades?.length || 0} actividades
                          </TableCell>
                          <TableCell className="border-0">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-0"
                              onClick={() => handleVerItinerario(itinerario.id)}
                            >
                              Ver itinerario
                            </Button>
                          </TableCell>
                          <TableCell className="border-0">{getEstadoBadge(itinerario.estado)}</TableCell>
                          <TableCell className="border-0">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                                onClick={() => handleVerItinerario(itinerario.id)}
                                title="Ver itinerario"
                              >
                                <IconEye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-amber-600 hover:bg-amber-50"
                                onClick={() => handleConfiguracion(itinerario.id)}
                                title="Configuración"
                              >
                                <IconSettings className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleEliminar(itinerario.id)}
                                disabled={deletingId === Number(itinerario.id)}
                                title="Eliminar"
                              >
                                <IconTrash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : !loading ? (
                        <TableRow className="border-0">
                          <TableCell colSpan={7} className="border-0 text-center py-8">
                          <p className="text-muted-foreground">
                            No se encontraron itinerarios
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </div>

              {/* Información de resultados */}
              {!loading && itinerariosFiltrados.length > 0 && (
                <div className="mt-4 text-sm text-muted-foreground">
                  Mostrando {itinerariosFiltrados.length} de {itinerariosData.length} itinerarios
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal ver itinerario */}
      {modalAbierto && itinerarioSeleccionado && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) cerrarModal();
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 w-full max-w-4xl rounded-xl bg-white shadow-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">{itinerarioSeleccionado.title}</h3>
              <Button variant="ghost" size="sm" onClick={cerrarModal}>Cerrar</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Carrusel de imágenes */}
              <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                {Array.isArray((itinerarioSeleccionado as any).imagenes) && (itinerarioSeleccionado as any).imagenes.length > 0 ? (
                  <img
                    src={(itinerarioSeleccionado as any).imagenes[carouselIndex]}
                    alt={`Imagen ${carouselIndex + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/600x400?text=Imagen";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
                    Sin imágenes
                  </div>
                )}
                {Array.isArray((itinerarioSeleccionado as any).imagenes) && (itinerarioSeleccionado as any).imagenes.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between px-2">
                    <Button variant="outline" size="sm" onClick={prevSlide}>◀</Button>
                    <Button variant="outline" size="sm" onClick={nextSlide}>▶</Button>
                  </div>
                )}
              </div>
              {/* Descripción y calificación */}
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Descripción</p>
                  <p className="text-sm">{(itinerarioSeleccionado as any).descripcion}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Calificación:</span>
                  <span className="font-medium">{(itinerarioSeleccionado as any).calificacion ?? 0}</span>
                </div>
                {itinerarioSeleccionado.autor && (
                  <div className="text-sm text-muted-foreground">
                    Autor: <span className="font-medium">{itinerarioSeleccionado.autor.username || itinerarioSeleccionado.autor.nombre || itinerarioSeleccionado.autor.correo}</span>
                  </div>
                )}
                <div className="text-sm text-muted-foreground">
                  Actividades: <span className="font-medium">{itinerarioSeleccionado.actividades?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
