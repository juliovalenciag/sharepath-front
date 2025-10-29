"use client";
import * as React from "react";
import { format, eachDayOfInterval, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import type { ViewDay } from "@/lib/constants/view-types";

export function TripCalendarStrip({
  days,
  onPick,
}: {
  days: ViewDay[];
  onPick?: (idx: number) => void;
}) {
  const start = new Date(days[0]?.dateISO ?? Date.now());
  const end = new Date(days[days.length - 1]?.dateISO ?? Date.now());
  const all = eachDayOfInterval({ start, end: addDays(end, 0) });
  const covered = new Set(
    days.map((d) => format(new Date(d.dateISO), "yyyy-MM-dd"))
  );

  return (
    <Card className="p-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold">Calendario</h4>
        <p className="text-xs text-muted-foreground">
          {format(start, "d MMM", { locale: es })} –{" "}
          {format(end, "d MMM", { locale: es })}
        </p>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {all.map((d, i) => {
          const key = format(d, "yyyy-MM-dd");
          const isCovered = covered.has(key);
          return (
            <button
              key={i}
              className={[
                "aspect-square rounded-md text-xs",
                "border grid place-items-center",
                isCovered
                  ? "bg-[color-mix(in_oklch,var(--palette-blue)_20%,transparent)] border-[var(--palette-blue)]"
                  : "bg-muted/40",
              ].join(" ")}
              onClick={() => {
                const idx = days.findIndex(
                  (x) => format(new Date(x.dateISO), "yyyy-MM-dd") === key
                );
                if (idx >= 0 && onPick) onPick(idx);
              }}
              title={format(d, "eee d", { locale: es })}
            >
              {format(d, "d")}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
