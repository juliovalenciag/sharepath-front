"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { TripHeader } from "@/components/viajero/editor/TripHeader";
import DiaDetalle from "@/components/DiaDetalle2";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { toast } from "sonner";
import { PLACES, type Place } from "@/lib/constants/mock-itinerary-data";

// Mapa igual que en "ver itinerario"
const ItineraryMap = dynamic(
  () => import("@/components/viajero/view/ItineraryMap"),
  { ssr: false }
);

// ---------- Tipos ----------

interface Actividad {
  id: number | string; // id de la ACTIVIDAD en el backend (o local para nuevas)
  lugarId: number | string; // id del lugar en catálogo
  nombre: string;
  lat: number;
  lng: number;
  description?: string;
  foto_url?: string;
  categoria?: string;
  estado?: string;
}

interface Dia {
  id: number | string;
  nombre: string; // "5 nov"
  fecha: Date;
  lugares: Actividad[];
}

// ---------- Auxiliares ----------

function SortableDiaDetalle({
  lugar,
  onActivityChange,
  onDelete,
}: {
  lugar: Actividad;
  onActivityChange: (
    id: string | number,
    field: keyof Actividad,
    value: any
  ) => void;
  onDelete: (id: string | number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: lugar.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <DiaDetalle
        lugar={lugar}
        onActivityChange={onActivityChange}
        onDelete={onDelete}
        dragListeners={listeners}
      />
    </div>
  );
}

function SelectorDias({
  dias,
  diaActivoId,
  setDiaActivoId,
}: {
  dias: Dia[];
  diaActivoId: number | string;
  setDiaActivoId: (id: number | string) => void;
}) {
  if (!dias.length) return null;

  return (
    <div className="space-y-4 p-3">
      <div className="flex flex-wrap gap-3 justify-center">
        {dias.map((dia) => (
          <Button
            key={dia.id}
            variant={diaActivoId === dia.id ? "default" : "outline"}
            onClick={() => setDiaActivoId(dia.id)}
          >
            {dia.nombre}
          </Button>
        ))}
      </div>
    </div>
  );
}

// ---------- Página principal ----------

export default function EditItineraryPage() {
  const router = useRouter();
  const params = useParams();
  const itineraryId = String((params as any).itineraryId);

  const [titulo, setTitulo] = useState("Editar itinerario");
  const [diasData, setDiasData] = useState<Dia[]>([]);
  const [diaActivoId, setDiaActivoId] = useState<number | string>(1);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const posicionInicial: [number, number] = [19.5043, -99.147];
  const zoomInicial = 13;

  // --- búsqueda de lugares ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Place[]>([]);

  // DnD
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ---------- Cargar itinerario del servidor ----------
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const res = await fetch(
          `https://harol-lovers.up.railway.app/itinerario/${itineraryId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("authToken") || "",
            },
          }
        );

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          console.error("Error al cargar itinerario:", res.status, txt);
          toast.error("No se pudo cargar el itinerario.");
          setDiasData([]);
          return;
        }

        const data = await res.json();
        console.log("Itinerario a editar:", data);

        setTitulo(data.title || "Editar itinerario");

        const actividades = Array.isArray(data.actividades)
          ? data.actividades
          : [];

        if (!actividades.length) {
          toast.info("Este itinerario todavía no tiene actividades.");
          setDiasData([]);
          return;
        }

        // Ordenar por fecha
        const actividadesOrdenadas = actividades.sort(
          (a: any, b: any) =>
            new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
        );

        // Agrupar por fecha YYYY-MM-DD
        const actividadesPorFecha: Record<string, any[]> = {};
        actividadesOrdenadas.forEach((act: any) => {
          let fechaStr: string;

          if (typeof act.fecha === "string") {
            if (act.fecha.includes("T")) {
              fechaStr = new Date(act.fecha).toISOString().split("T")[0];
            } else {
              fechaStr = act.fecha;
            }
          } else {
            fechaStr = new Date(act.fecha).toISOString().split("T")[0];
          }

          if (!actividadesPorFecha[fechaStr]) {
            actividadesPorFecha[fechaStr] = [];
          }
          actividadesPorFecha[fechaStr].push(act);
        });

        const fechasOrdenadas = Object.keys(actividadesPorFecha).sort();

        const nuevosDias: Dia[] = fechasOrdenadas.map((fechaStr, index) => {
          const fechaDate = new Date(fechaStr);
          const actsDia = actividadesPorFecha[fechaStr];

          const lugares: Actividad[] = actsDia.map((act: any) => ({
            id: act.id,
            lugarId: act.lugar?.id ?? act.lugarId ?? act.id,
            nombre: act.lugar?.nombre ?? "Lugar",
            lat: act.lugar?.latitud,
            lng: act.lugar?.longitud,
            description: act.description,
            foto_url: act.lugar?.foto_url,
            categoria: act.lugar?.category,
            estado: act.lugar?.mexican_state,
          }));

          return {
            id: index + 1,
            nombre: format(fechaDate, "d MMM", { locale: es }),
            fecha: fechaDate,
            lugares,
          };
        });

        setDiasData(nuevosDias);
        setDiaActivoId(nuevosDias[0]?.id ?? 1);
      } catch (err: any) {
        console.error(err);
        toast.error("Error al cargar el itinerario.");
        setDiasData([]);
      } finally {
        setLoading(false);
      }
    }

    if (itineraryId) fetchData();
  }, [itineraryId]);

  const diaActual = diasData.find((d) => d.id === diaActivoId);
  const lugaresActivos = diaActual ? diaActual.lugares : [];

  // ---------- Búsqueda de lugares (local con PLACES) ----------
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setSearchResults([]);
      return;
    }

    const filtered = PLACES.filter((p) => {
      const name = p.nombre?.toLowerCase() || "";
      const state =
        (p.mexican_state as string | undefined)?.toLowerCase() || "";
      return name.includes(q) || state.includes(q);
    }).slice(0, 20); // limitar resultados

    setSearchResults(filtered);
  }, [searchQuery]);

  const handleAddPlaceFromSearch = (place: Place) => {
    if (!diaActual) {
      toast.error("Primero selecciona un día.");
      return;
    }

    // evitar duplicados por lugarId en el día actual
    const yaExiste = diaActual.lugares.some(
      (l) => String(l.lugarId) === String(place.id_api_place)
    );
    if (yaExiste) {
      toast.info(`${place.nombre} ya está en el día seleccionado.`);
      return;
    }

    const nuevaActividad: Actividad = {
      id: `${place.id_api_place}-${Date.now()}`, // id temporal local
      lugarId: place.id_api_place,
      nombre: place.nombre,
      lat: place.latitud,
      lng: place.longitud,
      description: "",
      foto_url: place.foto_url,
      categoria: place.category,
      estado: place.mexican_state,
    };

    setDiasData((dias) => {
      const diaIndex = dias.findIndex((d) => d.id === diaActivoId);
      if (diaIndex === -1) return dias;

      const nuevosDias = [...dias];
      nuevosDias[diaIndex] = {
        ...nuevosDias[diaIndex],
        lugares: [...nuevosDias[diaIndex].lugares, nuevaActividad],
      };

      return nuevosDias;
    });

    toast.success(`${place.nombre} añadido al día seleccionado.`);
  };

  // ---------- Drag & Drop ----------
  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    setDiasData((dias) => {
      const diaIndex = dias.findIndex((d) => d.id === diaActivoId);
      if (diaIndex === -1) return dias;

      const oldIndex = dias[diaIndex].lugares.findIndex(
        (l) => l.id === active.id
      );
      const newIndex = dias[diaIndex].lugares.findIndex(
        (l) => l.id === over.id
      );
      if (oldIndex === -1 || newIndex === -1) return dias;

      const updated = [...dias[diaIndex].lugares];
      const [moved] = updated.splice(oldIndex, 1);
      updated.splice(newIndex, 0, moved);

      const nuevosDias = [...dias];
      nuevosDias[diaIndex] = {
        ...nuevosDias[diaIndex],
        lugares: updated,
      };

      return nuevosDias;
    });
  }

  // ---------- Editar campos de una actividad ----------
  const handleActivityChange = (
    actividadId: string | number,
    field: keyof Actividad,
    value: any
  ) => {
    setDiasData((currentDias) => {
      const diaIndex = currentDias.findIndex((d) => d.id === diaActivoId);
      if (diaIndex === -1) return currentDias;

      const nuevosDias = [...currentDias];
      const nuevosLugares = nuevosDias[diaIndex].lugares.map((lugar) =>
        lugar.id === actividadId ? { ...lugar, [field]: value } : lugar
      );

      nuevosDias[diaIndex] = {
        ...nuevosDias[diaIndex],
        lugares: nuevosLugares,
      };

      return nuevosDias;
    });
  };

  // ---------- Eliminar actividad ----------
  const handleDelete = (actividadId: string | number) => {
    setDiasData((currentDias) => {
      const diaIndex = currentDias.findIndex((d) => d.id === diaActivoId);
      if (diaIndex === -1) return currentDias;

      const nuevosDias = [...currentDias];
      nuevosDias[diaIndex] = {
        ...nuevosDias[diaIndex],
        lugares: nuevosDias[diaIndex].lugares.filter(
          (lugar) => lugar.id !== actividadId
        ),
      };

      return nuevosDias;
    });
  };

  // ---------- Guardar cambios ----------
  const handleSave = async () => {
    if (!diasData.length) {
      toast.error("No hay actividades en el itinerario.");
      return;
    }

    setSaving(true);

    const actividadesPayload = diasData.flatMap((dia) =>
      dia.lugares.map((lugar) => ({
        fecha: format(dia.fecha, "yyyy-MM-dd"),
        description: lugar.description || `Visita a ${lugar.nombre || "lugar"}`,
        lugarId: String(lugar.lugarId ?? lugar.id),
      }))
    );

    const body = {
      title: titulo,
      actividades: actividadesPayload,
    };

    try {
      const promise = fetch(
        `https://harol-lovers.up.railway.app/itinerario/${itineraryId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("authToken") || "",
          },
          body: JSON.stringify(body),
        }
      );

      toast.promise(promise, {
        loading: "Guardando cambios...",
        success: async (res) => {
          if (!res.ok) {
            const data = await res.json().catch(() => null);
            throw new Error(
              data?.message || "Error al actualizar el itinerario."
            );
          }
          router.push("/viajero/itinerarios");
          return "Itinerario actualizado con éxito.";
        },
        error: (err) =>
          err?.message || "Ocurrió un error al guardar los cambios.",
      });
    } catch (err: any) {
      console.error(err);
      toast.error("Error inesperado al guardar.");
    } finally {
      setSaving(false);
    }
  };

  // ---------- Mapa (igual que ver itinerario) ----------
  const placesForMap = lugaresActivos.map((lugar) => ({
    id: String(lugar.id),
    name: lugar.nombre,
    city: lugar.description || "",
    tag: lugar.categoria || "lugar",
    img: lugar.foto_url,
    lat: lugar.lat,
    lng: lugar.lng,
  }));

  // ---------- Render ----------
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100svh-3rem)]">
        <p className="text-sm text-muted-foreground">Cargando itinerario...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100svh-3rem)] overflow-hidden">
      {/* IZQUIERDA: Editor */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full overflow-y-auto border-r bg-background">
        <TripHeader
          title={titulo}
          subtitle="Edita tu itinerario, ajusta días y actividades"
        />

        <div className="flex items-center gap-2 text-sm justify-center p-2 border-b bg-muted/30">
          <h2 className="font-bold px-2">Plan de viaje</h2>
          <Separator orientation="vertical" className="h-4 hidden sm:block" />
          <Button
            variant="default"
            className="h-auto px-3 py-1"
            onClick={handleSave}
            disabled={saving}
          >
            Guardar cambios
          </Button>
        </div>

        <SelectorDias
          dias={diasData}
          diaActivoId={diaActivoId}
          setDiaActivoId={setDiaActivoId}
        />

        {/* BUSCADOR DE LUGARES */}
        <div className="px-4 pb-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Buscar lugares para añadir al día seleccionado
          </p>
          <Input
            placeholder="Buscar por nombre o estado (ej. 'Centro Histórico', 'CDMX')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 text-sm"
          />

          {searchResults.length > 0 && (
            <div className="mt-2 max-h-52 overflow-y-auto rounded-md border bg-card text-xs">
              {searchResults.map((place) => (
                <div
                  key={place.id_api_place}
                  className="flex items-center justify-between gap-2 px-2 py-1.5 border-b last:border-b-0 hover:bg-muted/60"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{place.nombre}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {place.category} · {place.mexican_state}
                    </span>
                  </div>
                  <Button
                    size="xs"
                    className="text-[10px] px-2 py-1"
                    onClick={() => handleAddPlaceFromSearch(place)}
                  >
                    Añadir
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={lugaresActivos.map((lugar) => lugar.id)}
            strategy={verticalListSortingStrategy}
          >
            {lugaresActivos.map((lugar) => (
              <SortableDiaDetalle
                key={lugar.id}
                lugar={lugar}
                onActivityChange={handleActivityChange}
                onDelete={handleDelete}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {/* DERECHA: Mapa */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full bg-gray-100">
        <ItineraryMap
          places={placesForMap}
          center={posicionInicial}
          zoom={zoomInicial}
        />
      </div>
    </div>
  );
}
