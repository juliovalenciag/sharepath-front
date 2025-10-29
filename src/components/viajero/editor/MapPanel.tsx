"use client";

import * as React from "react";
import { IconMap, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export function MapPanel({ onCloseMobile }: { onCloseMobile?: () => void }) {
  return (
    <div className="relative h-full w-full">
      {/* Header mini en móvil */}
      <div className="md:hidden absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-3 bg-card/80 border-b backdrop-blur">
        <div className="inline-flex items-center gap-2">
          <IconMap className="size-4" />
          <span className="text-sm font-medium">Mapa</span>
        </div>
        <button
          onClick={onCloseMobile}
          className="rounded-md border px-2 py-1 text-sm"
        >
          <IconX className="size-4" />
        </button>
      </div>

      {/* Placeholder visual */}
      <div className="h-full w-full grid place-items-center bg-[radial-gradient(ellipse_at_top,theme(colors.palette.blue)/12%,transparent_55%),linear-gradient(to_bottom,transparent,theme(colors.palette.dark)/6%)]">
        <div className="text-center px-6">
          <div className="mx-auto mb-3 size-12 rounded-full bg-palette-blue text-primary-foreground flex items-center justify-center shadow-lg">
            <IconMap className="size-6" />
          </div>
          <p className="font-medium">Mapa próximamente</p>
          <p className="text-sm text-muted-foreground">
            Integraremos Mapbox/Google Maps aquí (capas de lugares y rutas).
          </p>
        </div>
      </div>
    </div>
  );
}
