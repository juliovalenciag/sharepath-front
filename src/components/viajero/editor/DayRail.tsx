"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

export type RailDay = {
  key: string;
  date?: Date;
  label?: string;
  day?: number;
};

export function DayRail({
  days,
  activeKey,
  onPick,
  className,
}: {
  days: RailDay[];
  activeKey?: string;
  onPick?: (index: number) => void;
  className?: string;
}) {
  const list = React.useMemo(
    () =>
      days.map((d) => {
        const lbl = d.date
          ? format(d.date, "EEE", { locale: es })
          : d.label ?? "";
        const dd = d.date ? Number(format(d.date, "d")) : d.day ?? 0;
        return {
          ...d,
          _label: (lbl || "").toString(),
          _day: Number.isFinite(dd) ? dd : 0,
        };
      }),
    [days]
  );
  const active = Math.max(
    0,
    list.findIndex((x) => x.key === activeKey)
  );

  return (
    <div
      className={cn(
        "h-full w-[var(--editor-rail-w,64px)] flex flex-col items-center gap-2 py-3 border-r bg-background/90",
        "supports-[backdrop-filter]:backdrop-blur",
        className
      )}
    >
      <ol className="flex-1 flex flex-col items-stretch gap-2">
        {list.map((d, i) => {
          const is = i === active;
          const tip = `${d._label.slice(0, 3).toUpperCase()} ${String(
            d._day
          ).padStart(2, "0")}`;
          return (
            <li key={d.key}>
              <button
                type="button"
                title={tip}
                aria-label={tip}
                onClick={() => onPick?.(i)}
                className={cn(
                  "relative w-11 h-11 rounded-full grid place-content-center text-xs border shadow-sm transition",
                  is
                    ? "bg-[var(--palette-blue)] text-[var(--primary-foreground)] border-transparent"
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                <span className="leading-none font-semibold">
                  {String(d._day).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "absolute -left-1 -top-1 text-[9px] px-1 py-0.5 rounded",
                    is
                      ? "bg-[var(--palette-blue)] text-[var(--primary-foreground)]"
                      : "bg-accent text-accent-foreground"
                  )}
                >
                  {d._label.slice(0, 3).toUpperCase()}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <button
        type="button"
        className="mb-1 size-6 grid place-content-center rounded-md border bg-background text-xs"
        title="(Opcional) colapsar"
        aria-label="Colapsar"
      >
        »
      </button>
    </div>
  );
}
