// src/stores/trip-store.ts
"use client";
import { create } from "zustand";

export type Place = {
  id: string;
  name: string;
  city: string;
  tag: string; // cultura | parque | naturaleza | historia | ...
  rating?: number; // 4.6
  popular?: boolean;
  lat: number;
  lng: number;
  image?: string;
  about?: string;
  why?: string[];
  tips?: string[];
  reviews?: string[];
};

type TripState = {
  activeDayKey: string | null;
  byDay: Record<string, Place[]>;
  selectedPlace: Place | null;
  setActiveDay: (k: string) => void;
  addPlace: (dayKey: string, p: Place) => void;
  removePlace: (dayKey: string, idx: number) => void;
  movePlace: (dayKey: string, from: number, to: number) => void;
  selectPlace: (p: Place | null) => void;
};

export const useTrip = create<TripState>((set) => ({
  activeDayKey: null,
  byDay: {},
  selectedPlace: null,
  setActiveDay: (k) => set({ activeDayKey: k }),
  addPlace: (dayKey, p) =>
    set((s) => ({
      byDay: { ...s.byDay, [dayKey]: [...(s.byDay[dayKey] ?? []), p] },
    })),
  removePlace: (dayKey, idx) =>
    set((s) => {
      const list = [...(s.byDay[dayKey] ?? [])];
      list.splice(idx, 1);
      return { byDay: { ...s.byDay, [dayKey]: list } };
    }),
  movePlace: (dayKey, from, to) =>
    set((s) => {
      const arr = [...(s.byDay[dayKey] ?? [])];
      if (to < 0 || to >= arr.length) return s;
      const [it] = arr.splice(from, 1);
      arr.splice(to, 0, it);
      return { byDay: { ...s.byDay, [dayKey]: arr } };
    }),
  selectPlace: (p) => set({ selectedPlace: p }),
}));
