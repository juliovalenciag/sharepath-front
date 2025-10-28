"use client";

import * as React from "react";
import { type Place } from "../../lib/constants";

export default function PlaceSearch({
  query,
  onQuery,
  data,
  onPick,
}: {
  query: string;
  onQuery: (v: string) => void;
  data: Place[];
  onPick: (p: Place) => void;
}) {
  return (
    <div className="border rounded-lg">
      <input
        className="w-full bg-transparent px-3 py-2 outline-none"
        placeholder="Busca lugares (ej. Bellas Artes, Bernal, Tolantongo...)"
        value={query}
        onChange={(e) => onQuery(e.target.value)}
      />
      <div className="max-h-64 overflow-auto border-t">
        {data.length === 0 ? (
          <div className="px-3 py-2 text-sm text-muted-foreground">
            No se encontraron lugares
          </div>
        ) : (
          data.map((p) => (
            <button
              key={p.id}
              onClick={() => onPick(p)}
              className="w-full text-left px-3 py-2 hover:bg-muted flex items-center justify-between"
            >
              <div className="min-w-0">
                <p className="truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.city}</p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded border">
                {p.tag}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
