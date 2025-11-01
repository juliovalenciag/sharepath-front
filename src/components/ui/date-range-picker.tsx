"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { DateRange, RangeKeyDict } from "react-date-range";
import { es } from "date-fns/locale";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";


type Props = {
  value?: { start?: Date | null; end?: Date | null };
  onChange: (v: { start?: Date | null; end?: Date | null }) => void;
  trigger: (opts: {
    open: boolean;
    setOpen: (b: boolean) => void;
  }) => React.ReactNode;
};

export default function DateRangePicker({ value, onChange, trigger }: Props) {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const anchorRef = React.useRef<HTMLSpanElement | null>(null);

  React.useEffect(() => setMounted(true), []);

  // Cerrar con click fuera
  React.useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!open) return;
      const a = anchorRef.current;
      const pop = document.getElementById("drp-popover");
      if (!pop) return;
      if (a?.contains(e.target as Node) || pop.contains(e.target as Node))
        return;
      setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const ranges = [
    {
      startDate: value?.start ?? undefined,
      endDate: value?.end ?? undefined,
      key: "selection",
    } as any,
  ];

  function handleChange(r: RangeKeyDict) {
    const sel = r.selection;
    onChange({ start: sel.startDate ?? null, end: sel.endDate ?? null });
  }

  // Posicionamiento y colisiones
  function getStyle(): React.CSSProperties {
    const a = anchorRef.current!;
    const rect = a.getBoundingClientRect();
    const top = rect.bottom + window.scrollY + 8;
    let left = rect.left + window.scrollX;
    const width = 620; // aprox. 2 meses
    const margin = 12;
    const maxLeft = window.scrollX + window.innerWidth - width - margin;
    if (left > maxLeft) left = Math.max(margin + window.scrollX, maxLeft);
    return { top, left };
  }

  // Responsivo: 1 mes en móvil
  const months =
    typeof window !== "undefined" && window.innerWidth < 640 ? 1 : 2;

  return (
    <>
      <span ref={anchorRef}>{trigger({ open, setOpen })}</span>

      {mounted &&
        open &&
        anchorRef.current &&
        createPortal(
          <div
            id="drp-popover"
            className="fixed z-50"
            style={getStyle()}
            role="dialog"
            aria-label="Selector de rango de fechas"
          >
            <div className="rounded-lg bg-card shadow-xl border">
              <DateRange
                ranges={ranges}
                onChange={handleChange}
                months={months}
                direction={months === 1 ? "vertical" : "horizontal"}
                locale={es}
                showDateDisplay={false}
                editableDateInputs={false}
                moveRangeOnFirstSelection={false}
                // Importante: dale un color base para no depender de transparent
                rangeColors={["#4b8bd8"]}
              />
              <div className="flex items-center justify-between px-3 py-3 border-t">
                <button
                  className="text-sm text-muted-foreground hover:underline"
                  onClick={() => onChange({ start: undefined, end: undefined })}
                >
                  Limpiar
                </button>
                <button
                  className="px-3 py-1.5 text-sm rounded-md bg-[var(--palette-blue)] text-[var(--primary-foreground)]"
                  onClick={() => setOpen(false)}
                >
                  Ok
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
