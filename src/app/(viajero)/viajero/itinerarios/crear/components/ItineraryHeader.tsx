// src/app/(viajero)/viajero/itinerarios/crear/components/ItineraryHeader.tsx
"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarDays,
  MapPin,
  Save,
  Wand2,
  Trash2,
  Pencil,
  Loader2,
  RotateCcw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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

import { REGIONS_DATA, RegionKey } from "@/lib/constants/regions";
import type { BuilderMeta } from "@/lib/itinerary-builder-store";
import { cn } from "@/lib/utils";

// --- TIPOS ---

type CommonProps = {
  meta: BuilderMeta;

  // Configuración
  onEditSetup: () => void;

  // Guardar
  onSave: () => void;
  isSaving: boolean;

  // Optimizar
  onOptimize: () => void;
  canOptimize: boolean;

  // (Opcional) Ruta automática / Completar
  onRuta?: () => void;

  // Estado global opcional
  disabled?: boolean;
  className?: string;
};

// Props específicas para MODO CREAR
type CreateProps = CommonProps & {
  mode?: "create";
  onResetDraft: () => void; // Reemplaza al antiguo 'onReset'
};

// Props específicas para MODO EDITAR
type EditProps = CommonProps & {
  mode: "edit";
  onDiscardChanges?: () => void; // Descartar cambios sin borrar itinerario
  onDeleteItinerary: () => Promise<void> | void; // Borrar itinerario de la DB
  isDeleting?: boolean;
};

export function ItineraryHeader(props: CreateProps | EditProps) {
  const isEdit = props.mode === "edit";

  // Estados locales para el diálogo de confirmación
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [localWorking, setLocalWorking] = React.useState(false);

  const disabled = props.disabled ?? false;

  // Calculamos si se está borrando (ya sea por prop externa o estado local)
  const deleting = isEdit
    ? Boolean((props as EditProps).isDeleting) || localWorking
    : localWorking;

  // --- LÓGICA DE VISUALIZACIÓN ---

  const regionsDisplay = React.useMemo(() => {
    if (!props.meta.regions || props.meta.regions.length === 0)
      return "Sin destino";

    const names = props.meta.regions.map(
      (r) => REGIONS_DATA[r as RegionKey]?.short || String(r)
    );

    if (names.length <= 3) return names.join(", ");
    return `${names.slice(0, 3).join(", ")} (+${names.length - 3})`;
  }, [props.meta.regions]);

  const dateRangeLabel = React.useMemo(() => {
    try {
      return `${format(props.meta.start, "d MMM", { locale: es })} — ${format(
        props.meta.end,
        "d MMM",
        { locale: es }
      )}`;
    } catch {
      return "Fechas sin definir";
    }
  }, [props.meta.start, props.meta.end]);

  // Textos dinámicos para el diálogo de destrucción según el modo
  const destructiveLabel = isEdit ? "Eliminar itinerario" : "Borrar borrador";
  const destructiveTitle = isEdit
    ? "¿Eliminar este itinerario?"
    : "¿Borrar este borrador?";
  const destructiveDescription = isEdit
    ? "Esta acción es permanente. Se eliminará el itinerario y todas sus actividades de la base de datos."
    : "Se borrará tu progreso actual y se reiniciará el creador. Esta acción no se puede deshacer.";

  // Manejador de eliminación/reset
  const handleConfirmDestructive = async () => {
    try {
      setLocalWorking(true);

      if (isEdit) {
        await (props as EditProps).onDeleteItinerary();
      } else {
        (props as CreateProps).onResetDraft();
      }

      setConfirmOpen(false);
    } catch (e) {
      console.error(e);
      // Opcional: mostrar toast de error aquí
    } finally {
      setLocalWorking(false);
    }
  };

  const destructiveDisabled = disabled || props.isSaving || deleting;

  return (
    <>
      <header
        className={cn(
          "z-20 flex flex-col gap-3 border-b bg-background/80 px-4 py-3 backdrop-blur-md sticky top-0 sm:flex-row sm:items-center sm:justify-between transition-all duration-300",
          props.className
        )}
      >
        {/* --- SECCIÓN 1: INFO DEL VIAJE --- */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1
              className="truncate text-lg font-bold tracking-tight text-foreground max-w-[250px] sm:max-w-md"
              title={props.meta.title}
            >
              {props.meta.title}
            </h1>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={props.onEditSetup}
              disabled={disabled || props.isSaving || deleting}
              title="Editar configuración"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>

            {isEdit && (
              <span
                className="hidden sm:inline-flex items-center gap-1 rounded-md border bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground"
                title="Estás editando un itinerario existente"
              >
                <ShieldAlert className="h-3 w-3" />
                Modo edición
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
            <span
              className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-md max-w-full truncate"
              title={(props.meta.regions || []).join(", ")}
            >
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{regionsDisplay}</span>
            </span>

            <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-md shrink-0">
              <CalendarDays className="h-3 w-3" />
              {dateRangeLabel}
            </span>
          </div>
        </div>

        {/* --- SECCIÓN 2: ACCIONES --- */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {/* BOTÓN: Descartar cambios (Solo Edit Mode) */}
          {isEdit && (props as EditProps).onDiscardChanges ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(props as EditProps).onDiscardChanges}
              disabled={disabled || props.isSaving || deleting}
              className="h-9 text-muted-foreground hover:text-foreground"
              title="Descartar cambios actuales"
            >
              <RotateCcw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Descartar</span>
            </Button>
          ) : null}

          {/* BOTÓN: Borrar (funciona como Reset en Create o Delete en Edit) */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            disabled={destructiveDisabled}
            className={cn(
              "h-9 text-red-500 hover:text-red-600 hover:bg-red-500/10",
              // Si estamos en create mode, queremos que se vea el icono de basura siempre
              !isEdit && "px-2 sm:px-3"
            )}
            title={destructiveLabel}
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin sm:mr-2" />
            ) : (
              <Trash2 className="h-4 w-4 sm:mr-2" />
            )}
            {/* Texto solo visible en desktop si es edit mode, o tooltip en mobile */}
            <span className={cn("hidden", isEdit ? "sm:inline" : "hidden")}>
              Eliminar
            </span>
          </Button>

          <div className="h-4 w-px bg-border mx-1 hidden sm:block" />

          {/* BOTÓN: Completar Ruta (Opcional) */}
          {props.onRuta && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={props.onRuta}
              disabled={disabled || props.isSaving || deleting}
              className="h-9 hidden sm:inline-flex min-w-[110px] shadow-sm active:scale-95 transition-transform"
              title="Generar ruta / recomendaciones"
            >
              {/* Usamos Sparkles para mantener la consistencia visual con el código anterior */}
              <Sparkles className="mr-2 h-3.5 w-3.5 text-primary" />
              Completar
            </Button>
          )}

          {/* BOTÓN: Optimizar */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={props.onOptimize}
            disabled={
              disabled || props.isSaving || deleting || !props.canOptimize
            }
            className={cn(
              "h-9 min-w-[110px] shadow-sm active:scale-95 transition-transform",
              props.canOptimize ? "sm:inline-flex" : "hidden"
            )}
            title="Reordenar ruta por distancia"
          >
            <Wand2 className="mr-2 h-3.5 w-3.5 text-primary" />
            Optimizar
          </Button>

          {/* BOTÓN: Guardar */}
          <Button
            type="button"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!props.isSaving && !disabled && !deleting) {
                props.onSave();
              }
            }}
            disabled={disabled || deleting || props.isSaving}
            className="h-9 min-w-[110px] shadow-sm active:scale-95 transition-transform"
            title={isEdit ? "Guardar cambios" : "Guardar itinerario"}
          >
            {props.isSaving ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="mr-2 h-3.5 w-3.5" />
            )}
            {props.isSaving ? "Guardando" : "Guardar"}
          </Button>
        </div>
      </header>

      {/* --- MODAL: CONFIRMACIÓN DE BORRADO --- */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="sm:max-w-[520px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              {destructiveTitle}
            </AlertDialogTitle>

            <AlertDialogDescription className="space-y-3 pt-2">
              <p className="text-muted-foreground">{destructiveDescription}</p>

              <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                <div
                  className="font-semibold text-foreground truncate"
                  title={props.meta.title}
                >
                  {props.meta.title}
                </div>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5">
                    <MapPin className="h-3 w-3" />
                    {regionsDisplay}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5">
                    <CalendarDays className="h-3 w-3" />
                    {dateRangeLabel}
                  </span>
                </div>
              </div>

              {isEdit && (
                <p className="text-xs text-muted-foreground">
                  Tip: si solo quieres revertir los cambios recientes, usa el
                  botón <b>Descartar</b> en la barra superior.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting || props.isSaving}>
              Cancelar
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleConfirmDestructive();
              }}
              disabled={deleting || props.isSaving || disabled}
              className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Eliminar definitivamente" : "Borrar y reiniciar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
