"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { Eye, Trash2, Settings } from "lucide-react";

interface Itinerario {
  id: number;
  nombre: string;
  fecha: string;
  estado: string;
  usuario: {
    username: string;
  };
}

export default function CRUDItinerariosPage() {
  const [itinerarios, setItinerarios] = useState<Itinerario[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [filtrados, setFiltrados] = useState<Itinerario[]>([]);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : "";

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          "https://harol-lovers.up.railway.app/admin/itinerarios",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              token: token || "",
            },
          }
        );

        const data = await res.json();
        setItinerarios(Array.isArray(data) ? data : []);
        setFiltrados(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error al cargar itinerarios:", error);
      }
    }

    fetchData();
  }, [token]);

  const filtrar = () => {
    let resultado = itinerarios;

    if (busqueda.trim() !== "") {
      const texto = busqueda.toLowerCase();
      resultado = resultado.filter(
        (it) =>
          it.usuario?.username?.toLowerCase().includes(texto) ||
          it.nombre?.toLowerCase().includes(texto) ||
          it.id.toString().includes(texto)
      );
    }

    if (estadoFiltro !== "") {
      resultado = resultado.filter(
        (it) => it.estado.toLowerCase() === estadoFiltro.toLowerCase()
      );
    }

    setFiltrados(resultado);
  };
  //  Actualizar estado del itinerario
  const actualizarEstado = async (id: number, nuevoEstado: string) => {
    try {
      await fetch(
        `https://harol-lovers.up.railway.app/admin/itinerarios/${id}/estado`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            token: token || "",
          },
          body: JSON.stringify({ estado: nuevoEstado }),
        }
      );

      setItinerarios((prev) =>
        prev.map((it) => (it.id === id ? { ...it, estado: nuevoEstado } : it))
      );
      filtrar();
    } catch (error) {
      console.error("Error al actualizar estado:", error);
    }
  };

  // Eliminar itinerario
  const eliminarItinerario = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este itinerario?")) return;

    try {
      await fetch(
        `https://harol-lovers.up.railway.app/admin/itinerarios/${id}`,
        {
          method: "DELETE",
          headers: {
            token: token || "",
          },
        }
      );

      setItinerarios((prev) => prev.filter((it) => it.id !== id));
      filtrar();
    } catch (error) {
      console.error("Error al eliminar itinerario:", error);
    }
  };
  return (
    <div className="p-6 flex flex-col gap-10 min-h-screen">
      {/* Título */}
      <h1 className="text-3xl font-bold">Gestión de Itinerarios</h1>
      {/*  Barra de busqueda y Filtro */}
      <div className="w-full flex flex-wrap justify-between items-center gap-6">
        {/* Buscador por autor*/}
        <div className="flex items-center gap-2">
          <div className="relative">
            <HiOutlineMagnifyingGlass
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar itinerario por Autor/ ID/ Lugar"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="p-2 pl-10 border border-gray-300 rounded-xl shadow-md"
              style={{ width: "326px" }} //
            />
          </div>
          <Button
            onClick={filtrar}
            className="px-4 py-2 rounded-xl text-sm font-medium"
          >
            Ir
          </Button>
        </div>

        {/* Filtro Estado  */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Estado:</label>
          <select
            className="border px-1 py-2 rounded-xl text-sm shadow"
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="Reportada">Reportada</option>
            <option value="Aprobada">Aprobada</option>
            <option value="Revisión">Revisión</option>
          </select>
          <Button
            onClick={filtrar}
            className="px-4 py-2 rounded-xl text-sm font-medium"
          >
            Ir
          </Button>
        </div>
      </div>
      {/* Tabla */}
      <Card className="shadow-lg border rounded-xl p-0">
        <CardContent className="p-0 overflow-x-auto w-full">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100 rounded-t-xl">
              <tr className="text-left">
                <th className="p-4 border-b rounded-tl-xl">
                  Nombre de usuario
                </th>
                <th className="p-4 border-b">Nombre del itinerario</th>
                <th className="p-4 border-b">ID</th>
                <th className="p-4 border-b">Itinerario</th>
                <th className="p-4 border-b">Fecha</th>
                <th className="p-4 border-b">Estado</th>
                <th className="p-4 border-b rounded-tr-xl">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtrados.length > 0 ? (
                filtrados.map((it) => (
                  <tr key={it.id} className="hover:bg-gray-50 transition">
                    <td className="p-4">{it.usuario?.username || "—"}</td>
                    <td className="p-4">{it.nombre}</td>

                    <td className="p-4">
                      <span className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-xs">
                        {it.id}
                      </span>
                    </td>

                    <td className="p-4">
                      <Link href={`/viajero/itinerarios/${it.id}/ver`}>
                        <Button size="sm">Ver itinerario</Button>
                      </Link>
                    </td>

                    <td className="p-4">
                      {new Date(it.fecha).toLocaleDateString("es-MX")}
                    </td>

                    <td className="p-4">
                      <select
                        value={it.estado}
                        onChange={(e) =>
                          actualizarEstado(it.id, e.target.value)
                        }
                        className="px-3 py-1 rounded-md border text-xs shadow"
                      >
                        <option value="Reportada">Reportada</option>
                        <option value="Aprobada">Aprobada</option>
                        <option value="Revisión">Revisión</option>
                      </select>
                    </td>

                    <td className="p-4 flex items-center gap-4 text-gray-600">
                      <Trash2
                        className="w-5 h-5 cursor-pointer hover:text-red-500"
                        onClick={() => eliminarItinerario(it.id)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-gray-500">
                    No se encontraron itinerarios con esos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
