"use client";
import { useState, useEffect } from "react";
import { FiPlus } from "react-icons/fi";

export default function Page() {
  const [search, setSearch] = useState("");

  const itinerarios = [
    { dia: "Día 1", tipo: "Cultura", lugar: "Cerro del Tepozteco", experiencia: "Experiencia", img: "/img/tepozteco1.jpg", rating: 5 },
    { dia: "Día 2", tipo: "Hotel", lugar: "Posada del Tepozteco", experiencia: "Experiencia", img: "/img/tepozteco2.jpg", rating: 5 },
    { dia: "Día 3", tipo: "Comida", lugar: "Mercado de Tepoztlán", experiencia: "Experiencia", img: "/img/tepozteco3.jpg", rating: 5 },
    { dia: "Día 4", tipo: "Cultura", lugar: "Pirámide del Tepozteco", experiencia: "Experiencia", img: "/img/tepozteco4.jpg", rating: 5 },
    { dia: "Día 5", tipo: "Museo", lugar: "Museo de Arte Prehispánico Carlos Pellicer", experiencia: "Experiencia", img: "/img/tepozteco5.jpg", rating: 4 },
    { dia: "Día 6", tipo: "Naturaleza", lugar: "Ex Convento de la Natividad", experiencia: "Experiencia", img: "/img/tepozteco6.jpg", rating: 5 },
  ];

  // Quita scroll del body y html
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      {/* Barra superior */}
      <header className="bg-gray-200 flex justify-between items-center px-4 py-2 shadow">
        <h1 className="text-xl font-semibold">Itinerario</h1>
        <button className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition">
          <FiPlus size={20} />
        </button>
      </header>

      {/* Contenido principal sin scroll global */}
      <main className="flex-1 bg-white relative overflow-x-auto overflow-y-hidden">

        <div className="bg-[#0c2442] text-white rounded-t-2xl p-8 h-full flex flex-col">
          {/* Título fijo */}
          <div className="sticky top-0 bg-[#0c2442] z-10 pb-4">
            <h2 className="text-3xl font-bold mb-1">Tepoztlán, Morelos</h2>
            <p className="text-lg mb-2">Pueblo Mágico de Tepoztlán</p>
            <p className="font-semibold text-gray-300">Detalles del lugar:</p>
          </div>

          {/* Fichas con barra de desplazamiento visible */}
          <div className="flex gap-6 overflow-x-auto mt-6 pb-6 px-1">
            {itinerarios.map((it, index) => (
              <div
                key={index}
                className="bg-white text-gray-800 min-w-[260px] rounded-2xl shadow-md hover:shadow-lg transition overflow-hidden flex-shrink-0"
              >
                <img
                  src={it.img}
                  alt={it.lugar}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <p className="text-gray-700 font-bold">{it.dia}</p>
                  <div className="flex text-yellow-400">
                    {"★".repeat(it.rating)}
                  </div>
                  <p className="text-gray-600 mt-1">{it.tipo}</p>
                  <p className="font-semibold">{it.lugar}</p>
                  <p className="text-sm text-gray-500">- {it.experiencia}</p>
                  <div className="flex justify-end mt-2">
                    <button className="bg-blue-600 text-white text-sm px-4 py-1 rounded-full hover:bg-blue-700">
                      Ver
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
