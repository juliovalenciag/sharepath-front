"use client";

import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Clock,
  MapPin,
  ArrowRight,
  Star,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ItinerarioData, LugarData } from "@/api/interfaces/ApiRoutes";

// 1. IMPORTAMOS LA UTILIDAD DE CATEGORÍAS
import { getCategoryName } from "@/lib/category-utils";

// Helper para extraer datos seguros
function extractLugarId(a: any): string | null {
  const v =
    a?.lugarId ??
    a?.lugarID ??
    a?.lugar_id ??
    a?.id_lugar ??
    a?.placeId ??
    a?.place_id ??
    a?.id_api_place ??
    a?.lugar?.id_api_place ??
    null;
  return v ? String(v) : null;
}
function extractLugarEmbedded(a: any) {
  const l = a?.lugar ?? a?.place ?? a?.lugar_data ?? null;
  if (!l || typeof l !== "object") return null;
  return typeof l?.nombre === "string" ? l : null;
}

interface DayTimelineProps {
  selectedDate: Date;
  itinerarios: ItinerarioData[];
  placesCache: Map<string, LugarData>;
  loading: boolean;
  selectedKey: string;
}

export function DayTimeline({
  selectedDate,
  itinerarios,
  placesCache,
  loading,
  selectedKey,
}: DayTimelineProps) {
  if (loading) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-200 bg-slate-50/50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="text-sm font-medium text-slate-500">
          Cargando tus aventuras...
        </p>
      </div>
    );
  }

  if (itinerarios.length === 0) {
    return (
      <div className="flex h-[500px] flex-col items-center justify-center rounded-3xl border border-dashed bg-white px-4 text-center shadow-sm">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 ring-8 ring-indigo-50/50">
          <MapPin className="h-10 w-10 text-indigo-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Día Libre</h3>
        <p className="mt-2 max-w-xs text-sm text-slate-500">
          No tienes nada planeado para el <br />
          <span className="font-medium text-indigo-600">
            {format(selectedDate, "d 'de' MMMM", { locale: es })}
          </span>
          .
        </p>
        <Button
          asChild
          className="mt-8 rounded-full bg-indigo-600 px-8 hover:bg-indigo-700"
        >
          <Link href="/viajero/itinerarios/crear">
            <Plus className="mr-2 h-4 w-4" />
            Planear Aventura
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {itinerarios.map((it) => {
        const actsForDay = (it.actividades ?? []).filter((a: any) => {
          const d = a.fecha ? String(a.fecha).split("T")[0] : null;
          return d === selectedKey;
        });

        actsForDay.sort((a: any, b: any) =>
          (a.start_time || "").localeCompare(b.start_time || "")
        );

        return (
          <div key={String(it.id)} className="relative">
            <div className="sticky top-0 z-20 mb-6 flex items-center justify-between rounded-2xl border bg-white/80 p-4 shadow-sm backdrop-blur-md transition-all hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold">
                  {it.title.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 leading-tight">
                    {it.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {it.regions?.join(", ") || "Viaje General"}
                  </p>
                </div>
              </div>
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="rounded-full text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
              >
                <Link href={`/viajero/itinerarios/${it.id}/ver`}>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>

            <div className="ml-4 border-l-2 border-indigo-100 pl-8 pb-4 space-y-8">
              {actsForDay.length > 0 ? (
                actsForDay.map((a: any, idx: number) => {
                  const lugarId = extractLugarId(a);
                  const embedded = extractLugarEmbedded(a);
                  const lugar =
                    embedded ??
                    (lugarId ? placesCache.get(lugarId) : undefined);

                  const startTime = a.start_time?.slice(0, 5);
                  const endTime = a.end_time?.slice(0, 5);

                  return (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-[41px] top-4 flex h-5 w-5 items-center justify-center rounded-full bg-white ring-4 ring-indigo-50">
                        <div className="h-2.5 w-2.5 rounded-full bg-indigo-400 group-hover:bg-indigo-600 transition-colors" />
                      </div>

                      <Card className="overflow-hidden rounded-2xl border-0 shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-1 hover:shadow-lg hover:ring-indigo-200">
                        <div className="flex flex-col sm:flex-row">
                          <div className="relative h-40 w-full shrink-0 sm:h-auto sm:w-40 bg-slate-100">
                            {lugar?.foto_url ? (
                              <Image
                                src={lugar.foto_url}
                                alt={lugar.nombre}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-300">
                                <MapPin className="h-8 w-8" />
                              </div>
                            )}
                            <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm sm:hidden">
                              {startTime || "--:--"}
                            </div>
                          </div>

                          <div className="flex flex-1 flex-col p-5">
                            <div className="mb-2 flex items-start justify-between">
                              <div>
                                <h4 className="text-lg font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                                  {lugar?.nombre ?? "Actividad Personalizada"}
                                </h4>
                                <div className="flex items-center gap-1 text-sm text-slate-500">
                                  <MapPin className="h-3.5 w-3.5" />
                                  <span className="truncate max-w-[200px]">
                                    {lugar?.mexican_state
                                      ? `${lugar.mexican_state}, MX`
                                      : "Ubicación personal"}
                                  </span>
                                </div>
                              </div>
                              {lugar?.google_score && (
                                <Badge
                                  variant="secondary"
                                  className="bg-amber-100 text-amber-700 hover:bg-amber-100"
                                >
                                  <Star className="mr-1 h-3 w-3 fill-amber-700" />
                                  {lugar.google_score.toFixed(1)}
                                </Badge>
                              )}
                            </div>

                            <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
                              <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                                {lugar?.category && (
                                  // 2. APLICAMOS LA TRADUCCIÓN AQUÍ
                                  <span className="capitalize">
                                    {getCategoryName(lugar.category)}
                                  </span>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-slate-100"
                              >
                                <MoreHorizontal className="h-4 w-4 text-slate-400" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center">
                  <p className="text-sm text-slate-400 italic">
                    Este viaje está activo hoy, pero no hay actividades con hora
                    específica.
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}