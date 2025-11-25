"use client";

import dynamic from "next/dynamic";
import { use, useEffect, useState } from "react";
import ListaLugares from "@/components/listaLugares";
//import { MapContainer } from "react-leaflet";

export interface lugar {
    id_api_place: string,
    category: string,
    mexican_state: string,
    nombre: string,
    latitud: number,
    longitud: number,
    foto_url: string | null,
    google_score: number,
    total_reviews: number
  }

const Mapa = dynamic(() => import("@/components/map"), {
  ssr: false,
  loading: () => <p className="text-center">Cargando mapa...</p>,
});

export default function Home() {
  const posicionInicial: [number, number] = [19.5043, -99.1470];
  const zoomInicial = 17;

  const [lugaresTuristicos, setLugaresTuristicos] = useState<lugar[]>()

  useEffect( () => {
    fetch('http://localhost:4000/lugar/pague/3', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        token: localStorage.getItem('authToken') || ''
      }
    })
      .then( response => response.json() )
      .then( data => setLugaresTuristicos(data) )
      .catch( error => console.error('Error al obtener los lugares turísticos:', error) );
    
  }, [])

  console.log(lugaresTuristicos);
  

  const [itinerario, defItinerario] = useState<lugar[]>([]);

  const agregarLugar = (lugar: lugar) =>
  {
    if (!itinerario.find((elemento) => elemento.id_api_place === lugar.id_api_place))
    {
      defItinerario((itinerarioAnt) => [...itinerarioAnt, lugar])
    } 
  }

  const limpiarItinerario = () =>
  {
    defItinerario([]);
  }

  return (
    <main className="flex flex-row w-full h-full items-center">
      <div className="w-full flex flex-col justify-center h-screen md:w-1/3 p-4 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Lugares Turisticos</h2>

        {lugaresTuristicos ? (
          <ListaLugares lugares={lugaresTuristicos} onAddLugar={agregarLugar} />
        ) : (
          <p>Cargando lugares turísticos...</p>
        )}

        <h3 className="text-xl font-bold mt-6 mb-2">Itinerario</h3>
        {itinerario.length == 0 ?
          (
            <p>Añade lugares desde la lista o el buscador.</p>
          ) : (
            <ul>
              {itinerario.map((lugar) => (
                <li key={lugar.id_api_place} className="p-2 border-b">
                  {lugar.nombre}
                </li>
              ))}
            </ul>
          )}

          <button onClick={limpiarItinerario} className="mt-4 w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">
            Limpiar Itinerario
          </button>
      </div>

      <div className="w-full md:w-2/3 h-3/4 rounded-xl overflow-hidden">
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