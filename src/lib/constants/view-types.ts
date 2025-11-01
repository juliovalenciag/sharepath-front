export type LinkRef = { label: string; href: string };

export type Money = { label: string; amount: number; currency?: string };

export type ViewPlace = {
  id: string;
  name: string;
  city: string;
  tag: string;
  img: string;
  lat: number;
  lng: number;
  blurb?: string;            // subtítulo
  summary?: string;          // párrafo descriptivo
  badges?: string[];         // chips
  rating?: number;
  reviewsCount?: number;
  links?: LinkRef[];
  // extras útiles para el viajero
  tips?: string[];           // “Saber antes de ir”
  bestTime?: string;         // “Mejor al atardecer…”
  durationMin?: number;      // sugerido
  entryCost?: Money;         // costo de entrada
};

export type ViewTask = { id: string; text: string; done?: boolean; scope?: "trip"|"day"|"place" };
export type ViewNote = { id: string; title?: string; content: string; scope?: "trip"|"day"|"place" };

export type ViewReservation = {
  id: string;
  kind: "hotel" | "vuelo" | "tour" | "restaurante" | "otro";
  title: string;
  whenISO: string;           // inicio
  where?: string;            // dirección/nombre
  code?: string;             // localizador
  links?: LinkRef[];
};

export type ViewTransportHop = {
  fromId: string; toId: string;
  mode: "walk"|"car"|"metro"|"bus"|"uber"|"bike";
  distanceKm?: number; timeMin?: number; note?: string;
};

export type ViewWeather = { icon: string; tmin: number; tmax: number; rainProb?: number; unit?: "°C"|"°F" };

export type ViewDay = {
  key: string;
  dateISO: string;
  title?: string;
  items: ViewPlace[];
  notes?: ViewNote[];
  tasks?: ViewTask[];
  transport?: ViewTransportHop[]; // entre lugares del día
  weather?: ViewWeather;          // pronóstico del día
  budget?: Money[];               // costos del día
};

export type Itinerary = {
  id: string;
  title: string;
  cover: string;
  tags: string[];
  author: { name: string; avatar?: string };
  createdAtISO: string;
  region: string;
  days: ViewDay[];
  notes?: ViewNote[];             // notas generales
  tasks?: ViewTask[];             // checklist general
  budget?: Money[];               // presupuesto global
  reservations?: ViewReservation[];
  safety?: string[];              // bloque de seguridad
  generalTips?: string[];         // bloque general “Saber antes de ir”
};
