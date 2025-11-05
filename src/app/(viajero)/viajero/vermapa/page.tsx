'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

export interface lugar {
  id: number;
  nombre: string;
  lat: number;
  lng: number;
}

const lugaresEjemplo: lugar[] = [
  { id: 1, nombre: 'Museo Frida Kahlo', lat: 19.3552, lng: -99.1620 },
  { id: 2, nombre: 'Coyoacán Centro', lat: 19.3486, lng: -99.1619 },
  { id: 3, nombre: 'Parque Hundido', lat: 19.3752, lng: -99.1826 },
  { id: 4, nombre: 'Museo Soumaya', lat: 19.4401, lng: -99.2042 },
  { id: 5, nombre: 'Xochimilco Embarcadero', lat: 19.2676, lng: -99.1062 },
];

export default function Mapa() {
  const posicionInicial: [number, number] = [19.375, -99.160];
  const zoomInicial = 12;

  return (
    <div className="relative w-full h-screen">
      <MapContainer center={posicionInicial} zoom={zoomInicial} scrollWheelZoom={true} className="w-full h-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {lugaresEjemplo.map((lugar, index) => (
          <Marker key={lugar.id} position={[lugar.lat, lugar.lng]}>
            <Popup>
              <strong>{index + 1}</strong>. {lugar.nombre}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Botones flotantes */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-full shadow hover:bg-blue-700">
          Añadir lugar
        </button>
        <button className="bg-red-500 text-white px-4 py-2 rounded-full shadow hover:bg-red-600">
          Limpiar mapa
        </button>
      </div>
    </div>
  );
}