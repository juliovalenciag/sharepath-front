// Tipos y datos mock compartidos

export type RegionKey = "cdmx" | "edomex" | "hgo" | "mor" | "qro";

export const REGIONS: Record<string, string> = {
  cdmx: "Ciudad de México",
  edomex: "Estado de México",
  hgo: "Hidalgo",
  mor: "Morelos",
  qro: "Querétaro",
};

export type Place = { id: string; name: string; city: string; tag: string };

export const SUGGESTIONS: Place[] = [
  { id: "1", name: "Palacio de Bellas Artes", city: "CDMX", tag: "Cultura" },
  { id: "2", name: "Bosque de Chapultepec", city: "CDMX", tag: "Parque" },
  { id: "3", name: "Peña de Bernal", city: "Querétaro", tag: "Naturaleza" },
  { id: "4", name: "Grutas de Tolantongo", city: "Hidalgo", tag: "Naturaleza" },
  { id: "5", name: "Teotihuacán", city: "Edo. Méx.", tag: "Arqueología" },
  { id: "6", name: "Jardín Borda", city: "Morelos", tag: "Historia" },
];

export const CATEGORIES = [
  "Cultura",
  "Naturaleza",
  "Parque",
  "Historia",
  "Gastronomía",
  "Arqueología",
] as const;
