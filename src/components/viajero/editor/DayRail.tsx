"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

export function DayRail({ days }: { days: { key: string; date?: Date }[] }) {
  // expand on hover (desktop) / tap button (mobile)
  const [expanded, setExpanded] = React.useState(false);

  return (
    <nav
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={cn(
        "group relative h-full border-r bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60 transition-[width] duration-200",
        expanded ? "w-[240px]" : "w-[72px]"
      )}
    >
      {/* Handle para móvil */}
      <button
        className="absolute -right-3 top-4 md:hidden z-10 rounded-full border bg-background px-2 py-1 text-xs"
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded ? "‹" : "›"}
      </button>

      <div className="h-full overflow-hidden">
        <div className={cn("px-3 py-3 text-sm font-semibold")}>Resumen</div>
        <ul className="space-y-2 px-2">
          {days.map((d, i) => {
            const date = d.date;
            const labelShort = date
              ? `${format(date, "EEE", { locale: es }).toUpperCase()} ${format(
                  date,
                  "dd",
                  { locale: es }
                )}`
              : `DÍA ${i + 1}`;
            const labelFull = date
              ? `${format(date, "EEE dd 'de' MMM", { locale: es })}`
              : `Día ${i + 1}`;

            return (
              <li key={d.key}>
                <button
                  className={cn(
                    "w-full rounded-lg border text-left transition-colors hover:bg-muted focus:outline-none",
                    "grid items-center",
                    expanded ? "grid-cols-[28px_1fr]" : "grid-cols-1"
                  )}
                >
                  {/* punto / ícono */}
                  <span className="flex items-center justify-center py-2">
                    <span className="inline-flex size-2.5 rounded-full bg-palette-blue" />
                  </span>
                  {/* texto */}
                  <span
                    className={cn(
                      "truncate pr-2",
                      expanded ? "block" : "hidden"
                    )}
                  >
                    {labelFull}
                  </span>
                  {/* comprimido */}
                  <span
                    className={cn(
                      "text-xs py-2 text-center",
                      expanded ? "hidden" : "block"
                    )}
                  >
                    {labelShort}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
