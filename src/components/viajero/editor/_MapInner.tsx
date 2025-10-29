// src/components/viajero/editor/_MapInner.tsx
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
import { useTrip } from "@/stores/trip-store";

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

export default function MapInner() {
  const { selectedPlace } = useTrip();
  const center: [number, number] = selectedPlace
    ? [selectedPlace.lat, selectedPlace.lng]
    : [19.4326, -99.1332];

  return (
    <MapContainer
      center={center}
      zoom={13}
      zoomControl={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomleft" />
      {selectedPlace && (
        <Marker position={[selectedPlace.lat, selectedPlace.lng]} icon={icon}>
          <Popup>{selectedPlace.name}</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
