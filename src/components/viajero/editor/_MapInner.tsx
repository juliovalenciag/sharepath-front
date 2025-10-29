"use client";
import * as React from "react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import L from "leaflet";
import type { Place } from "@/stores/trip-store";
import "leaflet/dist/leaflet.css";

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25,41], iconAnchor: [12,41], popupAnchor: [1,-34], shadowSize: [41,41],
});

// Centro seguro si el mock no trae coords
const DEFAULT_CENTER: [number, number] = [19.4326, -99.1332];

export default function MapInner({ selected }: { selected?: Place }) {
  // guardia de client-side (evita 'appendChild' undefined)
  const isClient = typeof window !== "undefined";
  if (!isClient) return null;

  const center: [number, number] = selected?.lat && selected?.lng
    ? [selected.lat, selected.lng]
    : DEFAULT_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={selected ? 14 : 11}
      zoomControl={false}
      className="h-full w-full"
      preferCanvas
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomleft" />

      {selected && selected.lat && selected.lng && (
        <Marker position={[selected.lat, selected.lng]} icon={icon}>
          <Popup>{selected.name}</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
