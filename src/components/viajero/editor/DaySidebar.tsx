"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Place } from "@/lib/constants/mock";

export function DaySidebar({
  days,
  byDay,
}: {
  days: { key: string; date?: Date }[];
  byDay: Record<string, Place[]>;
}) {
  return (
    <div className="h-full">
      <div className="px-4 py-3 border-b text-sm font-semibold">Resumen</div>
      <div className="p-3 space-y-2">
        {days.map((d, i) => {
          const count = byDay[d.key]?.length ?? 0;
          return (
            <button
              key={d.key}
              className="w-full text-left rounded-lg border bg-card/50 hover:bg-muted px-3 py-2"
              title={`Día ${i + 1}`}
            >
              <p className="text-sm font-medium">Día {i + 1}</p>
              <p className="text-xs text-muted-foreground">
                {d.date
                  ? format(d.date, "EEE d 'de' MMM", { locale: es })
                  : "Sin fecha"}
                {count ? ` • ${count} lugar${count === 1 ? "" : "es"}` : ""}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
