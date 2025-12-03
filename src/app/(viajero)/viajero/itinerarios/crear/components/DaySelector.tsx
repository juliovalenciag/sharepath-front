// src/app/(viajero)/viajero/itinerarios/crear/components/DaySelector.tsx
"use client";

import React from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface DayInfo {
  key: string;
  date: Date;
  label: string;
  subtitle: string;
}

interface DaySelectorProps {
  days: DayInfo[];
  selectedDayKey: string | null;
  onSelect: (key: string) => void;
}

export function DaySelector({
  days,
  selectedDayKey,
  onSelect,
}: DaySelectorProps) {
  return (
    <div className="border-b bg-muted/30 dark:bg-muted/10">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex p-2 gap-2">
          {days.map((day) => {
            const isSelected = selectedDayKey === day.key;
            return (
              <button
                key={day.key}
                onClick={() => onSelect(day.key)}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[84px] px-3 py-2 rounded-lg text-sm border transition-all duration-200 select-none",
                  isSelected
                    ? "bg-background border-primary shadow-sm ring-1 ring-primary/20 scale-[1.02]"
                    : "bg-transparent border-transparent text-muted-foreground hover:bg-background/50 hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "text-xs font-bold uppercase tracking-wider",
                    isSelected ? "text-primary" : ""
                  )}
                >
                  {day.label}
                </span>
                <span className="text-[10px] opacity-80 font-medium">
                  {day.subtitle}
                </span>
              </button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}
