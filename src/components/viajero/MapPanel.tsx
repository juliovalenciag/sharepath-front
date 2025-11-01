"use client";

import * as React from "react";

export default function MapPanel() {
  return (
    <aside className="hidden lg:block relative">
      <div className="sticky top-0 h-[calc(100dvh-64px)]">
        {/* Aquí montarás MapLibre/Mapbox/Leaflet. Por ahora, placeholder. */}
        <div className="h-full w-full bg-[url('https://tile.openstreetmap.org/5/5/12.png')] bg-cover" />

        {/* Hint flotante como en la referencia */}
        <div className="absolute top-6 left-6 w-[320px] rounded-xl border bg-background/95 shadow p-3">
          <p className="text-sm font-medium">Añadir algunos lugares</p>
          <p className="text-xs text-muted-foreground mt-1">
            Intenta escribir <b>Museo Nacional de Antropología</b> en el campo
            de la izquierda.
          </p>
          <button className="mt-3 w-full h-9 text-sm rounded-md border">
            Añadir un lugar
          </button>
        </div>
      </div>
    </aside>
  );
}
