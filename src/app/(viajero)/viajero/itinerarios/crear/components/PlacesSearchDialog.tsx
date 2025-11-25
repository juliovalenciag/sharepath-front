// src/app/(viajero)/viajero/itinerarios/crear/components/PlaceSearchDialog.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import {
  Loader2,
  MapPin,
  Search,
  Sparkles,
  Star,
  Navigation,
  Info,
  Map,
  ArrowLeft,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import { ItinerariosAPI } from "@/api/ItinerariosAPI";
import type { LugarData } from "@/api/interfaces/ApiRoutes";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { DayInfo } from "./CinematicMap";

// --- TIPOS Y DATOS ---
type PlaceFilters = {
  state: string;
  category: string;
  minRating?: number;
};

const BASE_STATES = [
  "Ciudad de Mexico",
  "Estado de Mexico",
  "Hidalgo",
  "Morelos",
  "Querétaro",
];

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "amusement_park", label: "Parques de diversiones" },
  { value: "bowling_alley", label: "Boliche" },
  { value: "casino", label: "Casinos" },
  { value: "movie_theater", label: "Cines" },
  { value: "night_club", label: "Antros / Clubes nocturnos" },
  { value: "stadium", label: "Estadios" },
  { value: "aquarium", label: "Acuarios" },
  { value: "campground", label: "Zonas de camping" },
  { value: "park", label: "Parques" },
  { value: "zoo", label: "Zoológicos" },
  { value: "art_gallery", label: "Galerías de arte" },
  { value: "library", label: "Bibliotecas" },
  { value: "museum", label: "Museos" },
  { value: "tourist_attraction", label: "Atracciones turísticas" },
  { value: "bar", label: "Bares" },
  { value: "cafe", label: "Cafeterías" },
  { value: "restaurant", label: "Restaurantes" },
  { value: "beauty_salon", label: "Salones de belleza" },
  { value: "spa", label: "Spas" },
];

// --- UTILIDADES ---
function distanceKm(
  a: { latitud: number; longitud: number },
  b: { latitud: number; longitud: number }
) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.latitud - a.latitud);
  const dLon = toRad(b.longitud - a.longitud);
  const lat1 = toRad(a.latitud);
  const lat2 = toRad(b.latitud);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Componente visual para estrellas
const StarRating = ({
  score,
  size = 4,
}: {
  score: number;
  size?: number;
}) => {
  const roundedScore = Math.round(score);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            `h-${size} w-${size}`,
            star <= roundedScore
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted-foreground/20 dark:text-muted-foreground/10"
          )}
        />
      ))}
    </div>
  );
};

type PlaceSearchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDay: DayInfo | null;
  onAddLugarToDay: (lugar: LugarData) => void;
  defaultState?: string;
};

export function PlaceSearchDialog({
  open,
  onOpenChange,
  currentDay,
  onAddLugarToDay,
  defaultState,
}: PlaceSearchDialogProps) {
  // --- STATE ---
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<PlaceFilters>({
    state: "__all__",
    category: "__all__",
    minRating: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<LugarData[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<LugarData | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  // --- MEMOS ---
  const stateOptions = useMemo(() => {
    const set = new Set(BASE_STATES);
    if (defaultState && !set.has(defaultState)) {
      set.add(defaultState);
    }
    return Array.from(set);
  }, [defaultState]);

  // --- EFFECTS ---

  // Carga inicial basada en defaultState (ej. CDMX) para mostrar recomendados
  useEffect(() => {
    if (!open) {
      setQuery("");
      setSelectedPlace(null);
      setInitialLoaded(false);
      return;
    }

    if (open && defaultState && !initialLoaded) {
      setFilters((prev) => ({ ...prev, state: defaultState }));
      void loadInitialByState(defaultState);
    }
  }, [open, defaultState, initialLoaded]);

  // Búsqueda automática cuando cambian estado / categoría
  useEffect(() => {
    if (!open) return;

    // Si hay defaultState y aún no terminó la carga inicial, no disparamos todavía
    if (defaultState && !initialLoaded) return;

    // Evita buscar con todo México + todas las categorías + sin texto,
    // para no pegarle a la API hasta que el usuario elija algo.
    if (
      filters.state === "__all__" &&
      filters.category === "__all__" &&
      !query.trim()
    ) {
      return;
    }

    void handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.state, filters.category]);

  // --- API CALLS ---
  async function loadInitialByState(state: string) {
    setLoading(true);
    try {
      const api = ItinerariosAPI.getInstance();
      const resp = await api.getLugares(
        1,
        60,
        state,
        undefined,
        undefined as any
      );
      let lugares: LugarData[] = [];
      if (Array.isArray(resp)) {
        lugares = resp as any;
      } else if (resp && Array.isArray((resp as any).lugares)) {
        lugares = (resp as any).lugares;
      }
      setResults(lugares);
      setInitialLoaded(true);
    } catch (error: any) {
      console.error(error);
      toast.error("Error cargando lugares sugeridos.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    setLoading(true);
    setSelectedPlace(null);

    try {
      const api = ItinerariosAPI.getInstance();

      const apiState =
        filters.state && filters.state !== "__all__"
          ? filters.state
          : undefined;

      const apiCategory =
        filters.category && filters.category !== "__all__"
          ? filters.category
          : undefined;

      const searchQuery = query.trim();
      const apiQuery = searchQuery || undefined;

      const resp = await api.getLugares(
        1,
        60,
        apiState,
        apiCategory,
        apiQuery as any
      );

      let lugares: LugarData[] = [];
      if (Array.isArray(resp)) {
        lugares = resp as any;
      } else if (resp && Array.isArray((resp as any).lugares)) {
        lugares = (resp as any).lugares;
      }

      setResults(lugares);

      if (
        !lugares.length &&
        (apiState || apiCategory || searchQuery.length > 0)
      ) {
        toast.message("No se encontraron coincidencias.");
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Error en la búsqueda.");
    } finally {
      setLoading(false);
    }
  }

  // --- FILTERING + ORDEN POR RECOMENDADOS ---
  const filteredResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = results.filter((lugar) => {
      // Filtro por estado
      if (
        filters.state !== "__all__" &&
        filters.state &&
        lugar.mexican_state &&
        lugar.mexican_state !== filters.state
      ) {
        return false;
      }

      // Filtro por categoría
      if (
        filters.category !== "__all__" &&
        filters.category &&
        `${lugar.category ?? ""}`.toLowerCase() !==
          filters.category.toLowerCase()
      ) {
        return false;
      }

      // Filtro por rating mínimo
      if (filters.minRating && (lugar.google_score ?? 0) < filters.minRating) {
        return false;
      }

      // Filtro por texto (búsqueda libre) aplicado en front
      if (normalizedQuery) {
        const name = (lugar.nombre ?? "").toLowerCase();
        const cat = (lugar.category ?? "").toLowerCase();
        const state = (lugar.mexican_state ?? "").toLowerCase();

        const matches =
          name.includes(normalizedQuery) ||
          cat.includes(normalizedQuery) ||
          state.includes(normalizedQuery);

        if (!matches) return false;
      }

      return true;
    });

    // Ordenar por "más recomendados": rating DESC, reseñas DESC, nombre
    return filtered.sort((a, b) => {
      const scoreA = a.google_score ?? 0;
      const scoreB = b.google_score ?? 0;
      if (scoreA !== scoreB) return scoreB - scoreA;

      const reviewsA = a.total_reviews ?? 0;
      const reviewsB = b.total_reviews ?? 0;
      if (reviewsA !== reviewsB) return reviewsB - reviewsA;

      return (a.nombre ?? "").localeCompare(b.nombre ?? "");
    });
  }, [results, filters, query]);

  // --- SUGERENCIAS CERCA DEL LUGAR SELECCIONADO ---
  const suggested = useMemo(() => {
    if (!selectedPlace) return [] as LugarData[];
    return filteredResults
      .filter(
        (l) =>
          l.id_api_place !== selectedPlace.id_api_place &&
          l.category === selectedPlace.category &&
          typeof l.latitud === "number" &&
          typeof l.longitud === "number"
      )
      .map((l) => ({
        lugar: l,
        dist: distanceKm(
          { latitud: selectedPlace.latitud, longitud: selectedPlace.longitud },
          { latitud: l.latitud, longitud: l.longitud }
        ),
      }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 3)
      .map((x) => x.lugar);
  }, [filteredResults, selectedPlace]);

  const canAdd = !!currentDay && !!selectedPlace;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] w-[95vw] max-w-[95vw] flex-col gap-0 overflow-hidden rounded-xl border-border/50 p-0 shadow-2xl selection:bg-primary/20 selection:text-primary sm:max-w-[95vw] md:max-w-[90vw] lg:max-w-[1200px] xl:max-w-[1400px]">
        {/* HEADER */}
        <DialogHeader className="shrink-0 border-b border-border/60 bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="flex flex-wrap items-center justify-between gap-y-2">
            <div className="flex flex-col gap-0.5">
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                Explorar Destinos
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Descubre y añade lugares increíbles a tu plan de viaje.
              </DialogDescription>
            </div>
            {currentDay && (
              <Badge
                variant="outline"
                className="flex items-center gap-2 border-primary/20 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary shadow-sm dark:bg-primary/10 dark:text-primary-foreground"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>
                  Editando:{" "}
                  {format(currentDay.date, "EEEE d 'de' MMMM", { locale: es })}
                </span>
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* CONTAINER PRINCIPAL */}
        <div className="flex flex-1 flex-col overflow-hidden min-h-0 md:flex-row">
          {/* --- SIDEBAR: BUSCADOR Y LISTA --- */}
          <div
            className={cn(
              "flex flex-col border-r border-border/60 bg-muted/10 transition-all duration-300 dark:bg-card/30",
              selectedPlace ? "hidden md:flex" : "flex",
              "w-full shrink-0 md:w-[360px] lg:w-[400px] h-full min-h-0"
            )}
          >
            {/* BUSCADOR + FILTROS */}
            <div className="flex shrink-0 flex-col gap-3 border-b border-border/60 bg-background p-4 shadow-sm z-10 dark:bg-background/50">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar museo, parque, restaurante..."
                  className="h-11 rounded-xl border-muted bg-muted/20 pl-10 text-sm shadow-sm transition-all focus-visible:bg-background focus-visible:ring-primary/20 dark:border-border/40 dark:bg-secondary/50 dark:focus-visible:bg-background"
                  onKeyDown={(e) => e.key === "Enter" && void handleSearch()}
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  className="h-9 flex-1 rounded-lg text-xs font-semibold shadow-sm"
                  onClick={() => void handleSearch()}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  ) : null}
                  BUSCAR
                </Button>
                <Button
                  variant={showFilters ? "secondary" : "outline"}
                  size="icon"
                  className={cn(
                    "h-9 w-9 shrink-0 rounded-lg transition-colors border-input dark:border-border/40",
                    showFilters &&
                      "bg-secondary text-secondary-foreground dark:bg-primary/20 dark:text-primary"
                  )}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>

              {/* FILTROS DESPLEGABLES */}
              {showFilters && (
                <div className="grid grid-cols-2 gap-3 pt-2 animate-in slide-in-from-top-2 fade-in duration-200">
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      Estado
                    </label>
                    <Select
                      value={filters.state}
                      onValueChange={(v) =>
                        setFilters((prev) => ({ ...prev, state: v }))
                      }
                    >
                      <SelectTrigger className="h-8 rounded-lg text-xs dark:bg-secondary/30">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">Todo México</SelectItem>
                        {stateOptions.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      Categoría
                    </label>
                    <Select
                      value={filters.category}
                      onValueChange={(v) =>
                        setFilters((prev) => ({ ...prev, category: v }))
                      }
                    >
                      <SelectTrigger className="h-8 rounded-lg text-xs dark:bg-secondary/30">
                        <SelectValue placeholder="Categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">Todas</SelectItem>
                        {CATEGORY_OPTIONS.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Rating Mínimo
                      </label>
                      <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
                        {filters.minRating
                          ? `${filters.minRating}+`
                          : "Cualquiera"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5 focus-within:ring-1 focus-within:ring-primary/30 dark:border-border/40 dark:bg-secondary/30">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                      <Input
                        type="number"
                        min="0"
                        max="5"
                        step="0.5"
                        placeholder="0.0"
                        className="h-5 flex-1 border-0 bg-transparent p-0 text-xs focus-visible:ring-0"
                        value={filters.minRating ?? ""}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            minRating: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* LISTA DE RESULTADOS */}
            <div className="flex-1 overflow-hidden bg-muted/5 dark:bg-black/20">
              <ScrollArea className="h-full pr-3">
                <div className="flex flex-col gap-2 p-3 pb-20">
                  <div className="flex items-center justify-between px-1 pb-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Resultados ({filteredResults.length})
                    </p>
                  </div>

                  {filteredResults.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center opacity-60">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted dark:bg-muted/20">
                        <Search className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Sin resultados
                        </p>
                        <p className="text-xs max-w-[200px] mx-auto text-muted-foreground">
                          Intenta ajustar los filtros o buscar con otro término.
                        </p>
                      </div>
                    </div>
                  )}

                  {filteredResults.map((lugar) => (
                    <button
                      key={lugar.id_api_place}
                      onClick={() => setSelectedPlace(lugar)}
                      className={cn(
                        "group relative flex w-full gap-3 rounded-xl border p-2.5 text-left transition-all duration-300",
                        selectedPlace?.id_api_place === lugar.id_api_place
                          ? "border-primary/50 bg-primary/5 shadow-md ring-1 ring-primary/20 dark:bg-primary/10"
                          : "border-transparent bg-background hover:border-primary/20 hover:bg-white hover:shadow-sm dark:bg-card/50 dark:hover:bg-accent/50 dark:hover:border-primary/30"
                      )}
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted shadow-inner dark:bg-muted/20">
                        {lugar.foto_url ? (
                          <Image
                            src={lugar.foto_url}
                            alt={lugar.nombre}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            sizes="64px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <MapPin className="h-6 w-6 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 min-w-0 flex-col justify-center gap-0.5">
                        <h4 className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          {lugar.nombre}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <span className="truncate max-w-[80px] font-medium">
                            {lugar.category}
                          </span>
                          <span className="text-muted-foreground/40">•</span>
                          <span className="truncate">
                            {lugar.mexican_state}
                          </span>
                        </div>
                        {typeof lugar.google_score === "number" && (
                          <div className="mt-1 flex items-center gap-1.5">
                            <StarRating score={lugar.google_score} size={3} />
                            <span className="text-[10px] text-muted-foreground font-medium">
                              ({lugar.total_reviews})
                            </span>
                          </div>
                        )}
                      </div>

                      {selectedPlace?.id_api_place === lugar.id_api_place && (
                        <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* --- MAIN AREA: DETALLES --- */}
          <div
            className={cn(
              "relative flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background md:flex dark:bg-background",
              !selectedPlace ? "hidden" : "flex",
              "w-full min-w-0"
            )}
          >
            {selectedPlace ? (
              <>
                <div className="flex shrink-0 items-center border-b border-border/60 p-2 md:hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 pl-2 text-muted-foreground hover:text-foreground"
                    onClick={() => setSelectedPlace(null)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="text-xs font-medium">Volver a lista</span>
                  </Button>
                </div>

                <ScrollArea className="h-full w-full">
                  <div className="flex flex-col p-6 lg:p-8 pb-32 max-w-5xl mx-auto w-full">
                    {/* Hero Image */}
                    <div className="group relative mb-8 aspect-video w-full shrink-0 overflow-hidden rounded-2xl bg-muted shadow-sm ring-1 ring-border/50 sm:aspect-[21/9] dark:bg-muted/20">
                      {selectedPlace.foto_url ? (
                        <Image
                          src={selectedPlace.foto_url}
                          alt={selectedPlace.nombre}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          priority
                          sizes="(max-width: 1280px) 100vw, 1000px"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-muted/50 text-muted-foreground dark:bg-muted/10">
                          <MapPin className="h-16 w-16 opacity-10" />
                          <p className="text-sm font-medium">
                            Sin imagen disponible
                          </p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border-0 uppercase tracking-widest text-[10px]">
                            {selectedPlace.category}
                          </Badge>
                          {selectedPlace.mexican_state && (
                            <div className="flex items-center gap-1 text-xs font-medium text-white/90 drop-shadow-sm">
                              <Map className="h-3.5 w-3.5" />
                              {selectedPlace.mexican_state}
                            </div>
                          )}
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight drop-shadow-md text-balance text-white">
                          {selectedPlace.nombre}
                        </h1>
                      </div>
                    </div>

                    {/* Info & Rating */}
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-foreground">
                            Calificación
                          </h3>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <span className="text-2xl font-bold text-foreground">
                              {selectedPlace.google_score
                                ? selectedPlace.google_score.toFixed(1)
                                : "N/A"}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              / 5.0
                            </span>
                          </div>
                          {typeof selectedPlace.google_score === "number" && (
                            <>
                              <div className="h-4 w-px bg-border" />
                              <div className="flex flex-col">
                                <StarRating
                                  score={selectedPlace.google_score}
                                  size={4}
                                />
                                <span className="text-xs text-muted-foreground mt-0.5">
                                  Basado en {selectedPlace.total_reviews} reseñas
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator className="mb-8" />

                    {/* Detalles */}
                    <div className="grid gap-6 lg:grid-cols-2 mb-10">
                      <div className="rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md dark:border-border/60">
                        <div className="mb-4 flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20">
                            <Info className="h-5 w-5" />
                          </div>
                          <h4 className="font-semibold text-foreground">
                            Acerca de este lugar
                          </h4>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                          Este destino en{" "}
                          <span className="font-medium text-foreground">
                            {selectedPlace.mexican_state}
                          </span>{" "}
                          es perfecto para viajeros interesados en experiencias
                          de tipo{" "}
                          <span className="font-medium text-foreground">
                            {selectedPlace.category}
                          </span>
                          .<br />
                          <br />
                          Asegúrate de revisar el clima y los horarios locales
                          antes de tu visita.
                        </p>
                      </div>

                      <div className="rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md dark:border-border/60">
                        <div className="mb-4 flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20">
                            <Navigation className="h-5 w-5" />
                          </div>
                          <h4 className="font-semibold text-foreground">
                            Ubicación y Coordenadas
                          </h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="rounded-lg bg-muted/40 p-3 dark:bg-muted/20">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                              Latitud
                            </span>
                            <div className="font-mono text-sm mt-1 text-foreground">
                              {selectedPlace.latitud}
                            </div>
                          </div>
                          <div className="rounded-lg bg-muted/40 p-3 dark:bg-muted/20">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                              Longitud
                            </span>
                            <div className="font-mono text-sm mt-1 text-foreground">
                              {selectedPlace.longitud}
                            </div>
                          </div>
                        </div>
                        <p className="mt-4 text-xs text-muted-foreground flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-500" />
                          Ubicación verificada para rutas óptimas.
                        </p>
                      </div>
                    </div>

                    {/* Sugerencias */}
                    {suggested.length > 0 && (
                      <div className="space-y-4 mb-15 ">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500/20" />
                          <h3 className="text-lg font-semibold text-foreground">
                            Cerca de aquí
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                          {suggested.map((s) => (
                            <div
                              key={s.id_api_place}
                              className="group flex cursor-pointer flex-col gap-3 rounded-xl border bg-card p-3 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg dark:border-border/60 dark:hover:bg-accent/30"
                              onClick={() => setSelectedPlace(s)}
                            >
                              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted dark:bg-muted/20">
                                {s.foto_url && (
                                  <Image
                                    src={s.foto_url}
                                    alt={s.nombre}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                  />
                                )}
                              </div>
                              <div className="space-y-1">
                                <p className="truncate text-sm font-bold group-hover:text-primary transition-colors text-foreground">
                                  {s.nombre}
                                </p>
                                <div className="flex items-center justify-between">
                                  <p className="truncate text-xs text-muted-foreground">
                                    {s.category}
                                  </p>
                                  {s.google_score && (
                                    <span className="flex items-center gap-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                                      <Star className="h-2.5 w-2.5 fill-current" />{" "}
                                      {s.google_score}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Footer Flotante */}
                <div className="absolute bottom-0 left-0 right-0 z-20 border-t bg-background/80 p-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sm:px-8 sm:py-5 dark:border-border/60 dark:bg-background/80">
                  <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <div className="hidden text-sm sm:block">
                      {currentDay ? (
                        <span className="text-muted-foreground">
                          Añadiendo a:{" "}
                          <span className="font-semibold text-foreground">
                            {format(currentDay.date, "EEEE d", { locale: es })}
                          </span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic">
                          Selecciona un día en el calendario
                        </span>
                      )}
                    </div>
                    <div className="flex w-full gap-3 sm:w-auto">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedPlace(null)}
                        className="flex-1 rounded-xl border-muted-foreground/20 hover:bg-muted sm:flex-none dark:hover:bg-accent"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={() => {
                          if (!currentDay || !selectedPlace) {
                            toast.error("Debes seleccionar un día primero.");
                            return;
                          }
                          onAddLugarToDay(selectedPlace);
                          toast.success(
                            `${selectedPlace.nombre} añadido al itinerario`
                          );
                        }}
                        disabled={!canAdd}
                        className="flex-1 rounded-xl bg-primary font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] hover:shadow-xl sm:min-w-[180px] dark:shadow-none dark:hover:bg-primary/90"
                      >
                        <MapPin className="mr-2 h-4 w-4" />
                        Añadir al Mapa
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // Empty State
              <div className="flex h-full flex-col items-center justify-center bg-muted/5 p-8 text-center animate-in fade-in duration-500 dark:bg-background/40">
                <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-tr from-primary/10 to-blue-500/5 shadow-2xl ring-1 ring-border dark:from-primary/20 dark:to-blue-500/10">
                  <Map className="h-14 w-14 text-primary/60 dark:text-primary/80" />
                </div>
                <h3 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
                  Comienza tu Aventura
                </h3>
                <p className="max-w-xs text-muted-foreground text-balance leading-relaxed">
                  Selecciona una atracción de la lista para ver sus fotos,
                  reseñas y detalles exclusivos.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
