// components/viajero/Stepper.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

type Step = { id: string; label: string };

export function Stepper({
  steps,
  activeIndex = 0,
}: {
  steps: Step[];
  activeIndex?: number;
}) {
  return (
    <ol className="flex w-full max-w-md items-center justify-center gap-4">
      {steps.map((s, idx) => {
        const active = idx === activeIndex;
        return (
          <li key={s.id} className="flex flex-col items-center">
            <div
              className={cn(
                "size-8 rounded-full border inline-flex items-center justify-center text-xs font-semibold",
                active
                  ? "bg-palette-blue text-primary-foreground border-transparent"
                  : "bg-background text-foreground border-border"
              )}
            >
              {s.id}
            </div>
            <span
              className={cn(
                "mt-1 text-xs",
                active ? "text-foreground font-medium" : "text-muted-foreground"
              )}
            >
              {s.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
