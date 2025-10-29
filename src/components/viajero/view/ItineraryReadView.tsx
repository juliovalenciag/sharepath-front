"use client";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { clsx } from "clsx";
import TopSummary from "./TopSummary";
import GridQuickCards from "./GridQuickCards";
import TripPlan from "./TripPlan";

const StickyMapPanel = dynamic(() => import("./StickyMapPanel"), {
  ssr: false,
});

export default function ItineraryReadView() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_minmax(520px,640px)] gap-6 px-4 md:px-6 py-6">
      {/* Columna izquierda: contenido scrolleable */}
      <div className="space-y-6">
        <HeroHeader />
        <TopSummary />
        <GridQuickCards />
        <TripPlan />
      </div>

      {/* Columna derecha: mapa STICKY */}
      <aside className="xl:block hidden">
        <StickyMapPanel />
      </aside>
    </div>
  );
}

function HeroHeader() {
  return (
    <section className="relative overflow-hidden rounded-[var(--radius-lg)] ring-1 ring-border bg-gradient-to-br from-[oklch(0.95_0.02_250)] to-[oklch(0.92_0.04_230)] dark:from-[oklch(0.28_0.02_250)] dark:to-[oklch(0.24_0.04_230)]">
      <div className="p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="px-2.5 py-1 text-xs rounded-full bg-[var(--palette-blue)]/15 text-[var(--palette-blue)] ring-1 ring-[var(--palette-blue)]/20">
            CDMX
          </span>
          <span className="px-2.5 py-1 text-xs rounded-full bg-[oklch(0.95_0.09_160)]/40 text-[oklch(0.52_0.17_160)] ring-1 ring-black/5">
            3 noches
          </span>
          <span className="px-2.5 py-1 text-xs rounded-full bg-[oklch(0.96_0.02_30)] dark:bg-[oklch(0.30_0.02_30)] text-foreground ring-1 ring-border">
            Social: 128 guardaron
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Itinerario CDMX: arte, parques y gastronomía
        </h1>
        <p className="mt-2 text-muted-foreground">
          Resumen visual del viaje con calendario, checklist, presupuesto y el
          plan por día. El mapa permanece fijo a la derecha.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a className="inline-flex items-center gap-2 rounded-lg px-4 py-2 bg-[var(--palette-blue)] text-white hover:opacity-90">
            Crear mi itinerario
          </a>
          <button className="rounded-lg px-4 py-2 ring-1 ring-border hover:bg-muted/50">
            Compartir
          </button>
        </div>
      </div>
    </section>
  );
}
