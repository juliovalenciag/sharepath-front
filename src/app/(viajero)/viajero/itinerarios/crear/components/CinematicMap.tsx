
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  useMap,
  ZoomControl,
  Polyline,
} from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";

// --- ESTILOS ---
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

// --- UTILIDADES ---
import { format } from "date-fns";
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
  if (typeof window === "undefined") return undefined;

  let colorClass = "bg-blue-600";
  if (type === "start") colorClass = "bg-emerald-600";
  if (type === "end") colorClass = "bg-rose-600";

  return L.divIcon({
    className: "custom-pin-icon",
    html: `
      <div class="relative flex items-center justify-center group">
        <div class="absolute -bottom-1 h-3 w-3 rotate-45 bg-current ${colorClass.replace("bg-", "text-")} transition-transform group-hover:scale-110"></div>
        <div class="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-white shadow-lg ${colorClass} transition-transform group-hover:scale-110">
          <span class="text-xs font-bold">${index + 1}</span>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// --- COMPONENTE DE ROUTING (CON SEGURIDAD Y CARGA DINÁMICA) ---
function RoutingLayer({
  activities,
  onSummaryFound,
}: {
  activities: MapActivity[];
  onSummaryFound: (summary: { totalDistance: number; totalTime: number }) => void;
}) {
  const map = useMap();
  const routingControlRef = useRef<any>(null); // Usamos 'any' para evitar conflictos de tipos estrictos con la librería externa

  useEffect(() => {
    if (!map || typeof window === "undefined") return;

    // Importamos la librería aquí dentro para asegurar que 'window' y 'L' existen
    // Esto evita errores de SSR y problemas de inicialización
    const initializeRouting = async () => {
      // @ts-ignore
      if (!L.Routing) {
        await import("leaflet-routing-machine");
      }

      // Limpiar control previo
      if (routingControlRef.current) {
        try {
          map.removeControl(routingControlRef.current);
        } catch (e) {}
        routingControlRef.current = null;
      }

      // Si no hay suficientes puntos, reseteamos stats y salimos
      if (activities.length < 2) {
        onSummaryFound({ totalDistance: 0, totalTime: 0 });
        return;
      }

      const waypoints = activities.map((a) => L.latLng(a.lat, a.lng));

      try {
        // @ts-ignore
        const control = L.Routing.control({
          waypoints,
          // @ts-ignore
          router: L.Routing.osrmv1({
            serviceUrl: "https://router.project-osrm.org/route/v1",
            profile: "foot", // Modo caminata
          }),
          lineOptions: {
            styles: [{ color: "#3b82f6", opacity: 0.9, weight: 5 }], // Línea azul sólida
            extendToWaypoints: true,
            missingRouteTolerance: 50,
          },
          show: false, // Ocultar instrucciones de texto
          addWaypoints: false,
          draggableWaypoints: false,
          fitSelectedRoutes: false, // Manejamos el zoom nosotros
          createMarker: () => null, // No crear marcadores default
        });

        control.on("routesfound", function (e: any) {
          const routes = e.routes;
          if (routes && routes.length > 0) {
            const summary = routes[0].summary;
            onSummaryFound({
              totalDistance: summary.totalDistance,
              totalTime: summary.totalTime,
            });
          }
        });

        control.addTo(map);
        routingControlRef.current = control;
      } catch (error) {
        console.warn("Error al inicializar rutas:", error);
      }
    };

    initializeRouting();

    return () => {
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
      try {
        const bounds = L.latLngBounds(
          activities.map((a) => [a.lat, a.lng] as LatLngExpression)
        );
        if (bounds.isValid()) {
          map.flyToBounds(bounds, { padding: [100, 100], duration: 1.5 });
        }
      } catch (e) {}
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
  // Key única para forzar remontaje limpio si es necesario
  const [mapKey] = useState(() => `map-${Math.random().toString(36).slice(2)}`);
  
  const [mapStyle, setMapStyle] = useState<"streets" | "satellite">("streets");
  const [stats, setStats] = useState({ totalDistance: 0, totalTime: 0 });
  const [shouldFly, setShouldFly] = useState(true);

  const effectiveDayKey = selectedDayKey ?? (days.length ? days[0].key : null);

  const visibleActivities = useMemo(() => {
    if (!effectiveDayKey) return [] as MapActivity[];
    return activities
      .filter((a) => format(a.fecha, "yyyy-MM-dd") === effectiveDayKey)
      .sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""));
  }, [activities, effectiveDayKey]);

  // Coordenadas para la línea de respaldo (Polyline)
  const polylinePositions = useMemo(() => {
    return visibleActivities.map(a => [a.lat, a.lng] as LatLngExpression);
  }, [visibleActivities]);

  useEffect(() => {
    setShouldFly(true);
  }, [effectiveDayKey]);

  const center: LatLngExpression =
    visibleActivities.length > 0
      ? [visibleActivities[0].lat, visibleActivities[0].lng]
      : [19.4326, -99.1332];

  const tiles = {
    streets: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  };

  const attributions = {
    streets: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
    satellite: "Tiles &copy; Esri",
  };

  // Formato de estadísticas
  const distanceKm = (stats.totalDistance / 1000).toFixed(1);
  const timeHours = Math.floor(stats.totalTime / 3600);
  const timeMinutes = Math.floor((stats.totalTime % 3600) / 60);
  const timeString = timeHours > 0 ? `${timeHours}h ${timeMinutes}m` : `${timeMinutes} min`;

  return (
    <div className="relative h-full w-full overflow-hidden bg-muted/20">
      
      {/* BARRA DE DÍAS */}
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

      {/* PANEL DE ESTADÍSTICAS (Solo si hay más de 1 lugar) */}
      {visibleActivities.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[500] pointer-events-none animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="pointer-events-auto flex items-center gap-4 rounded-2xl bg-black/85 px-5 py-2.5 text-white shadow-2xl backdrop-blur-md border border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-blue-500/20 text-blue-400">
                <Footprints className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-white/50 font-bold uppercase tracking-wider">Distancia</span>
                <span className="text-sm font-bold leading-none">{distanceKm} km</span>
              </div>
            </div>
            <div className="h-8 w-px bg-white/10"></div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-400">
                 <Clock className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-white/50 font-bold uppercase tracking-wider">Tiempo</span>
                <span className="text-sm font-bold leading-none">{timeString}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTROLES MAPA */}
      <div className="absolute right-4 top-20 z-[500] flex flex-col gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="secondary" className="h-10 w-10 rounded-xl shadow-lg bg-background/90 backdrop-blur-md hover:bg-background">
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
              <Navigation className="h-4 w-4" />
              <span>Satélite</span>
              {mapStyle === "satellite" && <div className="ml-auto h-2 w-2 rounded-full bg-primary" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button 
            size="icon" 
            variant="secondary" 
            className="h-10 w-10 rounded-xl shadow-lg bg-background/90 backdrop-blur-md hover:bg-background"
            onClick={() => setShouldFly(true)}
            title="Centrar ruta"
        >
            <LocateFixed className="h-5 w-5 text-foreground/80" />
        </Button>
      </div>

      {/* MAPA */}
      <MapContainer
        key={mapKey}
        center={center}
        zoom={13}
        className="h-full w-full outline-none"
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        
        <TileLayer
          attribution={attributions[mapStyle]}
          url={tiles[mapStyle]}
        />

        {/* 1. LÍNEA DE RESPALDO (Siempre visible como guía directa) */}
        {visibleActivities.length > 1 && (
            <Polyline 
                positions={polylinePositions}
                pathOptions={{ 
                    color: '#94a3b8', // Gris slate
                    weight: 4, 
                    dashArray: '10, 10', // Punteada
                    opacity: 0.6 
                }} 
            />
        )}

        <MapController 
            activities={visibleActivities} 
            shouldFly={shouldFly} 
            setShouldFly={setShouldFly} 
        />
        
        {/* 2. RUTA REAL (Se dibuja encima de la línea de respaldo si el servicio funciona) */}
        <RoutingLayer 
            activities={visibleActivities} 
            onSummaryFound={setStats}
        />

        {/* MARCADORES */}
        {visibleActivities.map((a, index) => {
            const isStart = index === 0;
            const isEnd = index === visibleActivities.length - 1;
            const type = isStart ? "start" : isEnd ? "end" : "mid";
            
            const icon = createCustomIcon(index, type);
            if (!icon) return null;

            return (
                <Marker
                    key={a.id}
                    position={[a.lat, a.lng]}
                    icon={icon}
                >
                    <Tooltip direction="top" offset={[0, -36]} opacity={1} className="custom-tooltip border-none shadow-xl rounded-lg overflow-hidden p-0">
                        <div className="bg-background text-foreground px-3 py-2 border-b border-border min-w-[120px]">
                            <p className="font-bold text-xs leading-tight">{a.nombre}</p>
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

      {/* CSS GLOBAL PARA LIMPIEZA */}
      <style jsx global>{`
        /* Ocultar panel de instrucciones de routing machine */
        .leaflet-routing-container { display: none !important; }
        
        /* Limpiar estilos del tooltip */
        .leaflet-tooltip.custom-tooltip {
            background: transparent;
            border: none;
            box-shadow: none;
        }
        .leaflet-tooltip-left:before, .leaflet-tooltip-right:before, .leaflet-tooltip-bottom:before, .leaflet-tooltip-top:before {
            display: none; 
        }

        /* Animación para los pines */
        .custom-pin-icon {
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .custom-pin-icon:hover {
            transform: scale(1.15) translateY(-8px);
            z-index: 1000 !important;
        }
      `}</style>
    </div>
  );
}