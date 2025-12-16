"use client";

import { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
	IconUsers,
	IconMapPin,
	IconStar,
	IconTrendingUp,
	IconAlertTriangle,
	IconRoute,
} from "@tabler/icons-react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import { ItinerariosAPI } from "@/api/ItinerariosAPI";
import type { DashboardStatsResponse, Reporte } from "@/api/interfaces/ApiRoutes";

// Datos para la gráfica de usuarios por mes
const usuariosPorMes2024 = [
	{ mes: "Ene", usuarios: 45 },
	{ mes: "Feb", usuarios: 52 },
	{ mes: "Mar", usuarios: 68 },
	{ mes: "Abr", usuarios: 73 },
	{ mes: "May", usuarios: 85 },
	{ mes: "Jun", usuarios: 92 },
	{ mes: "Jul", usuarios: 105 },
	{ mes: "Ago", usuarios: 118 },
	{ mes: "Sep", usuarios: 125 },
	{ mes: "Oct", usuarios: 142 },
	{ mes: "Nov", usuarios: 158 },
	{ mes: "Dic", usuarios: 165 },
];

const usuariosPorMes2025 = [
	{ mes: "Ene", usuarios: 178 },
	{ mes: "Feb", usuarios: 192 },
	{ mes: "Mar", usuarios: 205 },
	{ mes: "Abr", usuarios: 218 },
	{ mes: "May", usuarios: 235 },
	{ mes: "Jun", usuarios: 248 },
	{ mes: "Jul", usuarios: 265 },
	{ mes: "Ago", usuarios: 282 },
	{ mes: "Sep", usuarios: 298 },
	{ mes: "Oct", usuarios: 315 },
	{ mes: "Nov", usuarios: 332 },
	{ mes: "Dic", usuarios: 350 },
];

type LugarCard = {
	id: number | string;
	nombre: string;
	visitas: number;
	calificacion: number;
	imagen: string;
	descripcion: string;
	categoria?: string;
	estado?: string;
	latitud?: number;
	longitud?: number;
};

// Fallback de destinos populares (se usa si la API falla)
const destinosPopulares: LugarCard[] = [
	{
		id: 1,
		nombre: "Teotihuacán",
		visitas: 1250,
		calificacion: 4.8,
		imagen:
			"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0eOqiCnR48ykeWdoQSvhnWdO6jTLEfmFnfQ&s",
		descripcion: "Zona arqueológica con pirámides del Sol y la Luna",
		categoria: "Arqueológico",
		estado: "Estado de México",
	},
	{
		id: 2,
		nombre: "Chapultepec",
		visitas: 2100,
		calificacion: 4.6,
		imagen:
			"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUB4eDXywgdKuPz6V6BEBIV2xp_9vjB-LYuQ&s",
		descripcion: "Parque urbano más grande de América",
		categoria: "Parque",
		estado: "Ciudad de México",
	},
	{
		id: 3,
		nombre: "Centro Histórico",
		visitas: 1850,
		calificacion: 4.9,
		imagen:
			"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9_0FMj_pljb1LpjvUvlO6xymKT8itvIfwSg&s",
		descripcion: "Patrimonio de la Humanidad UNESCO",
		categoria: "Cultural",
		estado: "Ciudad de México",
	},
	{
		id: 4,
		nombre: "Xochimilco",
		visitas: 980,
		calificacion: 4.5,
		imagen:
			"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIikF5Tbzn3zKiv7E5TpGAW4BNmZK7HK7YtA&s",
		descripcion: "Canales tradicionales y trajineras",
		categoria: "Natural",
		estado: "Ciudad de México",
	},
];

// Componente principal
export default function DashboardAdmin() {
	const [añoSeleccionado, setAñoSeleccionado] = useState("2025");
	const [destinoSeleccionado, setDestinoSeleccionado] =
		useState<null | LugarCard>(null);
	const [modalAbierto, setModalAbierto] = useState(false);
	const [statsData, setStatsData] = useState<DashboardStatsResponse | null>(null);
	const [reportes, setReportes] = useState<Reporte[]>([]);
	const [reportesLoaded, setReportesLoaded] = useState(false);
	const [lugares, setLugares] = useState<LugarCard[]>([]);
	const [loading, setLoading] = useState(true);

	const api = ItinerariosAPI.getInstance();

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				
				// Cargar estadísticas
				try {
					const stats = await api.getAdminStats();
					setStatsData(stats);
				} catch (statsError) {
					console.warn("No se pudieron cargar estadísticas:", statsError);
					// Continuar sin estadísticas
				}
			
				// Cargar reportes
				try {
					const reportesData = await api.getReports();
					setReportes(reportesData);
					setReportesLoaded(true);
				} catch (error) {
					console.warn("No se pudieron cargar los reportes:", error);
					setReportes([]);
					setReportesLoaded(true);
				}

				// Cargar lugares recomendados de la API
				try {
					// Pedimos recomendaciones (limit 8) y luego tomamos los 4 mejores calificados
					const recs = await api.getRecommendations({ limit: 8 });
					const lugaresData = Array.isArray(recs) ? recs : [];

					const lugaresOrdenados = [...lugaresData].sort((a: any, b: any) => {
						const scoreA = parseFloat(a.google_score) || 0;
						const scoreB = parseFloat(b.google_score) || 0;
						return scoreB - scoreA;
					});

					const mejoresLugares = lugaresOrdenados.slice(0, 4);

					const lugaresFormateados: LugarCard[] = mejoresLugares.map((lugar: any) => ({
						id: lugar.id_api_place || Math.random(),
						nombre: lugar.nombre,
						visitas: lugar.total_reviews || 0,
						calificacion: parseFloat(lugar.google_score) || 4.5,
						imagen: lugar.foto_url,
						descripcion: lugar.descripcion || lugar.category || "Destino turístico",
						categoria: lugar.category,
						estado: lugar.mexican_state,
						latitud: lugar.latitud,
						longitud: lugar.longitud,
					}));

					setLugares(lugaresFormateados);
				} catch (error) {
					console.warn("No se pudieron cargar recomendaciones; se usarán lugares populares por defecto:", error);
					setLugares(destinosPopulares);
				}
			} catch (error) {
				console.error("Error al cargar datos del dashboard:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	function abrirModal(destino: LugarCard) {
		setDestinoSeleccionado(destino);
		setModalAbierto(true);
	}
	function cerrarModal() {
		setModalAbierto(false);
		setDestinoSeleccionado(null);
	}

	const datosGrafica =
		añoSeleccionado === "2024" ? usuariosPorMes2024 : usuariosPorMes2025;

	
	const totalUsuarios = statsData?.usuarios.total ?? datosGrafica.reduce(
		(acc, mes) => acc + mes.usuarios,
		0
	);
	const promedioUsuarios = Math.round(totalUsuarios / datosGrafica.length);
	const crecimiento = statsData?.usuarios.crecimiento ?? (
		datosGrafica.length > 1
			? Math.round(
					((
						datosGrafica[datosGrafica.length - 1].usuarios -
						datosGrafica[0].usuarios
					) / datosGrafica[0].usuarios) *
						100
			  )
			: 0
	);

	if (loading) {
		return (
			<div className="container mx-auto py-6 px-4">
				<div className="flex items-center justify-center min-h-[400px]">
					<div className="text-center space-y-3">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
						<p className="text-muted-foreground">Cargando datos del dashboard...</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-6 px-4 space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-2">
				<h1 className="text-3xl font-bold">Dashboard Administrador</h1>
				<p className="text-muted-foreground">
					Bienvenido al panel de administración
					{statsData?.timestamp && (
						<span className="ml-2 text-xs">
							(Última actualización: {new Date(statsData.timestamp).toLocaleString("es-MX")})
						</span>
					)}
				</p>
			</div>

			{/* Tarjetas de estadísticas */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Usuarios
						</CardTitle>
						<IconUsers className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{statsData?.usuarios.total ?? 0}
						</div>
						<p className="text-xs text-muted-foreground">
							Usuarios registrados
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Itinerarios
						</CardTitle>
						<IconRoute className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{statsData?.metricasGenerales.totalItinerarios ?? 0}
						</div>
						<p className="text-xs text-muted-foreground">
							Itinerarios creados
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Crecimiento</CardTitle>
						<IconTrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{statsData?.usuarios.crecimiento ?? "0%"}
						</div>
						<p className="text-xs text-muted-foreground">Este año</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Lugares Registrados
						</CardTitle>
						<IconMapPin className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{statsData?.metricasGenerales.totalLugares ?? 0}
						</div>
						<p className="text-xs text-muted-foreground">
							Destinos disponibles
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Nueva tarjeta de reportes pendientes */}
			<Card className="border-orange-200 dark:border-orange-900">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<div>
						<CardTitle className="text-lg font-medium">
							Reportes Pendientes
						</CardTitle>
						<CardDescription>
							Reportes que requieren atención
						</CardDescription>
					</div>
					<IconAlertTriangle className="h-5 w-5 text-orange-500" />
				</CardHeader>
				<CardContent>
					<div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
						{statsData?.metricasGenerales.reportesPendientes ?? 0}
					</div>
					<p className="text-xs text-muted-foreground mt-1">
						{reportesLoaded
							? `${reportes.length || statsData?.metricasGenerales.reportesPendientes || 0} reportes en total`
							: "Cargando reportes..."}
					</p>
				</CardContent>
			</Card>			{/* Gráfica de nuevos usuarios */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Nuevos Usuarios</CardTitle>
							<CardDescription>
								Registro de usuarios por mes
							</CardDescription>
						</div>
						<Select
							value={añoSeleccionado}
							onValueChange={setAñoSeleccionado}
						>
							<SelectTrigger className="w-32">
								<SelectValue placeholder="Año" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="2024">2024</SelectItem>
								<SelectItem value="2025">2025</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardHeader>
				<CardContent>
					<ResponsiveContainer width="100%" height={350}>
						<AreaChart data={datosGrafica}>
							<defs>
								<linearGradient
									id="colorUsuarios"
									x1="0"
									y1="0"
									x2="0"
									y2="1"
								>
									<stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
									<stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
								</linearGradient>
							</defs>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="mes" />
							<YAxis />
							<Tooltip />
							<Area
								type="monotone"
								dataKey="usuarios"
								stroke="#2563eb"
								strokeWidth={2}
								fillOpacity={1}
								fill="url(#colorUsuarios)"
							/>
						</AreaChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>


			{/* Tarjetas de destinos populares con imágenes */}
			<div>
				<h2 className="text-2xl font-bold mb-4">Destinos Populares</h2>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{(lugares.length > 0 ? lugares : destinosPopulares).map((destino) => (
						<Card
							key={destino.id}
							className="overflow-hidden cursor-pointer"
							onClick={() => abrirModal(destino)}
						>
							<div className="aspect-video relative">
								<img
									src={destino.imagen}
									alt={destino.nombre}
									className="w-full h-full object-cover"
									onError={(e) => {
										(e.target as HTMLImageElement).src = "https://via.placeholder.com/400x225?text=Destino";
									}}
								/>
							</div>
							<CardHeader>
								<CardTitle className="text-lg">
									{destino.nombre}
								</CardTitle>
								<CardDescription className="line-clamp-2">
									{destino.descripcion}
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-2">
								<div className="flex items-center justify-between text-sm">
									<div className="flex items-center gap-1">
										<IconStar className="h-4 w-4 fill-yellow-400 text-yellow-400" />
										<span className="font-medium">
											{destino.calificacion}
										</span>
									</div>
									<div className="flex items-center gap-1 text-muted-foreground">
										<IconUsers className="h-4 w-4" />
										<span>{destino.visitas} visitas</span>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>

			{/* Modal de destino seleccionado */}
			{modalAbierto && destinoSeleccionado && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center p-4"
					onClick={(e) => {
						if (e.target === e.currentTarget) cerrarModal();
					}}
				>
					{/* Fondo */}
					<div className="absolute inset-0 bg-black/40" />

					{/* Contenido */}
					<div className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-2xl dark:bg-neutral-900">
						<div className="flex items-center justify-between border-b px-4 py-3">
							<h3 className="text-lg font-semibold">
								{destinoSeleccionado.nombre}
							</h3>
							<Button variant="ghost" size="sm" onClick={cerrarModal}>
								Cerrar
							</Button>
						</div>

						<div className="px-4 py-3 space-y-3">
							<div className="flex items-center gap-2">
								<Badge variant="secondary">
									{destinoSeleccionado.calificacion} ★
								</Badge>
								<Badge variant="outline">
									{destinoSeleccionado.visitas} visitas
								</Badge>
							</div>

							<p className="text-sm text-muted-foreground">
								{destinoSeleccionado.descripcion}
							</p>

							{/* Datos adicionales reales: ubicación y categoría */}
							<div className="grid grid-cols-2 gap-3 text-sm">
								<div className="rounded-lg border p-3">
									<p className="text-xs text-muted-foreground">Ubicación</p>
									<p className="font-medium">
										{destinoSeleccionado.estado ?? "Ubicación no disponible"}
									</p>
								</div>
								<div className="rounded-lg border p-3">
									<p className="text-xs text-muted-foreground">Categoría</p>
									<p className="font-medium">
										{destinoSeleccionado.categoria ?? "Sin categoría"}
									</p>
								</div>
							</div>

							<div className="rounded-lg overflow-hidden border">
								<img
									src={destinoSeleccionado.imagen}
									alt={destinoSeleccionado.nombre}
									className="w-full h-40 object-cover"
								/>
							</div>
						</div>

						<div className="flex justify-end gap-2 border-t px-4 py-3">

						</div>
					</div>
				</div>
			)}
		</div>
	);
}

