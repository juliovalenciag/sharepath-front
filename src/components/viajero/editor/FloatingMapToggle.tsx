"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export function FloatingMapToggle({
  open,
  setOpen,
  children,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Sheet simple (sin portal) */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 h-[75dvh] rounded-t-2xl border bg-card">
            {children}
          </div>
        </div>
      )}

      {/* FAB */}
      <div className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
        <Button
          onClick={() => setOpen(true)}
          className="rounded-full px-5 h-11 bg-palette-blue text-primary-foreground hover:opacity-90"
        >
          Abrir mapa
        </Button>
      </div>
    </>
  );
}
