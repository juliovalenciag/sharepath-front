"use client";

import { Star } from "lucide-react";

interface EstrellasProps {
  max?: number;   // cantidad total de estrellas
  value?: number; // valor de calificación a mostrar
}

export default function EstrellasEstaticas({ max = 5, value = 0 }: EstrellasProps) {
  return (
    <div className="flex gap-1">
      {[...Array(max)].map((_, i) => {
        const index = i + 1;
        const activo = index <= value;
        return (
          <Star
            key={index}
            className="w-7 h-7 transition-colors"
            stroke={activo ? "#facc15" : "#9ca3af"} // color del contorno
            fill={activo ? "#facc15" : "none"}      // color de relleno
          />
        );
      })}
    </div>
  );
}
