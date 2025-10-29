"use client";
import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ViewDay, ViewPlace } from "@/lib/constants/view-types";

// Carga react-leaflet y leaflet solo en cliente
let RL: any = null;
let L: any = null;

function useLeafletReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (typeof window === "undefined") return;
      const mod = await import("react-leaflet");
      const leaflet = (await import("leaflet")).default;
      RL = mod;
      L = leaflet;
      // Fix ruta de iconos por Vite/Next
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      if (mounted) setReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, []);
  return ready;
}

export default function MapView({
  day,
  selected,
  onSelect,
  onRoutePrev,
  onRouteNext,
}: {
  day: ViewDay;
  selected: ViewPlace | null;
  onSelect: (p: ViewPlace | null) => void;
  onRoutePrev: () => void;
  onRouteNext: () => void;
}) {
  const ready = useLeafletReady();
  const initial = useMemo(() => {
    const p = day.items[0];
    return p
      ? { lat: p.lat, lng: p.lng, z: 13 }
      : { lat: 19.4326, lng: -99.1332, z: 12 };
  }, [day.items]);

  return (
    <div className="rounded-xl border overflow-hidden bg-muted/20">
      <div className="h-[50svh] md:h-[60svh] w-full">
        {ready && RL ? (
          <RL.MapContainer
            center={[initial.lat, initial.lng]}
            zoom={initial.z}
            zoomControl={false}
            className="h-full w-full"
          >
            <RL.TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RL.ZoomControl position="bottomleft" />
            {day.items.map((p) => (
              <RL.Marker
                key={p.id}
                position={[p.lat, p.lng]}
                eventHandlers={{ click: () => onSelect(p) }}
              >
                <RL.Popup>{p.name}</RL.Popup>
              </RL.Marker>
            ))}
            {/* polyline simple conectando el orden del día */}
            {day.items.length > 1 && (
              <RL.Polyline
                positions={day.items.map((p) => [p.lat, p.lng]) as any}
                pathOptions={{ color: "#2609FF", weight: 4, opacity: 0.7 }}
              />
            )}
          </RL.MapContainer>
        ) : (
          <div className="h-full w-full grid place-items-center text-sm text-muted-foreground">
            Cargando mapa…
          </div>
        )}
      </div>

      {/* Drawer inferior fijo (si hay seleccionado) */}
      {selected && (
        <DetailDrawer
          place={selected}
          onClose={() => onSelect(null)}
          onPrev={onRoutePrev}
          onNext={onRouteNext}
        />
      )}
    </div>
  );
}

function DetailDrawer({
  place,
  onClose,
  onPrev,
  onNext,
}: {
  place: ViewPlace;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75">
      <div className="px-4 md:px-5 py-3 flex items-center justify-between">
        <div className="min-w-0">
          <h4 className="font-semibold truncate">{place.name}</h4>
          <p className="text-xs text-muted-foreground truncate">
            {place.city} • {place.tag}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onPrev}>
            ◀
          </Button>
          <Button variant="outline" onClick={onNext}>
            ▶
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>

      <div className="px-4 md:px-5 pb-4">
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="grid grid-cols-4 max-w-[520px]">
            <TabsTrigger value="about">Acerca de</TabsTrigger>
            <TabsTrigger value="reviews">Reseñas</TabsTrigger>
            <TabsTrigger value="photos">Fotos</TabsTrigger>
            <TabsTrigger value="mentions">Menciones</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="mt-3">
            <Card className="p-3 md:p-4">
              {place.summary ? (
                <p className="text-sm text-muted-foreground">{place.summary}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Sin descripción disponible.
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                {place.badges?.map((b) => (
                  <span
                    key={b}
                    className="text-xs rounded-full border px-2 py-0.5"
                  >
                    {b}
                  </span>
                ))}
              </div>

              {(place.rating || place.links?.length) && (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {typeof place.rating === "number" && (
                    <span className="text-sm">
                      ★ {place.rating}{" "}
                      <span className="text-muted-foreground">
                        ({place.reviewsCount?.toLocaleString() ?? "—"})
                      </span>
                    </span>
                  )}
                  {place.links?.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      target="_blank"
                      className="text-sm underline underline-offset-2"
                    >
                      {l.label}
                    </a>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-3">
            <Card className="p-4 text-sm text-muted-foreground">
              Integra aquí tu feed de reseñas/Tripadvisor/Google (placeholder).
            </Card>
          </TabsContent>

          <TabsContent value="photos" className="mt-3">
            <Card className="p-3 grid grid-cols-3 gap-2">
              {[place.img, place.img, place.img].map((src, i) => (
                <div
                  key={i}
                  className="relative h-24 rounded-md overflow-hidden border"
                >
                  {/* next/image por simplicidad */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </Card>
          </TabsContent>

          <TabsContent value="mentions" className="mt-3">
            <Card className="p-4 text-sm text-muted-foreground">
              Menciones en listas/guías de otros viajeros (placeholder).
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
