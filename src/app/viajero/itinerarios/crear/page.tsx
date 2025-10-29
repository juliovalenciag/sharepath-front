// src/app/viajero/itinerarios/crear/page.tsx
"use client";
import * as React from "react";
import dynamic from "next/dynamic";
import { format, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { DayRail } from "@/components/viajero/editor/DayRail";
import { PlaceSearchPro } from "@/components/viajero/editor/PlaceSearchPro";
import { PlanDeViaje } from "@/components/viajero/editor/PlanDeViaje";
import { TripHeader } from "@/components/viajero/editor/TripHeader";
import { Card } from "@/components/ui/card";
import { useTrip, type Place } from "@/stores/trip-store";

const MapPanel = dynamic(() => import("@/components/viajero/editor/MapPanel"), {
  ssr: false,
});

// Mock de dataset (sustituye por tus SUGGESTIONS)
import { SUGGESTIONS as DS } from "@/lib/constants/mock";

export default function EditorCrearPage() {
  const region = "Ciudad de México";
  const start = new Date(2025, 10, 1);
  const end = new Date(2025, 10, 4);
  const nights = 3;

  const days = React.useMemo(
    () =>
      Array.from({ length: nights + 1 }, (_, i) => ({
        key: `d${i + 1}`,
        date: addDays(start, i),
      })),
    [start, nights]
  );

  const subtitle = `${region} • ${format(start, "d 'de' MMM", {
    locale: es,
  })} — ${format(end, "d 'de' MMM", { locale: es })} (${nights} noches)`;

  const dataset: Place[] = DS as any; // adapta la forma si difiere

  return (
    <div className="grid grid-cols-1 md:grid-cols-[72px_minmax(0,1fr)_minmax(420px,48%)]">
      {/* Rail */}
      <DayRail days={days} />

      {/* Columna central */}
      <main className="min-w-0 border-r">
        <TripHeader title="Constructor de itinerario" subtitle={subtitle} />

        <div className="px-4 md:px-6 py-4 md:py-6 space-y-6">
          <PlaceSearchPro data={dataset} />
          <PlanDeViaje days={days as any} dataset={dataset} />
        </div>
      </main>

      {/* Mapa + detalle */}
      <aside className="hidden md:block">
        <MapPanel />
      </aside>
    </div>
  );
}
