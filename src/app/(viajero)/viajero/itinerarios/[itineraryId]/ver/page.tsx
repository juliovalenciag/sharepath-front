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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TripCalendarStrip } from "@/components/viajero/view/TripCalendarStrip";
import { Checklist } from "@/components/viajero/view/CheckList";
import {
  NotesBlock,
  BudgetBlock,
  ReservationsBlock,
  TipsBlock,
  WeatherInline,
} from "@/components/viajero/view/NotesBlock";
import { TransportChips } from "@/components/viajero/view/TransportChips";

// Mapa (cliente) con Drawer
const MapView = dynamic(() => import("@/components/viajero/view/MapView"), {
  ssr: false,
});

export default function ViewItineraryPage() {
  const data: Itinerary = VIEW_ITINERARY_SAMPLE;
  const [dayIndex, setDayIndex] = React.useState(0);
  const [selected, setSelected] = React.useState<ViewPlace | null>(null);
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
        <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="mx-auto max-w-7xl px-4 pb-4">
            <Card className="px-5 py-4 md:px-6 md:py-5 rounded-xl shadow-xl bg-card/80 backdrop-blur">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-2xl md:text-3xl font-bold leading-tight">
                    {data.title}
                  </h1>
                  <p className="text-sm text-muted-foreground truncate">
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
                  <Button className="bg-[var(--palette-blue)] text-[var(--primary-foreground)]">
                    Guardar
                  </Button>
                  <Button variant="outline">Compartir</Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* LAYOUT */}
      <main className="mx-auto max-w-7xl px-4 md:px-6 py-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(520px,48%)] gap-6">
        {/* IZQ: timeline + widgets */}
        <section className="min-w-0 space-y-6">
          {/* Calendario + resumen global */}
          <div className="grid gap-4 md:grid-cols-2">
            <TripCalendarStrip days={data.days} onPick={setDayIndex} />
            <div className="space-y-4">
              <Checklist title="Checklist del viaje" items={data.tasks ?? []} />
              <BudgetBlock title="Presupuesto global" items={data.budget} />
            </div>
          </div>

          {/* Notas/Tips/Seguridad/Reservas */}
          <div className="grid gap-4 md:grid-cols-2">
            <NotesBlock title="Notas generales" notes={data.notes} />
            <TipsBlock
              title="Saber antes de ir (general)"
              items={data.generalTips}
            />
            <ReservationsBlock items={data.reservations} />
            {data.safety?.length ? (
              <TipsBlock title="Seguridad" items={data.safety} />
            ) : null}
          </div>

          {/* Plan por días */}
          <header className="mt-2">
            <h2 className="text-xl md:text-2xl font-bold">Plan de viaje</h2>
          </header>

          <div className="space-y-6">
            {data.days.map((d, idx) => (
              <DayTimeline
                key={d.key}
                day={d}
                index={idx}
                active={idx === dayIndex}
                onFocusDay={() => setDayIndex(idx)}
                onSelectPlace={setSelected}
              />
            ))}
          </div>
        </section>

        {/* DER: mapa con detalle */}
        <aside className="min-h-[60svh] lg:sticky lg:top-[12px]">
          <MapView
            day={day}
            selected={selected}
            onSelect={setSelected}
            onRoutePrev={() =>
              setDayIndex((i) => (i - 1 + data.days.length) % data.days.length)
            }
            onRouteNext={() => setDayIndex((i) => (i + 1) % data.days.length)}
          />
        </aside>
      </main>
    </div>
  );
}

/* ---------- timeline por día con widgets ---------- */
import { Badge as _Badge } from "@/components/ui/badge";
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
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <button
            onClick={onFocusDay}
            className="text-lg md:text-xl font-bold text-left"
          >
            {format(new Date(day.dateISO), "EEEE, d 'de' MMM", { locale: es })}
          </button>
          {day.title && (
            <p className="text-sm text-muted-foreground">{day.title}</p>
          )}
          <div className="mt-2">
            <WeatherInline w={day.weather} />
          </div>
        </div>
        <div
          className={
            "h-3 w-3 rounded-full mt-1 " +
            (active ? "bg-[var(--palette-blue)]" : "bg-muted-foreground/30")
          }
        />
      </div>

      {/* Traslados + presupuesto del día */}
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <TransportChips day={day} />
        <BudgetBlock title="Costos del día" items={day.budget} />
      </div>

      {/* Lista de lugares */}
      <ol className="mt-4 space-y-4">
        {day.items.map((p, i) => (
          <li key={p.id} className="relative">
            {i < day.items.length - 1 && (
              <span className="absolute left-4 top-10 bottom-[-14px] w-px border-l-2 border-dotted border-muted-foreground/30" />
            )}
            <article className="pl-10 grid grid-cols-[minmax(0,1fr)_160px] gap-3">
              <div
                className="rounded-xl border bg-card/60 p-3 hover:bg-card transition cursor-pointer"
                onClick={() => onSelectPlace(p)}
                title="Ver detalle en el panel derecho"
              >
                <div className="flex items-center gap-2">
                  <span className="inline-grid place-items-center size-7 rounded-full text-sm font-bold bg-[color-mix(in_oklch,var(--palette-blue)_20%,transparent)] border">
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
                  <_Badge variant="outline">{p.city}</_Badge>
                  <_Badge variant="secondary">{p.tag}</_Badge>
                  {p.durationMin ? (
                    <_Badge variant="outline">
                      {Math.round(p.durationMin)} min
                    </_Badge>
                  ) : null}
                  {p.entryCost ? (
                    <_Badge variant="outline">
                      {p.entryCost.amount} {p.entryCost.currency ?? "MXN"}
                    </_Badge>
                  ) : null}
                  {p.bestTime ? (
                    <_Badge variant="outline">{p.bestTime}</_Badge>
                  ) : null}
                </div>

                {/* Tips del lugar (compacto) */}
                {p.tips?.length ? (
                  <ul className="mt-2 list-disc pl-5 text-xs text-muted-foreground space-y-1">
                    {p.tips.slice(0, 3).map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                ) : null}
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

      {/* Notas/Checklist del día */}
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <NotesBlock title="Notas del día" notes={day.notes} />
        <Checklist title="Tareas del día" items={day.tasks ?? []} />
      </div>
    </Card>
  );
}
