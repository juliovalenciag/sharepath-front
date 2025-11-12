"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import type { Place } from "@/lib/constants/mock-itinerary-data";

export default function Mapa({
  center,
  zoom = 12,
  markers = [],
  selectedId,
  onMarkerClick,
}: {
  center: [number, number];
  zoom?: number;
  markers?: Place[];
  selectedId?: string;
  onMarkerClick?: (id: string) => void;
}) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((m) => (
        <Marker
          key={m.id_api_place}
          position={[m.latitud, m.longitud]}
          eventHandlers={{ click: () => onMarkerClick?.(m.id_api_place) }}
        >
          <Popup>{m.nombre}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
