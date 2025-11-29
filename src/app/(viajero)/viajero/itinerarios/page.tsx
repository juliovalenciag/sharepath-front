"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import ItinerarioFrame from "@/components/dashboard-components/ItinerarioFrame";
import { ItinerariosAPI } from "@/api/ItinerariosAPI";
import {
  getCategoryName,
  getDefaultImageForCategory,
} from "@/lib/category-utils";
import { ItinerarioData, Actividad } from "@/api/interfaces/ApiRoutes";

export default function PublicacionPage() {
  const [itinerarios, setItinerarios] = useState<ItinerarioData[]>([]);

  useEffect(() => {
    const api = ItinerariosAPI.getInstance();
    const promise = api.getMyItinerarios();

    toast.promise(promise, {
      loading: "Cargando tus itinerarios...",

      success: (response: any) => {
        console.log("Respuesta CRUDA de la API:", response);

        if (Array.isArray(response)) {
          setItinerarios(response);
        } else {
          throw new Error("La API no devolvió el formato esperado.");
        }
        return "Itinerarios cargados con éxito";
      },

      error: (err: any) => {
        console.error("Error al obtener itinerarios:", err);
        return err.message || "Error al cargar los itinerarios.";
      },
    });
  }, []);

  const handleDeleteSuccess = (idEliminado: string | number) => {
    setItinerarios((currentItinerarios) =>
      currentItinerarios.filter(
        (itinerario) =>
          (itinerario as any)._id !== idEliminado &&
          itinerario.id !== idEliminado
      )
    );
  };

  return (
    <div className="grid grid-cols-1">
      {itinerarios.length > 0 ? (
        itinerarios.map((itinerarioApi) => {
          const datosParaElFrame = transformarItinerario(itinerarioApi);
          return (
            <ItinerarioFrame
              key={datosParaElFrame.id}
              itinerario={datosParaElFrame}
              onItinerarioDeleted={handleDeleteSuccess}
            />
          );
        })
      ) : (
        <div className="p-10">No has creado ningún itinerario todavía.</div>
      )}
    </div>
  );
}

function transformarItinerario(itinerarioApi: ItinerarioData) {
  const rawActivities = itinerarioApi.actividades || [];
  const sortedActivities = [...rawActivities].sort((a: any, b: any) => {
    return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
  });

  let startDate = new Date();
  let startDateString = "";

  if (sortedActivities.length > 0) {
    startDateString = (sortedActivities[0] as any).fecha;
    startDate = new Date(startDateString);
  }
  const diasProcesados = sortedActivities.map((act: any, index) => {
    const actDate = new Date(act.fecha);

    const startMidnight = new Date(startDate);
    startMidnight.setHours(0, 0, 0, 0);
    const actMidnight = new Date(actDate);
    actMidnight.setHours(0, 0, 0, 0);

    const diffTime = actMidnight.getTime() - startMidnight.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    const numeroDia = diffDays + 1;

    const lugar = act.lugar;

    return {
      id: act._id || act.id || index,
      dia: `Día ${numeroDia}`,
      categoria: lugar?.category || "General",
      titulo: lugar?.nombre || act.description || "Actividad",
      urlImagen: lugar?.foto_url || null,
      calificacion: lugar?.google_score || 0,
    };
  });

  return {
    id: (itinerarioApi as any)._id || itinerarioApi.id,
    tituloPrincipal: itinerarioApi.title,
    subtitulo: startDateString
      ? `Inicia el: ${startDate.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}`
      : "Sin fecha",
    calificacion: 0,
    fechaInicio: startDateString,
    detallesLugar: "Detalles del viaje",
    dias: diasProcesados,
  };
}
