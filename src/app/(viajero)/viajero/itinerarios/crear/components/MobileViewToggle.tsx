// src/app/(viajero)/viajero/itinerarios/crear/components/MobileViewToggle.tsx
"use client";

import React from "react";
import { List, Map as MapIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileViewToggleProps {
  view: "list" | "map";
  onChange: (view: "list" | "map") => void;
}

export function MobileViewToggle({ view, onChange }: MobileViewToggleProps) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:hidden z-50 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex bg-foreground/90 text-background rounded-full shadow-2xl border border-white/10 p-1.5 backdrop-blur-md">
        <button
          onClick={() => onChange("list")}
          className={cn(
            "flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all duration-300",
            view === "list"
              ? "bg-background text-foreground shadow-sm scale-105"
              : "text-background/60 hover:text-background"
          )}
        >
          <List className="h-4 w-4" /> Lista
        </button>
        <button
          onClick={() => onChange("map")}
          className={cn(
            "flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all duration-300",
            view === "map"
              ? "bg-background text-foreground shadow-sm scale-105"
              : "text-background/60 hover:text-background"
          )}
        >
          <MapIcon className="h-4 w-4" /> Mapa
        </button>
      </div>
    </div>
  );
}
