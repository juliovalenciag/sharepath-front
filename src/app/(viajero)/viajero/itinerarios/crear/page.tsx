"use client";
import * as React from "react";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Card } from "@/components/ui/card";
import { TripHeader } from "@/components/viajero/editor/TripHeader";
import { CategoryChips } from "@/components/viajero/editor/CategoryChips";
import { PlaceSearch } from "@/components/viajero/editor/PlaceSearch";
import { DaySection } from "@/components/viajero/editor/DaySection";
import { PlaceDetailPanel } from "@/components/viajero/editor/PlaceDetailPanel";

import { useTrip } from "@/stores/trip-store";
import { SUGGESTIONS } from "@/lib/constants/mock";

const MapPanel = dynamic(() => import("@/components/viajero/editor/MapPanel"), {
  ssr: false,
});

export default function EditorCrearPage() {
  const region = "Ciudad de México";
  const start = new Date(2025, 10, 1);
  const end = new Date(2025, 10, 4);
  const nights = 3;

  const { days, activeDayKey, setActiveDay, addPlace, selectPlace } = useTrip();
  const subtitle = `${region} • ${format(start, "d 'de' MMM", {
    locale: es,
  })} — ${format(end, "d 'de' MMM", { locale: es })} (${nights} noches)`;

  const [filterTag, setFilterTag] = React.useState<string | null>(null);
  const results = filterTag
    ? SUGGESTIONS.filter((x) => x.tag === filterTag)
    : SUGGESTIONS;

  return (
    <div className="grid h-[calc(100dvh-64px)] grid-cols-1 md:grid-cols-[76px_minmax(0,1fr)_minmax(420px,48%)]">
      {/* Rail de días */}
      <aside className="hidden md:flex flex-col items-center gap-2 border-r py-3 bg-background">
        {days.map((d) => {
          const label = format(d.date, "EEE", { locale: es })
            .slice(0, 3)
            .toUpperCase();
          const dayno = format(d.date, "dd");
          const active = d.key === activeDayKey;
          return (
            <button
              key={d.key}
              title={`${label} ${dayno}`}
              onClick={() => setActiveDay(d.key)}
              className={`relative w-11 h-11 rounded-full grid place-content-center border text-xs
                         ${
                           active
                             ? "bg-foreground text-background"
                             : "bg-muted hover:bg-muted/80"
                         }`}
            >
              <span className="leading-none font-semibold">{dayno}</span>
              <span
                className={`absolute -left-1 -top-1 text-[9px] px-1 py-0.5 rounded ${
                  active ? "bg-foreground text-background" : "bg-muted"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </aside>

      {/* Columna central */}
      <main className="min-w-0 border-r bg-background relative">
        <TripHeader title="Crea tu itinerario" subtitle={subtitle} />

        <div className="px-4 md:px-6 py-4 space-y-6 h-[calc(100%-160px)] overflow-auto">
          <Card className="p-4 space-y-3">
            
            <PlaceSearch
              results={results}
              onPick={(p) => addPlace(activeDayKey, p)}
              onFilterTag={setFilterTag}
            />
          </Card>

          {days.map((d) => (
            <DaySection
              key={d.key}
              dayKey={d.key}
              date={d.date}
              recommended={results.slice(0, 8)}
            />
          ))}
        </div>
      </main>

      {/* Mapa + panel de detalle */}
      <aside className="relative bg-muted/20">
        <MapPanel />
        <PlaceDetailPanel />
      </aside>
    </div>
  );
}
