// Datos simulados y constantes de UI (puedes remplazar por tu backend Elysia)
export type Place = {
  id: string;
  name: string;
  city: string;
  tag: string;
  image: string;
};

export const UI = {
  radius: {
    sm: "rounded-[var(--radius-sm)]",
    md: "rounded-[var(--radius-md)]",
    lg: "rounded-[var(--radius-lg)]",
  },
  glass: "bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60",
  ring: "ring-1 ring-border",
  brand: {
    primary: "bg-[var(--palette-blue)] text-[var(--primary-foreground)]",
    primaryHover: "hover:opacity-90",
    chip: "bg-[oklch(0.97_0_0)] dark:bg-[oklch(0.269_0_0)] text-foreground border border-border",
  },
};

export const CATEGORIES = [
  "Cultura",
  "Naturaleza",
  "Parque",
  "Historia",
  "Gastronomía",
  "Arqueología",
] as const;

export const SUGGESTIONS: Place[] = [
  {
    id: "1",
    name: "Palacio de Bellas Artes",
    city: "CDMX",
    tag: "Cultura",
    image: "https://images.pexels.com/photos/12281148/pexels-photo-12281148.jpeg",
  },
  {
    id: "2",
    name: "Bosque de Chapultepec",
    city: "CDMX",
    tag: "Parque",
    image: "https://images.pexels.com/photos/12666954/pexels-photo-12666954.jpeg",
  },
  {
    id: "3",
    name: "Peña de Bernal",
    city: "Querétaro",
    tag: "Naturaleza",
    image: "https://images.pexels.com/photos/33826654/pexels-photo-33826654.jpeg",
  },
  {
    id: "4",
    name: "Grutas de Tolantongo",
    city: "Hidalgo",
    tag: "Naturaleza",
    image: "https://images.pexels.com/photos/12331034/pexels-photo-12331034.jpeg",
  },
  {
    id: "5",
    name: "Teotihuacán",
    city: "Edo. Méx.",
    tag: "Arqueología",
    image: "https://images.pexels.com/photos/17061903/pexels-photo-17061903.jpeg",
  },
  {
    id: "6",
    name: "Jardín Borda",
    city: "Morelos",
    tag: "Historia",
    image: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Jardin_borda.jpg",
  },
];

export const REGION_LABELS: Record<string, string> = {
  cdmx: "Ciudad de México",
  edomex: "Estado de México",
  hgo: "Hidalgo",
  mor: "Morelos",
  qro: "Querétaro",
};

export const REGION_HERO: Record<string, string> = {
  cdmx:
    "https://images.pexels.com/photos/14071000/pexels-photo-14071000.jpeg",
  edomex:
    "https://images.pexels.com/photos/31646848/pexels-photo-31646848.jpeg",
  hgo:
    "https://images.pexels.com/photos/34106330/pexels-photo-34106330.jpeg",
  mor:
    "https://images.pexels.com/photos/14159886/pexels-photo-14159886.jpeg",
  qro:
    "https://images.pexels.com/photos/34444990/pexels-photo-34444990.jpeg",
};