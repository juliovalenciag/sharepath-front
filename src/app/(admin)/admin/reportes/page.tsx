"use client";

import React, { useState, useEffect, useMemo } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  CheckCircle2,
  XCircle,
  Trash2,
  Eye,
  Search,
  Filter,
  AlertTriangle,
  Loader2,
  ShieldAlert,
  FileText,
  History,
  Image as ImageIcon,
  MapPin,
  RefreshCw,
  MoreHorizontal,
  Clock,
  User,
  Flag,
  AlertCircle,
  ArrowUpRight,
  Calendar
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ItinerariosAPI } from "@/api/ItinerariosAPI";
import { Reporte, Publicacion } from "@/api/interfaces/ApiRoutes";
import { cn } from "@/lib/utils";

// --- TIPOS ---
type ReportStatus = "en_revision" | "pendiente" | "resuelto";

type ReportItemUI = {
  id: number;
  description: string;
  usuario_emitente: {
    username: string;
    nombre_completo: string;
    role: string;
    foto_url?: string;
  };
  date: string;
  status: ReportStatus;
  originalReport?: Reporte;
};

// --- COMPONENTES AUXILIARES ---

// 1. Badge de Estado Consistente
const StatusBadge = ({ status }: { status: ReportStatus }) => {
  const config = {
    pendiente: {
        label: "Pendiente",
        icon: Clock,
        className: "bg-blue-50 text-blue-700 border-blue-100"
    },
    en_revision: {
        label: "En Revisión",
        icon: AlertCircle,
        className: "bg-amber-50 text-amber-700 border-amber-100"
    },
    resuelto: {
        label: "Resuelto",
        icon: CheckCircle2,
        className: "bg-emerald-50 text-emerald-700 border-emerald-100"
    }
  };
  const { label, icon: Icon, className } = config[status] || config.pendiente;

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border gap-1.5", className)}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
};

// 2. Tarjeta de Métricas (Estilo Simple)
function StatCard({ title, value, icon: Icon, description, colorClass }: any) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-2">{value}</h3>
            <p className="text-xs text-gray-400 mt-1">{description}</p>
        </div>
        <div className={cn("p-3 rounded-lg", colorClass)}>
            <Icon className="h-5 w-5" />
        </div>
      </div>
    );
  }

// --- PÁGINA PRINCIPAL ---
export default function ReportesPage() {
  const [reports, setReports] = useState<ReportItemUI[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedReport, setSelectedReport] = useState<Reporte | null>(null);
  const [selectedPublicacion, setSelectedPublicacion] = useState<Publicacion | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [publicacionLoading, setPublicacionLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [queryText, setQueryText] = useState("");
  const [queryStatus, setQueryStatus] = useState<ReportStatus | "all">("all");

  const api = useMemo(() => ItinerariosAPI.getInstance(), []);

  // Carga de datos
  const loadReports = async () => {
    try {
      setLoading(true);
      const reportesDelBackend = await api.getReports();
      
      if (reportesDelBackend.length > 0) {
        const mappedReports: ReportItemUI[] = reportesDelBackend.map((reporte) => ({
          id: reporte.id,
          description: reporte.description,
          usuario_emitente: {
            username: reporte.usuario_emitente?.username || "Anónimo",
            nombre_completo: reporte.usuario_emitente?.nombre_completo || "Usuario Desconocido",
            role: reporte.usuario_emitente?.role || "viajero",
            foto_url: reporte.usuario_emitente?.foto_url,
          },
          date: new Date().toISOString(), 
          status: "pendiente",
          originalReport: reporte
        }));
        setReports(mappedReports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error("Error cargando reportes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReports(); }, [api]);

  // Filtros
  const filteredReports = useMemo(() => {
    const lowerQuery = queryText.toLowerCase();
    return reports.filter((r) => {
      const matchText = 
        r.id.toString().includes(lowerQuery) ||
        r.usuario_emitente.nombre_completo.toLowerCase().includes(lowerQuery) ||
        r.usuario_emitente.username.toLowerCase().includes(lowerQuery) ||
        r.description.toLowerCase().includes(lowerQuery);
        
      const matchStatus = queryStatus === "all" || r.status === queryStatus;
      return matchText && matchStatus;
    });
  }, [reports, queryText, queryStatus]);

  // Stats
  const stats = useMemo(() => {
    const total = reports.length;
    const pendientes = reports.filter(r => r.status === "pendiente").length;
    const revision = reports.filter(r => r.status === "en_revision").length;
    return { total, pendientes, revision };
  }, [reports]);

  // Acciones
  const handleViewDetails = async (id: number) => {
    setModalOpen(true);
    setDetailLoading(true);
    try {
      const detail = await api.getAdminReportDetail(id);
      setSelectedReport(detail);
    } catch (error) {
      const localReport = reports.find(r => r.id === id)?.originalReport;
      if (localReport) setSelectedReport(localReport);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleBanPublication = async (id: number) => {
    if(!confirm("¿Estás seguro de banear la publicación asociada?")) return;
    try {
      await api.banPublication(id);
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: "en_revision" } : r));
      setModalOpen(false);
    } catch (error) {
        alert("Error al banear");
    }
  };

  const handleDeleteReport = async (id: number) => {
    if (!confirm("¿Eliminar este reporte permanentemente?")) return;
    try {
      await api.deleteReport(id);
      setReports(prev => prev.filter(r => r.id !== id));
      setModalOpen(false);
    } catch (error) {
      alert("Error al eliminar");
    }
  };

  const extractPublicacionId = (reporte: Reporte): number | null => {
    if (reporte.historial?.length > 0) {
        const match = reporte.historial[0].action_description.match(/con id (\d+)/i);
        if (match) return parseInt(match[1], 10);
    }
    const descMatch = reporte.description.match(/id[:\s]+(\d+)/i);
    return descMatch ? parseInt(descMatch[1], 10) : null;
  };

  const handleViewPublication = async () => {
    if (!selectedReport) return;
    const pubId = extractPublicacionId(selectedReport);
    if (!pubId) {
      alert("No se pudo identificar el ID de la publicación.");
      return;
    }
    setPreviewOpen(true);
    setPublicacionLoading(true);
    try {
      const pub = await api.getPublicationWithResenas(pubId) as any;
      setSelectedPublicacion(pub);
    } catch (error) {
      setSelectedPublicacion(null);
    } finally {
      setPublicacionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
      
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Centro de Moderación</h1>
            <p className="text-gray-500 mt-2 text-sm">
                Gestiona los reportes de contenido y usuarios de la plataforma.
            </p>
            </div>
            <button 
                onClick={loadReports} 
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
            >
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Actualizar
            </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
                title="Total Reportes" 
                value={stats.total} 
                icon={Flag} 
                description="Histórico completo" 
                colorClass="bg-gray-100 text-gray-600"
            />
            <StatCard 
                title="Pendientes" 
                value={stats.pendientes} 
                icon={Clock} 
                description="Requieren atención" 
                colorClass="bg-blue-50 text-blue-600"
            />
            <StatCard 
                title="En Revisión" 
                value={stats.revision} 
                icon={ShieldAlert} 
                description="Acciones tomadas" 
                colorClass="bg-amber-50 text-amber-600"
            />
        </div>

        {/* Toolbar & Filters */}
        <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar por ID, usuario, motivo..."
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm text-gray-900 placeholder:text-gray-400"
                />
            </div>
            <div className="flex gap-2">
                 <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                        value={queryStatus}
                        onChange={(e) => setQueryStatus(e.target.value as any)}
                        className="pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                        <option value="all">Todos los estados</option>
                        <option value="pendiente">Pendientes</option>
                        <option value="en_revision">En revisión</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Main Table */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Usuario Reportante</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Motivo</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-2" />
                                        <p className="text-sm text-gray-500">Cargando reportes...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredReports.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="bg-gray-100 p-3 rounded-full mb-3">
                                            <Flag className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <h3 className="text-gray-900 font-medium">Sin resultados</h3>
                                        <p className="text-sm text-gray-500 mt-1">No hay reportes con los filtros actuales.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredReports.map((report) => (
                                <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        #{report.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Avatar className="h-8 w-8 border border-gray-200">
                                                <AvatarImage src={report.usuario_emitente.foto_url} />
                                                <AvatarFallback className="bg-indigo-50 text-indigo-700 text-xs font-bold">
                                                    {report.usuario_emitente.username.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-gray-900">{report.usuario_emitente.nombre_completo}</div>
                                                <div className="text-xs text-gray-500 capitalize">{report.usuario_emitente.role}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <p className="text-sm text-gray-600 max-w-[250px] truncate cursor-default">
                                                        {report.description}
                                                    </p>
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs bg-gray-900 text-white border-0">
                                                    {report.description}
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm text-gray-900">{format(new Date(report.date), "dd MMM yyyy", { locale: es })}</span>
                                            <span className="text-xs text-gray-500">{formatDistanceToNow(new Date(report.date), { addSuffix: true, locale: es })}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={report.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleViewDetails(report.id)}
                                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="Ver detalles"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border-gray-100">
                                                    <DropdownMenuLabel className="text-xs text-gray-500 uppercase tracking-wider">Acciones</DropdownMenuLabel>
                                                    <DropdownMenuItem 
                                                        onClick={() => handleBanPublication(report.id)} 
                                                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 cursor-pointer"
                                                    >
                                                        <ShieldAlert className="mr-2 h-4 w-4" /> Banear Contenido
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem 
                                                        onClick={() => handleDeleteReport(report.id)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar Reporte
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Table Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">
                    Mostrando {filteredReports.length} reportes
                </span>
                <div className="flex gap-2">
                    <button disabled className="px-3 py-1 border border-gray-300 rounded-lg text-xs text-gray-400 bg-white cursor-not-allowed">Anterior</button>
                    <button disabled className="px-3 py-1 border border-gray-300 rounded-lg text-xs text-gray-400 bg-white cursor-not-allowed">Siguiente</button>
                </div>
            </div>
        </div>

      </div>

      {/* --- MODALES --- */}

      {/* 1. Modal Detalle (Estilo Expediente) */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-2xl p-0 gap-0 rounded-2xl border-0 shadow-2xl overflow-hidden bg-white">
          <DialogHeader className="p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-4">
                <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                    <DialogTitle className="text-xl font-bold text-gray-900">Detalles del Reporte</DialogTitle>
                    <DialogDescription className="text-gray-500 mt-1">
                        ID: #{selectedReport?.id} • {selectedReport ? format(new Date(), "dd MMMM yyyy", { locale: es }) : "..."}
                    </DialogDescription>
                </div>
            </div>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            <div className="p-6 space-y-6">
                {detailLoading ? (
                    <div className="py-12 flex justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
                    </div>
                ) : selectedReport ? (
                    <div className="space-y-6">
                        {/* User Card */}
                        <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                             <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                <AvatarImage src={selectedReport.usuario_emitente.foto_url} />
                                <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">
                                    {selectedReport.usuario_emitente.username.slice(0,2)}
                                </AvatarFallback>
                             </Avatar>
                             <div className="ml-4">
                                <h4 className="text-sm font-bold text-gray-900">{selectedReport.usuario_emitente.nombre_completo}</h4>
                                <p className="text-xs text-gray-500">Reportado por @{selectedReport.usuario_emitente.username}</p>
                             </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Motivo del reporte</h4>
                            <div className="bg-white p-4 border border-gray-200 rounded-xl text-sm text-gray-700 leading-relaxed shadow-sm">
                                {selectedReport.description}
                            </div>
                        </div>

                        {/* History */}
                        {selectedReport.historial && selectedReport.historial.length > 0 && (
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Historial</h4>
                                <div className="border-l-2 border-gray-200 ml-2 pl-4 space-y-3">
                                    {selectedReport.historial.map((h, i) => (
                                        <div key={i} className="relative text-sm text-gray-600">
                                            <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-gray-300 ring-4 ring-white"></div>
                                            {h.action_description}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>
          </ScrollArea>

          <DialogFooter className="p-4 bg-gray-50 border-t border-gray-100 flex-col sm:flex-row gap-3">
            <button 
                onClick={() => setModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
            >
                Cerrar
            </button>
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={handleViewPublication}
                className="flex-1 sm:flex-none px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="h-4 w-4" /> Ver Contenido
              </button>
              <button 
                onClick={() => handleBanPublication(selectedReport!.id)}
                className="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <ShieldAlert className="h-4 w-4" /> Sancionar
              </button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Modal Preview (Estilo Red Social) */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border-0 shadow-2xl bg-white">
            {publicacionLoading ? (
                <div className="py-20 flex flex-col items-center">
                    <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
                    <p className="text-sm text-gray-500 mt-4">Cargando publicación...</p>
                </div>
            ) : selectedPublicacion ? (
                <div>
                    <div className="p-4 flex items-center justify-between border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Publicación #{selectedPublicacion.id}</h3>
                                <p className="text-xs text-gray-500">Vista de moderación</p>
                            </div>
                        </div>
                        <button onClick={() => setPreviewOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <XCircle className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="bg-gray-900 aspect-square flex items-center justify-center relative">
                        {selectedPublicacion.fotos && selectedPublicacion.fotos.length > 0 ? (
                            <img 
                                src={selectedPublicacion.fotos[0].foto_url} 
                                className="w-full h-full object-contain" 
                                alt="Evidencia"
                            />
                        ) : (
                            <div className="text-gray-500 flex flex-col items-center">
                                <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                                <span className="text-sm">Sin imagen</span>
                            </div>
                        )}
                    </div>

                    <div className="p-6">
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Descripción</h4>
                        <p className="text-sm text-gray-800 leading-relaxed">
                            {selectedPublicacion.descripcion || <span className="italic text-gray-400">Sin descripción</span>}
                        </p>
                        
                        {selectedPublicacion.itinerario && (
                            <div className="mt-4 flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-100">
                                <MapPin className="h-3.5 w-3.5" />
                                <span className="truncate">Vinculado a: {(selectedPublicacion.itinerario as any).title || selectedPublicacion.itinerario.id}</span>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="p-10 text-center">
                    <AlertTriangle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                    <h3 className="text-gray-900 font-bold">No disponible</h3>
                    <p className="text-gray-500 text-sm mt-2">El contenido ha sido eliminado o no es accesible.</p>
                </div>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}