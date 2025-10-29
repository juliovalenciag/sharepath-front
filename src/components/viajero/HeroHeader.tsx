"use client";

import * as React from "react";

export default function HeroHeader() {
  return (
    <header id="resumen" className="scroll-mt-24">
      <div className="relative overflow-hidden rounded-xl border">
        <div
          className="h-40 sm:h-48 md:h-56 bg-center bg-cover"
          style={{
            backgroundImage:
              "url(https://images.pexels.com/photos/3579433/pexels-photo-3579433.jpeg)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <h1 className="text-2xl md:text-3xl font-extrabold drop-shadow">
            Viaje a Mexico City
          </h1>
          <p className="text-sm text-muted-foreground">10/25 – 10/28</p>
        </div>
      </div>
    </header>
  );
}
