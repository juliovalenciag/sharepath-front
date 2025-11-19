const categoryDetails: Record<string, { name: string; defaultImage: string }> =
  {
    // Entretenimiento
    amusement_park: {
      name: "Parque de diversiones",
      defaultImage: "/img/categories/amusement_park.jpg",
    },
    bowling_alley: {
      name: "Boliche",
      defaultImage: "/img/categories/bowling_alley.jpg",
    },
    casino: {
      name: "Casino",
      defaultImage: "/img/categories/casino.jpg",
    },
    movie_theater: {
      name: "Cine",
      defaultImage: "/img/categories/movie_theater.jpg",
    },
    night_club: {
      name: "Antro/Club",
      defaultImage: "/img/categories/night_club.jpg",
    },
    stadium: {
      name: "Estadio",
      defaultImage: "/img/categories/stadium.jpg",
    },

    // Naturaleza
    aquarium: { name: "Acuario", defaultImage: "/img/categories/aquarium.jpg" },
    campground: {
      name: "Zona de camping",
      defaultImage: "/img/categories/campground.jpg",
    },
    park: { name: "Parque", defaultImage: "/img/categories/park.jpg" },
    zoo: { name: "Zoológico", defaultImage: "/img/categories/zoo.jpg" },

    // Cultura y Educación
    art_gallery: {
      name: "Galería de Arte",
      defaultImage: "/img/categories/art_gallery.jpg",
    },
    library: {
      name: "Biblioteca",
      defaultImage: "/img/categories/library.jpg",
    },
    museum: { name: "Museo", defaultImage: "/img/categories/museum.jpg" },
    tourist_attraction: {
      name: "Atracción Turística",
      defaultImage: "/img/categories/tourit_attraction.jpg",
    },

    // Gastronomía
    bar: { name: "Bar", defaultImage: "/img/categories/bar.jpg" },
    cafe: { name: "Cafetería", defaultImage: "/img/categories/cafe.jpg" },
    restaurant: {
      name: "Restaurante",
      defaultImage: "/img/categories/restaurant.jpg",
    },

    // Bienestar
    beauty_salon: {
      name: "Salón de Belleza",
      defaultImage: "/img/categories/beauty_salon.jpg",
    },
    spa: { name: "Spa", defaultImage: "/img/categories/spa.jpg" },
  };

const fallback = {
  name: "General",
  defaultImage: "/img/categories/default.jpg",
};

/**
 * Obtiene el nombre legible de una categoría.
 * @param categoryKey - El identificador de la categoría (ej. "art_gallery").
 * @returns El nombre formateado (ej. "Galería de Arte").
 */
export function getCategoryName(categoryKey: string | undefined): string {
  if (!categoryKey) return fallback.name;
  return categoryDetails[categoryKey]?.name || fallback.name;
}

/**
 * Obtiene la URL de la imagen por defecto para una categoría.
 * @param categoryKey - El identificador de la categoría (ej. "art_gallery").
 * @returns La ruta a la imagen de fallback.
 */
export function getDefaultImageForCategory(
  categoryKey: string | undefined
): string {
  if (!categoryKey) return fallback.defaultImage;
  return categoryDetails[categoryKey]?.defaultImage || fallback.defaultImage;
}
