// components/viajero/read/StickyMapPanel.tsx
"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const marker = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function StickyMapPanel() {
  return (
    <div className="sticky top-20">
      <div className="h-[calc(100dvh-6rem)] rounded-[var(--radius-lg)] overflow-hidden ring-1 ring-border">
        <MapContainer
          center={[19.4326, -99.1332]}
          zoom={12}
          className="h-full w-full"
          scrollWheelZoom
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[19.436, -99.141]} icon={marker}>
            <Popup>Palacio de Bellas Artes</Popup>
          </Marker>
        </MapContainer>
      </div>
      {/* Panel flotante tipo “sheet” bajo el mapa */}
      <div className="mt-4 p-4 rounded-[var(--radius-lg)] ring-1 ring-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <h4 className="font-semibold">Detalle seleccionado</h4>
        <p className="text-sm text-muted-foreground">
          Toca un lugar del plan para ver “Acerca de / Reseñas / Fotos /
          Menciones”.
        </p>
      </div>
    </div>
  );
}
