"use client";
import dynamic from "next/dynamic";
import * as React from "react";
import { useTrip } from "@/stores/trip-store";

// Carga sólo en cliente para evitar SSR errors (appendChild)
const MapInner = dynamic(() => import("./_MapInner"), { ssr: false });

export default function MapPanel() {
  const { selectedPlace } = useTrip();
  return (
    <div className="h-full w-full bg-muted">
      {/* Re-renderiza cuando cambie el seleccionado */}
      <MapInner selected={selectedPlace ?? undefined} />
    </div>
  );
}
