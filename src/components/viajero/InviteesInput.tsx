// components/viajero/create/InviteesInput.tsx
"use client";

import * as React from "react";
import { IconUsersGroup } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";

export function InviteesInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">
        Invitar a compañeros de viaje (opcional)
      </label>
      <div className="relative">
        <IconUsersGroup className="absolute left-2 top-1/2 -translate-y-1/2 size-4 opacity-60" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Correos separados por coma"
          className="pl-8 rounded-lg"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Ej.: ana@mail.com, luis@mail.com
      </p>
    </div>
  );
}
