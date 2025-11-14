import React from "react";
import { Card, CardContent, CardDescription, CardTitle } from "./ui/card";
import { GripVertical, Trash2, Star } from "lucide-react";
import Image from "next/image";
import { Input } from "./ui/input";
import { Actividad } from "@/app/(viajero)/viajero/itinerarios/crear/page2";
interface DiaDetalleProps {
  lugar: Actividad;
  onActivityChange: (
    id: string | number,
    field: keyof Actividad,
    value: any
  ) => void;
  onDelete: (id: string | number) => void;
}
export default function DiaDetalle({
  lugar,
  onActivityChange,
  onDelete,
}: DiaDetalleProps) {
  return (
    <div>
      <Card className="p-2 m-3">
        <CardContent className="flex gap-4 items-center">
          <GripVertical className="text-gray-400 w-5 h-5 cursor-grab" />

          <div className="w-1/3">
            <Image
              src="/img/bellas_artes.jpg"
              alt={lugar.nombre}
              width={400}
              height={200}
              className="rounded-md w-full h-auto object-cover"
            />
          </div>

          {/* Texto: 2/3 */}
          <div className="w-2/3 flex flex-col justify-center">
            <CardTitle className="text-xl font-semibold flex gap-2 justify-between">
              {lugar.nombre}
              <Trash2
                className="text-red-500"
                onClick={() => onDelete(lugar.id)}
              ></Trash2>
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 mt-2">
              {/* <span className='flex gap-2'><Star className='text-dark text-sm'></Star>4.5</span> */}
              <Input
                type="text"
                placeholder="Añadir una descripción (Opcional)"
                className="border-0 m-2"
                // Lee el valor del estado
                value={lugar.description || ""}
                // Actualiza el estado en el padre cuando se escribe
                onChange={(e) =>
                  onActivityChange(lugar.id, "description", e.target.value)
                }
              />
            </CardDescription>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
