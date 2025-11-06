import ItinerarioFrame from "@/components/dashboard-components/ItinerarioFrame";
const datosPublicacion = {
  id: "t1",
  tituloPrincipal: "Mi primer itinerario en Tepozotlan",
  subtitulo: "Pueblo Mágico de Tepoztlan",
  calificacion: 2.5,
  fechaInicio: "2024-08-10",
  detallesLugar: "Este lugar es conocido por su rica cultura y hermosos paisajes.",
  dias: [
    { id: 1, dia: "Día 1", categoria: "Hotel", titulo: "Posada del Tepozteco", urlImagen: "/img/tepozteco1.jpg", calificacion:"3.2"},
    { id: 2, dia: "Día 2", categoria: "Cultura", titulo: "Cerro del Tepozteco", urlImagen: "/img/tepozteco2.jpg", calificacion:"2.2"},
    { id: 3, dia: "Día 3", categoria: "Comida", titulo: "Mercado de Tepoztlán", urlImagen: "/img/tepozteco3.jpg", calificacion:"5.0"},
    { id: 4, dia: "Día 4", categoria: "Descanso", titulo: "Balneario de Atongo", urlImagen: "/img/tepozteco4.jpg", calificacion:"2.4" },
  ],
};

export default function PublicacionPage() {
  return (
    <>    <div className="p-10">
      <ItinerarioFrame itinerario={datosPublicacion} />
    </div>
    <div className="p-10">
      <ItinerarioFrame itinerario={datosPublicacion} />
    </div>
    <div className="p-10">
      <ItinerarioFrame itinerario={datosPublicacion} />
    </div>
    <div className="p-10">
      <ItinerarioFrame itinerario={datosPublicacion} />
    </div>
    <div className="p-10">
      <ItinerarioFrame itinerario={datosPublicacion} />
    </div>
    <div className="p-10">
      <ItinerarioFrame itinerario={datosPublicacion} />
    </div>
</>
  );
}