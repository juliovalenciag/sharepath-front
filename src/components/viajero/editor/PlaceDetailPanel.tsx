"use client";
import * as React from "react";
import { useTrip } from "@/stores/trip-store";
import { cn } from "@/lib/utils";

const TABS = ["Acerca de", "Reseñas", "Fotos", "Menciones"] as const;

export function PlaceDetailPanel() {
  const { selectedPlace } = useTrip();
  const [tab, setTab] = React.useState<(typeof TABS)[number]>("Acerca de");

  if (!selectedPlace) return null;

  return (
    <div className="absolute left-0 right-0 bottom-0 md:left-auto md:w-[min(680px,48vw)] md:right-0 md:top-[64px] bg-card border-t md:border-l rounded-t-2xl md:rounded-none shadow-lg">
      {/* Tabs */}
      <div className="px-4 pt-3 border-b flex gap-4">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "h-10 px-2 font-medium border-b-2",
              tab === t
                ? "border-[var(--palette-blue)]"
                : "border-transparent text-muted-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-3 max-h-[45vh] md:max-h-[calc(100vh-96px)] overflow-auto">
        <header className="flex items-center gap-3">
          <div className="size-16 rounded-md overflow-hidden border">
            <img
              src={selectedPlace.img}
              className="size-full object-cover"
              alt=""
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{selectedPlace.name}</h3>
            <p className="text-xs text-muted-foreground">
              {selectedPlace.city} • {selectedPlace.tag}
            </p>
          </div>
        </header>

        {tab === "Acerca de" && (
          <>
            <div className="rounded-xl bg-[color-mix(in_oklch,var(--palette-blue)_12%,transparent)] p-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <div className="text-4xl font-black opacity-60">1</div>Admira
                  su arquitectura icónica
                </div>
                <div>
                  <div className="text-4xl font-black opacity-60">2</div>Explora
                  salas y exposiciones
                </div>
                <div>
                  <div className="text-4xl font-black opacity-60">3</div>Murales
                  de artistas reconocidos
                </div>
              </div>
            </div>
            <ul className="space-y-2">
              <li>💡 Compra boletos con anticipación en temporada alta.</li>
              <li>💡 Visítalo al atardecer para mejores fotos.</li>
              <li>💡 Considera 1–2 horas para recorrerlo completo.</li>
            </ul>
          </>
        )}

        {tab === "Reseñas" && (
          <div className="grid gap-3 md:grid-cols-2">
            {(
              selectedPlace.reviews ?? [
                "Stunning inside and out. Worth the visit.",
                "Architecture is amazing; great exhibits.",
                "Must-see in CDMX. Beautiful murals.",
              ]
            ).map((r, i) => (
              <div
                key={i}
                className="rounded-2xl border p-4 text-sm text-muted-foreground"
              >
                {r}
              </div>
            ))}
          </div>
        )}

        {tab === "Fotos" && (
          <div className="grid grid-cols-3 gap-2">
            {(
              selectedPlace.photos ?? [
                selectedPlace.img,
                selectedPlace.img,
                selectedPlace.img,
              ]
            ).map((src, i) => (
              <img
                key={i}
                src={src}
                className="aspect-video object-cover rounded-lg border"
              />
            ))}
          </div>
        )}

        {tab === "Menciones" && (
          <div className="text-sm text-muted-foreground">
            Próximamente: prensa, blogs y guías que mencionan este lugar.
          </div>
        )}
      </div>
    </div>
  );
}
