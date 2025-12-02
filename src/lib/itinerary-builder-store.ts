// src/lib/itinerary-builder-store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { RegionKey } from "./constants/regions";

// ========== TIPOS ==========

export type BuilderPlace = {
  id_api_place: string;
  nombre: string;
  latitud: number;
  longitud: number;
  foto_url: string | null;
  category?: string;
  descripcion?: string;
  mexican_state?: string;
  google_score?: number;
  total_reviews?: number;
};

export type BuilderActivity = {
  id: string;
  fecha: Date; // Se guarda como string ISO, se hidrata a Date
  descripcion: string;
  lugar: BuilderPlace;
  start_time: string | null; // "10:00"
  end_time: string | null; // "11:00"
};

export type BuilderMeta = {
  title: string;
  start: Date;
  end: Date;
  regions: RegionKey[];
  visibility: "private" | "friends" | "public"; // Agregado para soportar tu flujo completo
  companions: string[];
};

// Helpers de comparación para evitar re-renders innecesarios
function shallowEqualArray<T>(a: T[], b: T[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  return a.every((val, i) => val === b[i]);
}

type SetActivitiesInput =
  | BuilderActivity[]
  | ((prev: BuilderActivity[]) => BuilderActivity[]);

type ItineraryBuilderState = {
  meta: BuilderMeta | null;
  actividades: BuilderActivity[];

  // Acciones
  setMeta: (meta: BuilderMeta | null) => void;

  /**
   * Actualiza la lista completa de actividades.
   * Útil para reordenamiento (drag & drop) o optimización.
   */
  setActivities: (input: SetActivitiesInput) => void;

  addActivity: (activity: BuilderActivity) => void;
  updateActivity: (id: string, patch: Partial<BuilderActivity>) => void;
  removeActivity: (id: string) => void;

  /**
   * Borra todo el estado y el localStorage asociado.
   */
  clear: () => void;
};

// ========== STORE ==========

export const useItineraryBuilderStore = create<ItineraryBuilderState>()(
  persist(
    (set, get) => ({
      meta: null,
      actividades: [],

      setMeta: (meta) => {
        const current = get().meta;
        // Evitamos actualización si es idéntico (optimización)
        if (JSON.stringify(current) === JSON.stringify(meta)) return;
        set({ meta });
      },

      setActivities: (input) => {
        set((state) => {
          const prev = state.actividades;
          const next = typeof input === "function" ? input(prev) : input;

          if (shallowEqualArray(prev, next)) return state;
          return { actividades: next };
        });
      },

      addActivity: (activity) => {
        set((state) => {
          // Prevenir duplicados de ID (seguridad extra)
          if (state.actividades.some((a) => a.id === activity.id)) return state;
          return { actividades: [...state.actividades, activity] };
        });
      },

      updateActivity: (id, patch) => {
        set((state) => ({
          actividades: state.actividades.map((a) =>
            a.id === id ? { ...a, ...patch } : a
          ),
        }));
      },

      removeActivity: (id) => {
        set((state) => ({
          actividades: state.actividades.filter((a) => a.id !== id),
        }));
      },

      clear: () => set({ meta: null, actividades: [] }),
    }),
    {
      name: "itinerary-builder-storage-v2", // Nombre clave en localStorage
      storage: createJSONStorage(() => localStorage),

      // --- HIDRATACIÓN ---
      // Convierte los strings de fecha de vuelta a objetos Date reales al recargar la página
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        if (state.meta) {
          state.meta.start = new Date(state.meta.start);
          state.meta.end = new Date(state.meta.end);
        }

        if (state.actividades) {
          state.actividades = state.actividades.map((a) => ({
            ...a,
            fecha: new Date(a.fecha),
          }));
        }
      },
    }
  )
);

// ========== HELPER PARA PAYLOAD (Conexión con Backend) ==========
// Este helper prepara los datos para que coincidan con lo que tu API espera
export function buildItineraryPayload(
  meta: BuilderMeta,
  actividades: BuilderActivity[]
) {
  return {
    title: meta.title,
    visibility: meta.visibility,
    regions: meta.regions,
    start_date: meta.start.toISOString().slice(0, 10), // YYYY-MM-DD
    end_date: meta.end.toISOString().slice(0, 10),

    // Mapeo hacia la interfaz 'Actividad' del backend
    actividades: actividades.map((a) => ({
      fecha: a.fecha.toISOString().slice(0, 10),
      description: a.descripcion || "", // CORRECCIÓN: El campo esperado por la API es "description"
      lugarId: a.lugar.id_api_place,

      // Datos extra que agregamos a la interfaz en el paso anterior
      start_time: a.start_time || null,
      end_time: a.end_time || null,
    })),
  };
}
