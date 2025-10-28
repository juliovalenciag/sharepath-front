"use client";

import * as React from "react";
import { DateRange, RangeKeyDict } from "react-date-range";
import { es } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

/* Hook para MQ sin dependencias externas */
function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false);
  React.useEffect(() => {
    const media = window.matchMedia(query);
    const handler = () => setMatches(media.matches);
    handler();
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

type Props = {
  value?: { start?: Date | null; end?: Date | null };
  onChange: (v: { start?: Date | null; end?: Date | null }) => void;
  trigger: React.ReactNode; // botón/entrada que abre el calendario
};

export default function DateRangePicker({ value, onChange, trigger }: Props) {
  const [open, setOpen] = React.useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const ranges = [
    {
      startDate: value?.start ?? undefined,
      endDate: value?.end ?? undefined,
      key: "selection",
    } as const,
  ];

  function handleChange(r: RangeKeyDict) {
    const sel = r.selection;
    onChange({ start: sel.startDate ?? null, end: sel.endDate ?? null });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-auto p-0 rounded-lg bg-card shadow-xl border"
      >
        <DateRange
          ranges={ranges}
          onChange={handleChange}
          months={isMobile ? 1 : 2}
          direction={isMobile ? "vertical" : "horizontal"}
          locale={es}
          showDateDisplay={false}
          editableDateInputs={false}
          moveRangeOnFirstSelection={false}
          rangeColors={["transparent"]} /* colores los define el CSS */
        />

        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <button
            type="button"
            className="text-sm text-muted-foreground hover:underline"
            onClick={() => {
              onChange({ start: undefined, end: undefined });
              setOpen(false);
            }}
          >
            Limpiar
          </button>
          <button
            type="button"
            className="px-4 py-1.5 text-sm rounded-md bg-palette-blue text-primary-foreground hover:opacity-90 transition-opacity"
            onClick={() => setOpen(false)}
          >
            Hecho
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
