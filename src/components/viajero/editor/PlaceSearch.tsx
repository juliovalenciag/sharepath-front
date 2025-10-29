"use client";

import * as React from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { SUGGESTIONS, type Place } from "@/lib/constants/mock";

export function PlaceSearch({
  onPick,
  filterTag,
}: {
  onPick: (p: Place) => void;
  filterTag: string | null;
}) {
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    let arr = SUGGESTIONS;
    if (filterTag) arr = arr.filter((x) => x.tag === filterTag);
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter(
        (x) => x.name.toLowerCase().includes(q) || x.city.toLowerCase().includes(q)
      );
    }
    return arr.slice(0, 7);
  }, [query, filterTag]);

  return (
    <Command className="rounded-lg border">
      <div className="px-2 pt-2 pb-1">
        <CommandInput
          placeholder="Busca lugares (ej. Bellas Artes, Bernal, Tolantongo...)"
          value={query}
          onValueChange={setQuery}
        />
      </div>
      <CommandList className="max-h-64">
        <CommandEmpty>No se encontraron lugares</CommandEmpty>
        <CommandGroup heading="Sugerencias">
          {filtered.map((p) => (
            <CommandItem
              key={p.id}
              value={`${p.name} ${p.city} ${p.tag}`}
              onSelect={() => onPick(p)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={p.image}
                  alt={p.name}
                  className="size-10 rounded-md object-cover border"
                />
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.city}</p>
                </div>
              </div>
              <Badge variant="outline">{p.tag}</Badge>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
