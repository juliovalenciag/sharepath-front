"use client";

import { useState } from "react";
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

// Datos de nuevos usuarios para la tabla
const nuevosUsuarios = [
	{
		id: 1,
		nombre: "María González",
		email: "maria.gonzalez@email.com",
		fechaRegistro: "2025-11-15",
		estado: "Activo",
		itinerarios: 3,
		avatar: "https://i.pravatar.cc/150?img=1",
	},
	{
		id: 2,
		nombre: "Carlos Ramírez",
		email: "carlos.ramirez@email.com",
		fechaRegistro: "2025-11-14",
		estado: "Activo",
		itinerarios: 1,
		avatar: "https://i.pravatar.cc/150?img=2",
	},
	{
		id: 3,
		nombre: "Ana López",
		email: "ana.lopez@email.com",
		fechaRegistro: "2025-11-13",
		estado: "Activo",
		itinerarios: 2,
		avatar: "https://i.pravatar.cc/150?img=3",
	},
	{
		id: 4,
		nombre: "Juan Pérez",
		email: "juan.perez@email.com",
		fechaRegistro: "2025-11-12",
		estado: "Pendiente",
		itinerarios: 0,
		avatar: "https://i.pravatar.cc/150?img=4",
	},
	{
		id: 5,
		nombre: "Laura Martínez",
		email: "laura.martinez@email.com",
		fechaRegistro: "2025-11-11",
		estado: "Activo",
		itinerarios: 4,
		avatar: "https://i.pravatar.cc/150?img=5",
	},
];

// Datos de destinos populares con imágenes
const destinosPopulares = [
	{
		id: 1,
		nombre: "Teotihuacán",
		visitas: 1250,
		calificacion: 4.8,
		imagen:
			"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0eOqiCnR48ykeWdoQSvhnWdO6jTLEfmFnfQ&s",
		descripcion: "Zona arqueológica con pirámides del Sol y la Luna",
	},
	{
		id: 2,
		nombre: "Chapultepec",
		visitas: 2100,
		calificacion: 4.6,
		imagen:
			"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUB4eDXywgdKuPz6V6BEBIV2xp_9vjB-LYuQ&s",
		descripcion: "Parque urbano más grande de América",
	},
	{
		id: 3,
		nombre: "Centro Histórico",
		visitas: 1850,
		calificacion: 4.9,
		imagen:
			"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9_0FMj_pljb1LpjvUvlO6xymKT8itvIfwSg&s",
		descripcion: "Patrimonio de la Humanidad UNESCO",
	},
	{
		id: 4,
		nombre: "Xochimilco",
		visitas: 980,
		calificacion: 4.5,
		imagen:
			"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIikF5Tbzn3zKiv7E5TpGAW4BNmZK7HK7YtA&s",
		descripcion: "Canales tradicionales y trajineras",
	},
];

// Componente principal
export default function DashboardAdmin() {
	const [añoSeleccionado, setAñoSeleccionado] = useState("2025");
	const [destinoSeleccionado, setDestinoSeleccionado] =
		useState<null | (typeof destinosPopulares)[number]>(null);
	const [modalAbierto, setModalAbierto] = useState(false);

	function abrirModal(destino: (typeof destinosPopulares)[number]) {
		setDestinoSeleccionado(destino);
		setModalAbierto(true);
	}
	function cerrarModal() {
		setModalAbierto(false);
		setDestinoSeleccionado(null);
	}

	const datosGrafica =
		añoSeleccionado === "2024" ? usuariosPorMes2024 : usuariosPorMes2025;

	// Calcular estadísticas
	const totalUsuarios = datosGrafica.reduce(
		(acc, mes) => acc + mes.usuarios,
		0
	);
	const promedioUsuarios = Math.round(totalUsuarios / datosGrafica.length);
	const crecimiento =
		datosGrafica.length > 1
			? Math.round(
					((
						datosGrafica[datosGrafica.length - 1].usuarios -
						datosGrafica[0].usuarios
					) / datosGrafica[0].usuarios) *
						100
			  )
			: 0;

	return (
		<div className="container mx-auto py-6 px-4 space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-2">
				<h1 className="text-3xl font-bold">Dashboard Administrador</h1>
				<p className="text-muted-foreground">
					Bienvenido al panel de administración
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
						<div className="text-2xl font-bold">{totalUsuarios}</div>
						<p className="text-xs text-muted-foreground">
							En {añoSeleccionado}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Promedio Mensual
						</CardTitle>
						<IconTrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{promedioUsuarios}</div>
						<p className="text-xs text-muted-foreground">
							Usuarios/mes
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Crecimiento</CardTitle>
						<IconTrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">+{crecimiento}%</div>
						<p className="text-xs text-muted-foreground">Este año</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Destinos Activos
						</CardTitle>
						<IconMapPin className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{destinosPopulares.length}
						</div>
						<p className="text-xs text-muted-foreground">
							Lugares registrados
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Gráfica de nuevos usuarios */}
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

			{/* Tabla de nuevos usuarios */}
			<Card>
				<CardHeader>
					<CardTitle>Usuarios Recientes</CardTitle>
					<CardDescription>
						Últimos usuarios registrados en la plataforma
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Usuario</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Fecha Registro</TableHead>
								<TableHead>Estado</TableHead>
								<TableHead className="text-right">
									Itinerarios
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{nuevosUsuarios.map((usuario) => (
								<TableRow key={usuario.id}>
									<TableCell className="font-medium">
										<div className="flex items-center gap-3">
											<img
												src={usuario.avatar}
												alt={usuario.nombre}
												className="h-8 w-8 rounded-full object-cover"
											/>
											<span>{usuario.nombre}</span>
										</div>
									</TableCell>
									<TableCell>{usuario.email}</TableCell>
									<TableCell>{usuario.fechaRegistro}</TableCell>
									<TableCell>
										<Badge
											variant={
												usuario.estado === "Activo"
													? "default"
													: "secondary"
											}
										>
											{usuario.estado}
										</Badge>
									</TableCell>
									<TableCell className="text-right">
										{usuario.itinerarios}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* Tarjetas de destinos populares con imágenes */}
			<div>
				<h2 className="text-2xl font-bold mb-4">Destinos Populares</h2>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{destinosPopulares.map((destino) => (
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

							{/* Datos adicionales simulados: ubicación y categoría */}
							<div className="grid grid-cols-2 gap-3 text-sm">
								<div className="rounded-lg border p-3">
									<p className="text-xs text-muted-foreground">
										Ubicación
									</p>
									<p className="font-medium">México</p>
								</div>
								<div className="rounded-lg border p-3">
									<p className="text-xs text-muted-foreground">
										Categoría
									</p>
									<p className="font-medium">Destino Turístico</p>
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
