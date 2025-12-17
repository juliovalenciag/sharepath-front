"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { ItinerariosAPI } from "@/api/ItinerariosAPI";
import type {
  ItinerarioData,
  ItinerarioListResponse,
  LugarData,
} from "@/api/interfaces/ApiRoutes";

import { Button } from "@/components/ui/button";

// Importamos nuestros nuevos componentes lindos
import { CalendarWidget } from "./components/CalendarioWidget";
import { DayTimeline } from "./components//DayTimeline";

// --- HELPERS (Se mantienen igual para la lógica de fechas) ---
type DayKey = `${number}-${string}-${string}`;
function dayKeyFromDate(d: Date): DayKey {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}` as DayKey;
}
function toDayKey(input?: string | null): DayKey | null {
  if (!input) return null;
  const isoMatch = input.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) return isoMatch[1] as DayKey;
  const d = new Date(input);
  if (Number.isNaN(+d)) return null;
  return dayKeyFromDate(d);
}
function keyToLocalNoonDate(key: DayKey): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}
function eachDayKeyInclusive(startKey: DayKey, endKey: DayKey): DayKey[] {
  const start = keyToLocalNoonDate(startKey);
  const end = keyToLocalNoonDate(endKey);
  const out: DayKey[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    out.push(dayKeyFromDate(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}
function indexItinerariosByDay(itinerarios: ItinerarioData[]) {
  const byDay = new Map<DayKey, ItinerarioData[]>();
  const dayKeys = new Set<DayKey>();

  const add = (key: DayKey, it: ItinerarioData) => {
    const arr = byDay.get(key) ?? [];
    if (!arr.some((x) => String(x.id) === String(it.id))) arr.push(it);
    byDay.set(key, arr);
    dayKeys.add(key);
  };

  for (const it of itinerarios) {
    const startK = toDayKey(it.start_date);
    const endK = toDayKey(it.end_date);
    if (startK && endK) {
      for (const k of eachDayKeyInclusive(startK, endK)) add(k, it);
      continue;
    }
    for (const a of it.actividades ?? []) {
      const k = toDayKey(a.fecha);
      if (k) add(k, it);
    }
  }
  const daysWithItineraries = Array.from(dayKeys)
    .sort()
    .map((k) => keyToLocalNoonDate(k));
  return { byDay, daysWithItineraries };
}

function useResponsiveMonths() {
  const [months, setMonths] = React.useState(1);
  React.useEffect(() => {
    const compute = () => (window.innerWidth >= 1280 ? 2 : 1);
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);
  return months;
}

// --- PAGE COMPONENT ---
export default function ItinerariosCalendarioPage() {
  const months = useResponsiveMonths();
  const [loading, setLoading] = React.useState(true);
  const [itinerarios, setItinerarios] = React.useState<ItinerarioData[]>([]);
  const [selected, setSelected] = React.useState<Date>(new Date());

  // Cache para los lugares (evita re-fetching)
  const placesRef = React.useRef<Map<string, LugarData>>(new Map());
  const [, forceRender] = React.useReducer((x) => x + 1, 0);

  // Fetch inicial
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const resp = await ItinerariosAPI.getInstance().getMyItinerarios();
        const list = Array.isArray(resp) ? resp : resp?.itinerarios ?? [];
        if (mounted) setItinerarios(list);
      } catch (e) {
        toast.error("Error cargando itinerarios");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Procesamiento de datos
  const { byDay, daysWithItineraries } = React.useMemo(
    () => indexItinerariosByDay(itinerarios),
    [itinerarios]
  );
  const selectedKey = React.useMemo(() => dayKeyFromDate(selected), [selected]);
  const selectedItinerarios = byDay.get(selectedKey) ?? [];

  // Fetch de detalles de lugares on-demand
  const ensurePlaces = React.useCallback(async (ids: string[]) => {
    const unique = Array.from(new Set(ids.filter(Boolean)));
    const missing = unique.filter((id) => !placesRef.current.has(id));
    if (missing.length === 0) return;

    const results = await Promise.allSettled(
      missing.map((id) => ItinerariosAPI.getInstance().getLugarById(id))
    );
    results.forEach((r, idx) => {
      if (r.status === "fulfilled" && r.value) {
        placesRef.current.set(missing[idx], r.value);
      }
    });
    forceRender();
  }, []);

  React.useEffect(() => {
    if (selectedItinerarios.length === 0) return;
    const ids: string[] = [];

    // Helpers internos para extracción
    const getLugarId = (a: any) =>
      a?.lugarId ?? a?.lugar_id ?? a?.placeId ?? a?.id_api_place ?? null;
    const getEmbed = (a: any) =>
      a?.lugar && typeof a.lugar === "object" && a.lugar.nombre
        ? a.lugar
        : null;

    for (const it of selectedItinerarios) {
      for (const a of it.actividades ?? []) {
        const embedded = getEmbed(a);
        if (embedded?.id_api_place)
          placesRef.current.set(String(embedded.id_api_place), embedded);

        const id = getLugarId(a);
        // Validamos fecha simple
        const activityDate = a.fecha ? String(a.fecha).split("T")[0] : null;
        if (activityDate === selectedKey && id) ids.push(String(id));
      }
    }
    void ensurePlaces(ids);
  }, [selectedItinerarios, selectedKey, ensurePlaces]);

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] text-slate-900">
      {/* Background Decorativo */}
      <div
        className="fixed inset-0 z-0 opacity-40"
        style={{
          backgroundImage: "radial-gradient(#E2E8F0 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      ></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 md:px-6 lg:py-12">
        {/* HEADER PRINCIPAL */}
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 lg:text-5xl">
              Hola, Viajero
            </h1>
            <p className="text-lg text-slate-500">
              Aquí tienes el resumen de tus próximas aventuras.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setSelected(new Date())}
              className="rounded-full border-slate-300 bg-white hover:bg-slate-50"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Hoy
            </Button>
            <Button
              asChild
              className="rounded-full bg-primary px-6 shadow-lg shadow-indigo-200 hover:bg-indigo-700"
            >
              <Link href="/viajero/itinerarios/crear">
                <Plus className="mr-2 h-5 w-5" />
                Nuevo Itinerario
              </Link>
            </Button>
          </div>
        </div>

        {/* GRID PRINCIPAL */}
        <div className="grid gap-8 lg:grid-cols-[420px_1fr] xl:gap-12">
          {/* COLUMNA IZQUIERDA: CALENDARIO WIDGET */}
          <aside className="flex flex-col gap-6 lg:sticky lg:top-8 lg:h-fit">
            <CalendarWidget
              selected={selected}
              onSelect={setSelected}
              daysWithItineraries={daysWithItineraries}
              totalItineraries={itinerarios.length}
              monthsVisible={months}
            />
          </aside>

          {/* COLUMNA DERECHA: TIMELINE DE ACTIVIDADES */}
          <main>
            <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-2xl font-bold capitalize text-slate-800">
                  {format(selected, "EEEE d 'de' MMMM", { locale: es })}
                </h2>
                <p className="text-sm font-medium text-slate-400 uppercase tracking-wide">
                  {format(selected, "yyyy")}
                </p>
              </div>
            </div>

            <DayTimeline
              selectedDate={selected}
              itinerarios={selectedItinerarios}
              placesCache={placesRef.current}
              loading={loading}
              selectedKey={selectedKey}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
