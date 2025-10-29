"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function CategoryChips({
  categories,
  active,
  onChange,
}: {
  categories: string[];
  active: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {categories.map((c) => (
        <Badge
          key={c}
          variant={active === c ? "default" : "outline"}
          className={cn(
            "cursor-pointer",
            active === c
              ? "bg-palette-blue text-primary-foreground border-transparent"
              : "hover:bg-muted"
          )}
          onClick={() => onChange(active === c ? null : c)}
        >
          {c}
        </Badge>
      ))}
      {active && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-sm text-muted-foreground hover:underline"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
