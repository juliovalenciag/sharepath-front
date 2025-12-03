// utils/itinerario-helpers.ts
import { ItinerarioData } from "@/api/interfaces/ApiRoutes";
import { format, differenceInDays, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export const transformarItinerario = (itinerarioApi: ItinerarioData) => {
  const rawActivities = itinerarioApi.actividades || [];
  
  // 1. Ordenar actividades cronológicamente
  const sortedActivities = [...rawActivities].sort((a: any, b: any) => {
    return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
  });

  // 2. Calcular Fechas Reales (Inicio y Fin basados en actividades)
  let startDate = new Date();
  let endDate = new Date();
  let hasDates = false;

  if (sortedActivities.length > 0) {
    startDate = new Date(sortedActivities[0].fecha);
    endDate = new Date(sortedActivities[sortedActivities.length - 1].fecha);
    hasDates = true;
  } 
  // Fallback si viene fecha en el root del objeto (depende de tu backend)
  else if ((itinerarioApi as any).createdAt) {
      startDate = new Date((itinerarioApi as any).createdAt);
      endDate = startDate;
  }

  // 3. Obtener imágenes para el collage (Tomamos las primeras 3 que existan)
  const images = sortedActivities
    .map((act: any) => act.lugar?.foto_url)
    .filter(Boolean)
    .slice(0, 3);

  // 4. Calcular estadísticas
  const totalDays = hasDates ? differenceInDays(endDate, startDate) + 1 : 0;
  const totalPlaces = sortedActivities.length;

  return {
    id: (itinerarioApi as any)._id || itinerarioApi.id,
    titulo: itinerarioApi.title || "Viaje sin nombre",
    startDate,
    endDate,
    formattedDate: hasDates 
      ? `${format(startDate, "d MMM", { locale: es })} - ${format(endDate, "d MMM yyyy", { locale: es })}`
      : "Fecha por definir",
    totalDays,
    totalPlaces,
    images, // Array de strings
    // Pasamos los días procesados para el carrusel
    dias: processDaysForCarousel(sortedActivities, startDate), 
  };
};

function processDaysForCarousel(activities: any[], startDate: Date) {
    // Tu lógica existente de procesamiento de días, pero limpia
    return activities.map((act: any, index: number) => {
        // ... (Tu lógica actual de mapeo de días)
        const actDate = new Date(act.fecha);
        const diffTime = actDate.getTime() - startDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        // Nota: Ajusta Math.ceil/round según tu necesidad exacta de zona horaria
        
        return {
            id: act._id || index,
            dia: `Día ${diffDays + 1}`, // Simplificación
            titulo: act.lugar?.nombre || act.description,
            categoria: act.lugar?.category,
            urlImagen: act.lugar?.foto_url,
            calificacion: act.lugar?.google_score
        };
    });
}