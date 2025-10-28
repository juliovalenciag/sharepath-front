"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  format,
  eachDayOfInterval,
  differenceInCalendarDays,
  parseISO,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  IconMapSearch,
  IconMapPinFilled,
  IconCalendar,
  IconPlus,
  IconTrash,
  IconArrowUp,
  IconArrowDown,
  IconDeviceFloppy,
  IconMap,
  IconX,
} from "@tabler/icons-react";

import { REGIONS, SUGGESTIONS, CATEGORIES, type Place } from "@/lib/constants";
import PlaceSearch from "@/components/viajero/PlaceSearch";
import DayCard from "@/components/viajero/DayCard";
import MapPlaceholder from "@/components/viajero/MapPlaceholder";

export default function ItineraryBuilder() {
  const params = useSearchParams();

  const regionKey = params.get("region") ?? "";
  const region = REGIONS[regionKey] ?? "—";
  const startISO = params.get("start");
  const endISO = params.get("end");

  const start = startISO ? parseISO(startISO) : undefined;
  const end = endISO ? parseISO(endISO) : undefined;

  const days = useMemo(() => {
    if (!start || !end) return [];
    return eachDayOfInterval({ start, end }).map((d, idx) => ({
      key: `day-${idx}`,
      date: d,
    }));
  }, [start, end]);

  const nights = useMemo(() => {
    if (!start || !end) return 0;
    return Math.max(0, differenceInCalendarDays(end, start));
  }, [start, end]);

  const [byDay, setByDay] = useState<Record<string, Place[]>>({});
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  function addPlace(dayKey: string, p: Place) {
    setByDay((s) => ({ ...s, [dayKey]: [...(s[dayKey] ?? []), p] }));
  }
  function removePlace(dayKey: string, idx: number) {
    setByDay((s) => {
      const cp = [...(s[dayKey] ?? [])];
      cp.splice(idx, 1);
      return { ...s, [dayKey]: cp };
    });
  }
  function move(dayKey: string, from: number, to: number) {
    setByDay((s) => {
      const arr = [...(s[dayKey] ?? [])];
      if (to < 0 || to >= arr.length) return s;
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return { ...s, [dayKey]: arr };
    });
  }

  const filtered = useMemo(() => {
    let arr = SUGGESTIONS;
    if (filterTag) arr = arr.filter((x) => x.tag === filterTag);
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter(
        (x) =>
          x.name.toLowerCase().includes(q) || x.city.toLowerCase().includes(q)
      );
    }
    return arr.slice(0, 8);
  }, [query, filterTag]);

  return (
    <div className="flex h-[calc(100dvh-64px)] w-full">
      {/* Panel izquierdo */}
      <section className="flex-1 min-w-0 border-r bg-background">
        {/* Header */}
        <div className="px-4 md:px-6 py-3 sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/65">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="inline-flex size-9 items-center justify-center rounded-full bg-palette-blue text-primary-foreground">
                <IconMapSearch className="size-5" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-semibold leading-tight">
                  Constructor de Itinerario
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {region !== "—" && (
                    <span className="inline-flex items-center gap-1 mr-2">
                      <IconMapPinFilled className="size-3.5 opacity-70" />{" "}
                      {region}
                    </span>
                  )}
                  {start && end && (
                    <span className="inline-flex items-center gap-1">
                      <IconCalendar className="size-3.5 opacity-70" />
                      {format(start, "d 'de' MMM", { locale: es })} —{" "}
                      {format(end, "d 'de' MMM", { locale: es })}
                      <span className="ml-1 text-muted-foreground">
                        ({nights} {nights === 1 ? "noche" : "noches"})
                      </span>
                    </span>
                  )}
                </p>
              </div>
            </div>

            <button className="hidden md:inline-flex h-9 items-center gap-1 rounded-md px-3 bg-palette-blue text-primary-foreground hover:opacity-90">
              <IconDeviceFloppy className="size-4" /> Guardar
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="h-[calc(100dvh-64px-56px)] overflow-auto px-4 md:px-6 py-4 md:py-6 space-y-6">
          {/* Buscador + filtros */}
          <div className="rounded-lg border p-4">
            <div className="flex items-start md:items-center justify-between gap-3 flex-col md:flex-row">
              <div className="w-full md:max-w-[520px]">
                <PlaceSearch
                  query={query}
                  onQuery={setQuery}
                  data={filtered}
                  onPick={(p) => {
                    const first = days[0]?.key;
                    if (first) addPlace(first, p);
                  }}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    className={
                      "px-2.5 py-1 rounded-full border text-sm " +
                      (filterTag === c
                        ? "bg-palette-blue text-primary-foreground border-transparent"
                        : "")
                    }
                    onClick={() =>
                      setFilterTag((prev) => (prev === c ? null : c))
                    }
                  >
                    {c}
                  </button>
                ))}
                {filterTag && (
                  <button
                    className="text-sm flex items-center gap-1 hover:underline"
                    onClick={() => setFilterTag(null)}
                  >
                    <IconX className="size-4" /> Limpiar filtros
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Días */}
          <div className="space-y-4">
            {(days.length
              ? days
              : [{ key: "nodate", date: undefined as any }]
            ).map((d, idx) => (
              <DayCard
                key={d.key}
                dayIndex={idx}
                date={d.date}
                places={byDay[d.key] ?? []}
                onSuggest={() => {
                  const pick =
                    SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)];
                  addPlace(d.key, pick);
                }}
                onMove={(from, to) => move(d.key, from, to)}
                onRemove={(i) => removePlace(d.key, i)}
                onQuickAdd={(p) => addPlace(d.key, p)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Panel derecho (mapa) */}
      <aside className="hidden md:flex w-[44%] xl:w-[46%] 2xl:w-[48%] bg-muted/20">
        <MapPlaceholder />
      </aside>
    </div>
  );
}
