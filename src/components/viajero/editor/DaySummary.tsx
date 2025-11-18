"use client";
import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useItineraryStore } from "@/lib/useItineraryStore";

export default function DaySummary() {
  const day = useItineraryStore((s) => s.activeDay());
  const setShowRoute = useItineraryStore((s) => s.setShowRoute);
  const optimizeDayOrder = useItineraryStore((s) => s.optimizeDayOrder);
  if (!day) return null;

  const distKm = (day.places.length * 2.1).toFixed(1); // mock
  const mins = (day.places.length * 6 + 1) * 3; // mock

  return (
    <Card className="mx-3 mb-3 p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-6 text-sm sm:text-base">
          <div>
            Dist.: <b>{distKm} km</b>
          </div>
          <div>
            Traslado: <b>{mins} min</b>
          </div>
          <div>{day.places.length} lugares</div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowRoute(true)}>
            Mostrar ruta del día
          </Button>
          <Button
            onClick={() => {
              const idx = Math.max(
                0,
                prompt("¿Por dónde te gustaría empezar? (índice 1..N)")
                  ? Number(prompt)
                  : 0
              );
              optimizeDayOrder(day.id, isNaN(idx) ? 0 : idx - 1);
            }}
          >
            Optimizar ruta
          </Button>
        </div>
      </div>
    </Card>
  );
}
