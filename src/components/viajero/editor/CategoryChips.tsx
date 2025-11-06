"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export function CategoryChips({
  categories,
  value,
  onChange,
  className,
}: {
  categories: string[];
  value?: string | null;
  onChange?: (next: string | null) => void;
  className?: string;
}) {
  const [active, setActive] = React.useState<string | null>(value ?? null);

  React.useEffect(() => {
    if (value !== undefined) setActive(value);
  }, [value]);

  return (
    <div
      className={cn(
        "sticky top-[calc(64px+12px)] z-30", // queda debajo del header, no se sobrepone
        "bg-[var(--card)]/90 backdrop-blur rounded-[var(--radius)] border p-2",
        "flex flex-wrap gap-2",
        className
      )}
    >
      {categories.map((c) => {
        const is = active === c;
        return (
          <button
            key={c}
            onClick={() => {
              const next = is ? null : c;
              setActive(next);
              onChange?.(next);
            }}
            className={cn(
              "px-3 h-8 rounded-full text-sm border transition",
              is
                ? "bg-[var(--palette-blue)] text-[var(--primary-foreground)] border-transparent"
                : "bg-background hover:bg-muted"
            )}
          >
            {c}
          </button>
        );
      })}
      {active && (
        <button
          onClick={() => {
            setActive(null);
            onChange?.(null);
          }}
          className="ml-auto text-sm underline text-muted-foreground"
        >
          Limpiar
        </button>
      )}
    </div>
  );
}
