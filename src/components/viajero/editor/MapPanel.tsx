// components/viajero/editor/MapPanel.tsx
"use client";
import * as React from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

const Leaflet = dynamic(
  async () => {
    const L = await import("react-leaflet");
    return L;
  },
  { ssr: false }
);

export default function MapPanel() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-full w-full bg-muted" />;

  // carga diferida para evitar import SSR
  const {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    ZoomControl,
  } = require("react-leaflet");
  const L = require("leaflet");
  const markerIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  return (
    <MapContainer
      center={[19.4326, -99.1332]}
      zoom={12}
      zoomControl={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomleft" />
      <Marker position={[19.4326, -99.1332]} icon={markerIcon}>
        <Popup>Ciudad de México</Popup>
      </Marker>
    </MapContainer>
  );
}
