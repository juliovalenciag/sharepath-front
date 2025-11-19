"use client";
import { useEffect, useState } from "react";
import { Map } from "lucide-react";
import dynamic from "next/dynamic";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useParams } from "next/navigation";


// Carga dinámica en cliente para evitar SSR
const ItineraryMap = dynamic(() => import("@/components/viajero/view/ItineraryMap"), { ssr: false });


function TripStats({ diasTotales, totalLugares, fechaInicio, fechaFin, categorias}) {
	
	return (
		<Card className="h-full bg-gradient-to-br from-[oklch(0.97_0.02_240)] to-[oklch(0.94_0.04_230)] dark:from-[oklch(0.26_0.02_240)] dark:to-[oklch(0.22_0.04_230)]">
			<CardHeader>
				<CardTitle>Resumen del viaje</CardTitle>
			</CardHeader>
			<CardContent>
				<ul className="grid grid-cols-2 gap-3">
					<li className="rounded-xl ring-1 ring-border bg-card/70 p-3 text-center">
						<p className="text-xs text-muted-foreground">Días</p>
						<p className="text-xl font-semibold tracking-tight">{diasTotales}</p>
						<p className="text-[11px] text-muted-foreground">{fechaInicio} - {fechaFin}</p>
					</li>

					<li className="rounded-xl ring-1 ring-border bg-card/70 p-3 text-center">
						<p className="text-xs text-muted-foreground">Lugares</p>
						<p className="text-xl font-semibold tracking-tight">{totalLugares}</p>
					</li>
				</ul>
 
				<div className="mt-3 flex flex-wrap gap-2">
					{categorias.map((t) => (
						<span key={t} className="px-2.5 py-1 text-xs rounded-full ring-1 ring-border bg-[oklch(0.98_0_0)] dark:bg-[oklch(0.28_0_0)]">{t}</span>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

// --- Componente Principal de la Aplicación ---

export default function ItineraryReadView({id}: {id: string}) {
	

	const [itinerario, setItinerario] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [dia, setDia] = useState(1);
	
	useEffect(()=> {
		async function fetchData() {
			console.log("ID recibido:", id);
			try{
				const res = await fetch(`https://harol-lovers.up.railway.app/itinerario/${id}`, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
            			token: localStorage.getItem('authToken') || "",
					}
				});

				const data = await res.json();
				console.log("Itinerario detallado:", data);
				console.log("Actividades:", data.actividades);

				const actividadesOrdenadas = data.actividades.sort(
					(a: any, b: any) => 
						new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
				);

				const fechas = actividadesOrdenadas.map(a => new Date(a.fecha));
				const fechaInicio = new Date(Math.min(...fechas));
				const fechaFin = new Date(Math.max(...fechas));

				const categorias = [...new Set(actividadesOrdenadas.map(a => a.lugar.category))];

				const diasTotales = fechas.length > 0 ?
				Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1 : 0;

				const totalLugares = actividadesOrdenadas.length;

				// Agrupar actividades por fecha real
				const actividadesPorDia: Record<string, any[]> = {};

				actividadesOrdenadas.forEach((act: any) => {
				const fecha = new Date(act.fecha).toISOString().split("T")[0]; // YYYY-MM-DD

				if (!actividadesPorDia[fecha]) {
					actividadesPorDia[fecha] = [];
				}

				actividadesPorDia[fecha].push({
					id: act.id,
					titulo: act.lugar.nombre,
					descripcion: act.description,
					imageUrl: act.lugar.foto_url,
					categoria: act.lugar.category,
					estado: act.lugar.mexican_state,
					lat: act.lugar.latitud,
					lng: act.lugar.longitud,
				});
				});

				// Convertir el objeto en una lista de “días”
				const dias = Object.keys(actividadesPorDia)
				.sort()
				.map((fecha, index) => ({
					dia: index + 1,
					fecha,
					lugares: actividadesPorDia[fecha],
				}));


				setItinerario({
					id: data.id,
					titulo: data.title,
					dias,
					resumen: {
						diasTotales,
						totalLugares,
						fechaInicio: fechaInicio.toLocaleDateString('es-MX'),
						fechaFin: fechaFin.toLocaleDateString('es-MX'),
						categorias,
					}
				});
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		}
		fetchData();
	}, [id]);

	if (loading) return <p className="p-4 text-xl">Cargando...-</p>;
	if (!itinerario) return <p>Intinerarios no encontrado</p>;

	const diaSeleccionado = itinerario.dias.find((d: any) => d.dia === dia);
	const lugaresDelDia = diaSeleccionado ? diaSeleccionado.lugares : [];

	
	const placesForMap = lugaresDelDia.map((lugar: any) => ({
		id: String(lugar.id),
		name: lugar.titulo,
		city: lugar.descripcion,
		tag: lugar.categoria || "lugar",
		img: lugar.imageUrl,
		lat: lugar.lat,
		lng: lugar.lng,
	}));

	return (
		<div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
			<main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* COLUMNA IZQUIERDA: Título y Tarjetas de Contenido */}
				<div className="lg:col-span-1 space-y-6">
					{/* Título Principal de la Columna */}
					<h1 className="text-3xl font-extrabold text-gray-900 border-b-4 border-indigo-500 pb-2">
						{itinerario.titulo}
					</h1>

					{/* Botones de días*/}
					<div className="flex gap-2 mt-3">
						{itinerario.dias.map((d: any) => (
							<button
							key={d.dia}
							onClick={() => setDia(d.dia)}
							className={`px-3 py-1 rounded-md border ${
								dia === d.dia
								? "bg-indigo-500 text-white"
								: "bg-white hover:bg-indigo-100"
                			}`}
							>Día {d.dia}</button>
						))}
					</div>



					{/* Lista de Tarjetas */}
					{lugaresDelDia.map((lugar: any) => {
						//Esta es la imagen generica por si el back no tiene imagen del lugar

						const imagenFinal =
							lugar.imageUrl && lugar.imageUrl !== "null" && lugar.imageUrl !== null
								? lugar.imageUrl
								: "/img/museo_antropologia.jpg";

						return (
							<Card key={lugar.id} className="overflow-hidden shadow">
								<img
									src={imagenFinal}
									className="w-full h-48 object-cover rounded-t-lg"
									alt={lugar.titulo}
								/>
								<div className="p-4 space-y-1">
									<h4 className="text-lg font-bold flex items-center justify-between">
										{lugar.titulo}
										<span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-primary rounded-full">
											{lugar.categoria}
										</span>
									</h4>
									<p className="text-sm text-gray-700">{lugar.descripcion}</p>
									<p className="text-xs text-gray-500 italic">{lugar.estado}</p>
								</div>
							</Card>
						);
					})}
				</div>

				{/* COLUMNA DERECHA: Mapa y Tarjeta de Información */}
				<div className="lg:col-span-2 space-y-6">
					<div className="grid grid-cols-1 gap-6 h-full">
						{/* 1. Área del Mapa (real) */}
						<div className="flex flex-col h-[350px] md:h-[450px] bg-gray-100 border-4 border-gray-300 rounded-xl overflow-hidden shadow-2xl">
							<div className="p-4 bg-gray-800 text-white font-semibold flex items-center">
								<Map className="w-5 h-5 mr-2" />
								Vista de Mapa
							</div>
							<div className="flex-grow">
								<ItineraryMap places={placesForMap} />
							</div>
						</div>
						<TripStats 
						diasTotales={itinerario.resumen.diasTotales}
						totalLugares={itinerario.resumen.totalLugares}
						fechaInicio={itinerario.resumen.fechaInicio}
						fechaFin={itinerario.resumen.fechaFin}
						categorias={itinerario.resumen.categorias}
						/>
					</div>
				</div>
			</main>
		</div>
	);
}
