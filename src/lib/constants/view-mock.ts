import type { Itinerary } from "./view-types";

export const VIEW_ITINERARY_SAMPLE: Itinerary = {
  id: "cdmx-3d",
  title: "CDMX Highlights – 3 días intensos",
  cover: "https://images.pexels.com/photos/14071000/pexels-photo-14071000.jpeg",
  tags: ["Itinerario 3 días", "Guía urbana", "CDMX"],
  author: { name: "kelo" },
  createdAtISO: "2025-10-29",
  region: "Ciudad de México",
  notes: [
    {
      id: "n-trip-1",
      title: "Cambio de moneda",
      content:
        "Lleva efectivo para entradas pequeñas; muchas taquillas no aceptan tarjetas.",
    },
    {
      id: "n-trip-2",
      title: "Transporte",
      content: "Tarjeta de Movilidad Integrada para metro y metrobús.",
    },
  ],
  tasks: [
    { id: "t-1", text: "Comprar seguro de viaje", done: true, scope: "trip" },
    { id: "t-2", text: "Descargar mapas offline", scope: "trip" },
  ],
  budget: [
    { label: "Entradas museos", amount: 650, currency: "MXN" },
    { label: "Comidas", amount: 1200, currency: "MXN" },
  ],
  reservations: [
    {
      id: "r1",
      kind: "hotel",
      title: "Hotel Histórico Centro",
      whenISO: "2025-11-01T15:00:00-06:00",
      where: "Centro Hist.",
      code: "HHC-8K2P",
      links: [{ label: "Ver reserva", href: "#" }],
    },
    {
      id: "r2",
      kind: "tour",
      title: "Tour Centro + Templo Mayor",
      whenISO: "2025-11-01T10:00:00-06:00",
      where: "Bellas Artes",
      code: "TOUR-213A",
    },
  ],
  safety: [
    "Evita caminar solo muy tarde por calles poco iluminadas.",
    "Usa apps oficiales de taxi o plataformas con placa verificada.",
  ],
  generalTips: [
    "Compra boletos con antelación para evitar filas en Chapultepec.",
    "Los lunes muchos museos cierran.",
  ],
  days: [
    {
      key: "d1",
      dateISO: "2025-11-01",
      title: "Centro histórico y alrededores",
      weather: { icon: "☀️", tmin: 11, tmax: 22, rainProb: 10, unit: "°C" },
      items: [
        {
          id: "bellas-artes",
          name: "Palacio de Bellas Artes",
          city: "CDMX",
          tag: "Cultura",
          img: "https://images.pexels.com/photos/12281148/pexels-photo-12281148.jpeg",
          lat: 19.4353,
          lng: -99.1412,
          blurb: "Icono art déco con murales de Rivera.",
          summary:
            "Dramatic marble hall & museum featuring murals by Diego Rivera.",
          badges: ["Centro cultural", "Museo"],
          durationMin: 90,
          bestTime: "Atardecer",
          entryCost: { label: "Entrada", amount: 90, currency: "MXN" },
          tips: [
            "Llega 15 min antes del espectáculo",
            "Mejor vista desde el café de Sears",
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
          durationMin: 40,
        },
      ],
      transport: [
        {
          fromId: "bellas-artes",
          toId: "alameda",
          mode: "walk",
          distanceKm: 0.3,
          timeMin: 6,
          note: "Plano y con sombra",
        },
      ],
      budget: [{ label: "Snacks/agua", amount: 80, currency: "MXN" }],
      notes: [
        {
          id: "n-d1-1",
          content: "Comprar postales en la Librería Porrúa (detrás de Palacio)",
        },
      ],
      tasks: [
        { id: "t-d1-1", text: "Foto nocturna en Bellas Artes", scope: "day" },
      ],
    },
    {
      key: "d2",
      dateISO: "2025-11-02",
      title: "Chapultepec y Reforma",
      weather: { icon: "⛅️", tmin: 12, tmax: 21, rainProb: 20, unit: "°C" },
      items: [
        {
          id: "castillo",
          name: "Castillo de Chapultepec",
          city: "CDMX",
          tag: "Historia",
          img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Chapultepec_Castle.jpg/640px-Chapultepec_Castle.jpg",
          lat: 19.4209,
          lng: -99.1815,
          blurb: "Vistas espectaculares.",
        },
        {
          id: "angel",
          name: "El Ángel de la Independencia",
          city: "CDMX",
          tag: "Monumento",
          img: "https://upload.wikimedia.org/wikipedia/commons/7/78/Angel_Independencia.jpg",
          lat: 19.427,
          lng: -99.1677,
          blurb: "Ideal después del atardecer.",
        },
      ],
      transport: [
        {
          fromId: "castillo",
          toId: "angel",
          mode: "uber",
          distanceKm: 2.3,
          timeMin: 9,
          note: "Tráfico ligero domingo",
        },
      ],
    },
    {
      key: "d3",
      dateISO: "2025-11-03",
      title: "Templo Mayor y Zócalo",
      weather: { icon: "🌦️", tmin: 11, tmax: 20, rainProb: 40, unit: "°C" },
      items: [
        {
          id: "templo-mayor",
          name: "Museo del Templo Mayor",
          city: "CDMX",
          tag: "Arqueología",
          img: "https://upload.wikimedia.org/wikipedia/commons/4/48/Templo_Mayor_Ruins.jpg",
          lat: 19.4342,
          lng: -99.1329,
          blurb: "Sitio mexica en el corazón de la ciudad.",
        },
      ],
    },
  ],
};
