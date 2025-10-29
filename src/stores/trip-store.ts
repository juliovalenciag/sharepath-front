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
  lat?: number;
  lng?: number;
  img?: string;
  image?: string;
  about?: string;
  why?: string[];
  tips?: string[];
  reviews?: string[];
};

type TripState = {
  byDay: Record<string, Place[]>;
  selectedPlace: Place | null;

  addPlace: (dayKey: string, p: Place) => void;
  removePlace: (dayKey: string, index: number) => void;
  movePlace: (dayKey: string, from: number, to: number) => void;

  selectPlace: (p: Place | null) => void;
  clearDay: (dayKey: string) => void;
};

export const useTrip = create<TripState>()((set) => ({
  byDay: {},
  selectedPlace: null,

  addPlace: (dayKey, p) =>
    set((s) => ({
      byDay: { ...s.byDay, [dayKey]: [...(s.byDay[dayKey] ?? []), p] },
    })),

  removePlace: (dayKey, index) =>
    set((s) => {
      const arr = [...(s.byDay[dayKey] ?? [])];
      arr.splice(index, 1);
      return { byDay: { ...s.byDay, [dayKey]: arr } };
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
  clearDay: (dayKey) => set((s) => ({ byDay: { ...s.byDay, [dayKey]: [] } })),
}));
