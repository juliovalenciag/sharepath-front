"use client";

import { IconMap } from "@tabler/icons-react";

export default function MapPlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[var(--palette-dark)]/5 dark:bg-[var(--palette-dark)]/40">
      <div className="text-center px-6">
        <div className="mx-auto mb-3 size-10 rounded-full bg-palette-blue text-primary-foreground flex items-center justify-center">
          <IconMap className="size-5" />
        </div>
        <p className="font-medium">Mapa próximamente</p>
        <p className="text-sm text-muted-foreground">
          Integraremos la capa de lugares y rutas aquí. Por ahora es un
          placeholder.
        </p>
      </div>
    </div>
  );
}
