"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Toaster, toast } from "sonner";
import { ItinerariosAPI } from "@/api/ItinerariosAPI";
import { LugarData } from "@/api/interfaces/ApiRoutes";
import { getCategoryName, getDefaultImageForCategory } from "@/lib/category-utils";

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

// Categorías de la API (keys del CATEGORY_MAP)
const CATEGORIAS = [
	"amusement_park",
	"bowling_alley",
	"casino",
	"movie_theater",
	"night_club",
	"stadium",
	"aquarium",
	"campground",
	"park",
	"zoo",
	"art_gallery",
	"library",
	"museum",
	"tourist_attraction",
	"bar",
	"cafe",
	"restaurant",
	"beauty_salon",
	"spa",
];

// Estados disponibles en la API
const ESTADOS_MEXICO = [
	"Ciudad de Mexico",
	"Estado de Mexico",
	"Querétaro",
	"Hidalgo",
	"Morelos"
];

export default function LugaresPage() {
	const [allPlaces, setAllPlaces] = useState<LugarData[]>([]); 
	const [places, setPlaces] = useState<LugarData[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("");
	const [selectedState, setSelectedState] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [deleting, setDeleting] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const [placeToDelete, setPlaceToDelete] = useState<LugarData | null>(null);
	const ITEMS_PER_PAGE = 12;

	// Form state
	const [formData, setFormData] = useState({
		id_api_place: "",
		nombre: "",
		descripcion: "",
		category: "",
		mexican_state: "",
		foto_url: "",
		google_maps_url: "",
		latitud: 0,
		longitud: 0,
		google_score: 0,
		total_reviews: 0,
	});

	const api = useMemo(() => ItinerariosAPI.getInstance(), []);

	const extractCoordinatesFromGoogleMaps = (url: string): { lat: number; lng: number } | null => {
		try {
			const pattern1 = /@([-\d.]+),([-\d.]+),/;
			const match1 = url.match(pattern1);
			if (match1) {
				return { lat: parseFloat(match1[1]), lng: parseFloat(match1[2]) };
			}

			const pattern2 = /[?&]q=([-\d.]+),([-\d.]+)/;
			const match2 = url.match(pattern2);
			if (match2) {
				return { lat: parseFloat(match2[1]), lng: parseFloat(match2[2]) };
			}

			const pattern3 = /place\/(.*?)\/([-\d.]+),([-\d.]+)/;
			const match3 = url.match(pattern3);
			if (match3) {
				return { lat: parseFloat(match3[2]), lng: parseFloat(match3[3]) };
			}

			return null;
		} catch (error) {
			return null;
		}
	};

	const handleGoogleMapsLink = (e: React.ChangeEvent<HTMLInputElement>) => {
		const url = e.target.value;
		setFormData({ ...formData, google_maps_url: url });

		const coords = extractCoordinatesFromGoogleMaps(url);
		if (coords) {
			setFormData((prev) => ({
				...prev,
				latitud: coords.lat,
				longitud: coords.lng,
			}));
		}
	};

	const loadAllPlaces = async () => {
		setLoading(true);
		try {
			const response = await api.getLugares(
				1, 
				10000, 
				selectedState || undefined, 
				selectedCategory || undefined, 
				searchTerm || undefined
			);
			
			const lugaresArray = Array.isArray(response) ? response : (response.lugares || []);
			console.log(`Total de lugares cargados: ${lugaresArray.length}`);
			setAllPlaces(lugaresArray);
			
			paginateClientSide(lugaresArray, 1);
		} catch (error: any) {
			console.error("Error al cargar lugares:", error);
			setAllPlaces([]);
			setPlaces([]);
		} finally {
			setLoading(false);
		}
	};

	const paginateClientSide = (data: LugarData[], page: number) => {
		const startIndex = (page - 1) * ITEMS_PER_PAGE;
		const endIndex = startIndex + ITEMS_PER_PAGE;
		const paginatedData = data.slice(startIndex, endIndex);
		setPlaces(paginatedData);
		setCurrentPage(page);
	};

	useEffect(() => {
		loadAllPlaces();
	}, [searchTerm, selectedCategory, selectedState]);

	const handlePageChange = (newPage: number) => {
		paginateClientSide(allPlaces, newPage);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const totalPages = Math.ceil(allPlaces.length / ITEMS_PER_PAGE);

	const handleDeleteClick = (place: LugarData) => {
		setPlaceToDelete(place);
		setDeleteConfirmOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!placeToDelete) return;
		
		const id = placeToDelete.id_api_place;
		console.log("Intentando eliminar lugar con ID:", id);
		setDeleting(id);
		setDeleteConfirmOpen(false);
		
		try {
			const response = await api.deleteLugar(id);
			console.log("Respuesta del servidor al eliminar:", response);
			
			const updatedPlaces = allPlaces.filter((p) => p.id_api_place !== id);
			setAllPlaces(updatedPlaces);
			paginateClientSide(updatedPlaces, currentPage);
			
			toast.success(`Lugar eliminado exitosamente: ${placeToDelete.nombre}`);
		} catch (error: any) {
			console.error("Error al eliminar lugar:", error);
			console.error("Detalles del error:", error.message);
			toast.error(`Error al eliminar el lugar: ${error.message || 'Error desconocido'}`);
		} finally {
			setDeleting(null);
			setPlaceToDelete(null);
		}
	};

	const handleDeleteCancel = () => {
		setDeleteConfirmOpen(false);
		setPlaceToDelete(null);
	};

	const handleCreatePlace = async (e: React.FormEvent) => {
		e.preventDefault();
		
		// Generar ID aleatorio si no está presente
		const generatedId = formData.id_api_place || `lugar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		
		if (!formData.nombre.trim() || !formData.descripcion.trim() || !formData.category || !formData.mexican_state || !formData.foto_url.trim()) {
			toast.error('Por favor completa todos los campos requeridos');
			return;
		}

		if (!formData.google_maps_url.trim()) {
			toast.error('Por favor ingresa un URL de Google Maps válido');
			return;
		}

		if (formData.latitud === 0 || formData.longitud === 0) {
			toast.error('Las coordenadas no se pudieron extraer. Verifica que el URL de Google Maps sea válido');
			return;
		}
		
		try {
			const newPlace = await api.createLugar({
				...formData,
				id_api_place: generatedId
			});
			setAllPlaces((prev) => [newPlace, ...prev]);
			paginateClientSide([newPlace, ...allPlaces], 1);
			setIsModalOpen(false);
			setFormData({
				id_api_place: "",
				nombre: "",
				descripcion: "",
				category: "",
				mexican_state: "",
				foto_url: "",
				google_maps_url: "",
				latitud: 0,
				longitud: 0,
				google_score: 0,
				total_reviews: 0,
			});
			toast.success(`Lugar "${newPlace.nombre}" creado exitosamente`);
		} catch (error) {
			console.error("Error al crear lugar:", error);
			toast.error("Error al crear el lugar");
		}
	};

	const averageRating = useMemo(() => {
		if (!places || places.length === 0) return 0;
		const sum = places.reduce((acc, p) => acc + p.google_score, 0);
		return Number((sum / places.length).toFixed(1));
	}, [places]);

	return (
		<>
			<Toaster position="top-right" richColors />
			<div className="p-6">
				<h1 className="text-2xl font-semibold mb-2">Gestionar Lugares</h1>
			<p className="text-sm text-gray-600 mb-6">
				Total de lugares: <span className="font-medium">{allPlaces.length}</span> • 
				Promedio de estrellas: <span className="font-medium">{averageRating}</span> / 5 •
				Página <span className="font-medium">{currentPage}</span> de <span className="font-medium">{totalPages || 1}</span>
			</p>

			<div className="mb-6 space-y-4">
				<div className="flex gap-3 flex-wrap">
					<input
						type="text"
						placeholder="Buscar por nombre..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="flex-1 min-w-[200px] px-4 py-2 border rounded-md"
					/>
					<select
						value={selectedCategory}
						onChange={(e) => setSelectedCategory(e.target.value)}
						className="px-4 py-2 border rounded-md"
					>
						<option value="">Todas las categorías</option>
						{CATEGORIAS.map((cat) => (
							<option key={cat} value={cat}>{getCategoryName(cat)}</option>
						))}
					</select>
					<select
						value={selectedState}
						onChange={(e) => setSelectedState(e.target.value)}
						className="px-4 py-2 border rounded-md"
					>
						<option value="">Todos los estados</option>
						{ESTADOS_MEXICO.map((estado) => (
							<option key={estado} value={estado}>{estado}</option>
						))}
					</select>
					<button
						type="button"
						onClick={() => setIsModalOpen(true)}
						className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
					>
						+ Añadir Lugar
					</button>
				</div>
			</div>

			{loading && <p className="text-center py-8">Cargando lugares...</p>}

			{!loading && places.length === 0 && (
				<p className="text-center py-8 text-gray-500">No se encontraron lugares. Intenta con otros filtros o añade uno nuevo.</p>
			)}

		<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
			{places.map((place, index) => (
				<div key={`${place.id_api_place}-${currentPage}-${index}`} className="rounded-lg border bg-white/5 shadow-sm overflow-hidden flex flex-col h-full">
					<div className="relative w-full h-44">
						<Image
							src={place.foto_url || getDefaultImageForCategory(place.category)}
							alt={place.nombre}
							fill
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
							className="object-cover"
						/>
					</div>

					<div className="p-4 flex flex-col gap-3 grow">
						<div className="flex items-start justify-between gap-3">
							<div>
								<h2 className="text-lg font-medium">{place.nombre}</h2>
								<p className="text-sm text-gray-600">{place.descripcion}</p>
								<p className="text-xs text-gray-500 mt-1">{getCategoryName(place.category)} • {place.mexican_state}</p>
							</div>
							<StarRating rating={place.google_score} />
						</div>

						<div key={`map-${place.id_api_place}-${currentPage}`} className="h-[180px] rounded-md overflow-hidden">
							<MiniMap lat={place.latitud} lng={place.longitud} title={place.nombre} />
						</div>

						<div className="flex justify-end mt-auto pt-3 border-t border-gray-200/20">
							<button
								type="button"
								onClick={() => handleDeleteClick(place)}
								disabled={deleting === place.id_api_place}
								className="px-3 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
							>
								{deleting === place.id_api_place ? "Eliminando..." : "Eliminar lugar"}
							</button>
						</div>
					</div>
				</div>
			))}
		</div>			
			{!loading && totalPages > 1 && (
				<div className="flex justify-center items-center gap-2 mt-8">
					<button
						onClick={() => handlePageChange(currentPage - 1)}
						disabled={currentPage === 1}
						className="px-4 py-2 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						← Anterior
					</button>
					
					<div className="flex gap-1">
						{/* Primera página */}
						{currentPage > 3 && (
							<>
								<button
									onClick={() => handlePageChange(1)}
									className="px-3 py-2 border rounded-md hover:bg-gray-100"
								>
									1
								</button>
								{currentPage > 4 && <span className="px-2 py-2">...</span>}
							</>
						)}
						
						{(() => {
							const pagesToShow = [];
							const start = Math.max(1, currentPage - 2);
							const end = Math.min(totalPages, currentPage + 2);
							
							for (let i = start; i <= end; i++) {
								if (i === 1 && currentPage > 3) continue;
								if (i === totalPages && currentPage < totalPages - 2) continue;
								
								pagesToShow.push(
									<button
										key={i}
										onClick={() => handlePageChange(i)}
										className={`px-3 py-2 border rounded-md ${
											currentPage === i
												? 'bg-blue-600 text-white'
												: 'hover:bg-gray-100'
										}`}
									>
										{i}
									</button>
								);
							}
							return pagesToShow;
						})()}
						
						{currentPage < totalPages - 2 && (
							<>
								{currentPage < totalPages - 3 && <span className="px-2 py-2">...</span>}
								<button
									onClick={() => handlePageChange(totalPages)}
									className="px-3 py-2 border rounded-md hover:bg-gray-100"
								>
									{totalPages}
								</button>
							</>
						)}
					</div>
					
					<button
						onClick={() => handlePageChange(currentPage + 1)}
						disabled={currentPage === totalPages}
						className="px-4 py-2 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Siguiente →
					</button>
				</div>
			)}

			{deleteConfirmOpen && placeToDelete && (
				<div 
					className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" 
					style={{ zIndex: 9999 }}
					onClick={handleDeleteCancel}
				>
					<div 
						className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex items-center gap-3 mb-4">
							<div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
								</svg>
							</div>
							<div>
								<h3 className="text-lg font-semibold text-gray-900">Eliminar Lugar</h3>
								<p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
							</div>
						</div>
						
						<div className="mb-6">
							<p className="text-gray-700 mb-2">¿Estás seguro de que deseas eliminar este lugar?</p>
							<div className="bg-gray-50 rounded-md p-3 border border-gray-200">
								<p className="font-medium text-gray-900">{placeToDelete.nombre}</p>
								<p className="text-sm text-gray-600">{placeToDelete.mexican_state} • {getCategoryName(placeToDelete.category)}</p>
							</div>
						</div>

						<div className="flex gap-3 justify-end">
							<button
								type="button"
								onClick={handleDeleteCancel}
								className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 font-medium text-gray-700"
							>
								Cancelar
							</button>
							<button
								type="button"
								onClick={handleDeleteConfirm}
								className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
							>
								Eliminar
							</button>
						</div>
					</div>
				</div>
			)}

			{isModalOpen && (
				<div 
					className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" 
					style={{ zIndex: 9999 }}
					onClick={() => setIsModalOpen(false)}
				>
					<div 
						className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
						onClick={(e) => e.stopPropagation()}
					>
						<h2 className="text-2xl font-semibold mb-4">Añadir Nuevo Lugar</h2>
						<form onSubmit={handleCreatePlace} className="space-y-4">
							<div>
								<label className="block text-sm font-medium mb-1">ID API Place <span className="text-gray-500">(Opcional - Se genera automáticamente)</span></label>
								<input
									type="text"
									value={formData.id_api_place}
									onChange={(e) => setFormData({ ...formData, id_api_place: e.target.value })}
									placeholder="Dejar vacío para generar automáticamente"
									className="w-full px-3 py-2 border rounded-md"
								/>
								{!formData.id_api_place && (
									<p className="text-xs text-blue-600 mt-1">
										Se generará un ID único automáticamente al crear el lugar
									</p>
								)}
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Nombre *</label>
								<input
									type="text"
									required
									value={formData.nombre}
									onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
									className="w-full px-3 py-2 border rounded-md"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Descripción *</label>
								<textarea
									required
									value={formData.descripcion}
									onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
									className="w-full px-3 py-2 border rounded-md"
									rows={3}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Categoría *</label>
								<select
									required
									value={formData.category}
									onChange={(e) => setFormData({ ...formData, category: e.target.value })}
									className="w-full px-3 py-2 border rounded-md"
								>
									<option value="">Seleccione una categoría</option>
									{CATEGORIAS.map((cat) => (
										<option key={cat} value={cat}>{getCategoryName(cat)}</option>
									))}
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Estado *</label>
								<select
									required
									value={formData.mexican_state}
									onChange={(e) => setFormData({ ...formData, mexican_state: e.target.value })}
									className="w-full px-3 py-2 border rounded-md"
								>
									<option value="">Seleccione un estado</option>
									{ESTADOS_MEXICO.map((estado) => (
										<option key={estado} value={estado}>{estado}</option>
									))}
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">URL de la Foto *</label>
								<input
									type="url"
									required
									value={formData.foto_url}
									onChange={(e) => setFormData({ ...formData, foto_url: e.target.value })}
									className="w-full px-3 py-2 border rounded-md"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">URL de Google Maps *</label>
								<input
									type="url"
									placeholder="https://maps.google.com/maps/place/..."
									required
									value={formData.google_maps_url}
									onChange={handleGoogleMapsLink}
									className="w-full px-3 py-2 border rounded-md"
								/>
								{formData.latitud !== 0 && formData.longitud !== 0 && (
									<p className="text-xs text-green-600 mt-1">
										✓ Coordenadas detectadas: {formData.latitud.toFixed(4)}, {formData.longitud.toFixed(4)}
									</p>
								)}
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium mb-1">Latitud (Auto)</label>
									<input
										type="number"
										step="any"
										value={formData.latitud}
										disabled
										className="w-full px-3 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium mb-1">Longitud (Auto)</label>
									<input
										type="number"
										step="any"
										value={formData.longitud}
										disabled
										className="w-full px-3 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
									/>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium mb-1">Calificación Google (0-5) *</label>
									<input
										type="number"
										step="0.1"
										min="0"
										max="5"
										required
										value={formData.google_score || ""}
										onChange={(e) => setFormData({ ...formData, google_score: e.target.value === "" ? 0 : parseFloat(e.target.value) })}
										className="w-full px-3 py-2 border rounded-md"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium mb-1">Total de Reseñas *</label>
									<input
										type="number"
										min="0"
										required
										value={formData.total_reviews || ""}
										onChange={(e) => setFormData({ ...formData, total_reviews: e.target.value === "" ? 0 : parseInt(e.target.value) })}
										className="w-full px-3 py-2 border rounded-md"
									/>
								</div>
							</div>
							<div className="flex gap-3 justify-end pt-4">
								<button
									type="button"
									onClick={() => setIsModalOpen(false)}
									className="px-4 py-2 border rounded-md hover:bg-gray-100"
								>
									Cancelar
								</button>
								<button
									type="submit"
									className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
								>
									Crear Lugar
								</button>
							</div>
					</form>
				</div>
			</div>
		)}
	</div>
</>
	);
}