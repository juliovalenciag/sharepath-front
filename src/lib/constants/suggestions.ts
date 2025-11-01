// src/lib/constants/suggestions.ts
export type Place = {
  id: string;
  name: string;
  city: string;
  tag: string;
  img: string;
};

export const CATEGORIES = [
  "Cultura",
  "Naturaleza",
  "Parque",
  "Historia",
  "Gastronomía",
  "Arqueología",
];

export const SUGGESTIONS: Place[] = [
  {
    id: "1",
    name: "Palacio de Bellas Artes",
    city: "CDMX",
    tag: "Cultura",
    img: "https://images.pexels.com/photos/12281148/pexels-photo-12281148.jpeg",
  },
  {
    id: "2",
    name: "Bosque de Chapultepec",
    city: "CDMX",
    tag: "Parque",
    img: "https://images.pexels.com/photos/12666954/pexels-photo-12666954.jpeg",
  },
  {
    id: "3",
    name: "Peña de Bernal",
    city: "Querétaro",
    tag: "Naturaleza",
    img: "https://images.pexels.com/photos/33826654/pexels-photo-33826654.jpeg",
  },
  {
    id: "4",
    name: "Grutas de Tolantongo",
    city: "Hidalgo",
    tag: "Naturaleza",
    img: "https://images.pexels.com/photos/12331034/pexels-photo-12331034.jpeg",
  },
  {
    id: "5",
    name: "Teotihuacán",
    city: "Edo. Méx.",
    tag: "Arqueología",
    img: "https://images.pexels.com/photos/17061903/pexels-photo-17061903.jpeg",
  },
  {
    id: "6",
    name: "Jardín Borda",
    city: "Morelos",
    tag: "Historia",
    img: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Jardin_borda.jpg",
  },
];
