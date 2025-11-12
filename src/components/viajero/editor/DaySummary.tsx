"use client";
import { useItineraryStore } from "@/lib/useItineraryStore";
import { Card } from "@/components/ui/card";

function kmAndMin(places: number) {
  if (places <= 1) return { km: 0, min: 0 };
  // Mock compacto
  const km = (places - 1) * 2.1;
  const min = Math.round(km * 3);
  return { km: Number(km.toFixed(1)), min };
}

export default function DaySummary() {
  const active = useItineraryStore(s => s.activeDay());
  const count = active?.places.length ?? 0;
  const { km, min } = kmAndMin(count);

  return (
    <Card className="mx-3 mt-2 p-3">
      <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
        <span className="rounded-full border px-3 py-1">Dist.: <b>{km} km</b></span>
        <span className="rounded-full border px-3 py-1">Traslado: <b>{min} min</b></span>
        <span className="rounded-full border px-3 py-1"><b>{count}</b> lugares</span>
      </div>
    </Card>
  );
}
