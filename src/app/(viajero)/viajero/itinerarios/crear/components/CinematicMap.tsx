// src/app/(viajero)/viajero/itinerarios/crear/components/CinematicMap.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  useMap,
  ZoomControl,
} from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";

// --- ESTILOS ---
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Clock,
  Footprints,
  Layers,
  LocateFixed,
  Map as MapIcon,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- TIPOS ---
export type MapActivity = {
  id: string;
  nombre: string;
  lat: number;
  lng: number;
  fecha: Date;
  start_time?: string | null;
};

export type DayInfo = {
  key: string;
  date: Date;
  label: string;
  subtitle: string;
};

export type CinematicMapProps = {
  activities: MapActivity[];
  days: DayInfo[];
  selectedDayKey: string | null;
  onSelectDay: (key: string) => void;
};

// --- ICONOS PERSONALIZADOS ---
const createCustomIcon = (index: number, type: "start" | "end" | "mid") => {
  let colorClass = "bg-blue-600";
  if (type === "start") colorClass = "bg-emerald-600"; // Inicio Verde
  if (type === "end") colorClass = "bg-rose-600"; // Fin Rojo

  return L.divIcon({
    className: "custom-pin-icon",
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute -bottom-1 h-3 w-3 rotate-45 bg-current ${colorClass.replace("bg-", "text-")}"></div>
        <div class="relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-white shadow-lg ${colorClass}">
          <span class="text-xs font-bold">${index + 1}</span>
        </div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30], // La punta del pin
    popupAnchor: [0, -30],
  });
};

// --- COMPONENTE DE ROUTING AVANZADO ---
// Calcula la ruta y extrae estadísticas (distancia/tiempo)
function RoutingLayer({
  activities,
  onSummaryFound,
}: {
  activities: MapActivity[];
  onSummaryFound: (summary: { totalDistance: number; totalTime: number }) => void;
}) {
  const map = useMap();
  const routingControlRef = useRef<L.Routing.Control | null>(null);

  useEffect(() => {
    if (!map) return;

    // Limpiar control previo si hay pocos puntos
    if (activities.length < 2) {
      if (routingControlRef.current) {
        try {
          map.removeControl(routingControlRef.current);
        } catch (e) {}
        routingControlRef.current = null;
        onSummaryFound({ totalDistance: 0, totalTime: 0 });
      }
      return;
    }

    const waypoints = activities.map((a) => L.latLng(a.lat, a.lng));

    if (!routingControlRef.current) {
      // Crear instancia
      routingControlRef.current = L.Routing.control({
        waypoints,
        router: L.Routing.osrmv1({
          serviceUrl: "https://router.project-osrm.org/route/v1",
          profile: "foot", // Caminando
        }),
        lineOptions: {
          styles: [{ color: "#3b82f6", opacity: 0.8, weight: 6 }],
          extendToWaypoints: true,
          missingRouteTolerance: 10,
        },
        show: false, // Ocultar panel texto
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: false, // Controlamos el zoom manualmente
        createMarker: () => null, // Usamos nuestros propios marcadores
      });

      // ESCUCHAR EVENTO DE RUTA ENCONTRADA PARA ESTADÍSTICAS
      routingControlRef.current.on("routesfound", function (e: any) {
        const routes = e.routes;
        if (routes && routes.length > 0) {
          const summary = routes[0].summary;
          // summary.totalDistance es en metros, summary.totalTime es en segundos
          onSummaryFound({
            totalDistance: summary.totalDistance,
            totalTime: summary.totalTime,
          });
        }
      });

      routingControlRef.current.addTo(map);
    } else {
      // Actualizar puntos
      routingControlRef.current.setWaypoints(waypoints);
    }

    return () => {
      // Cleanup controlado
      if (routingControlRef.current && map) {
        try {
          map.removeControl(routingControlRef.current);
        } catch (e) {}
        routingControlRef.current = null;
      }
    };
  }, [map, activities, onSummaryFound]);

  return null;
}

// --- CONTROL DE CAMARA ---
function MapController({
  activities,
  shouldFly,
  setShouldFly,
}: {
  activities: MapActivity[];
  shouldFly: boolean;
  setShouldFly: (v: boolean) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (shouldFly && activities.length > 0) {
      const bounds = L.latLngBounds(
        activities.map((a) => [a.lat, a.lng] as LatLngExpression)
      );
      map.flyToBounds(bounds, { padding: [80, 80], duration: 1.5 });
      setShouldFly(false);
    }
  }, [map, activities, shouldFly, setShouldFly]);

  return null;
}

// --- COMPONENTE PRINCIPAL ---
export function CinematicMap({
  activities,
  days,
  selectedDayKey,
  onSelectDay,
}: CinematicMapProps) {
  // --- ESTADOS ---
  const [mapStyle, setMapStyle] = useState<"streets" | "satellite">("streets");
  const [stats, setStats] = useState({ totalDistance: 0, totalTime: 0 });
  const [shouldFly, setShouldFly] = useState(true);

  const effectiveDayKey = selectedDayKey ?? (days.length ? days[0].key : null);

  // Filtrar actividades
  const visibleActivities = useMemo(() => {
    if (!effectiveDayKey) return [] as MapActivity[];
    return activities
      .filter((a) => format(a.fecha, "yyyy-MM-dd") === effectiveDayKey)
      .sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""));
  }, [activities, effectiveDayKey]);

  // Resetear vuelo al cambiar de día
  useEffect(() => {
    setShouldFly(true);
  }, [effectiveDayKey]);

  // Centro inicial
  const center: LatLngExpression =
    visibleActivities.length > 0
      ? [visibleActivities[0].lat, visibleActivities[0].lng]
      : [19.4326, -99.1332];

  // Tile Layers URLs
  const tiles = {
    streets: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  };

  const attributions = {
    streets: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    satellite: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  };

  // Formatear estadísticas
  const distanceKm = (stats.totalDistance / 1000).toFixed(1);
  const timeHours = Math.floor(stats.totalTime / 3600);
  const timeMinutes = Math.floor((stats.totalTime % 3600) / 60);
  const timeString =
    timeHours > 0 ? `${timeHours}h ${timeMinutes}m` : `${timeMinutes} min`;

  return (
    <div className="relative h-full w-full overflow-hidden bg-muted/20">
      
      {/* 1. BARRA SUPERIOR FLOTANTE (Días) */}
      <div className="absolute left-0 right-0 top-4 z-[500] flex justify-center px-4 pointer-events-none">
        {days.length > 0 && (
          <div className="pointer-events-auto flex max-w-full overflow-x-auto rounded-full bg-background/80 p-1.5 shadow-xl backdrop-blur-md border border-white/20 scrollbar-hide">
            {days.map((d) => {
              const active = d.key === effectiveDayKey;
              return (
                <button
                  key={d.key}
                  onClick={() => onSelectDay(d.key)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm scale-105"
                      : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10"
                  )}
                >
                  {d.label}
                  <span className={cn("hidden sm:inline opacity-70 font-normal", active && "opacity-90")}>
                    {d.subtitle}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. PANEL DE ESTADÍSTICAS (Inferior Central) */}
      {visibleActivities.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[500] pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-4 rounded-2xl bg-black/80 px-5 py-3 text-white shadow-2xl backdrop-blur-lg border border-white/10 transition-all animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-blue-500/20 text-blue-400">
                <Footprints className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-white/60 font-medium uppercase tracking-wider">Distancia</span>
                <span className="text-sm font-bold">{distanceKm} km</span>
              </div>
            </div>
            
            <div className="h-8 w-px bg-white/10"></div>

            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-400">
                 <Clock className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-white/60 font-medium uppercase tracking-wider">Tiempo Aprox.</span>
                <span className="text-sm font-bold">{timeString}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CONTROLES DE MAPA (Derecha) */}
      <div className="absolute right-4 top-20 z-[500] flex flex-col gap-2">
        
        {/* Selector de Capas */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="secondary" className="h-10 w-10 rounded-xl shadow-lg bg-background/90 backdrop-blur-md">
              <Layers className="h-5 w-5 text-foreground/80" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => setMapStyle("streets")} className="gap-2 cursor-pointer">
              <MapIcon className="h-4 w-4" />
              <span>Callejero</span>
              {mapStyle === "streets" && <div className="ml-auto h-2 w-2 rounded-full bg-primary" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setMapStyle("satellite")} className="gap-2 cursor-pointer">
              <Navigation className="h-4 w-4" /> {/* Icono provisional para satelite */}
              <span>Satélite</span>
              {mapStyle === "satellite" && <div className="ml-auto h-2 w-2 rounded-full bg-primary" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Recentrar */}
        <Button 
            size="icon" 
            variant="secondary" 
            className="h-10 w-10 rounded-xl shadow-lg bg-background/90 backdrop-blur-md"
            onClick={() => setShouldFly(true)}
            title="Centrar ruta"
        >
            <LocateFixed className="h-5 w-5 text-foreground/80" />
        </Button>
      </div>

      {/* 4. MAPA */}
      <MapContainer
        center={center}
        zoom={13}
        className="h-full w-full outline-none"
        zoomControl={false} // Desactivamos el zoom default para ponerlo nosotros si queremos o usar scroll
      >
        <ZoomControl position="bottomright" />
        
        <TileLayer
          attribution={attributions[mapStyle]}
          url={tiles[mapStyle]}
        />

        {/* Controladores Lógicos */}
        <MapController 
            activities={visibleActivities} 
            shouldFly={shouldFly} 
            setShouldFly={setShouldFly} 
        />
        
        <RoutingLayer 
            activities={visibleActivities} 
            onSummaryFound={setStats}
        />

        {/* Marcadores */}
        {visibleActivities.map((a, index) => {
            // Determinar tipo de pin
            const isStart = index === 0;
            const isEnd = index === visibleActivities.length - 1;
            const type = isStart ? "start" : isEnd ? "end" : "mid";

            return (
                <Marker
                    key={a.id}
                    position={[a.lat, a.lng]}
                    icon={createCustomIcon(index, type)}
                >
                    <Tooltip direction="top" offset={[0, -32]} opacity={1} className="custom-tooltip border-none shadow-xl rounded-lg overflow-hidden p-0">
                        <div className="bg-background text-foreground px-3 py-2 border-b border-border">
                            <p className="font-bold text-xs">{a.nombre}</p>
                        </div>
                        {a.start_time && (
                            <div className="bg-muted px-3 py-1.5 flex items-center gap-1.5">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <p className="text-[10px] text-muted-foreground font-medium">{a.start_time}</p>
                            </div>
                        )}
                    </Tooltip>
                </Marker>
            );
        })}
      </MapContainer>

      {/* Global CSS Overrides */}
      <style jsx global>{`
        /* Ocultar panel de routing por defecto */
        .leaflet-routing-container { display: none !important; }
        
        /* Tooltip estilos */
        .leaflet-tooltip.custom-tooltip {
            background: transparent;
            border: none;
            box-shadow: none;
        }
        .leaflet-tooltip-left:before, .leaflet-tooltip-right:before, .leaflet-tooltip-bottom:before, .leaflet-tooltip-top:before {
            display: none; /* Quitar la flechita default fea */
        }

        /* Animación suave de los marcadores */
        .custom-pin-icon {
            transition: transform 0.2s ease;
        }
        .custom-pin-icon:hover {
            transform: scale(1.1) translateY(-5px);
            z-index: 1000 !important;
        }
      `}</style>
    </div>
  );
}