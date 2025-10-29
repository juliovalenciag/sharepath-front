"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import LeftNav from "./LeftNav";
import HeroHeader from "./HeroHeader";
import SectionCard from "./SectionCard";
import MapPanel from "./MapPanel";
import { Separator } from "@/components/ui/separator";

export default function ItineraryShell() {
  return (
    <div className="min-h-[calc(100dvh-64px)] grid grid-cols-1 lg:grid-cols-[minmax(0,700px)_minmax(420px,1fr)]">
      {/* Panel izquierdo */}
      <div className="border-r bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Contenido scrollable */}
        <div className="h-full flex">
          <LeftNav />
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 pb-16">
            <HeroHeader />

            {/* Secciones placeholder para igualar la UI de referencia */}
            <section id="explorar" className="scroll-mt-24">
              <SectionCard
                title="Explorar"
                subtitle="Descubre lugares, restaurantes y hoteles destacados"
              >
                {/* Aquí irán los 3 cards (Best attractions, Best restaurants, Hoteles) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  <div className="h-36 rounded-xl border bg-muted/40" />
                  <div className="h-36 rounded-xl border bg-muted/40" />
                  <div className="h-36 rounded-xl border bg-muted/40" />
                </div>
              </SectionCard>
            </section>

            <Separator className="my-6" />

            <section id="notas" className="scroll-mt-24">
              <SectionCard
                title="Notas"
                subtitle="Consejos, tips y cómo moverte"
              >
                <div className="h-24 rounded-lg border bg-muted/30" />
              </SectionCard>
            </section>

            <Separator className="my-6" />

            <section id="lugares" className="scroll-mt-24">
              <SectionCard
                title="Lugares para visitar"
                subtitle="Agrega puntos de interés a tu lista"
              >
                <div className="h-32 rounded-lg border bg-muted/30" />
                <div className="mt-4 h-24 rounded-lg border bg-muted/20" />
              </SectionCard>
            </section>

            <Separator className="my-6" />

            <section id="plan" className="scroll-mt-24">
              <SectionCard
                title="Plan de viaje"
                subtitle="Organiza día por día"
              >
                <div className="space-y-3">
                  <div className="h-16 rounded-lg border bg-muted/30" />
                  <div className="h-12 rounded-lg border bg-muted/20" />
                  <div className="h-12 rounded-lg border bg-muted/20" />
                  <div className="h-12 rounded-lg border bg-muted/20" />
                </div>
              </SectionCard>
            </section>

            <Separator className="my-6" />

            <section id="presupuesto" className="scroll-mt-24">
              <SectionCard
                title="Presupuesto"
                subtitle="Visualiza costos estimados"
              >
                <div className="h-24 rounded-lg border bg-muted/30" />
              </SectionCard>
            </section>
          </main>
        </div>
      </div>

      {/* Panel derecho (mapa) */}
      <MapPanel />
    </div>
  );
}
