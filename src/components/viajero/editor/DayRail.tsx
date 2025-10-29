
"use client";
import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useTrip } from "@/stores/trip-store";

export type RailDay = { key: string; date: Date };

export function DayRail({ days }: { days: RailDay[] }) {
  const { activeDayKey, setActiveDay } = useTrip();
  React.useEffect(() => {
    if (!activeDayKey && days[0]) setActiveDay(days[0].key);
  }, [activeDayKey, days, setActiveDay]);

  return (
    <aside
      className={cn(
        "z-rail h-[calc(100dvh-64px)] w-[64px] md:w-[72px]",
        "bg-background/90 supports-[backdrop-filter]:backdrop-blur border-r",
        "flex flex-col items-center gap-2 py-3 sticky top-[64px]"
      )}
    >
      <ol className="flex-1 flex flex-col gap-2">
        {days.map((d) => {
          const label = format(d.date, "EEE", { locale: es })
            .slice(0, 3)
            .toUpperCase();
          const num = format(d.date, "dd");
          const active = activeDayKey === d.key;
          return (
            <li key={d.key}>
              <button
                type="button"
                title={`${label} ${num}`}
                onClick={() => setActiveDay(d.key)}
                className={cn(
                  "relative grid place-content-center w-11 h-11 rounded-full border text-xs",
                  active
                    ? "bg-foreground text-background"
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                <span className="font-semibold leading-none">{num}</span>
                <span
                  className={cn(
                    "absolute -left-1 -top-1 text-[9px] px-1 py-0.5 rounded",
                    active ? "bg-foreground text-background" : "bg-muted"
                  )}
                >
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
