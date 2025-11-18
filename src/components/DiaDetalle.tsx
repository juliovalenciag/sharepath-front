"use client";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useItineraryStore } from "@/lib/useItineraryStore";
import type { Place } from "@/lib/constants/mock-itinerary-data";

export default function DiaDetalle({ place }: { place: Place }) {
  const dayId = useItineraryStore((s) => s.activeDayId);
  const remove = useItineraryStore((s) => s.removePlaceFromDay);
  return (
    <Card className="m-3 p-3">
      <div className="flex items-center gap-3">
        <div className="h-16 w-20 overflow-hidden rounded-md bg-muted">
          {place.foto_url && (
            <Image
              src={place.foto_url}
              width={160}
              height={120}
              alt={place.nombre}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{place.nombre}</p>
          <p className="text-xs text-muted-foreground">
            {place.category} • ⭐ {place.google_score.toFixed(1)} (
            {place.total_reviews.toLocaleString()})
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => remove(dayId, place.id_api_place)}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </Card>
  );
}
