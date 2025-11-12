"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  MAX_DAYS,
  Place,
  StateKey,
  suggestPlacesByRadius,
  centerForStates,
  haversineKm,
} from "@/lib/constants/mock-itinerary-data";

export type DayPlace = Place & { note?: string };

export type Day = {
  id: string;         // yyyy-mm-dd
  nombre: string;     // "Día 1 (12 nov)"
  places: DayPlace[];
  date: Date;
};

type Filters = {
  q: string;
  category: string | null;
  radiusKm: number;
};

type Store = {
  states: StateKey[];
  startDate: string;
  days: Day[];
  activeDayId: string;
  selectedPlaceId: string | null;

  // UI / map
  showMapOnMobile: boolean;
  filters: Filters;
  showResults: boolean;       // muestra panel/markers de resultados
  showRoute: boolean;         // dibujar ruta
  routeStartId: string | null;

  // getters
  activeDay(): Day | null;
  center(): { lat: number; lng: number };

  // acciones
  initDraft: (opts?: { startDate?: string; days?: number; states?: StateKey[] }) => void;
  setActiveDay: (id: string) => void;
  addDay: () => void;
  removeActiveDay: () => void;

  setSelectedPlace: (id: string | null) => void;

  addPlaceToActive: (place: Place) => void;
  setPlaceNote: (dayId: string, placeId: string, note: string) => void;
  movePlaceWithinDay: (dayId: string, oldIndex: number, newIndex: number) => void;
  movePlaceToDay: (placeId: string, toDayId: string) => void;
  removePlaceFromDay: (dayId: string, placeId: string) => void;

  optimizeDayOrder: (dayId: string, startId?: string) => void; // con heurística
  suggestForActive: () => void;

  setFilters: (p: Partial<Filters>) => void;
  setShowResults: (b: boolean) => void;

  toggleMapMobile: (b: boolean) => void;
  setShowRoute: (b: boolean) => void;
  setRouteStart: (placeId: string | null) => void;
};

function labelFor(date: Date, index: number) {
  const fmt = date.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
  return `Día ${index + 1} (${fmt})`;
}
function addDays(date: Date, n: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export const useItineraryStore = create<Store>()(
  persist(
    (set, get) => ({
      states: ["cdmx"],
      startDate: new Date().toISOString(),
      days: [],
      activeDayId: "",
      selectedPlaceId: null,

      showMapOnMobile: false,
      filters: { q: "", category: null, radiusKm: 25 },
      showResults: true,
      showRoute: false,
      routeStartId: null,

      activeDay() {
        const { activeDayId, days } = get();
        return days.find((d) => d.id === activeDayId) ?? null;
      },
      center() {
        return centerForStates(get().states);
      },

      initDraft(opts) {
        const start = opts?.startDate ? new Date(opts.startDate) : new Date();
        const n = Math.min(opts?.days ?? 2, MAX_DAYS);
        const states = (opts?.states?.length ? opts.states : get().states) as StateKey[];

        const newDays: Day[] = Array.from({ length: n }).map((_, i) => {
          const d = addDays(start, i);
          return {
            id: d.toISOString().slice(0, 10) + `-${i}`,  // evita claves duplicadas
            nombre: labelFor(d, i),
            places: [],
            date: d,
          };
        });

        set({
          states,
          startDate: start.toISOString(),
          days: newDays,
          activeDayId: newDays[0]?.id ?? "",
          selectedPlaceId: null,
        });
      },

      setActiveDay(id) {
        set({ activeDayId: id });
      },

      addDay() {
        const { days, startDate } = get();
        if (days.length >= MAX_DAYS) return;
        const d = addDays(new Date(startDate), days.length);
        const nuevo: Day = {
          id: d.toISOString().slice(0, 10) + `-${days.length}`,
          nombre: labelFor(d, days.length),
          places: [],
          date: d,
        };
        set({ days: [...days, nuevo], activeDayId: nuevo.id });
      },

      removeActiveDay() {
        const { activeDayId, days, startDate } = get();
        if (!activeDayId || days.length <= 1) return;
        const idx = days.findIndex((d) => d.id === activeDayId);
        if (idx < 0) return;

        // reconstruye secuencia y etiquetas desde startDate
        const kept = days.filter((d) => d.id !== activeDayId);
        const rebuilt = kept.map((_, i) => {
          const d = addDays(new Date(startDate), i);
          return {
            ...kept[i],
            id: d.toISOString().slice(0, 10) + `-${i}`,
            nombre: labelFor(d, i),
            date: d,
          };
        });
        const newActive = rebuilt[Math.max(0, idx - 1)]?.id ?? rebuilt[0]?.id ?? "";
        set({ days: rebuilt, activeDayId: newActive });
      },

      setSelectedPlace(id) {
        set({ selectedPlaceId: id });
      },

      addPlaceToActive(place) {
        const { activeDayId, days } = get();
        const idx = days.findIndex((d) => d.id === activeDayId);
        if (idx < 0) return;
        const exists = days[idx].places.some((p) => p.id_api_place === place.id_api_place);
        if (exists) return;
        const copy = [...days];
        copy[idx] = { ...copy[idx], places: [...copy[idx].places, { ...place }] };
        set({ days: copy });
      },

      setPlaceNote(dayId, placeId, note) {
        const { days } = get();
        const di = days.findIndex((d) => d.id === dayId);
        if (di < 0) return;
        const arr = days[di].places.map(p =>
          p.id_api_place === placeId ? { ...p, note } : p
        );
        const copy = [...days];
        copy[di] = { ...copy[di], places: arr };
        set({ days: copy });
      },

      movePlaceWithinDay(dayId, oldIndex, newIndex) {
        const { days } = get();
        const di = days.findIndex((d) => d.id === dayId);
        if (di < 0) return;
        const arr = [...days[di].places];
        const el = arr.splice(oldIndex, 1)[0];
        arr.splice(newIndex, 0, el);
        const copy = [...days];
        copy[di] = { ...copy[di], places: arr };
        set({ days: copy });
      },

      movePlaceToDay(placeId, toDayId) {
        const { days } = get();
        const fromIdx = days.findIndex((d) => d.places.some((p) => p.id_api_place === placeId));
        if (fromIdx < 0) return;
        const pl = days[fromIdx].places.find((p) => p.id_api_place === placeId)!;

        const copy = [...days];
        copy[fromIdx] = {
          ...copy[fromIdx],
          places: copy[fromIdx].places.filter((p) => p.id_api_place !== placeId),
        };
        const toIdx = copy.findIndex((d) => d.id === toDayId);
        if (toIdx >= 0 && !copy[toIdx].places.some((p) => p.id_api_place === placeId)) {
          copy[toIdx] = { ...copy[toIdx], places: [...copy[toIdx].places, pl] };
        }
        set({ days: copy, activeDayId: toDayId });
      },

      removePlaceFromDay(dayId, placeId) {
        const { days } = get();
        const di = days.findIndex((d) => d.id === dayId);
        if (di < 0) return;
        const copy = [...days];
        copy[di] = {
          ...copy[di],
          places: copy[di].places.filter((p) => p.id_api_place !== placeId),
        };
        set({ days: copy });
      },

      optimizeDayOrder(dayId, startId) {
        // Heurística “vecino más cercano” desde un inicio
        const { days } = get();
        const di = days.findIndex((d) => d.id === dayId);
        if (di < 0) return;
        const list = [...days[di].places];
        if (list.length < 2) return;

        const find = (id: string) => list.findIndex(p => p.id_api_place === id);
        let startIdx = startId ? find(startId) : 0;
        if (startIdx < 0) startIdx = 0;

        const route: DayPlace[] = [list[startIdx]];
        const pool = list.filter((_, i) => i !== startIdx);

        while (pool.length) {
          const last = route[route.length - 1];
          let bestI = 0, bestD = Infinity;
          pool.forEach((cand, i) => {
            const d = haversineKm(
              { lat: last.latitud, lng: last.longitud },
              { lat: cand.latitud, lng: cand.longitud }
            );
            if (d < bestD) { bestD = d; bestI = i; }
          });
          route.push(pool.splice(bestI, 1)[0]);
        }

        const copy = [...days];
        copy[di] = { ...copy[di], places: route };
        set({ days: copy, showRoute: true });
      },

      suggestForActive() {
        const { states, filters } = get();
        const suggested = suggestPlacesByRadius(
          states, filters.radiusKm, filters.q, filters.category as any
        );
        suggested.slice(0, 4).forEach((p) => get().addPlaceToActive(p));
      },

      setFilters(p) {
        set({ filters: { ...get().filters, ...p } });
      },
      setShowResults(b) { set({ showResults: b }); },

      toggleMapMobile(b) { set({ showMapOnMobile: b }); },
      setShowRoute(b) { set({ showRoute: b }); },
      setRouteStart(id) { set({ routeStartId: id }); },
    }),
    { name: "sharepath-itinerary" }
  )
);
