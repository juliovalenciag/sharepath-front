"use client";

import React, { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Tooltip,
  useMap,
} from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

export type MapActivity = {
  id: string;
  nombre: string;
  lat: number;
  lng: number;
  fecha: Date;
  start_time?: string | null;
};

export type DayInfo = {
  key: string;
  date: Date;
  label: string;
  subtitle: string;
};

export type CinematicMapProps = {
  activities: MapActivity[];
  days: DayInfo[];
  selectedDayKey: string | null;
  onSelectDay: (key: string) => void;
};

function dayKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

/**
 * Ajusta la vista del mapa al conjunto de actividades del día seleccionado
 */
function FitToDayBounds({
  activities,
  selectedDayKey,
}: {
  activities: MapActivity[];
  selectedDayKey: string | null;
}) {
  const map = useMap();

  const dayActivities = useMemo(() => {
    if (!activities.length) return [] as MapActivity[];
    if (!selectedDayKey) return activities;
    return activities.filter((a) => dayKey(a.fecha) === selectedDayKey);
  }, [activities, selectedDayKey]);

  useEffect(() => {
    if (!map || dayActivities.length === 0) return;

    const bounds = L.latLngBounds(
      dayActivities.map((a) => [a.lat, a.lng] as LatLngExpression)
    );
    map.flyToBounds(bounds, { padding: [40, 40], duration: 0.8 });
  }, [map, dayActivities]);

  return null;
}

export function CinematicMap({
  activities,
  days,
  selectedDayKey,
  onSelectDay,
}: CinematicMapProps) {
  const hasActivities = activities.length > 0;

  const effectiveDayKey = selectedDayKey ?? (days.length ? days[0].key : null);

  const visibleActivities = useMemo(() => {
    if (!effectiveDayKey) return [] as MapActivity[];
    return activities
      .filter((a) => dayKey(a.fecha) === effectiveDayKey)
      .sort((a, b) => {
        const at = a.start_time ?? "";
        const bt = b.start_time ?? "";
        return at.localeCompare(bt);
      });
  }, [activities, effectiveDayKey]);

  const center: LatLngExpression = hasActivities
    ? [activities[0].lat, activities[0].lng]
    : ([19.4326, -99.1332] as LatLngExpression); // CDMX como fallback

  const polyline: LatLngExpression[] =
    visibleActivities.length >= 2
      ? visibleActivities.map((a) => [a.lat, a.lng] as LatLngExpression)
      : [];

  return (
    <div className="relative z-0 h-full w-full overflow-hidden rounded-t-none border-l bg-background md:rounded-none">
      {/* Controles flotantes (pestañas de día + resumen) */}
      <div className="pointer-events-none absolute left-1/2 top-3 z-0 flex -translate-x-1/2 flex-col items-center gap-2">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-background/90 px-3 py-1 text-xs shadow-sm">
          <span className="font-medium">Vista del mapa</span>
          {effectiveDayKey && (
            <span className="rounded-full bg-muted px-2 py-[2px] text-[11px] text-muted-foreground">
              {visibleActivities.length} parada
              {visibleActivities.length === 1 ? "" : "s"} en este día
            </span>
          )}
        </div>

        {days.length > 0 && (
          <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-background/95 px-1 py-1 shadow-sm">
            {days.map((d) => {
              const active = d.key === effectiveDayKey;
              return (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => onSelectDay(d.key)}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-3 py-1 text-xs transition",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {d.label}
                  <span className="hidden text-[11px] opacity-80 sm:inline">
                    {d.subtitle}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <MapContainer
        center={center}
        zoom={13}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Ajuste automático a las paradas del día */}
        <FitToDayBounds
          activities={activities}
          selectedDayKey={effectiveDayKey}
        />

        {/* Ruta del día (simple polyline entre paradas) */}
        {polyline.length >= 2 && (
          <Polyline positions={polyline} weight={4} opacity={0.7} />
        )}

        {/* Marcadores */}
        {visibleActivities.map((a, index) => (
          <Marker key={a.id} position={[a.lat, a.lng]}>
            <Tooltip direction="top" offset={[0, -6]} opacity={1}>
              <div className="space-y-1 text-xs">
                <div className="font-semibold">{a.nombre}</div>
                <div className="text-[11px] text-muted-foreground">
                  {format(a.fecha, "d MMM", { locale: es })} ·{" "}
                  {a.start_time ?? "Sin horario"}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Parada #{index + 1}
                </div>
              </div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
