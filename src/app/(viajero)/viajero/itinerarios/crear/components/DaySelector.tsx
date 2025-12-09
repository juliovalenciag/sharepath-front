// src/app/(viajero)/viajero/itinerarios/crear/components/DaySelector.tsx
"use client";

import React from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { CalendarDays } from "lucide-react";

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
    <div className="relative border-b bg-background/95 backdrop-blur-sm z-10 shadow-sm">
      
      {/* Máscaras de degradado para indicar scroll (Izquierda/Derecha) */}
      <div className="absolute left-0 top-0 bottom-0 w-6  z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-6  z-20 pointer-events-none" />

      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex items-center p-3 gap-3">
          {days.map((day) => {
            const isSelected = selectedDayKey === day.key;
            return (
              <button
                key={day.key}
                onClick={() => onSelect(day.key)}
                className={cn(
                  "group relative flex flex-col items-center justify-center min-w-[72px] h-[64px] px-2 rounded-xl transition-all duration-300 ease-out select-none border",
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground shadow-md scale-105 ring-2 ring-primary/20"
                    : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted hover:border-border/50 hover:text-foreground"
                )}
              >
                {/* Indicador superior (solo visible si está activo) */}
                {isSelected && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-white/20 rounded-full " />
                )}

                <span
                  className={cn(
                    "text-[10px] font-extrabold uppercase tracking-widest leading-none mb-1",
                    isSelected ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                  )}
                >
                  {day.label.replace("Día", "DÍA")}
                </span>
                
                <span className={cn(
                    "text-xs font-semibold leading-none flex items-center gap-1",
                    isSelected ? "text-white dark:text-black" : ""
                )}>
                   {day.subtitle}
                </span>

                {/* Icono sutil de fondo para decoración en estado inactivo */}
                {!isSelected && (
                    <CalendarDays className="absolute opacity-[0.03] w-8 h-8 -rotate-12" />
                )}
              </button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}