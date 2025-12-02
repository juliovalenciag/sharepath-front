// src/lib/utils/category-utils.ts
import {
  FerrisWheel,
  MapPin,
  Ticket,
  Palmtree,
  Tent,
  Utensils,
  Coffee,
  Beer,
  Landmark,
  Camera,
  Music,
  Film,
  Palette,
  Dumbbell,
  Sparkles,
  Book,
  Fish,
  User,
} from "lucide-react";

type CategoryDetail = {
  name: string;
  defaultImage: string;
  icon: any; // Icono Lucide
  color: string; // Clase Tailwind texto
  bg: string; // Clase Tailwind fondo
};

const DEFAULT_STYLE: CategoryDetail = {
  name: "Lugar de interés",
  defaultImage: "/img/categories/default.jpg",
  icon: MapPin,
  color: "text-slate-600",
  bg: "bg-slate-100",
};

// Mapeo completo combinando tus datos + estilos UI
const CATEGORY_MAP: Record<string, CategoryDetail> = {
  // --- Entretenimiento ---
  amusement_park: {
    name: "Parque de diversiones",
    defaultImage: "/img/categories/amusement_park.jpg",
    icon: FerrisWheel,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
  bowling_alley: {
    name: "Boliche",
    defaultImage: "/img/categories/bowling_alley.jpg",
    icon: Dumbbell,
    color: "text-indigo-600",
    bg: "bg-indigo-100", // Icono genérico deporte/juego
  },
  casino: {
    name: "Casino",
    defaultImage: "/img/categories/casino.jpg",
    icon: Ticket,
    color: "text-amber-600",
    bg: "bg-amber-100",
  },
  movie_theater: {
    name: "Cine",
    defaultImage: "/img/categories/movie_theater.jpg",
    icon: Film,
    color: "text-red-600",
    bg: "bg-red-100",
  },
  night_club: {
    name: "Antro/Club",
    defaultImage: "/img/categories/night_club.jpg",
    icon: Music,
    color: "text-violet-600",
    bg: "bg-violet-100",
  },
  stadium: {
    name: "Estadio",
    defaultImage: "/img/categories/stadium.jpg",
    icon: Ticket,
    color: "text-blue-700",
    bg: "bg-blue-100",
  },

  // --- Naturaleza ---
  aquarium: {
    name: "Acuario",
    defaultImage: "/img/categories/aquarium.jpg",
    icon: Fish,
    color: "text-cyan-600",
    bg: "bg-cyan-100",
  },
  campground: {
    name: "Zona de camping",
    defaultImage: "/img/categories/campground.jpg",
    icon: Tent,
    color: "text-green-700",
    bg: "bg-green-100",
  },
  park: {
    name: "Parque",
    defaultImage: "/img/categories/park.jpg",
    icon: Palmtree,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
  },
  zoo: {
    name: "Zoológico",
    defaultImage: "/img/categories/zoo.jpg",
    icon: MapPin,
    color: "text-green-600",
    bg: "bg-green-50",
  },

  // --- Cultura y Educación ---
  art_gallery: {
    name: "Galería de Arte",
    defaultImage: "/img/categories/art_gallery.jpg",
    icon: Palette,
    color: "text-pink-600",
    bg: "bg-pink-100",
  },
  library: {
    name: "Biblioteca",
    defaultImage: "/img/categories/library.jpg",
    icon: Book,
    color: "text-orange-700",
    bg: "bg-orange-100",
  },
  museum: {
    name: "Museo",
    defaultImage: "/img/categories/museum.jpg",
    icon: Landmark,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  tourist_attraction: {
    name: "Atracción Turística",
    defaultImage: "/img/categories/tourist_attraction.jpg",
    icon: Camera,
    color: "text-sky-600",
    bg: "bg-sky-100",
  },

  // --- Gastronomía ---
  bar: {
    name: "Bar",
    defaultImage: "/img/categories/bar.jpg",
    icon: Beer,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
  },
  cafe: {
    name: "Cafetería",
    defaultImage: "/img/categories/cafe.jpg",
    icon: Coffee,
    color: "text-amber-700",
    bg: "bg-amber-100",
  },
  restaurant: {
    name: "Restaurante",
    defaultImage: "/img/categories/restaurant.jpg",
    icon: Utensils,
    color: "text-orange-600",
    bg: "bg-orange-100",
  },

  // --- Bienestar ---
  beauty_salon: {
    name: "Salón de Belleza",
    defaultImage: "/img/categories/beauty_salon.jpg",
    icon: Sparkles,
    color: "text-rose-500",
    bg: "bg-rose-100",
  },
  spa: {
    name: "Spa",
    defaultImage: "/img/categories/spa.jpg",
    icon: User,
    color: "text-teal-600",
    bg: "bg-teal-100",
  },
};

/**
 * Obtiene todos los detalles de estilo y datos para una categoría.
 * Normaliza la entrada a minúsculas para evitar errores.
 */
export function getCategoryStyle(categoryKey?: string): CategoryDetail {
  if (!categoryKey) return DEFAULT_STYLE;
  const key = categoryKey.toLowerCase().trim();
  return CATEGORY_MAP[key] || { ...DEFAULT_STYLE, name: categoryKey }; // Fallback con nombre original si no existe
}

export function getCategoryName(categoryKey: string | undefined): string {
  return getCategoryStyle(categoryKey).name;
}

export function getDefaultImageForCategory(
  categoryKey: string | undefined
): string {
  return getCategoryStyle(categoryKey).defaultImage;
}
