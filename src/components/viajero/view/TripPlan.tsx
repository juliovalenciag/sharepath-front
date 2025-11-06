// components/viajero/read/TripPlan.tsx
"use client";
import { DayCard } from "./DayCard";

export default function TripPlan() {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-bold">Plan de viaje</h2>
      <DayCard
        dateLabel="Sábado, 1 de nov."
        weather={{ icon: "☀️", temp: "19°/28°", note: "Lluvia 10%" }}
        items={[
          {
            id: "1",
            title: "Palacio de Bellas Artes",
            subtitle: "CDMX • Cultura",
            desc: "Dramatic marble performance hall & museum featuring murals.",
            img: "https://images.pexels.com/photos/12281148/pexels-photo-12281148.jpeg",
            tags: ["Museo", "Centro cultural"],
            km: "0.24 mi",
            min: "5 mins",
          },
          {
            id: "2",
            title: "Alameda Central",
            subtitle: "Parque urbano",
            desc: "Parque histórico con fuentes y árboles centenarios.",
            img: "https://images.pexels.com/photos/12666954/pexels-photo-12666954.jpeg",
            tags: ["Parque"],
            km: "0.31 mi",
            min: "6 mins",
          },
        ]}
      />
      <DayCard
        dateLabel="Domingo, 2 de nov."
        weather={{ icon: "⛅", temp: "18°/26°", note: "Lluvia 30%" }}
        items={[]}
      />
    </section>
  );
}
