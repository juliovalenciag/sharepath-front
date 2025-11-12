"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

type Props = {
  className?: string;
  value: { q: string; category: string | null; radiusKm: number };
  onChange: (v: { q: string; category: string | null; radiusKm: number }) => void;
  onClear: () => void;
};

export default function MapSearchBar({ className, value, onChange, onClear }: Props) {
  const set = (patch: Partial<typeof value>) => onChange({ ...value, ...patch });

  return (
    <div className={cn("w-full max-w-[960px] rounded-xl bg-background/90 shadow-lg backdrop-blur p-3 space-y-2", className)}>
      {/* barra de búsqueda a todo el ancho */}
      <Input
        placeholder="Busca museos, tacos, miradores..."
        value={value.q}
        onChange={(e) => set({ q: e.target.value })}
        className="h-11"
      />
      {/* filtros debajo */}
      <div className="flex items-center gap-2">
        <Select
          value={value.category ?? "__all"}
          onValueChange={(v) => set({ category: v === "__all" ? null : v })}
        >
          <SelectTrigger className="w-40"><SelectValue placeholder="Todas" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">Todas</SelectItem>
            <SelectItem value="museo">Museo</SelectItem>
            <SelectItem value="parque">Parque</SelectItem>
            <SelectItem value="avenida">Avenida</SelectItem>
            <SelectItem value="histórico">Histórico</SelectItem>
            <SelectItem value="arte">Arte</SelectItem>
            <SelectItem value="pueblo mágico">Pueblo mágico</SelectItem>
            <SelectItem value="viñedo">Viñedo</SelectItem>
            <SelectItem value="religioso">Religioso</SelectItem>
            <SelectItem value="zona arqueológica">Zona arqueológica</SelectItem>
            <SelectItem value="cafetería">Cafetería</SelectItem>
            <SelectItem value="bar">Bar</SelectItem>
            <SelectItem value="gastronomía">Gastronomía</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={String(value.radiusKm)}
          onValueChange={(v) => set({ radiusKm: Number(v) })}
        >
          <SelectTrigger className="w-28"><SelectValue placeholder="Radio" /></SelectTrigger>
          <SelectContent>
            {[10,15,25,35,50].map(km => (
              <SelectItem key={km} value={String(km)}>{km} km</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="ghost" onClick={onClear} className="ml-auto">Limpiar</Button>
      </div>
    </div>
  );
}
