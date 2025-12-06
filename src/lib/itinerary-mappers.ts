import { format, parseISO, addDays, differenceInCalendarDays } from "date-fns";
import type {
  ItinerarioData,
  Actividad,
  LugarData,
  CreateItinerarioRequest,
} from "@/api/interfaces/ApiRoutes";
import type {
  BuilderActivity,
  BuilderMeta,
} from "@/lib/itinerary-builder-store";

export function buildMetaFromItinerario(
  it: ItinerarioData,
  actividades: Actividad[],
  lugaresById: Record<string, LugarData>
): BuilderMeta {
  // Fechas: intentamos usar start_date / end_date, si no, calculamos por actividades
  let start: Date;
  let end: Date;

  if (it.start_date && it.end_date) {
    start = parseISO(it.start_date);
    end = parseISO(it.end_date);
  } else {
    const fechas = actividades.map((a) => new Date(a.fecha));
    fechas.sort((a, b) => a.getTime() - b.getTime());
    start = fechas[0];
    end = fechas[fechas.length - 1];
  }

  // Regiones: si vienen en el itinerario, las usamos; si no, inferimos de los lugares.
  let regions: string[] =
    it.regions && it.regions.length
      ? it.regions
      : Array.from(
          new Set(
            actividades
              .map((a) => lugaresById[a.lugarId]?.mexican_state)
              .filter(Boolean)
          )
        );

  return {
    title: it.title,
    start,
    end,
    regions: regions as any, // RegionKey[]
    companions: [], // o lo que ya uses en tu builder
    // visibility, etc., si ya lo tienes en tu BuilderMeta
  };
}

export function buildBuilderActivitiesFromItinerario(
  actividades: Actividad[],
  lugaresById: Record<string, LugarData>
): BuilderActivity[] {
  return actividades.map((a, idx) => {
    const lugar = lugaresById[a.lugarId];
    return {
      id: `${a.lugarId}-${idx}`,
      fecha: new Date(a.fecha),
      start_time: a.start_time ?? null,
      end_time: a.end_time ?? null,
      descripcion: a.description,
      lugar,
    } as BuilderActivity;
  });
}

export function buildRequestFromBuilder(
  meta: BuilderMeta,
  actividades: BuilderActivity[]
): CreateItinerarioRequest {
  const start_date = meta.start ? format(meta.start, "yyyy-MM-dd") : undefined;
  const end_date = meta.end ? format(meta.end, "yyyy-MM-dd") : undefined;

  return {
    title: meta.title,
    actividades: actividades.map<Actividad>((a) => ({
      fecha: format(a.fecha, "yyyy-MM-dd"),
      description: a.descripcion || "",
      lugarId: a.lugar.id_api_place,
      start_time: a.start_time ?? null,
      end_time: a.end_time ?? null,
    })),
    start_date,
    end_date,
    regions: meta.regions as string[] | undefined,
    // visibility: meta.visibility ?? "private",
  };
}
