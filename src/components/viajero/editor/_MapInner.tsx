"use client";
import * as React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function MapInner({
  center,
  selectedName,
}: {
  center: [number, number];
  selectedName?: string;
}) {
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => setReady(true), []);
  if (!ready) return <div className="h-full w-full" />;

  return (
    <MapContainer
      center={center}
      zoom={12}
      zoomControl={false}
      className="h-full w-full"
    >
      <TileLayer
        // evitar appendChild error asegurando que solo se monta en cliente
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomleft" />
      {center && (
        <Marker position={center} icon={icon}>
          {selectedName && <Popup>{selectedName}</Popup>}
        </Marker>
      )}
    </MapContainer>
  );
}
