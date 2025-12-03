"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";

type Place = {
	id: string;
	title: string;
	description: string;
	rating: number; // 0-5
	imageUrl: string;
	lat: number;
	lon: number;
};

// Dynamic import for MiniMap to avoid SSR issues
const MiniMap = dynamic(() => import("@/components/MiniMap"), { ssr: false });

const StarRating = ({ rating }: { rating: number }) => (
	<span className="flex items-center gap-1 text-yellow-500 font-semibold text-base" aria-label={`Calificación ${rating} de 5`}>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#fbbf24" className="w-5 h-5">
			<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.967 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.88 8.72c-.783-.57-.379-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
		</svg>
		{rating}
	</span>
);

const initialPlaces: Place[] = [
	{
		id: "1",
		title: "Museo Nacional de Antropología",
		description: "Un recorrido por la historia y arte del país.",
		rating: 4.7,
		imageUrl: "https://www.museosdemexico.com/_uploads/salas-museo-antropologia-mexico.jpg",
		lat: 19.426, // CDMX aprox
		lon: -99.167,
	},
	{
		id: "2",
		title: "Plaza de la Constitución",
		description: "Espacios verdes, lagos y actividades al aire libre.",
		rating: 4.4,
		imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/09/14/5d/ff/plaza-de-la-constitucion.jpg?w=700&h=-1&s=1",
		lat: 19.4326,
		lon: -99.1332,
	},
	{
		id: "3",
		title: "Zona Arqueológica de Teotihuacán",
		description: "Antiguas pirámides y estructuras impresionantes para explorar.",
		rating: 4.9,
		imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/2020-02-11_Teotihuacan_la_Avenida_de_los_Muertos_y_la_Pir%C3%A1mide_del_Sol.jpg/330px-2020-02-11_Teotihuacan_la_Avenida_de_los_Muertos_y_la_Pir%C3%A1mide_del_Sol.jpg",
		lat: 19.6925, // Teotihuacán aprox
		lon: -98.843,
	},
];

export default function LugaresPage() {
	const [places, setPlaces] = useState<Place[]>(initialPlaces);

	const averageRating = useMemo(() => {
		if (places.length === 0) return 0;
		const sum = places.reduce((acc, p) => acc + p.rating, 0);
		return Number((sum / places.length).toFixed(1));
	}, [places]);

	const handleDelete = (id: string) => {
		setPlaces((prev) => prev.filter((p) => p.id !== id));
	};

	return (
		<div className="p-6">
			<h1 className="text-2xl font-semibold mb-2">Gestionar Lugares</h1>
			<p className="text-sm text-gray-600 mb-6">
				Promedio de estrellas: <span className="font-medium">{averageRating}</span> / 5
			</p>

			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
				{places.map((place) => (
					<div key={place.id} className="rounded-lg border bg-white/5 shadow-sm overflow-hidden">
						<div className="relative w-full h-44">
							<Image
								src={place.imageUrl}
								alt={place.title}
								fill
								sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
								className="object-cover"
							/>
						</div>

						<div className="p-4 space-y-3">
							<div className="flex items-start justify-between gap-3">
								<div>
									<h2 className="text-lg font-medium">{place.title}</h2>
									<p className="text-sm text-gray-600">{place.description}</p>
								</div>
							<StarRating rating={place.rating} />
						</div>

						<div className="h-[180px] rounded-md overflow-hidden">
							<MiniMap lat={place.lat} lng={place.lon} title={place.title} />
						</div>

						<div className="flex justify-end">
							<button
									type="button"
									onClick={() => handleDelete(place.id)}
									className="px-3 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700"
								>
									Eliminar lugar
								</button>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

