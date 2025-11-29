"use client";
import * as React from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Place } from "@/stores/trip-store";

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const DEFAULT_CENTER: [number, number] = [19.4326, -99.1332];

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  React.useEffect(() => {
    if (!points || points.length === 0) return;
    try {
      const bounds = L.latLngBounds(points as any);
      map.fitBounds(bounds, { padding: [40, 40] });
    } catch {
      // ignore
    }
  }, [map, points]);
  return null;
}

export default function ItineraryMap({ places }: { places: (Place & { lat: number; lng: number })[] }) {
  const isClient = typeof window !== "undefined";
  if (!isClient) return null;

  const [routeCoords, setRouteCoords] = React.useState<[number, number][]>([]);
  const [loadingRoute, setLoadingRoute] = React.useState(false);
  const [routeError, setRouteError] = React.useState<string | null>(null);

  const points: [number, number][] =
    places && places.length > 0 ? places.map((p) => [p.lat, p.lng]) : [DEFAULT_CENTER];
  const center = points.length > 0 ? points[0] : DEFAULT_CENTER;

  // Obtener ruta real desde OSRM cuando existan 2+ lugares
  React.useEffect(() => {
    if (!places || places.length < 2) {
      setRouteCoords([]);
      setRouteError(null);
      return;
    }

    const controller = new AbortController();
    const coordsLngLat = places.map((p) => [p.lng, p.lat]); // OSRM -> [lng, lat]
    const coordsPath = coordsLngLat.map(([lng, lat]) => `${lng},${lat}`).join(";");
    const url = `https://router.project-osrm.org/route/v1/driving/${coordsPath}?overview=full&geometries=geojson&steps=false`;

    async function fetchRoute() {
      setLoadingRoute(true);
      setRouteError(null);
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`OSRM error ${res.status}`);
        const data = await res.json();
        const geometry = data?.routes?.[0]?.geometry;
        const coords: [number, number][] | undefined = geometry?.coordinates?.map(
          (c: [number, number]) => [c[1], c[0]] // Leaflet -> [lat, lng]
        );
        if (coords && coords.length) {
          setRouteCoords(coords);
        } else {
          setRouteCoords([]);
          setRouteError("No se encontró ruta");
        }
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          setRouteCoords([]);
          setRouteError(e?.message || "Error obteniendo la ruta");
        }
      } finally {
        setLoadingRoute(false);
      }
    }

    fetchRoute();
    return () => controller.abort();
  }, [places]);

  return (
    <MapContainer center={center} zoom={13} zoomControl={false} className="h-full w-full relative" preferCanvas>
      <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ZoomControl position="bottomleft" />

      {/* Loader mientras se calcula la ruta */}
      {loadingRoute && (
        <div className="absolute inset-0 z-1000 flex items-center justify-center bg-white/60">
          <div className="flex items-center gap-3 rounded-md bg-white px-3 py-2 shadow">
            <svg className="h-5 w-5 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z" />
            </svg>
            <span className="text-sm text-gray-700">Calculando ruta…</span>
          </div>
        </div>
      )}

      {places.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={icon}>
          <Popup>
            <strong>{p.name || (p as any).title}</strong>
            {p.city && <div className="text-xs">{p.city}</div>}
          </Popup>
        </Marker>
      ))}

      {places.length > 1 && (
        <>
          <Polyline
            positions={routeCoords.length > 0 ? routeCoords : points}
            color="#3b82f6"
            weight={4}
            opacity={0.9}
          />
          <FitBounds points={routeCoords.length > 0 ? routeCoords : points} />
        </>
      )}
    </MapContainer>
  );
}
