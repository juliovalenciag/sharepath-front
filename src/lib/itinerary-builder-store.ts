// src/lib/itinerary-builder-store.ts
import { create } from "zustand";

// ========== Tipos base ==========

export type BuilderPlace = {
  id_api_place: string;
  nombre: string;
  latitud: number;
  longitud: number;
  foto_url: string | null;
  category?: string;
  mexican_state?: string;
  google_score?: number;
  total_reviews?: number;
};

export type BuilderActivity = {
  id: string;
  fecha: Date;
  description: string;
  lugar: BuilderPlace;
  start_time: string | null;
  end_time: string | null;
};

export type BuilderMeta = {
  title: string;
  start: Date;
  end: Date;
  regions: string[];
  visibility: "private" | "friends" | "public";
};

// ========== Helpers internos ==========

type SetActivitiesInput =
  | BuilderActivity[]
  | ((prev: BuilderActivity[]) => BuilderActivity[]);

function shallowEqualArray<T>(a: T[], b: T[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// ========== Estado del builder ==========

type ItineraryBuilderState = {
  meta: BuilderMeta | null;
  actividades: BuilderActivity[];

  setMeta: (meta: BuilderMeta | null) => void;
  /**
   * Reemplaza la lista de actividades.
   * Acepta un array nuevo o una función (prev) => next.
   */
  setActivities: (input: SetActivitiesInput) => void;

  addActivity: (activity: BuilderActivity) => void;
  updateActivity: (id: string, patch: Partial<BuilderActivity>) => void;
  removeActivity: (id: string) => void;

  /**
   * Limpia todo el estado del builder (meta + actividades).
   */
  clear: () => void;
};

export const useItineraryBuilderStore = create<ItineraryBuilderState>()(
  (set) => ({
    meta: null,
    actividades: [],

    setMeta: (meta) => {
      set((state) => {
        // Si es exactamente el mismo objeto, no dispares update
        if (state.meta === meta) return state;
        return { ...state, meta };
      });
    },

    setActivities: (input) => {
      set((state) => {
        const prev = state.actividades;
        const next =
          typeof input === "function"
            ? (input as (prev: BuilderActivity[]) => BuilderActivity[])(prev)
            : input;

        // Evita rerenders si el array es superficialmente igual
        if (shallowEqualArray(prev, next)) return state;

        return { ...state, actividades: next };
      });
    },

    addActivity: (activity) => {
      set((state) => {
        // Evita duplicar por id
        if (state.actividades.some((a) => a.id === activity.id)) {
          return state;
        }
        return { ...state, actividades: [...state.actividades, activity] };
      });
    },

    updateActivity: (id, patch) => {
      set((state) => {
        const updated = state.actividades.map((a) =>
          a.id === id ? { ...a, ...patch } : a
        );
        if (shallowEqualArray(state.actividades, updated)) return state;
        return { ...state, actividades: updated };
      });
    },

    removeActivity: (id) => {
      set((state) => {
        const filtered = state.actividades.filter((a) => a.id !== id);
        if (filtered.length === state.actividades.length) return state;
        return { ...state, actividades: filtered };
      });
    },

    clear: () => ({
      meta: null,
      actividades: [],
    }),
  })
);

// ========== Helper para payload del backend ==========

export function buildItineraryPayload(
  meta: BuilderMeta,
  actividades: BuilderActivity[]
) {
  return {
    title: meta.title,
    visibility: meta.visibility,
    regions: meta.regions,
    start_date: meta.start.toISOString().slice(0, 10),
    end_date: meta.end.toISOString().slice(0, 10),
    actividades: actividades.map((a) => ({
      fecha: a.fecha.toISOString().slice(0, 10),
      description: a.description,
      lugarId: a.lugar.id_api_place,
      start_time: a.start_time,
      end_time: a.end_time,
    })),
  };
}
