// components/viajero/editor/PlaceSearch.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  IconSearch,
  IconPlus,
  IconMapPinFilled,
  IconHotelService,
  IconRun,
} from "@tabler/icons-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Item = {
  id: string;
  name: string;
  city: string;
  tag: string; // cultura | naturaleza | parque | historia | gastronomía | arqueología
  image?: string;
  rating?: number; // opcional
  popular?: boolean;
};

type Props = {
  onPick: (p: Item) => void;
  // opcional: semilla para sugerencias
  suggestions?: Item[];
};

const CATEGORY_ORDER = [
  "cultura",
  "naturaleza",
  "parque",
  "historia",
  "gastronomía",
  "arqueología",
] as const;
const TABS = [
  { key: "lugares", label: "Lugares", icon: IconMapPinFilled },
  { key: "actividades", label: "Actividades", icon: IconRun },
] as const;

export function PlaceSearch({ onPick, suggestions = [] }: Props) {
  const [tab, setTab] = React.useState<(typeof TABS)[number]["key"]>("lugares");
  const [query, setQuery] = React.useState("");
  const [activeTag, setActiveTag] = React.useState<string | null>(null);

  // demo: filtra de la lista de sugerencias (cuando integres tu API, cámbialo aquí)
  const results = React.useMemo(() => {
    const base = suggestions;
    const byTab = base; // en prod: filtra por tab
    const byTag = activeTag ? byTab.filter((x) => x.tag === activeTag) : byTab;
    const byQuery = query.trim()
      ? byTag.filter((x) =>
          (x.name + " " + x.city)
            .toLowerCase()
            .includes(query.trim().toLowerCase())
        )
      : byTag;
    return byQuery.slice(0, 30);
  }, [suggestions, activeTag, query]);

  return (
    <Card className="p-3 md:p-4 border bg-card/90">
      {/* INPUT + TABS */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <IconSearch className="absolute left-2 top-1/2 -translate-y-1/2 size-4 opacity-60" />
          <input
            className="w-full h-10 rounded-md border pl-8 pr-10 bg-white/70 outline-none focus:ring-2 focus:ring-[var(--palette-blue)]"
            placeholder="Busca lugares (ej. Bellas Artes, Tolantongo…)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="button"
            title="Ubicación"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border bg-background/70 size-8 grid place-content-center"
          >
            <IconMapPinFilled className="size-4" />
          </button>
        </div>

        <div className="hidden md:flex gap-1 rounded-md border p-1 bg-background">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "px-3 h-10 rounded-md text-sm inline-flex items-center gap-2 transition",
                  active
                    ? "bg-[var(--palette-blue)] text-white"
                    : "hover:bg-muted"
                )}
              >
                <Icon className="size-4" /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* CATEGORÍAS (scroll-x y sticky visualmente al bloque, no a la página) */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-muted-foreground">
            Categorías
          </span>
          {activeTag && (
            <button
              className="text-xs underline text-muted-foreground hover:text-foreground"
              onClick={() => setActiveTag(null)}
            >
              Limpiar
            </button>
          )}
        </div>
        <div className="mask-fade-x overflow-x-auto">
          <div className="flex gap-2 py-1">
            {CATEGORY_ORDER.map((cat) => (
              <Badge
                key={cat}
                variant={activeTag === cat ? "default" : "outline"}
                className={cn(
                  "cursor-pointer whitespace-nowrap",
                  activeTag === cat &&
                    "bg-[var(--palette-blue)] text-[var(--primary-foreground)] border-transparent"
                )}
                onClick={() => setActiveTag(activeTag === cat ? null : cat)}
              >
                {cat[0].toUpperCase() + cat.slice(1)}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* RESULTADOS (altura fija + scroll interno) */}
      <div className="mt-3">
        <ScrollArea className="max-h-[360px] rounded-lg border overflow-hidden">
          <ul className="divide-y">
            {results.map((it) => (
              <li key={it.id} className="p-3 hover:bg-muted/60">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-16 shrink-0 rounded-md overflow-hidden border bg-muted">
                    <Image
                      src={
                        it.image ||
                        "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?q=80&w=800&auto=format&fit=crop"
                      }
                      alt={it.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{it.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {it.city} • {it.tag}
                    </p>
                    {it.popular && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground mt-1 inline-block">
                        Popular
                      </span>
                    )}
                  </div>
                  <button
                    className="h-8 px-2 rounded-md border text-sm hover:bg-muted"
                    onClick={() => onPick(it)}
                    title="Añadir a día actual"
                  >
                    <IconPlus className="size-4 inline -mt-0.5 mr-1" />
                    Añadir
                  </button>
                </div>
              </li>
            ))}

            {results.length === 0 && (
              <li className="p-6 text-sm text-muted-foreground">
                Sin resultados. Prueba con otro término o cambia de categoría.
              </li>
            )}
          </ul>
        </ScrollArea>
      </div>

      {/* SUGERENCIAS (solo si no hay query) */}
      {!query && (
        <div className="mt-3">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Sugerencias populares
          </p>
          <div className="flex gap-3 overflow-x-auto mask-fade-x pb-1">
            {suggestions.slice(0, 12).map((s) => (
              <article key={`s-${s.id}`} className="min-w-[240px]">
                <div className="rounded-lg border overflow-hidden bg-card">
                  <div className="relative h-[120px]">
                    <Image
                      src={
                        s.image ||
                        "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?q=80&w=1200&auto=format&fit=crop"
                      }
                      alt={s.name}
                      fill
                      sizes="240px"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-2">
                    <p className="text-sm font-medium line-clamp-2">{s.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {s.city} • {s.tag}
                    </p>
                    <button
                      className="mt-2 w-full h-8 text-sm rounded-md border hover:bg-muted"
                      onClick={() => onPick(s)}
                    >
                      Añadir
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
