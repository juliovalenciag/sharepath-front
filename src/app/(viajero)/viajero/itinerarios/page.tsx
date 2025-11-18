"use client";
import { useEffect, useState } from "react";
import ItinerarioFrame from "@/components/dashboard-components/ItinerarioFrame";

export default function PublicacionPage() {
  const [itinerarios, setItinerarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Cambiar el formato del back
  function changeIti(apiData: any[]) {
    return apiData.map((it) => {
      const actividadesOrdenadas = it.actividades.sort(
        (a: any, b: any) =>
          new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
      );

      return {
        id: it.id,
        tituloPrincipal: it.title,
        subtitulo: "",
        calificacion: "",
        fechaInicio: actividadesOrdenadas[0]?.fecha.split("T")[0] || "",
        detallesLugar: "",
        dias: actividadesOrdenadas.map((act: any, index: number) => ({
          id: act.id,
          dia: `Día ${index + 1}`,
          categoria: act.lugar.category,
          titulo: act.lugar.nombre,
          urlImagen: act.lugar.foto_url,
          calificacion: act.lugar.google_score,
        })),
      };
    });
  }

  useEffect(() => {
    async function fetchItinerarios() {
      try {
        const res = await fetch("https://harol-lovers.up.railway.app/itinerario", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("authToken") || "",
          },
        });

        console.log("Status:", res.status);

        if (res.status === 401) {
          console.log("No autorizado");
          setLoading(false);
          return;
        }

        const datos = await res.json();
        console.log("Respuesta del Backend:", datos);

        const transformados = changeIti(datos);
        setItinerarios(transformados);
      } catch (error) {
        console.error("Error al cargar itinerarios", error);
      } finally {
        setLoading(false);
      }
    }

    fetchItinerarios();
  }, []);

  if (loading)
    return <p className="p-6 text-xl font-semibold">Cargando itinerarios...</p>;

  return (
    <div className="p-10 flex flex-col gap-10">
      {itinerarios.length === 0 ? (
        <p className="text-gray-500 text-lg">No tienes itinerarios aún.</p>
      ) : (
        itinerarios.map((iti) => (
          <ItinerarioFrame key={iti.id} itinerario={iti} />
        ))
      )}
    </div>
  );
}
