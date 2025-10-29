// src/components/viajero/editor/MapPanel.tsx
"use client";
import * as React from "react";
import dynamic from "next/dynamic";
import { useTrip } from "@/stores/trip-store";

// react-leaflet solo en cliente
const Leaflet = dynamic(() => import("./_MapInner"), { ssr: false });

export default function MapPanel() {
  const { selectedPlace } = useTrip();
  return (
    <div className="relative h-[calc(100dvh-64px)]">
      <Leaflet />
      {/* Panel detalle */}
      {selectedPlace && (
        <div className="absolute bottom-0 right-0 left-auto w-full md:w-[min(720px,52vw)] max-h-[70%] bg-card border-t md:border-l md:rounded-tl-xl shadow-xl overflow-auto">
          <PlaceDetail />
        </div>
      )}
    </div>
  );
}

// ========== Detalle del lugar ==========
function PlaceDetail() {
  const { selectedPlace, selectPlace } = useTrip();
  const [tab, setTab] = React.useState<"about" | "reviews" | "photos">("about");
  if (!selectedPlace) return null;

  return (
    <div className="p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="text-lg font-semibold truncate">
            {selectedPlace.name}
          </h4>
          <p className="text-xs text-muted-foreground">
            {selectedPlace.city} • {selectedPlace.tag}
          </p>
        </div>
        <button
          onClick={() => selectPlace(null)}
          className="rounded-md border px-2 py-1 text-sm hover:bg-muted"
        >
          Cerrar
        </button>
      </div>

      <div className="mt-3">
        <div className="border-b mb-3 flex items-center gap-3">
          {[
            { k: "about", l: "Acerca de" },
            { k: "reviews", l: "Reseñas" },
            { k: "photos", l: "Fotos" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k as any)}
              className={
                tab === t.k
                  ? "border-b-2 border-[var(--palette-blue)] pb-2 text-sm"
                  : "pb-2 text-sm text-muted-foreground"
              }
            >
              {t.l}
            </button>
          ))}
        </div>

        {tab === "about" && (
          <div className="space-y-4">
            {selectedPlace.image && (
              <img
                src={selectedPlace.image}
                alt=""
                className="w-full h-48 object-cover rounded-lg border"
              />
            )}
            <p className="text-sm">
              {selectedPlace.about ?? "Descripción no disponible."}
            </p>

            {/* Por qué ir */}
            {selectedPlace.why && selectedPlace.why.length > 0 && (
              <div className="rounded-xl bg-[var(--palette-blue)]/8 p-4 space-y-2">
                <p className="font-semibold">Por qué deberías ir</p>
                <ol className="grid md:grid-cols-3 gap-3 text-sm">
                  {selectedPlace.why.map((w, i) => (
                    <li key={i} className="rounded-lg bg-card/80 border p-3">
                      <span className="text-[var(--palette-blue)] font-bold mr-2">
                        {i + 1}
                      </span>
                      {w}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Tips */}
            {selectedPlace.tips && selectedPlace.tips.length > 0 && (
              <div className="space-y-2">
                <p className="font-semibold">Saber antes de ir</p>
                <ul className="grid gap-2">
                  {selectedPlace.tips.map((t, i) => (
                    <li key={i} className="text-sm">
                      • {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {tab === "reviews" && (
          <div className="grid gap-3">
            {(selectedPlace.reviews ?? []).slice(0, 6).map((r, i) => (
              <blockquote key={i} className="rounded-xl border p-3 text-sm">
                {r}
              </blockquote>
            ))}
            {!(selectedPlace.reviews ?? []).length && (
              <p className="text-sm text-muted-foreground">
                Sin reseñas destacadas.
              </p>
            )}
          </div>
        )}

        {tab === "photos" && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-video rounded-lg bg-muted" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
