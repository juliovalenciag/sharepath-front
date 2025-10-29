"use client";
import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { PlaceSearch } from "@/components/viajero/editor/PlaceSearch";
import { DaySection } from "@/components/viajero/editor/DaySection";
import MapPanel from "@/components/viajero/editor/MapPanel";
import { DetailPanel } from "@/components/viajero/editor/DetailPanel";
import { useTrip } from "@/stores/trip-store";
import { SUGGESTIONS } from "@/lib/places-adapter";

const DAYS = [0, 1, 2, 3].map((off) => {
  const d = new Date(2025, 10, 1 + off);
  return { key: `d${off + 1}`, date: d };
});

export default function EditorCrearPage() {
  const region = "Ciudad de México";
  const start = DAYS.at(0)?.date!;
  const end = DAYS.at(-1)?.date!;
  const nights = 3;

  const subtitle = `${region} • ${format(start, "d 'de' MMM", {
    locale: es,
  })} — ${format(end, "d 'de' MMM", { locale: es })} (${nights} noches)`;
  const { addPlace } = useTrip();

  return (
    <div className="h-[calc(100dvh-64px)] grid grid-cols-1 md:grid-cols-[64px_minmax(0,1fr)_minmax(380px,42%)]">
      {/* Riel comprimido */}
      <aside className="hidden md:flex flex-col items-center gap-2 border-r py-3 bg-background z-30">
        {DAYS.map((d, i) => (
          <button
            key={d.key}
            className="relative w-11 h-11 rounded-full border grid place-content-center bg-muted hover:bg-muted/80"
            title={`${format(d.date, "EEE", {
              locale: es,
            }).toUpperCase()} ${String(d.date.getDate()).padStart(2, "0")}`}
          >
            <span className="absolute -left-1 -top-1 text-[9px] px-1 py-0.5 rounded bg-muted">
              {format(d.date, "EEE", { locale: es }).slice(0, 3).toUpperCase()}
            </span>
            <span className="font-semibold leading-none">
              {String(d.date.getDate()).padStart(2, "0")}
            </span>
          </button>
        ))}
      </aside>

      {/* Editor central */}
      <section className="min-w-0 overflow-y-auto">
        {/* Hero + título */}
        <div className="relative h-[160px] w-full">
          <img
            src="https://images.pexels.com/photos/14071000/pexels-photo-14071000.jpeg"
            className="absolute inset-0 w-full h-full object-cover"
            alt=""
          />
        </div>
        <Card className="px-4 py-3 md:px-6 md:py-4 rounded-xl shadow-lg max-w-[780px] -mt-8 ml-4 relative">
          <h1 className="text-xl md:text-2xl font-bold">
            Constructor de itinerario
          </h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </Card>

        {/* Buscador + resultados */}
        <div className="px-4 md:px-6 py-5 space-y-6">
          <PlaceSearch
            onPick={(p) => {
              // por UX, si no hay día activo, agregamos al primero
              const first = DAYS[0].key;
              addPlace(first, p);
            }}
          />

          {/* Plan por día */}
          <div className="space-y-4">
            {DAYS.map((d) => (
              <DaySection
                key={d.key}
                dayKey={d.key}
                date={d.date}
                title="Lugares para visitar"
                recommended={SUGGESTIONS.slice(0, 6)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Columna derecha: mapa + detalle (split vertical simple) */}
      <aside className="hidden md:grid grid-rows-[1fr_minmax(220px,40%)] border-l bg-card">
        <div className="relative">
          <MapPanel />
        </div>
        <div className="border-t">
          <DetailPanel />
        </div>
      </aside>
    </div>
  );
}
