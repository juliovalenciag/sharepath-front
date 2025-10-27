"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import ListaLugares from "@/components/listaLugares";
//import { MapContainer } from "react-leaflet";

export interface lugar
{
  id: number | string;
  nombre: string;
  lat: number;
  lng: number;
}

const lugaresTuristicos: lugar[] =
[
  { id: 1, nombre: "Museo de Antropología", lat: 19.4260, lng:-99.1863 },
  { id: 2, nombre: "Palacio de Bellas Artes", lat: 19.4352, lng:-99.1412 },
  { id: 3, nombre: "Castillo de Chapultepec", lat: 19.4204, lng:-99.1816 },
  { id: 4, nombre: "Monumento a la Revolución", lat: 19.4366, lng: -99.1548 },
  { id: 5, nombre: "Alameda Central", lat: 19.4361, lng:-99.1438 },
]

const Mapa = dynamic(() => import("@/components/map"), {
  ssr: false,
  loading: () => <p className="text-center">Cargando mapa...</p>,
});

export default function Home() {
  const posicionInicial: [number, number] = [19.504, -99.146];
  const zoomInicial = 16;

  const [itinerario, defItinerario] = useState<lugar[]>([]);

  /* Ver que hace este codigo */
  const agregarLugar = (lugar: lugar) =>
  {
    if (!itinerario.find((elemento) => elemento.id === lugar.id))
    {
      defItinerario((itinerarioAnt) => [...itinerarioAnt, lugar])
    } 
  }

  const limpiarItinerario = () =>
  {
    defItinerario([]);
  }

  return (
    <main className="flex flex-row w-full h-screen">
      <div className="w-full flex flex-col justify-center h-screen md:w-1/3 p-4 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Lugares Turisticos</h2>

        <ListaLugares lugares={lugaresTuristicos} onAddLugar={agregarLugar}></ListaLugares>

        <h3 className="text-xl font-bold mt-6 mb-2">Itinerario</h3>
        {itinerario.length == 0 ?
          (
            <p>Añade lugares desde la lista o el buscador.</p>
          ) : (
            <ul>
              {itinerario.map((lugar) => (
                <li key={lugar.id} className="p-2 border-b">
                  {lugar.nombre}
                </li>
              ))}
            </ul>
          )}

          <button onClick={limpiarItinerario} className="mt-4 w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">
            Limpiar Itinerario
          </button>
      </div>

      <div className="w-full md:w-2/3 h-full">
        <Mapa
          posicion={posicionInicial}
          zoom={zoomInicial}
          itinerario={itinerario}
          onAddLugar={agregarLugar}
        />
      </div>
    </main>
  );
}