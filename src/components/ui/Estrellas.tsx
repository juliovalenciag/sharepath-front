"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface EstrellasProps {
  max?: number;               // cantidad de estrellas
  initial?: number;           // calificación inicial
  onRate?: (value: number) => void; // callback al calificar
}

export default function Estrellas({ max = 5, initial = 0, onRate }: EstrellasProps) {
  const [valor, setValor] = useState(initial);
  const [hover, setHover] = useState(0);

  const handleClick = (value: number) => {
    setValor(value);
    if (onRate) onRate(value);
    console.log("⭐ Nueva calificación:", value);
  };

  return (
    <div className="flex gap-1">
      {[...Array(max)].map((_, i) => {
        const index = i + 1;
        const activo = index <= (hover || valor);
        return (
          <Star
            key={index}
            onClick={() => handleClick(index)}
            onMouseEnter={() => setHover(index)}
            onMouseLeave={() => setHover(0)}
            className="w-7 h-7 cursor-pointer transition-colors"
            stroke={activo ? "#facc15" : "#9ca3af"} // contorno
            fill={activo ? "#facc15" : "none"}       // relleno
          />
        );
      })}
    </div>
  );
}
