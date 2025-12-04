"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import dynamic from "next/dynamic";
import { format, eachDayOfInterval } from "date-fns";
import { es } from "date-fns/locale";
import { arrayMove } from "@dnd-kit/sortable";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";

// Lógica y Estado
import {
  useItineraryBuilderStore,
  buildItineraryPayload,
  BuilderActivity,
} from "@/lib/itinerary-builder-store";
import { ItinerariosAPI } from "@/api/ItinerariosAPI";
import { mapApiToBuilder } from "@/lib/utils/itinerary-adapter";
import { REGIONS_DATA } from "@/lib/constants/regions";
import { cn } from "@/lib/utils";

// Componentes UI
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Componentes Reutilizados
// Asegúrate de que estas rutas sean correctas según tu estructura de carpetas
import { ItineraryHeader } from "../../crear/components/ItineraryHeader";
import { DaySelector } from "../../crear/components/DaySelector";
import { ActivityListPanel } from "../../crear/components/ActivityListPanel";
import { MobileViewToggle } from "../../crear/components/MobileViewToggle";
import { ItinerarySetupDialog } from "../../crear/components/ItinerarySetupDialog"; 
import { PlaceSearchDialog } from "../../crear/components/PlacesSearchDialog";
import { PlaceInfoDialog } from "../../crear/components/PlaceInfoDialog";

// Mapa Dinámico (Lazy)
const CinematicMap = dynamic(
  () => import("../../crear/components/CinematicMap").then((mod) => mod.CinematicMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-muted/30 animate-pulse flex flex-col items-center justify-center text-muted-foreground gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
        <span className="text-sm font-medium tracking-wide">Cargando mapa...</span>
      </div>
    ),
  }
);

// Helper Distancia
function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * R;
}

export default function EditarItinerarioPage() {
  const router = useRouter();
  const params = useParams();
  // FIX: Asegurar que itineraryId sea string o undefined, no array
  const itineraryId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  // STORE
  const {
    meta,
    actividades,
    setMeta,
    setActivities,
    addActivity,
    removeActivity,
    updateActivity,
    reset,
  } = useItineraryBuilderStore(useShallow((s) => s));

  // ESTADOS
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  
  const [setupOpen, setSetupOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [saveAlertOpen, setSaveAlertOpen] = useState(false);
  
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  // --- CARGA DE DATOS ---
  useEffect(() => {
    const loadItinerary = async () => {
        // FIX: Si no hay ID todavía, no hacemos nada pero no bloqueamos el estado de carga eternamente si falla
        if (!itineraryId) return;

        try {
            setIsLoadingData(true);
            const api = ItinerariosAPI.getInstance();
            
            const data = await api.getItinerarioById(itineraryId);
            
            // FIX: Verificar si la respuesta es válida antes de procesar
            if (!data || !data.title) {
                 throw new Error("Datos incompletos");
            }

            const { meta: loadedMeta, activities: loadedActivities } = mapApiToBuilder(data);
            
            setMeta(loadedMeta);
            setActivities(loadedActivities);
            
            if (loadedActivities.length > 0) {
                const sorted = [...loadedActivities].sort((a,b) => a.fecha.getTime() - b.fecha.getTime());
                setSelectedDayKey(format(sorted[0].fecha, "yyyy-MM-dd"));
            } else {
                setSelectedDayKey(format(loadedMeta.start, "yyyy-MM-dd"));
            }

            toast.success("Itinerario cargado correctamente");

        } catch (error) {
            console.error("Error cargando itinerario:", error);
            toast.error("No se pudo cargar el viaje", { description: "Es posible que no exista o no tengas permiso." });
            router.push("/viajero/itinerarios");
        } finally {
            setIsLoadingData(false);
        }
    };

    loadItinerary();
  }, [itineraryId, setMeta, setActivities, router]);


  // --- MEMOS ---
  const days = useMemo(() => {
    if (!meta?.start || !meta?.end) return [];
    try {
      return eachDayOfInterval({ start: meta.start, end: meta.end }).map((date, idx) => ({
        key: format(date, "yyyy-MM-dd"),
        date,
        label: `Día ${idx + 1}`,
        subtitle: format(date, "d MMM", { locale: es }),
      }));
    } catch { return []; }
  }, [meta?.start, meta?.end]);

  const currentDayActivities = useMemo(() => {
    if (!selectedDayKey) return [];
    return actividades.filter((a) => format(a.fecha, "yyyy-MM-dd") === selectedDayKey);
  }, [actividades, selectedDayKey]);

  const currentDay = useMemo(() => days.find((d) => d.key === selectedDayKey) || null, [days, selectedDayKey]);
  
  const initialMapCenter = useMemo(() => {
    if (!meta?.regions || meta.regions.length === 0) return undefined;
    // @ts-ignore
    const regionData = REGIONS_DATA[meta.regions[0]];
    return regionData ? { lat: regionData.lat, lng: regionData.lng } : undefined;
  }, [meta?.regions]);

  const tripProgress = useMemo(() => {
    if (days.length === 0) return 0;
    const filledDays = new Set(actividades.map(a => format(a.fecha, "yyyy-MM-dd"))).size;
    return (filledDays / days.length) * 100;
  }, [days, actividades]);


  // --- HANDLERS ---

  const handleReset = useCallback(() => {
    if (window.confirm("¿Descartar cambios y recargar?")) {
       window.location.reload(); 
    }
  }, []);

  const handlePreUpdate = () => {
    if (!meta) return;
    if (actividades.length === 0) {
      toast.error("El plan está vacío", { 
        description: "Agrega al menos un lugar antes de guardar." 
      });
      return;
    }
    const filledDaysCount = new Set(actividades.map(a => format(a.fecha, "yyyy-MM-dd"))).size;
    if (filledDaysCount < days.length) {
      setSaveAlertOpen(true);
    } else {
      executeUpdate();
    }
  };

  const executeUpdate = async () => {
    if (!meta || !itineraryId) return;
    setSaveAlertOpen(false);
    setIsSaving(true);

    try {
      const payload = buildItineraryPayload(meta, actividades);
      await ItinerariosAPI.getInstance().updateItinerario(itineraryId, payload);
      toast.success("Cambios guardados");
    } catch (error: any) {
      console.error(error);
      toast.error("Error al guardar", { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleOptimize = useCallback(async () => {
    if (!currentDay || currentDayActivities.length < 3) {
        toast.warning("Se necesitan más lugares para optimizar");
        return;
    }
    setOptimizing(true);
    const toastId = toast.loading("Optimizando ruta...");
    await new Promise(r => setTimeout(r, 600));

    try {
        const items = [...currentDayActivities];
        const startNode = items.shift()!; 
        const optimizedPath: BuilderActivity[] = [startNode];

        while (items.length > 0) {
          const current = optimizedPath[optimizedPath.length - 1];
          let bestIdx = -1, minDist = Infinity;
          items.forEach((cand, i) => {
            const d = distanceKm(current.lugar.latitud, current.lugar.longitud, cand.lugar.latitud, cand.lugar.longitud);
            if (d < minDist) { minDist = d; bestIdx = i; }
          });
          if (bestIdx !== -1) optimizedPath.push(items.splice(bestIdx, 1)[0]);
        }

        const others = actividades.filter(a => format(a.fecha, "yyyy-MM-dd") !== selectedDayKey);
        setActivities([...others, ...optimizedPath]);
        toast.success("Ruta optimizada", { id: toastId });
    } catch (e) { toast.error("Error", { id: toastId }); } finally {
        setOptimizing(false);
    }
  }, [currentDay, currentDayActivities, actividades, selectedDayKey, setActivities]);

  const handleDragStart = (e: any) => setActiveDragId(e.active.id);
  const handleDragEnd = (e: any) => {
    setActiveDragId(null);
    const { active, over } = e;
    if (!over || active.id === over.id || !currentDay) return;
    const oldIndex = currentDayActivities.findIndex((a) => a.id === active.id);
    const newIndex = currentDayActivities.findIndex((a) => a.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(currentDayActivities, oldIndex, newIndex);
      const others = actividades.filter((a) => format(a.fecha, "yyyy-MM-dd") !== selectedDayKey);
      setActivities([...others, ...reordered]);
    }
  };


  // --- RENDER ---

  if (isLoadingData) {
    return (
      <div className="h-[calc(100vh-4rem)] w-full flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">Cargando editor...</p>
      </div>
    );
  }

  if (!meta) return null;

  return (
    <>
      <ItinerarySetupDialog open={setupOpen} onOpenChange={setSetupOpen} />
      
      <PlaceSearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        currentDay={currentDay}
        // @ts-ignore
        defaultState={meta?.regions[0]}
        onAddLugarToDay={(lugar) => {
          if (!currentDay) return;
          addActivity({
            id: crypto.randomUUID(),
            fecha: currentDay.date,
            descripcion: "",
            lugar: lugar as any,
            start_time: null,
            end_time: null,
          });
          toast.success("Lugar agregado");
        }}
      />

      <PlaceInfoDialog
        isOpen={infoOpen}
        onClose={() => setInfoOpen(false)}
        activityId={selectedActivityId}
        allActivities={actividades}
        onUpdate={updateActivity}
      />

      <AlertDialog open={saveAlertOpen} onOpenChange={setSaveAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="h-5 w-5" /> Tienes días sin planes
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Deseas guardar los cambios así o prefieres seguir editando?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Seguir editando</AlertDialogCancel>
            <AlertDialogAction onClick={executeUpdate} disabled={isSaving} className="bg-primary">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Guardar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex h-[calc(100vh-4rem)] flex-col bg-background text-foreground overflow-hidden animate-in fade-in duration-500">
        
        <div className="w-full bg-muted h-1">
            <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${tripProgress}%` }} />
        </div>

        <ItineraryHeader
          meta={meta}
          onEditSetup={() => setSetupOpen(true)}
          onReset={handleReset}
          onOptimize={handleOptimize}
          onSave={handlePreUpdate}
          isSaving={isSaving}
          canOptimize={currentDayActivities.length >= 3 && !optimizing}
        />

        <div className="flex flex-1 overflow-hidden relative group/canvas">
          <aside className={cn(
              "flex flex-col w-full md:w-[440px] lg:w-[500px] bg-background border-r transition-transform duration-500 ease-in-out absolute md:relative h-full z-20 shadow-xl md:shadow-none",
              mobileView === "list" ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
            <DaySelector days={days} selectedDayKey={selectedDayKey} onSelect={setSelectedDayKey} />
            
            <ActivityListPanel
              activities={currentDayActivities}
              currentDayLabel={currentDay?.label || null}
              onAddPlace={() => setSearchOpen(true)}
              onRemoveActivity={removeActivity}
              onViewDetails={(id) => { setSelectedActivityId(id); setInfoOpen(true); }}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              activeDragId={activeDragId}
            />
          </aside>

          <main className={cn(
              "flex-1 relative transition-all duration-500 ease-in-out absolute md:relative inset-0 bg-muted/10 z-10",
              mobileView === "map" ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 md:translate-x-0 md:opacity-100"
            )}>
            <CinematicMap
              activities={actividades.map((a) => ({
                id: a.id,
                nombre: a.lugar.nombre,
                lat: a.lugar.latitud,
                lng: a.lugar.longitud,
                fecha: a.fecha,
                start_time: null,
              }))}
              days={days}
              selectedDayKey={selectedDayKey}
              onSelectDay={setSelectedDayKey}
              // @ts-ignore
              initialCenter={initialMapCenter}
            />
          </main>

          <MobileViewToggle view={mobileView} onChange={setMobileView} />
        </div>
      </div>
    </>
  );
}