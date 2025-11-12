"use client";

import React, { useState } from "react";
import { Map, Zap } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import MuseumIcon from "@/components/icons/MuseumIcon";
import TreeIcon from "@/components/icons/TreeIcon";
import BrushIcon from "@/components/icons/BrushIcon";
import { title } from "process";
import { description } from "@/components/dashboard-components/chart-area-interactive";
import { id } from "date-fns/locale";
import dynamic from "next/dynamic";

// Carga dinámica en cliente para evitar SSR
const ItineraryMap = dynamic(() => import("@/components/viajero/view/ItineraryMap"), { ssr: false });


const contentCards = {
	1: [
		{
			id: 1,
			title: "Palacio de Bellas Artes",
			description: "Av. Juarez S/N, Centro Histórico, Ciudad de México, CDMX",
			imageUrl: "https://www.gob.mx/cms/uploads/press/main_image/265770/post_Bellas_Artes.jpeg",
		},
		{
			id: 2,
			title: "Bosque de Chapultepec",
			description: " Miguel Hidalgo, Ciudad de México, CDMX",
			imageUrl: "https://cdn1.matadornetwork.com/blogs/2/2019/08/Bosque-de-Chapultepec.jpg",
		},
	],
	2: [
		{
			id: 3,
			title: "Museo Soumaya",
			description: "Blvd. Miguel de Cervantes Saavedra, Granada, Miguel Hidalgo, 11529 Ciudad de México, CDMX",
			imageUrl: "https://images.adsttc.com/media/images/5295/42d3/e8e4/4ead/2a00/0016/newsletter/014_Soumaya_Image_by_Rafael_Gamo_05.jpg?1385513634",
		},
	],
	3: [
		{
			id: 4,
			title: "Angel de la independencia",
			description: "Av. P.º de la Reforma 342-Piso 27, Juárez, Cuauhtémoc, 06600 Ciudad de México, CDMX",
			imageUrl: "https://i0.wp.com/historico.alcaldiacuauhtemoc.mx/wp-content/uploads/2020/01/cuauchtemocAngel-de-la-Independencia-destacada.jpg?fit=528%2C453&ssl=1",
		}
	],
	4:[
		{
			id: 5,
			title: "Torre latinoamericana",
			description: "Eje Central Lázaro Cárdenas 2-piso 44, Col. Centro, Centro, Cuauhtémoc, 06000 Ciudad de México, CDMX",
			imageUrl: "https://mexicocity.cdmx.gob.mx/wp-content/uploads/2023/11/Torre-Latinoamericana.jpg",
		}
	],
	5: [
		{
			id: 6,
			title: "Museo Nacional de Antropología",
			description: "Av. P.º de la Reforma s/n, Polanco, Bosque de Chapultepec I Secc, Miguel Hidalgo, 11560 Ciudad de México, CDMX",
			imageUrl: "https://mna.inah.gob.mx/images/huellas/Paraguas-1200x800.jpg",
		}
	],

};

function TripStats() {
	const stats = [
		{ label: "Días", value: "5", hint: "31 oct – 4 nov" },
		{ label: "Lugares", value: "10", hint: "Museos, parques, arte" },
	];
	

	return (
		<Card className="h-full bg-gradient-to-br from-[oklch(0.97_0.02_240)] to-[oklch(0.94_0.04_230)] dark:from-[oklch(0.26_0.02_240)] dark:to-[oklch(0.22_0.04_230)]">
			<CardHeader>
				<CardTitle>Resumen del viaje</CardTitle>
			</CardHeader>
			<CardContent>
				<ul className="grid grid-cols-2 gap-3">
					{stats.map((s) => (
						<li
							key={s.label}
							className="rounded-xl ring-1 ring-border bg-card/70 p-3 text-center"
						>
							<p className="text-xs text-muted-foreground">{s.label}</p>
							<p className="text-xl font-semibold tracking-tight">
								{s.value}
							</p>
							<p className="text-[11px] text-muted-foreground">
								{s.hint}
							</p>
						</li>
					))}
				</ul>

				<div className="mt-3 flex flex-wrap gap-2">
					{["Cultura", "Parques", "Gastronomía", "Historia"].map((t) => (
						<span
							key={t}
							className="px-2.5 py-1 text-xs rounded-full ring-1 ring-border bg-[oklch(0.98_0_0)] dark:bg-[oklch(0.28_0_0)]"
						>
							{t}
						</span>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

// --- Componente Principal de la Aplicación ---

export default function ItineraryReadView() {
	const [selecDay, setSelecDay] = useState(1);

	// Mapeo simple de los items mock a objetos con lat/lng para el mapa.
	// Coordenadas aproximadas en Ciudad de México para demostrar la ruta.
	const placesForMap = contentCards[selecDay].map((it) => {
		// valores por defecto si no existe lat/lng
		const lookup: Record<number, { lat: number; lng: number }> = {
			1: { lat: 19.435, lng: -99.1416 }, // Palacio de Bellas Artes
			2: { lat: 19.4204, lng: -99.1819 }, // Bosque de Chapultepec
			3: { lat: 19.4347, lng: -99.2037 }, // Museo Soumaya (Polanco)
			4: { lat: 19.4270, lng: -99.1677 }, // Ángel de la Independencia
			5: { lat: 19.4333, lng: -99.1415 }, // Torre Latinoamericana
			6: { lat: 19.4260, lng: -99.1860 }, // Museo Nacional de Antropología
		};
		const coord = lookup[it.id as number];
		return {
			id: String(it.id),
			name: it.title,
			city: it.description,
			lat: coord?.lat ?? 19.4326,
			lng: coord?.lng ?? -99.1332,
		};
	});
	return (
		<div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
			<main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* COLUMNA IZQUIERDA: Título y Tarjetas de Contenido */}
				<div className="lg:col-span-1 space-y-6">
					{/* Título Principal de la Columna */}
					<h1 className="text-3xl font-extrabold text-gray-900 border-b-4 border-indigo-500 pb-2">
						Mi primer itinerario
					</h1>

					{/* Botones de días*/}
					<div className="flex gap-2 mt-3">
						{[1, 2, 3, 4, 5].map((n) => (
							<button
								key={n}
								type="button"
								onClick={() => setSelecDay(n)}
								className={`px-3 py-1 rounded-md border text-sm font-medium
									${selecDay === n
										? "bg-indigo-500 text-white"
										: "bg-white border-gray-200 hover:bg-indigo-50"}
								`}
							>
								Día {n}
							</button>
						))}
					</div>

					{/* Lista de Tarjetas */}
					{contentCards[selecDay].map((item) => (
						<Card key={item.id} className="p-0 overflow-hidden">
							<div className="flex flex-col md:flex-row-reverse items-stretch">
								<div className="md:w-2/5 flex-shrink-0">
									<img
										src={item.imageUrl}
										alt={`Imagen para ${item.title}`}
										className="w-full h-40 object-cover md:h-full"
										onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
											const target = e.target as HTMLImageElement;
											target.onerror = null;
											target.src = `https://placehold.co/400x200/3b82f6/ffffff?text=Error+de+Carga`;
										}}
									/>
								</div>
								<div className="p-4 space-y-2 flex-grow md:w-3/5">
									<h4 className="text-lg font-bold text-gray-800 flex items-center">
										{item.id === 1 && (
											<MuseumIcon className="w-5 h-5 mr-2 text-indigo-500" />
										)}
										{item.id === 2 && (
											<TreeIcon className="w-5 h-5 mr-2 text-green-500" />
										)}
										{item.id === 3 && (
											<BrushIcon className="w-5 h-5 mr-2 text-pink-500" />
										)}
										{item.title}
									</h4>
									<p className="text-sm text-gray-600">
										{item.description}
									</p>
								</div>
							</div>
						</Card>
					))}
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
						<TripStats />
					</div>
				</div>
			</main>
		</div>
	);
}