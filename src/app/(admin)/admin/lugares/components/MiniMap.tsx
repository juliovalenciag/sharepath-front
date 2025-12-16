"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ExternalLink, MapPin, Navigation } from "lucide-react";

// Hook para actualizar el centro si cambian las props
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
}

interface MiniMapProps {
  lat: number;
  lng: number;
  title?: string;
}

export default function MiniMap({ lat, lng, title }: MiniMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-full bg-gray-50 animate-pulse flex items-center justify-center text-gray-400 text-xs font-medium rounded-xl">
        Cargando mapa...
      </div>
    );
  }

  // Coordenadas seguras o default (CDMX)
  const safeLat = typeof lat === 'number' && !isNaN(lat) ? lat : 19.4326;
  const safeLng = typeof lng === 'number' && !isNaN(lng) ? lng : -99.1332;
  const position: [number, number] = [safeLat, safeLng];

  // --- DISEÑO DEL MARCADOR PERSONALIZADO ---
  // Imitamos el punto rojo/rosa de tu captura con CSS puro
  const customIcon = L.divIcon({
    className: "custom-map-marker",
    html: `
      <div class="relative group">
        <div class="w-6 h-6 bg-rose-500 rounded-full border-[3px] border-white shadow-[0_4px_12px_rgba(0,0,0,0.3)] box-content relative z-10"></div>
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-1 w-3 h-1.5 bg-black/20 rounded-[50%] blur-[2px]"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [15, 15],
  });

  return (
    <div className="relative w-full h-full group/map isolate bg-gray-50">
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={false}
        zoomControl={false}
        dragging={false} // Estático para que funcione como "imagen" interactiva
        doubleClickZoom={false}
        attributionControl={false}
        className="w-full h-full z-0"
        style={{ background: "#f8fafc" }} 
      >
        {/* Usamos CartoDB Voyager para ese look limpio y moderno (crema/gris) */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <Marker position={position} icon={customIcon} />
        <MapUpdater center={position} />
      </MapContainer>

      {/* --- UI FLOTANTE (Estilo Pill/Pastilla) --- */}
      
      {/* Etiqueta de Coordenadas (Arriba Izquierda) */}
      <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-gray-200/50 flex items-center gap-2 transition-transform duration-200 hover:scale-105">
        <Navigation className="w-3 h-3 text-rose-500 fill-rose-500" />
        <span className="text-[10px] font-bold text-gray-700 font-mono tracking-tight">
          {safeLat.toFixed(3)}, {safeLng.toFixed(3)}
        </span>
      </div>

      {/* Botón Google Maps (Arriba Derecha - Aparece en Hover) */}
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${safeLat},${safeLng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-3 right-3 z-[400] bg-white text-gray-600 p-2 rounded-full shadow-md border border-gray-100 opacity-0 translate-y-2 group-hover/map:opacity-100 group-hover/map:translate-y-0 transition-all duration-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100"
        title="Abrir en Google Maps"
      >
        <ExternalLink className="w-4 h-4" />
      </a>

      {/* Overlay sutil para dar profundidad interior */}
      <div className="absolute inset-0 pointer-events-none rounded-xl ring-1 ring-inset ring-black/5 z-[399]"></div>
    </div>
  );
}