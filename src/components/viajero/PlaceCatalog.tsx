"use client";

import React from "react";
import Image from "next/image";
import { IconMapPinFilled, IconSearch } from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { LugarData } from "@/api/interfaces/ApiRoutes";
import { getCategoryName, getDefaultImageForCategory } from "@/components/dashboard-components/category-utils";
import { Skeleton } from "@/components/ui/skeleton";

interface PlaceCatalogProps {
  places: LugarData[];
  filters: { state: string; category: string; search: string };
  onFiltersChange: (filters: { state: string; category: string; search: string }) => void;
  loading: boolean;
  onAdd: (place: LugarData) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  states: string[];
  categories: string[];
  error?: string | null;
}

export function PlaceCatalog({
  places,
  filters,
  onFiltersChange,
  loading,
  onAdd,
  onLoadMore,
  hasMore,
  states,
  categories,
  error,
}: PlaceCatalogProps) {
  return (
    <Card className="m-3 p-4 border-secondary/50 bg-card/70 backdrop-blur-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase text-muted-foreground">Catálogo de lugares</p>
          <h3 className="text-xl font-semibold">Busca ideas cerca de tus destinos</h3>
          <p className="text-sm text-muted-foreground">
            Los resultados vienen directo del servidor, con fotos y calificación.
          </p>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.25fr_1fr_1fr]">
        <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
          <IconSearch className="size-4 text-muted-foreground" />
          <Input
            placeholder="Museo, restaurante, parque..."
            value={filters.search}
            onChange={(e) =>
              onFiltersChange({ ...filters, search: e.target.value })
            }
            className="border-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <Select
          value={filters.state}
          onValueChange={(state) => onFiltersChange({ ...filters, state })}
        >
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los estados</SelectItem>
            {states.map((state) => (
              <SelectItem key={state} value={state}>
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.category}
          onValueChange={(category) => onFiltersChange({ ...filters, category })}
        >
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas las categorías</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {getCategoryName(category)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {loading && places.length === 0
          ? Array.from({ length: 6 }).map((_, idx) => (
              <Card key={`skeleton-${idx}`} className="overflow-hidden border-border/60 bg-background/70">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </Card>
            ))
          : places.map((place) => {
              const imageUrl =
                place.foto_url || getDefaultImageForCategory(place.category);
              return (
                <Card
                  key={place.id_api_place}
                  className="overflow-hidden border-border/60 bg-background/70 shadow-sm flex flex-col"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={place.nombre}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-xs uppercase text-muted-foreground">
                          {getCategoryName(place.category)}
                        </p>
                        <h4 className="text-base font-semibold leading-tight">
                          {place.nombre}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <IconMapPinFilled className="size-3" />
                          <span>{place.mexican_state}</span>
                        </div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <p className="font-semibold text-foreground">
                          {place.google_score?.toFixed(1) ?? "--"} ★
                        </p>
                        <p>{place.total_reviews} reseñas</p>
                      </div>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground">
                        Lat {place.latitud.toFixed(3)}, Lng {place.longitud.toFixed(3)}
                      </p>
                      <Button
                        variant="default"
                        size="sm"
                        className="gap-1"
                        onClick={() => onAdd(place)}
                        disabled={loading}
                      >
                        Añadir al día
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
      </div>

      {places.length === 0 && !loading && !error && (
        <p className="mt-4 text-sm text-muted-foreground">
          No encontramos resultados con los filtros actuales.
        </p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Los lugares se cargan directamente desde la API pública del proyecto.
        </p>
        {hasMore && (
          <Button variant="outline" onClick={onLoadMore} disabled={loading}>
            {loading ? "Cargando..." : "Ver más"}
          </Button>
        )}
      </div>
    </Card>
  );
}
