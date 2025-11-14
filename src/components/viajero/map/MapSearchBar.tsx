"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PLACES } from "@/lib/constants/mock-itinerary-data";

type Props = {
  value: { q: string; category: string | null; radiusKm: number };
  onChange: (v: Partial<Props["value"]>) => void;
  onClear: () => void;
  className?: string;
};
const categories = Array.from(new Set(PLACES.map((p) => p.category)));

export default function MapSearchBar({
  value,
  onChange,
  onClear,
  className,
}: Props) {
  return (
    <div className={className}>
      {/* barra de búsqueda ancho completo */}
      <div className="rounded-xl bg-background shadow-lg border p-2">
        <Input
          value={value.q}
          onChange={(e) => onChange({ q: e.target.value })}
          placeholder="Busca museos, tacos, miradores…"
          className="h-10"
        />
        {/* filtros debajo */}
        <div className="mt-2 grid grid-cols-2 sm:flex sm:items-center gap-2">
          <Select
            value={value.category ?? "Todas"}
            onValueChange={(v) =>
              onChange({ category: v === "Todas" ? null : v })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todas">Todas</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={String(value.radiusKm)}
            onValueChange={(v) => onChange({ radiusKm: Number(v) })}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Radio" />
            </SelectTrigger>
            <SelectContent>
              {["5", "10", "15", "25", "50"].map((r) => (
                <SelectItem key={r} value={r}>
                  {r} km
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="sm:ml-auto">
            <Button variant="ghost" className="h-9" onClick={onClear}>
              Limpiar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
