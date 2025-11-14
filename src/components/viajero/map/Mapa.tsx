"use client";
import * as React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  ZoomControl,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Place } from "@/lib/constants/mock-itinerary-data";

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

export default function Mapa({
  center,
  zoom,
  markers,
  path,
  onMarkerClick,
}: {
  center: [number, number];
  zoom: number;
  markers: Place[];
  path?: Place[]; // cuando se muestra ruta del día
  onMarkerClick?: (id: string) => void;
}) {
  const poly = path?.map((p) => [p.latitud, p.longitud]) as
    | [number, number][]
    | undefined;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-full w-full"
      zoomControl={false}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="topright" />

      {poly && poly.length >= 2 && (
        <Polyline positions={poly} weight={4} opacity={0.8} />
      )}

      {markers.map((m) => (
        <Marker
          key={m.id_api_place}
          position={[m.latitud, m.longitud]}
          icon={icon}
          eventHandlers={{ click: () => onMarkerClick?.(m.id_api_place) }}
        />
      ))}
    </MapContainer>
  );
}
