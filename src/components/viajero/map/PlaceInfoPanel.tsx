"use client";
import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Place } from "@/lib/constants/mock-itinerary-data";
import { useItineraryStore } from "@/lib/useItineraryStore";

export default function PlaceInfoPanel({
  place,
  onClose,
}: {
  place: Place;
  onClose: () => void;
}) {
  const activeDayId = useItineraryStore((s) => s.activeDayId);
  const days = useItineraryStore((s) => s.days);
  const addPlaceToActive = useItineraryStore((s) => s.addPlaceToActive);
  const movePlaceToDay = useItineraryStore((s) => s.movePlaceToDay);

  const [toDay, setToDay] = React.useState<string>(activeDayId);
  React.useEffect(() => setToDay(activeDayId), [activeDayId]);

  return (
    <div className="fixed inset-0 z-[1000]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[95%] sm:w-[860px] -translate-x-1/2 -translate-y-1/2 bg-background rounded-2xl shadow-xl border p-5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-semibold">{place.nombre}</h3>
          <button className="text-sm text-muted-foreground" onClick={onClose}>
            Cerrar
          </button>
        </div>

        {place.foto_url && (
          <div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden mb-4 bg-muted">
            <Image
              src={place.foto_url}
              alt={place.nombre}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          {place.category} • ⭐ {place.google_score} (
          {place.total_reviews.toLocaleString()})
        </div>
        {place.short_desc && <p className="mt-2">{place.short_desc}</p>}

        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <Button
            className="sm:flex-1"
            onClick={() => {
              addPlaceToActive(place);
              onClose();
            }}
          >
            Añadir al día actual
          </Button>

          <Select value={toDay} onValueChange={setToDay}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Elegir día…" />
            </SelectTrigger>
            <SelectContent>
              {days.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              movePlaceToDay(place.id_api_place, toDay);
              onClose();
            }}
          >
            Añadir / Mover
          </Button>
        </div>
      </div>
    </div>
  );
}
