"use client";
import * as React from "react";
import { IconArrowDown, IconArrowUp, IconTrash } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useTrip, type Place } from "@/stores/trip-store";

export function DaySection({
  dayKey,
  date,
  recommended,
}: {
  dayKey: string;
  date: Date;
  recommended: Place[];
}) {
  const { byDay, addPlace, removePlace, movePlace, selectPlace } = useTrip();
  const items = byDay[dayKey] ?? [];

  return (
    <section aria-labelledby={`h-${dayKey}`} className="space-y-3">
      <header className="flex items-center justify-between">
        <div>
          <h2 id={`h-${dayKey}`} className="text-xl md:text-2xl font-bold">
            {format(date, "EEEE, MMMM dº", { locale: es })}
          </h2>
          <p className="text-muted-foreground text-sm">Añadir subtítulo</p>
        </div>
        <div className="flex items-center gap-3 text-[var(--palette-blue)]">
          <button className="font-semibold">Rellenar día</button>
          <span>·</span>
          <button className="font-semibold">Optimizar ruta</button>
        </div>
      </header>

      {/* Lista del día */}
      <Card className="divide-y border">
        {items.length === 0 && (
          <div className="p-4 text-sm text-muted-foreground">
            No hay lugares aún. Usa el buscador o las recomendaciones de abajo.
          </div>
        )}
        {items.map((p, i) => (
          <article
            key={`${p.id}-${i}`}
            className="p-3 md:p-4 flex gap-3 md:gap-4"
          >
            <div className="shrink-0 size-12 rounded-md overflow-hidden border">
              <img
                src={p.img}
                alt={p.name}
                className="size-full object-cover"
              />
            </div>

            <div className="min-w-0 grow">
              <h3 className="font-semibold leading-tight">
                {i + 1}. {p.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {p.city} • {p.tag} — Añadir notas, enlaces, etc.
              </p>
              <div className="mt-2 text-xs text-muted-foreground flex items-center gap-4">
                <span>🚶‍♂️ 6 mins · 0.31 mi</span>
                <button className="underline">Direcciones</button>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => movePlace(dayKey, i, i - 1)}
              >
                <IconArrowUp className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => movePlace(dayKey, i, i + 1)}
              >
                <IconArrowDown className="size-4" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                className="size-8"
                onClick={() => removePlace(dayKey, i)}
              >
                <IconTrash className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectPlace(p)}
              >
                Ver en mapa
              </Button>
            </div>
          </article>
        ))}
      </Card>

      {/* Añadir un lugar (input visual) */}
      <div className="rounded-xl border bg-muted/40 flex items-center gap-3 px-4 h-12 text-muted-foreground">
        <span>📍</span> Añadir un lugar
      </div>

      {/* Quick chips del día */}
      <div>
        <p className="text-sm font-medium mb-2">Lugares recomendados</p>
        <div className="mask-fade-x overflow-x-auto">
          <div className="flex gap-3 pr-3">
            {recommended.map((p) => (
              <button
                key={p.id}
                onClick={() => addPlace(dayKey, p)}
                className="min-w-[260px] rounded-lg border overflow-hidden bg-card hover:bg-muted/50"
                title={`Añadir ${p.name}`}
              >
                <img
                  src={p.img}
                  alt={p.name}
                  className="h-28 w-full object-cover"
                />
                <div className="p-2 text-left">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.city} • {p.tag}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
