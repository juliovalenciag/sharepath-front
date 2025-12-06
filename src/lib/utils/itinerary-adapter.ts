import { ItinerarioData } from "@/api/interfaces/ApiRoutes";
import { BuilderActivity, BuilderMeta } from "@/lib/itinerary-builder-store";

/**
 * Transforma la respuesta de la API (Base de Datos) al formato del Store de Zustand (Frontend UI)
 */
export function mapApiToBuilder(data: ItinerarioData): { meta: BuilderMeta; activities: BuilderActivity[] } {
  
  // 1. Procesar Actividades: Convertir fechas y asegurar números
  const activities: BuilderActivity[] = (data.actividades || []).map((act: any) => ({
    id: act._id || act.id || crypto.randomUUID(), // Asegurar ID único
    fecha: new Date(act.fecha), // String ISO -> Objeto Date
    descripcion: act.description || "",
    lugar: {
      id_api_place: act.lugar.id_api_place,
      nombre: act.lugar.nombre,
      latitud: Number(act.lugar.latitud),
      longitud: Number(act.lugar.longitud),
      category: act.lugar.category,
      mexican_state: act.lugar.mexican_state,
      foto_url: act.lugar.foto_url,
      google_score: act.lugar.google_score,
      total_reviews: act.lugar.total_reviews,
      descripcion: act.lugar.descripcion
    },
    start_time: act.start_time || null,
    end_time: act.end_time || null,
  }));

  // 2. Calcular Fechas del Meta (Si el backend no las devuelve explícitas, las inferimos de las actividades)
  let start = new Date();
  let end = new Date();

  // Intentamos usar las fechas guardadas en el itinerario, si no, calculamos min/max de actividades
  if (data.start_date && data.end_date) {
      start = new Date(data.start_date);
      end = new Date(data.end_date);
  } else if (activities.length > 0) {
    const sortedDates = activities.map(a => a.fecha.getTime()).sort((a, b) => a - b);
    start = new Date(sortedDates[0]);
    end = new Date(sortedDates[sortedDates.length - 1]);
  }

  // 3. Construir Meta
  const meta: BuilderMeta = {
    title: data.title,
    start,
    end,
    // @ts-ignore: Asumimos que regions viene del backend, si no, inferimos del primer lugar
    regions: data.regions || (activities.length > 0 ? [activities[0].lugar.mexican_state] : []), 
    companions: [], // Puedes agregar lógica si tu backend soporta compañeros
  };

  return { meta, activities };
}