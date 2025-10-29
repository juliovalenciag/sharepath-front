export type ViewPlace = {
  id: string;
  name: string;
  city: string;
  tag: string;
  img: string;
  lat: number;
  lng: number;
  blurb?: string; // texto corto bajo el título
  summary?: string; // párrafo descriptivo
  badges?: string[]; // p.ej. ["Atracción turística", "Museo"]
  links?: { label: string; href: string }[];
  rating?: number; // 4.6
  reviewsCount?: number; // 206
};

export type ViewDay = {
  key: string;
  dateISO: string; // "2025-11-01"
  title?: string; // opcional (p.ej. "Centro Histórico")
  items: ViewPlace[];
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
};
