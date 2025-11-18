"use client";
import * as React from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Place } from "@/lib/constants/mock-itinerary-data";

export function MapResultsPanel({
  results,
  onOpenPlace,
  hidden,
}: {
  results: Place[];
  onOpenPlace: (id: string) => void;
  hidden?: boolean;
}) {
  if (hidden) return null;
  return (
    <div className="w-[420px] max-h-[calc(100dvh-180px)] overflow-y-auto pr-2 space-y-3">
      {results.map((p) => (
        <Card key={p.id_api_place} className="p-3">
          <div className="flex gap-3">
            <div className="relative w-20 h-16 overflow-hidden rounded-md bg-muted">
              {p.foto_url && (
                <Image
                  src={p.foto_url}
                  alt={p.nombre}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex-1">
              <div className="font-semibold leading-tight">{p.nombre}</div>
              <div className="text-xs text-muted-foreground">
                {p.category} • ⭐ {p.google_score} (
                {p.total_reviews.toLocaleString()})
              </div>
              <p className="text-sm mt-1">{p.short_desc}</p>
              <div className="mt-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => onOpenPlace(p.id_api_place)}
                >
                  Ver detalles
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
