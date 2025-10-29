// app/viajero/itinerarios/crear/page.tsx
"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { DayRail } from "@/components/viajero/editor/DayRail";
import { TripHeader } from "@/components/viajero/editor/TripHeader";
import { PlaceSearch } from "@/components/viajero/editor/PlaceSearch";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { SUGGESTIONS } from "@/lib/constants/suggestions";

const MapPanel = dynamic(() => import("@/components/viajero/editor/MapPanel"), {
  ssr: false,
});

export default function EditorCrearPage() {
  const region = "Ciudad de México";
  const start = new Date(2025, 10, 1);
  const end = new Date(2025, 10, 4);
  const nights = 3;

  const subtitle = `${region} • ${format(start, "d 'de' MMM", {
    locale: es,
  })} — ${format(end, "d 'de' MMM", { locale: es })} (${nights} ${
    nights === 1 ? "noche" : "noches"
  })`;

  const [mapOpen, setMapOpen] = React.useState(false);

  const days = [
    { key: "d1", date: new Date(2025, 10, 1) },
    { key: "d2", date: new Date(2025, 10, 2) },
    { key: "d3", date: new Date(2025, 10, 3) },
    { key: "d4", date: new Date(2025, 10, 4) },
  ];

  return (
    <div className="min-h-[calc(100dvh-64px)]">
      {/* Hero + título */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-3 md:px-6 py-4">
          <TripHeader title="Constructor de itinerario" subtitle={subtitle} />
        </div>
        <div className="border-t" />
      </div>

      {/* Grid principal */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[72px_minmax(0,1fr)_minmax(420px,46%)] gap-0 md:gap-4 px-0 md:px-6">
        {/* Rail comprimido */}
        <aside className="hidden md:block sticky top-[calc(64px+180px)] self-start h-[calc(100dvh-64px-180px)] border-r bg-background">
          <DayRail days={days} />
        </aside>

        {/* Editor */}
        <section className="min-w-0">
          <div className="px-4 md:px-0 py-5 md:py-6 space-y-6">
            {/* SOLO PlaceSearch (con chips dentro) */}
            <PlaceSearch
              suggestions={SUGGESTIONS}
              onPick={(p) => {
                // aquí agregas a la lista del día activo
                console.log("[ADD]", p);
              }}
            />

            {/* Notas quick (igual que antes) */}
            <Card className="p-4 md:p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base md:text-lg font-semibold">Notas</h3>
                <div className="text-xs text-muted-foreground">Opcional</div>
              </div>
              <textarea
                placeholder="Escribe tips de transporte, checklist, etc."
                className="min-h-[88px] w-full resize-y rounded-md border bg-white/70 p-3 outline-none focus-visible:ring-2 focus-visible:ring-[var(--palette-blue)]"
              />
            </Card>

            {/* Aquí irán tus DayCards, listas, etc. */}
          </div>
        </section>

        {/* Mapa */}
        <aside className="hidden md:block sticky top-[calc(64px+180px)] self-start h-[calc(100dvh-64px-180px)] border-l rounded-l-xl overflow-hidden">
          <MapPanel />
        </aside>
      </div>

      {/* FAB móvil + hoja con mapa */}
      <div className="md:hidden">
        <Button
          onClick={() => setMapOpen(true)}
          className="fixed right-4 bottom-5 h-12 rounded-full shadow-lg bg-[var(--palette-blue)] text-white z-50"
        >
          Ver mapa
        </Button>
        <Sheet open={mapOpen} onOpenChange={setMapOpen}>
          <SheetContent side="bottom" className="h-[86dvh] p-0">
            <SheetHeader className="px-4 py-3 border-b">
              <SheetTitle>Mapa</SheetTitle>
            </SheetHeader>
            <div className="h-[calc(86dvh-56px)]">
              <MapPanel />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
