import type { Itinerary } from "./view-types";

export const VIEW_ITINERARY_SAMPLE: Itinerary = {
  id: "cdmx-3d",
  title: "CDMX Highlights – 3 días intensos",
  cover: "https://images.pexels.com/photos/14071000/pexels-photo-14071000.jpeg",
  tags: ["Itinerario 3 días", "Guía urbana", "CDMX"],
  author: { name: "kelo" },
  createdAtISO: "2025-10-29",
  region: "Ciudad de México",
  days: [
    {
      key: "d1",
      dateISO: "2025-11-01",
      title: "Centro histórico y alrededores",
      items: [
        {
          id: "bellas-artes",
          name: "Palacio de Bellas Artes",
          city: "CDMX",
          tag: "Cultura",
          img: "https://images.pexels.com/photos/12281148/pexels-photo-12281148.jpeg",
          lat: 19.4353,
          lng: -99.1412,
          blurb: "Icono art déco con murales de Rivera y más.",
          summary:
            "Dramatic marble performance hall & museum featuring murals by Diego Rivera & other notable artists.",
          badges: ["Centro cultural", "Museo", "Art museum"],
          rating: 4.8,
          reviewsCount: 186651,
          links: [
            { label: "Sitio oficial", href: "https://palacio.inba.gob.mx" },
            { label: "Google Maps", href: "https://maps.google.com" },
          ],
        },
        {
          id: "alameda",
          name: "Alameda Central",
          city: "CDMX",
          tag: "Parque",
          img: "https://images.pexels.com/photos/175152/pexels-photo-175152.jpeg",
          lat: 19.4359,
          lng: -99.1474,
          blurb: "El parque más antiguo de la ciudad.",
          summary:
            "Abierto 24 horas. Fuentes, árboles y un paseo perfecto para fotografías y descanso.",
        },
      ],
    },
    {
      key: "d2",
      dateISO: "2025-11-02",
      title: "Chapultepec y Reforma",
      items: [
        {
          id: "castillo",
          name: "Museo Nacional de Historia - Castillo de Chapultepec",
          city: "CDMX",
          tag: "Historia",
          img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Chapultepec_Castle.jpg/640px-Chapultepec_Castle.jpg",
          lat: 19.4209,
          lng: -99.1815,
          blurb: "Castillo con vistas y salas históricas.",
        },
        {
          id: "angel",
          name: "El Ángel de la Independencia",
          city: "CDMX",
          tag: "Monumento",
          img: "https://upload.wikimedia.org/wikipedia/commons/7/78/Angel_Independencia.jpg",
          lat: 19.427,
          lng: -99.1677,
          blurb: "Emblema de Reforma; vistas nocturnas espectaculares.",
        },
      ],
    },
    {
      key: "d3",
      dateISO: "2025-11-03",
      title: "Templo Mayor y Zócalo",
      items: [
        {
          id: "templo-mayor",
          name: "Museo del Templo Mayor",
          city: "CDMX",
          tag: "Arqueología",
          img: "https://upload.wikimedia.org/wikipedia/commons/4/48/Templo_Mayor_Ruins.jpg",
          lat: 19.4342,
          lng: -99.1329,
          blurb: "Sitio arqueológico mexica en el corazón de la ciudad.",
        },
      ],
    },
  ],
};
