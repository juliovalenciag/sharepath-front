"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { VIEW_ITINERARY_SAMPLE } from "@/lib/constants/view-mock";
import type { Itinerary, ViewPlace } from "@/lib/constants/view-types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Mapa solo en cliente (evita appendChild null)
const MapView = dynamic(() => import("@/components/viajero/view/MapView"), {
  ssr: false,
});

export default function ViewItineraryPage() {
  // en prod: fetch por id; aquí usamos mock
  const data: Itinerary = VIEW_ITINERARY_SAMPLE;

  // estado de detalle seleccionado (para Drawer bajo el mapa)
  const [selected, setSelected] = React.useState<ViewPlace | null>(null);
  const [dayIndex, setDayIndex] = React.useState(0);

  const day = data.days[dayIndex];

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      {/* HERO */}
      <section className="relative h-[42svh] md:h-[48svh] w-full">
        <Image
          src={data.cover}
          alt={data.title}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-background/5" />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="mx-auto max-w-7xl px-4 pb-4">
            <Card className="px-5 py-4 md:px-6 md:py-5 rounded-xl shadow-xl bg-card/80 backdrop-blur">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold leading-tight">
                    {data.title}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {data.region} • Publicado el{" "}
                    {format(new Date(data.createdAtISO), "d 'de' MMM yyyy", {
                      locale: es,
                    })}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {data.tags.map((t) => (
                      <Badge
                        key={t}
                        variant="secondary"
                        className="rounded-full"
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="bg-[var(--palette-blue)] text-[var(--primary-foreground)]"
                  >
                    Guardar
                  </Button>
                  <Button variant="outline">Compartir</Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* LAYOUT PRINCIPAL */}
      <main className="mx-auto max-w-7xl px-4 md:px-6 py-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(520px,48%)] gap-6">
        {/* IZQUIERDA: timeline por días */}
        <section className="min-w-0">
          <header className="mb-3">
            <h2 className="text-xl md:text-2xl font-bold">Plan de viaje</h2>
          </header>

          <div className="space-y-6">
            {data.days.map((d, idx) => (
              <DayTimeline
                key={d.key}
                index={idx}
                active={idx === dayIndex}
                day={d}
                onSelectPlace={setSelected}
                onFocusDay={() => setDayIndex(idx)}
              />
            ))}
          </div>
        </section>

        {/* DERECHA: mapa + detalle */}
        <aside className="min-h-[60svh] lg:sticky lg:top-[12px]">
          <MapView
            day={day}
            selected={selected}
            onSelect={setSelected}
            onRoutePrev={() =>
              setDayIndex((i) => (i - 1 + data.days.length) % data.days.length)
            }
            onRouteNext={() =>
              setDayIndex((i) => (i + 1) % data.days.length)
            }
          />
        </aside>
      </main>
    </div>
  );
}

/* ========== Subcomponentes ========== */

function DayTimeline({
  day,
  index,
  active,
  onSelectPlace,
  onFocusDay,
}: {
  day: Itinerary["days"][number];
  index: number;
  active: boolean;
  onSelectPlace: (p: ViewPlace) => void;
  onFocusDay: () => void;
}) {
  return (
    <Card className="p-4 md:p-5">
      <div className="flex items-start justify-between">
        <div>
          <button
            className="text-lg md:text-xl font-bold text-left"
            onClick={onFocusDay}
            title="Enfocar este día en el mapa"
          >
            {format(new Date(day.dateISO), "EEEE, d 'de' MMM", { locale: es })}
          </button>
          {day.title && (
            <p className="text-sm text-muted-foreground">{day.title}</p>
          )}
        </div>
        <div
          className={cn(
            "h-3 w-3 rounded-full mt-1",
            active ? "bg-[var(--palette-blue)]" : "bg-muted-foreground/30"
          )}
          aria-hidden
        />
      </div>

      <ol className="mt-4 space-y-4">
        {day.items.map((p, i) => (
          <li key={p.id} className="relative">
            {/* línea vertical punteada */}
            {i < day.items.length - 1 && (
              <span className="absolute left-4 top-10 bottom-[-14px] w-px border-l-2 border-dotted border-muted-foreground/30" />
            )}
            <article className="pl-10 grid grid-cols-[minmax(0,1fr)_160px] gap-3">
              <div
                className="rounded-xl border bg-card/60 p-3 hover:bg-card transition"
                role="button"
                onClick={() => onSelectPlace(p)}
                title="Ver detalle en el panel derecho"
              >
                <div className="flex items-center gap-2">
                  <span className="inline-grid place-items-center size-7 rounded-full text-sm font-bold bg-[color-mix(in_oklch,var(--palette-blue)_20%,transparent)] text-foreground border">
                    {i + 1}
                  </span>
                  <h3 className="font-semibold truncate">{p.name}</h3>
                </div>
                {p.blurb && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {p.blurb}
                  </p>
                )}
                {p.summary && (
                  <p className="mt-1 text-xs text-muted-foreground/90 line-clamp-2">
                    {p.summary}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="outline">{p.city}</Badge>
                  <Badge variant="secondary">{p.tag}</Badge>
                </div>
              </div>

              <div className="relative h-[92px] rounded-lg overflow-hidden border">
                <Image
                  src={p.img}
                  alt={p.name}
                  fill
                  className="object-cover"
                  sizes="160px"
                />
              </div>
            </article>
          </li>
        ))}
      </ol>
    </Card>
  );
}
