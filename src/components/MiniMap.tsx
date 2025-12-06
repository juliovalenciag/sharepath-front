"use client";
import * as React from "react";
import { MapContainer, TileLayer, Marker, ZoomControl, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function MiniMap({ lat, lng, title }: { lat: number; lng: number; title?: string }) {
  const position: [number, number] = [lat, lng];
  return (
    <div style={{ width: "100%", height: "180px" }}>
      <MapContainer center={position} zoom={15} scrollWheelZoom={false} zoomControl={false} style={{ width: "100%", height: "100%", borderRadius: "8px" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={position} icon={icon}>
          {title && <Popup>{title}</Popup>}
        </Marker>
        <ZoomControl position="bottomleft" />
      </MapContainer>
    </div>
  );
}
