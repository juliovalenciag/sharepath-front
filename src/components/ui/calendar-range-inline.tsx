"use client";

import * as React from "react";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  startOfMonth,
  startOfToday,
  startOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

type Props = {
  value?: { start?: Date | null; end?: Date | null };
  onChange: (v: { start?: Date | null; end?: Date | null }) => void;
  maxDays?: number; // default 7
};

export default function CalendarRangeInline({
  value,
  onChange,
  maxDays = 7,
}: Props) {
  const today = startOfToday();
  const [anchorMonth, setAnchorMonth] = React.useState<Date>(
    value?.start ?? today
  );

  const start = value?.start ?? null;
  const end = value?.end ?? null;

  /* ------- helpers ------- */
  const weeksShort = ["L", "M", "X", "J", "V", "S", "D"];

  function monthGrid(date: Date) {
    const start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(date), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }

  function handleDayClick(day: Date) {
    if (!start || (start && end)) {
      onChange({ start: day, end: null });
      return;
    }
    let s = start;
    let e = day;
    if (isBefore(e, s)) {
      const tmp = s;
      s = e;
      e = tmp;
    }
    const allowedEnd = addDays(s, maxDays - 1);
    if (isAfter(e, allowedEnd)) e = allowedEnd;
    onChange({ start: s, end: e });
  }

  function isInRange(d: Date) {
    return !!(start && end && isWithinInterval(d, { start, end }));
  }

  function isRangeStart(d: Date) {
    return !!(start && isSameDay(d, start));
  }

  function isRangeEnd(d: Date) {
    return !!(end && isSameDay(d, end));
  }

  function nextMonth() {
    setAnchorMonth((m) => addMonths(m, 1));
  }
  function prevMonth() {
    setAnchorMonth((m) => addMonths(m, -1));
  }

  // 1 mes en <1024px, 2 meses en >=1024px
  const singleMonth = typeof window !== "undefined" && window.innerWidth < 1024;
  const leftMonth = anchorMonth;
  const rightMonth = addMonths(anchorMonth, 1);

  function Header({ month }: { month: Date }) {
    return (
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">
          {format(month, "MMMM yyyy", { locale: es })}
        </div>
      </div>
    );
  }

  function Month({ month }: { month: Date }) {
    const days = monthGrid(month);
    return (
      <div className="rounded-xl border bg-background/60 p-2">
        <Header month={month} />
        <div className="grid grid-cols-7 text-center text-[11px] text-muted-foreground mb-1">
          {weeksShort.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((d) => {
            const outside = !isSameMonth(d, month);
            const inRange = isInRange(d);
            const startDot = isRangeStart(d);
            const endDot = isRangeEnd(d);

            let exceeding = false;
            if (start && !end) {
              const allowedEnd = addDays(start, maxDays - 1);
              exceeding = isAfter(d, allowedEnd) && isAfter(d, start);
            }

            const base =
              "relative select-none rounded-lg text-sm py-1.5 lg:py-2";
            const muted = outside ? "text-muted-foreground/40" : "";
            const hover = "cursor-pointer hover:bg-muted";
            const selected =
              startDot || endDot
                ? "bg-[var(--palette-blue)] text-[var(--primary-foreground)]"
                : inRange
                ? "bg-[color:var(--palette-blue-weak)]"
                : "";

            return (
              <button
                key={d.toISOString()}
                type="button"
                onClick={() => handleDayClick(d)}
                className={[
                  base,
                  hover,
                  muted,
                  selected,
                  exceeding ? "pointer-events-none opacity-35" : "",
                ].join(" ")}
                aria-pressed={startDot || endDot || inRange}
                aria-label={format(d, "PPP", { locale: es })}
                style={
                  {
                    "--palette-blue": "rgb(59 130 246)",
                    "--palette-blue-weak":
                      "color-mix(in oklab, var(--palette-blue) 18%, transparent)",
                  } as React.CSSProperties
                }
              >
                <span className="relative z-[1]">
                  {format(d, "d", { locale: es })}
                </span>

                {startDot && (
                  <span className="absolute inset-y-0 left-0 w-1 rounded-l-lg bg-[var(--palette-blue)]" />
                )}
                {endDot && (
                  <span className="absolute inset-y-0 right-0 w-1 rounded-r-lg bg-[var(--palette-blue)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border p-3 bg-card/70"
      style={{ "--palette-blue": "rgb(59 130 246)" } as React.CSSProperties}
      aria-label="Calendario de rango"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-muted-foreground">
          Selecciona un rango de 1 a {maxDays} días
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="h-8 w-8 inline-flex items-center justify-center rounded-md border hover:bg-muted"
            onClick={prevMonth}
            aria-label="Mes anterior"
          >
            <IconChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="h-8 w-8 inline-flex items-center justify-center rounded-md border hover:bg-muted"
            onClick={nextMonth}
            aria-label="Mes siguiente"
          >
            <IconChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        className={
          singleMonth
            ? "grid grid-cols-1 gap-3"
            : "grid grid-cols-1 lg:grid-cols-2 gap-3"
        }
      >
        <Month month={leftMonth} />
        {!singleMonth && <Month month={rightMonth} />}
      </div>

      {/* Presets */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {/* <button
          type="button"
          className="text-xs px-2 py-1 rounded-md border hover:bg-muted"
          onClick={() => {
            const s = startOfToday();
            onChange({ start: s, end: addDays(s, 1) });
          }}
        >
          Fin de semana
        </button> */}
        <button
          type="button"
          className="text-xs px-2 py-1 rounded-md border hover:bg-muted"
          onClick={() => {
            const s = startOfToday();
            onChange({ start: s, end: addDays(s, Math.min(6, maxDays - 1)) });
          }}
        >
          Próx. {Math.min(7, maxDays)} días
        </button>
        <button
          type="button"
          className="text-xs px-2 py-1 rounded-md border hover:bg-muted"
          onClick={() => onChange({ start: null, end: null })}
        >
          Limpiar
        </button>
      </div>
    </div>
  );
}
