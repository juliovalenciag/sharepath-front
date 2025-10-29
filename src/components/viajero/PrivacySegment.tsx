// components/viajero/create/PrivacySegment.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type V = "private" | "friends" | "public";

const options: { key: V; label: string }[] = [
  { key: "private", label: "Privado" },
  { key: "friends", label: "Amigos" },
  { key: "public", label: "Público" },
];

export function PrivacySegment({
  value,
  onChange,
}: {
  value: V;
  onChange: (v: V) => void;
}) {
  return (
    <div className="grid grid-cols-3 rounded-lg border overflow-hidden">
      {options.map((opt) => {
        const active = value === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange(opt.key)}
            className={cn(
              "px-3 py-2 text-sm transition-colors",
              active
                ? "bg-palette-blue text-primary-foreground"
                : "bg-background hover:bg-muted"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
