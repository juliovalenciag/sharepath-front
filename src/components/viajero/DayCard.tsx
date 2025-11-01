"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  IconPlus,
  IconArrowUp,
  IconArrowDown,
  IconTrash,
} from "@tabler/icons-react";
import { type Place, SUGGESTIONS } from "../../lib/constants";

export default function DayCard({
  dayIndex,
  date,
  places,
  onSuggest,
  onMove,
  onRemove,
  onQuickAdd,
}: {
  dayIndex: number;
  date?: Date;
  places: Place[];
  onSuggest: () => void;
  onMove: (from: number, to: number) => void;
  onRemove: (i: number) => void;
  onQuickAdd: (p: Place) => void;
}) {
  const quick = React.useMemo(() => SUGGESTIONS.slice(0, 6), []);

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm text-muted-foreground">
            Día {dayIndex + 1}
            {date
              ? ` • ${format(date, "EEEE d 'de' MMM", { locale: es })}`
              : ""}
          </p>
          <h3 className="text-base font-semibold">Lugares para visitar</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="h-8 px-3 rounded-md border hover:bg-muted inline-flex items-center gap-1"
            onClick={onSuggest}
          >
            <IconPlus className="size-4" /> Sugerir
          </button>
        </div>
      </div>

      {/* Sugerencias rápidas */}
      <div className="flex gap-2 flex-wrap">
        {quick.map((p) => (
          <button
            key={p.id}
            className="px-3 py-1.5 rounded-full border text-sm hover:bg-muted transition"
            onClick={() => onQuickAdd(p)}
          >
            + {p.name}
          </button>
        ))}
      </div>

      {/* Lista actual */}
      <ul className="mt-3 space-y-2">
        {places.length === 0 && (
          <li className="text-sm text-muted-foreground">
            Aún no hay lugares. Usa el buscador o “Sugerir”.
          </li>
        )}

        {places.map((p, i) => (
          <li key={`${p.id}-${i}`}>
            <div className="group flex items-center justify-between gap-2 rounded-lg border bg-card/40 p-2">
              <div className="min-w-0">
                <p className="truncate font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {p.city} • {p.tag}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="size-8 grid place-items-center rounded-md border"
                  onClick={() => onMove(i, i - 1)}
                  aria-label="Mover arriba"
                >
                  <IconArrowUp className="size-4" />
                </button>
                <button
                  className="size-8 grid place-items-center rounded-md border"
                  onClick={() => onMove(i, i + 1)}
                  aria-label="Mover abajo"
                >
                  <IconArrowDown className="size-4" />
                </button>
                <button
                  className="size-8 grid place-items-center rounded-md border text-red-600"
                  onClick={() => onRemove(i)}
                  aria-label="Eliminar"
                >
                  <IconTrash className="size-4" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
