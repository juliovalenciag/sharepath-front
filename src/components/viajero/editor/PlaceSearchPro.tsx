// src/components/viajero/editor/PlaceSearchPro.tsx
"use client";
import * as React from "react";
import { IconMapPin, IconSearch, IconPlus } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useTrip, type Place } from "@/stores/trip-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const TABS = [
  { key: "lugares", label: "Lugares" },
  { key: "actividades", label: "Actividades" },
] as const;

const CATS = [
  "Cultura",
  "Naturaleza",
  "Parque",
  "Historia",
  "Gastronomía",
  "Arqueología",
] as const;

export function PlaceSearchPro({
  data,
  onAdd,
}: {
  data: Place[];
  onAdd?: (p: Place) => void;
}) {
  const [tab, setTab] = React.useState<(typeof TABS)[number]["key"]>("lugares");
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState<string | null>(null);
  const { activeDayKey, addPlace, selectPlace } = useTrip();

  const filtered = React.useMemo(() => {
    const k = q.trim().toLowerCase();
    return data.filter((p) => {
      const okQ =
        !k ||
        p.name.toLowerCase().includes(k) ||
        p.city.toLowerCase().includes(k);
      const okC = !cat || p.tag.toLowerCase() === cat.toLowerCase();
      return okQ && okC;
    });
  }, [data, q, cat]);

  function handleAdd(p: Place) {
    if (onAdd) onAdd(p);
    else if (activeDayKey) addPlace(activeDayKey, p);
  }

  return (
    <section className="rounded-xl border bg-card p-3 md:p-4">
      {/* Tabs + search */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg border overflow-hidden">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "px-3 py-1.5 text-sm",
                tab === t.key
                  ? "bg-[var(--palette-blue)] text-[var(--primary-foreground)]"
                  : "bg-background hover:bg-muted"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative ml-auto w-full md:w-[420px]">
          <IconSearch className="absolute left-2 top-1/2 -translate-y-1/2 size-4 opacity-70" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Busca lugares o actividades…"
            className="w-full h-10 pl-8 pr-10 rounded-lg border bg-background"
          />
          <IconMapPin className="absolute right-2 top-1/2 -translate-y-1/2 size-4 opacity-60" />
        </div>
      </div>

      {/* Grid: lista + chips (no se sobreponen) */}
      <div className="mt-3 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_240px] gap-4">
        {/* Lista con scroll */}
        <ScrollArea className="h-[300px] rounded-lg border">
          <ul className="divide-y">
            {filtered.map((p) => (
              <li
                key={p.id}
                className="p-3 hover:bg-muted/40 flex items-start gap-3"
              >
                <img
                  src={
                    p.image ||
                    "https://images.unsplash.com/photo-1560090995-01632a3d7d55?q=80&w=600&auto=format&fit=crop"
                  }
                  alt={p.name}
                  className="size-12 rounded-md object-cover border"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{p.name}</p>
                    {p.popular && (
                      <span className="text-[10px] rounded px-1.5 py-0.5 bg-[var(--palette-pink)]/15 text-[var(--palette-pink)]">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {p.city} • {p.tag}
                    {p.rating ? ` • ⭐ ${p.rating}` : ""}
                  </p>
                  <div className="mt-1">
                    <button
                      onClick={() => selectPlace(p)}
                      className="text-xs underline text-muted-foreground hover:text-foreground"
                    >
                      Ver en mapa
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => handleAdd(p)}
                  className="shrink-0 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm hover:bg-muted"
                >
                  <IconPlus className="size-4" /> Añadir
                </button>
              </li>
            ))}
            {!filtered.length && (
              <li className="p-6 text-sm text-muted-foreground">
                Sin resultados.
              </li>
            )}
          </ul>
        </ScrollArea>

        {/* Chips de categorías */}
        <div className="rounded-lg border p-3">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Categorías
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(CATS as readonly string[]).map((c) => (
              <button
                key={c}
                onClick={() => setCat(cat === c ? null : c)}
                className={cn(
                  "h-7 rounded-full border px-3 text-xs",
                  cat === c
                    ? "bg-[var(--palette-blue)] text-[var(--primary-foreground)] border-transparent"
                    : "bg-background hover:bg-muted"
                )}
              >
                {c}
              </button>
            ))}
            {cat && (
              <Badge
                variant="outline"
                className="ml-1 cursor-pointer"
                onClick={() => setCat(null)}
              >
                Limpiar
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* “Sugerencias populares” carrusel compacto */}
      <div className="mt-4">
        <p className="text-sm font-medium mb-2">Sugerencias populares</p>
        <div className="mask-fade-x overflow-x-auto">
          <div className="flex gap-3 pr-3">
            {data.slice(0, 10).map((p) => (
              <button
                key={`sug-${p.id}`}
                className="min-w-[240px] rounded-lg border overflow-hidden text-left hover:bg-muted/40"
                onClick={() => handleAdd(p)}
                title={`Añadir ${p.name}`}
              >
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-28 w-full object-cover"
                />
                <div className="p-2">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {p.city} • {p.tag}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
