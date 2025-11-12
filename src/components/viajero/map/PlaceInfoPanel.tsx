"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useItineraryStore } from "@/lib/useItineraryStore";
import type { Place } from "@/lib/constants/mock-itinerary-data";

export default function PlaceInfoPanel({
  place,
  onClose,
}: {
  place: Place;
  onClose: () => void;
}) {
  const days = useItineraryStore((s) => s.days);
  const activeDayId = useItineraryStore((s) => s.activeDayId);
  const addPlaceToActive = useItineraryStore((s) => s.addPlaceToActive);
  const movePlaceToDay = useItineraryStore((s) => s.movePlaceToDay);

  // ✅ inicializa con un id válido; no hay valores vacíos en Select
  const [toDay, setToDay] = useState<string>(activeDayId);

  useEffect(() => {
    setToDay(activeDayId);
  }, [activeDayId]);

  return (
    <div className="fixed inset-0 z-[1000] bg-black/40">
      <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-2xl rounded-t-2xl bg-background p-4 shadow-xl md:top-1/2 md:-translate-y-1/2 md:rounded-2xl">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-bold">{place.nombre}</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>

        <Card className="mt-3 overflow-hidden">
          {place.foto_url && (
            <Image
              src={place.foto_url}
              alt={place.nombre}
              width={1200}
              height={600}
              className="h-48 w-full object-cover"
            />
          )}
          <div className="p-4">
            <p className="text-sm text-muted-foreground">
              {place.category} • ⭐ {place.google_score.toFixed(1)} (
              {place.total_reviews.toLocaleString()})
            </p>
            <p className="mt-2">{place.short_desc}</p>

            {!!place.tags?.length && (
              <div className="mt-3 flex flex-wrap gap-2">
                {place.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border px-2 py-0.5 text-xs"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button
                className="flex-1"
                onClick={() => {
                  addPlaceToActive(place);
                  onClose();
                }}
              >
                Añadir al día actual
              </Button>

              <div className="flex flex-1 items-center gap-2">
                <Select value={toDay} onValueChange={setToDay}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Elegir día…" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((d, i) => (
                      <SelectItem key={`${d.id}-${i}`} value={d.id}>
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
        </Card>
      </div>
    </div>
  );
}
