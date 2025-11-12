import ItinerarioFrame from "@/components/dashboard-components/ItinerarioFrame";

const datosPublicacion = {
  id: "t1",
  tituloPrincipal: "Mi primer itinerario",
  subtitulo: "",
  calificacion: 2.5,
  fechaInicio: "2024-10-31",
  detallesLugar: "Este lugar es conocido por su rica cultura y hermosos paisajes.",
  dias: [
    { id: 1, dia: "Día 1", categoria: "Cultura", titulo: "Palacio de Bellas Artes", urlImagen: "/img/bellas_artes.jpg", calificacion:"3.2"},
    { id: 2, dia: "Día 1", categoria: "Descanso", titulo: "Bosque de Chapultepec", urlImagen: "/img/bosque_chapultepec.jpg", calificacion:"3.2"},
    { id: 3, dia: "Día 2", categoria: "Cultura", titulo: "Museo Soumaya", urlImagen: "/img/museo_soumaya.jpg", calificacion:"2.2"},
    { id: 4, dia: "Día 3", categoria: "Cultura", titulo: "Ángel de la independencia", urlImagen: "/img/angel.jpg", calificacion:"5.0"},
    { id: 5, dia: "Día 4", categoria: "Cultura", titulo: "Torre latinoamericana", urlImagen: "/img/torre_latinoamericana.jpg", calificacion:"2.4" },
    { id: 6, dia: "Día 5", categoria: "Cultura", titulo: "Museo Nacional de Antropología", urlImagen: "/img/museo_antropologia.jpg", calificacion:"2.4" },
  ],
};

export default function PublicacionPage() {
  return (
    <>    <div className="p-10">
      <ItinerarioFrame itinerario={datosPublicacion} />
    </div>
    <div>
      <ItinerarioFrame itinerario={datosPublicacion}/>
    </div>
</>
  );
}