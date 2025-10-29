// src/components/viajero/editor/MapPanel.tsx
"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTrip } from "@/stores/trip-store";

// Carga perezosa de react-leaflet pieces
const RL = {
  MapContainer: dynamic(
    () => import("react-leaflet").then((m) => m.MapContainer),
    { ssr: false }
  ),
  TileLayer: dynamic(() => import("react-leaflet").then((m) => m.TileLayer), {
    ssr: false,
  }),
  Marker: dynamic(() => import("react-leaflet").then((m) => m.Marker), {
    ssr: false,
  }),
  Popup: dynamic(() => import("react-leaflet").then((m) => m.Popup), {
    ssr: false,
  }),
  ZoomControl: dynamic(
    () => import("react-leaflet").then((m) => m.ZoomControl),
    { ssr: false }
  ),
};

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function MapPanel() {
  const { selectedPlace } = useTrip();
  const [ready, setReady] = React.useState(false);

  // Evita montar nada hasta que exista window (fix 'appendChild' en SSR)
  React.useEffect(() => setReady(true), []);
  if (!ready) return <div className="h-full w-full bg-muted" />;

  const center: [number, number] = [19.4326, -99.1332]; // CDMX
  const hasCoords =
    selectedPlace &&
    typeof selectedPlace.lat === "number" &&
    typeof selectedPlace.lng === "number";

  return (
    <RL.MapContainer
      center={hasCoords ? [selectedPlace!.lat!, selectedPlace!.lng!] : center}
      zoom={hasCoords ? 14 : 11}
      zoomControl={false}
      className="h-full w-full"
    >
      <RL.TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <RL.ZoomControl position="bottomleft" />

      {hasCoords && (
        <RL.Marker
          position={[selectedPlace!.lat!, selectedPlace!.lng!]}
          icon={icon}
        >
          <RL.Popup>{selectedPlace!.name}</RL.Popup>
        </RL.Marker>
      )}
    </RL.MapContainer>
  );
}
