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
    } catch (e) {
      // ignore
    }
  }, [map, points]);
  return null;
}

export default function ItineraryMap({ places }: { places: (Place & { lat: number; lng: number })[] }) {
  const isClient = typeof window !== "undefined";
  if (!isClient) return null;

  const points: [number, number][] = places && places.length > 0 ? places.map((p) => [p.lat, p.lng]) : [DEFAULT_CENTER];
  const center = points.length > 0 ? points[0] : DEFAULT_CENTER;

  return (
    <MapContainer center={center} zoom={13} zoomControl={false} className="h-full w-full" preferCanvas>
      <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ZoomControl position="bottomleft" />

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
          <Polyline positions={points} color="#3b82f6" weight={4} opacity={0.9} />
          <FitBounds points={points} />
        </>
      )}
    </MapContainer>
  );
}
