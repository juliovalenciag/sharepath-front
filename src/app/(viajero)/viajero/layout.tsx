// app/viajero/layout.tsx
import type { ReactNode } from "react";

export default function ViajeroLayout({ children }: { children: ReactNode }) {
  // Mantén este layout limpio; si quieres sidebar, lo añadimos luego.
  return (
    <div className="min-h-dvh bg-background text-foreground">{children}</div>
  );
}
