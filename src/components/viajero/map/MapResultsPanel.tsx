"use client";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Place } from "@/lib/constants/mock-itinerary-data";

export function MapResultsPanel({
  results,
  onOpenPlace,
  className,
}: {
  results: Place[];
  onOpenPlace: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="max-h-[70vh] w-[420px] overflow-auto pr-2">
        {results.map((p) => (
          <Card key={p.id_api_place} className="mb-3 p-3">
            <div className="flex gap-3">
              <div className="h-16 w-20 overflow-hidden rounded-md bg-muted">
                {p.foto_url && (
                  <Image src={p.foto_url} width={160} height={120} alt={p.nombre} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate">{p.nombre}</p>
                <p className="text-xs text-muted-foreground">
                  {p.category} • ⭐ {p.google_score.toFixed(1)} ({p.total_reviews.toLocaleString()})
                </p>
                <p className="mt-1 text-sm line-clamp-2">{p.short_desc}</p>
                <div className="mt-2">
                  <Button variant="outline" size="sm" onClick={() => onOpenPlace(p.id_api_place)}>Ver detalles</Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {!results.length && (
          <Card className="p-3 text-sm text-muted-foreground">
            No hay resultados. Ajusta tu búsqueda o el radio.
          </Card>
        )}
      </div>
    </div>
  );
}
