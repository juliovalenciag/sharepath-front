"use client"

import { useEffect } from 'react';
import { useMap } from 'react-leaflet'
import * as GeoSearch from 'leaflet-geosearch'

import "leaflet-geosearch/dist/geosearch.css";
import "./estilosBusqueda.css"

import { lugar } from "@/app/(dashboard)/dashboard/vermapa/page"

interface BusquedaProps
{
    onAddLugar: (lugar: lugar) => void;
}

export default function busquedaMapa({ onAddLugar }: BusquedaProps)
{
    const map = useMap();
    const provider = new GeoSearch.OpenStreetMapProvider({
    params: {
        countrycodes: 'mx',
    },
    });

    useEffect(() =>
    {
        const search = GeoSearch.GeoSearchControl({
            searchLabel: 'Ingrese su búsqueda',
            notFoundMessage: 'No se encontró el lugar ingresado',
            provider: provider,
            style: 'bar',
            autoClose: true,
            keepResult: true,
        });

        map.addControl(search);

        const onResult = (e: any) =>
        {
            console.log('Se busco algo');
            const { location } = e;

            const nuevoLugar: lugar = {
                id: new Date().getTime().toString(),
                nombre: location.label,
                lat: location.y,
                lng: location.x,
            };

            //appendChild(botonAgregarLugar)
            //boton onclicl(onAddLugar(Lugar))

            onAddLugar(nuevoLugar);
        };

        map.on("geosearch/showlocation", onResult); //Poner showlocation con 'l' minuscula porque con 'L' no agarra

        return () =>
        {
            map.removeControl(search);
            map.off("geosearch/showlocation", onResult); //Poner showlocation con 'l' minuscula porque con 'L' no agarra
        };
    }, [map, onAddLugar, provider]);
    
    return null;
}