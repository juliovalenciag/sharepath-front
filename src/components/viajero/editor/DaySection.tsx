// src/components/viajero/editor/DaySection.tsx
"use client";
import * as React from "react";
import { IconArrowDown, IconArrowUp, IconTrash } from "@tabler/icons-react";
import { useTrip, type Place } from "@/stores/trip-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function DaySection({
  title = "Lugares para visitar",
  dayKey,
  date,
  recommended,
}: {
  title?: string;
  dayKey: string;
  date?: Date;
  recommended: Place[];
}) {
  const { byDay, addPlace, removePlace, movePlace, selectPlace } = useTrip();
  const items = byDay[dayKey] ?? [];

  return (
    <Card className="p-4 md:p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {date && (
            <p className="text-xs text-muted-foreground">
              {format(date, "EEEE d 'de' MMM", { locale: es })}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-3">
        {/* Lista actual */}
        <ul className="space-y-2">
          {items.length === 0 && (
            <li className="text-sm text-muted-foreground">
              Aún no hay lugares. Usa el buscador o el carrusel de abajo.
            </li>
          )}
          {items.map((p, i) => (
            <li key={`${p.id}-${i}`} className="group">
              <div className="flex items-center justify-between gap-2 rounded-lg border bg-card/50 p-2">
                <button
                  className="flex items-center gap-3 min-w-0 text-left"
                  onClick={() => selectPlace(p)}
                  title="Ver detalle en mapa"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="size-12 rounded object-cover border"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.city} • {p.tag}
                    </p>
                  </div>
                </button>
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
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Recomendados (horizontal) */}
        <div>
          <p className="text-sm font-medium mb-2">Lugares recomendados</p>
          <div className="mask-fade-x overflow-x-auto">
            <div className="flex gap-3 pr-3">
              {recommended.map((p) => (
                <button
                  key={`rec-${p.id}`}
                  onClick={() => addPlace(dayKey, p)}
                  className="min-w-[260px] rounded-lg border hover:bg-muted/40 overflow-hidden text-left"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-28 w-full object-cover"
                  />
                  <div className="p-2">
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
      </div>
    </Card>
  );
}
