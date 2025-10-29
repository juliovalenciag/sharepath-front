"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function CategoryChips({
  categories,
  initialSelected = [],
  multiselect = true,
  onChange,
  className,
}: {
  categories: string[];
  initialSelected?: string[];
  multiselect?: boolean;
  onChange?: (sel: string[]) => void;
  className?: string;
}) {
  const [sel, setSel] = React.useState<string[]>(initialSelected);

  React.useEffect(() => onChange?.(sel), [sel, onChange]);

  function toggle(c: string) {
    setSel((prev) => {
      if (multiselect) {
        return prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c];
      }
      return prev.includes(c) ? [] : [c];
    });
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-muted-foreground">Filtrar por categoría</p>
        {!!sel.length && (
          <button
            onClick={() => setSel([])}
            className="text-xs underline text-muted-foreground hover:text-foreground"
          >
            Limpiar
          </button>
        )}
      </div>

      <div className="relative">
        <div className="flex gap-2 overflow-x-auto mask-fade-x py-1">
          {categories.map((c) => {
            const active = sel.includes(c);
            return (
              <Badge
                key={c}
                onClick={() => toggle(c)}
                className={cn(
                  "cursor-pointer rounded-full px-3 py-1.5 text-xs select-none border",
                  active
                    ? "bg-[var(--palette-blue)] text-[var(--primary-foreground)] border-transparent"
                    : "bg-background hover:bg-muted"
                )}
              >
                {c}
              </Badge>
            );
          })}
          {/* “+ Más” si tienes muchas categorías (opcional) */}
          <span className="hidden md:inline text-xs text-muted-foreground pl-1">
            {categories.length > 10 ? "+ Más" : ""}
          </span>
        </div>
        {/* marca sutil inferior */}
        <div className="pointer-events-none absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
      </div>
    </div>
  );
}
