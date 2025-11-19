"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HiArrowLeft, HiOutlineMagnifyingGlass } from "react-icons/hi2";

interface ViajeroData {
  id: number;
  nombre_completo: string;
  username: string;
  foto_url: string | null;
  amigos_en_comun: number;
}

const API_URL = "https://harol-lovers.up.railway.app";

// Componente para los resultados de la búsqueda
const ResultadoViajero: React.FC<{ data: ViajeroData }> = ({ data }) => {
  const amigosComun = data.amigos_en_comun || 12;
  const usernameDisplay = data.username || "sin_usuario";

  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-xl shadow-sm transition duration-150 hover:shadow-md p-8">
      <div className="flex items-center">
        {/* Avatar */}
        <div className="w-15 h-15 rounded-full mr-4 bg-gray-200 flex items-center justify-center text-xl font-medium overflow-hidden">
          {data.foto_url ? (
            <img
              src={data.foto_url}
              alt={data.nombre_completo}
              className="w-full h-full object-cover"
            />
          ) : (
            data.nombre_completo?.charAt(0)?.toUpperCase() || "U"
          )}
        </div>
        <div>
          <p className="font-semibold">
            {data.nombre_completo}{" "}
            <span className="text-sm font-normal ">@{usernameDisplay}</span>
          </p>
          <p className="text-xs">{amigosComun} amigos en común</p>
        </div>
      </div>
      <button
        className="bg-primary hover:bg-secondary text-white text-sm font-medium py-2 px-4 rounded-full flex items-center transition duration-150"
        // Falta implementacion para enviar la solicitud de amistad
      >
        <span className="text-xl leading-none mr-1 pb-0.5">+</span> Agregar
      </button>
    </div>
  );
};

// Componente para las Sugerencias de Amistad
const SugerenciaAmistad: React.FC<{
  nombre: string;
  status: "Agregar" | "Solicitud enviada";
}> = ({ nombre, status }) => {
  let buttonText = status;
  let buttonClasses = "bg-primary hover:bg-secondary text-white";

  if (status === "Solicitud enviada") {
    buttonClasses = "bg-gray-200 text-gray-700 border border-gray-300";
  }

  return (
    <div className="w-40 flex-shrink-0 p-4 border border-gray-200 rounded-xl text-center shadow-md">
      {/* Avatar Placeholder */}
      <div className="w-16 h-16 rounded-full mx-auto mb-3 bg-gray-200 flex items-center justify-center text-3xl font-medium text-gray-500">
        {nombre.charAt(0)}
      </div>
      <p className="font-semibold text-sm">{nombre}</p>
      <p className="text-xs text-gray-500 mb-3">12 amigos en común</p>

      <button
        className={`w-full text-xs font-medium py-2 rounded-full transition duration-150 ${buttonClasses}`}
        disabled={status === "Solicitud enviada"}
      >
        {buttonText}
      </button>
    </div>
  );
};

// --- Mock Data para Sugerencias ---
const mockSugerencias = [
  { id: 101, nombre: "Maicol", status: "Agregar" as const },
  { id: 102, nombre: "Maicol", status: "Solicitud enviada" as const },
  { id: 103, nombre: "Maicol", status: "Agregar" as const },
];

// --- Página Principal ---

export default function BuscarViajeroPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const [viajeros, setViajeros] = useState<ViajeroData[]>([]);
  const [loading, setLoading] = useState(false);

  // Función para buscar viajeros
  const handleSearch = async (term: string) => {
    const token = localStorage.getItem("authToken");
    if (!token || term.trim() === "") {
      setViajeros([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/user/search?q=${encodeURIComponent(term)}`,
        {
          method: "GET",
          headers: {
            token: token,
          },
        }
      );

      if (!response.ok) throw new Error("Error al buscar viajeros");

      const data = await response.json();

      setViajeros(data);
    } catch (error) {
      console.error(error);
      setViajeros([]);
    } finally {
      setLoading(false);
    }
  };

  // Buscar al escribir
  useEffect(() => {
    const timeout = setTimeout(() => {
      handleSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  return (
    <div className="flex-1 p-6 md:p-10 min-h-screen">
      {/*  Encabezado y Título */}
      <div className="flex items-center mb-6">
        <Link href="/viajero" className="mr-4 p-2 transition duration-150">
          <HiArrowLeft size={24} aria-label="Volver atrás" />
        </Link>
        <h1 className="text-3xl font-bold">Buscar viajeros</h1>
      </div>

      {/*  Barra de Búsqueda */}
      <div className="mb-8">
        <div className="relative">
          <HiOutlineMagnifyingGlass
            className="absolute left-4 top-1/2 transform -translate-y-1/2"
            size={20}
          />
          <input
            type="text"
            placeholder="¡Busca a un amigo viajero!"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 pl-12 border border-gray-300 rounded-xl shadow-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
          />
        </div>
      </div>

      {/* Estado de carga */}
      {loading && (
        <p className="text-center text-blue-500 font-medium my-8">
          Buscando viajeros...
        </p>
      )}

      {/* Lista de Resultados de la Búsqueda */}
      <div className="space-y-4 mb-12">
        {!loading && viajeros.length > 0
          ? viajeros.map((viajero) => (
              <ResultadoViajero key={viajero.id} data={viajero} />
            ))
          : !loading &&
            searchTerm.trim() !== "" && (
              <p className="text-center my-8">
                No se encontraron viajeros que coincidan.
              </p>
            )}
      </div>

      {/* Sugerencias de Amistad  */}
      <h2 className="text-xl font-semibold mb-4">Sugerencias de amistad</h2>
      <div className="flex overflow-x-auto space-x-4 pb-4">
        {mockSugerencias.map((sugerencia) => (
          <SugerenciaAmistad
            key={sugerencia.id}
            nombre={sugerencia.nombre}
            status={sugerencia.status}
          />
        ))}

        {/* Flecha de Navegación Lateral  */}
        <div className="flex items-center justify-center flex-shrink-0">
          <button className="p-3 text-2xl bg-white border border-gray-200 rounded-full shadow-md hover:bg-gray-100 transition duration-150">
            &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
