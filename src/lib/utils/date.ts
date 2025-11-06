// lib/utils/date.ts
import { eachDayOfInterval, differenceInCalendarDays, parseISO } from "date-fns";

export function safeParseISO(v: string | null): Date | null {
  if (!v) return null;
  try {
    const d = parseISO(v);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

export function buildDays(start: Date | null, end: Date | null) {
  if (!start || !end) return [];
  const interval = eachDayOfInterval({ start, end });
  return interval.map((d, idx) => ({
    key: `day-${idx}`,
    date: d,
  }));
}

export function countNights(start: Date | null, end: Date | null) {
  if (!start || !end) return 0;
  return Math.max(0, differenceInCalendarDays(end, start));
}
