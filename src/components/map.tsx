import { LatLngExpression } from "leaflet";
<<<<<<< HEAD
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
=======
import * as L from "react-leaflet"
>>>>>>> abf5e16404d6701c2067fcbbef4d463cd7b22909
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"

import BusquedaMapa from "./busquedaMapa"
import Ruta from "./ruta"
import { lugar } from "@/app/(dashboard)/dashboard/vermapa/page"

interface MapProps{
  posicion: LatLngExpression,
  zoom: number,
  itinerario: lugar[],
  onAddLugar: (lugar: lugar) => void,
}

export default function Mapa(props: MapProps) {
  const { posicion, zoom, itinerario, onAddLugar } = props;

<<<<<<< HEAD
  return (
    <MapContainer center={posicion} zoom={zoom} scrollWheelZoom={true} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Ruta destinos={itinerario} />
      <BusquedaMapa onAddLugar={onAddLugar} />

      <Marker position={posicion}>
        <Popup>
          ESCOM <br /> Escula Superior de Computo
        </Popup>
      </Marker>
    </MapContainer>
  );
=======
  return <L.MapContainer center={posicion} zoom={zoom} scrollWheelZoom={true} className="h-full w-full">
    <L.TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
    />

    <Ruta destinos={itinerario}/>
    
    <BusquedaMapa onAddLugar={onAddLugar}/>

    <L.Marker position={posicion}>
      <L.Popup>
        ESCOM <br/> Escula Superior de Computo
      </L.Popup>
    </L.Marker>
  </L.MapContainer>
>>>>>>> abf5e16404d6701c2067fcbbef4d463cd7b22909
}