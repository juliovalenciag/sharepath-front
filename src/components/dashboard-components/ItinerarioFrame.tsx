// components/ItinerarioFrame.tsx
"use client";
import DiasCarousel from "./DiaCarousel";
import Link from "next/link";
import { useState } from "react"
import { MoreHorizontalIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Estrellas from "@/components/ui/Estrellas";

interface ItinerarioFrameProps {
  itinerario: ItinerarioPrincipal; // Recibe la estructura completa
}
import { Star } from "lucide-react";


const ItinerarioFrame: React.FC<ItinerarioFrameProps> = ({ itinerario }) => {
    const [showNewDialog, setShowNewDialog] = useState(false)
    const [showShareDialog, setShowShareDialog] = useState(false)
  return (
    <>
        <div className="p-2 flex rounded-lg min-h-[300px] w-full">
            
            <div className="w-1/3 p-4 flex flex-col justify-center">
<<<<<<< HEAD
                <Estrellas
                initial={Number(itinerario.calificacion) || 0}
                onRate={(valor) => console.log("Nueva calificación:", valor)}/>

                <h1 className="text-3xl font-bold text-blue-400 mb-2">
=======
                <Estrellas calificacion={itinerario.calificacion} />
                <h1 className="text-3xl font-bold text-[var(--palette-blue)] mb-2">
>>>>>>> main
                {itinerario.tituloPrincipal}
                </h1>
                <h2 className="text-xl font-semibold mb-6">
                {itinerario.subtitulo}
                </h2>
                <p>
                Fecha de inicio {itinerario.fechaInicio}
                </p>
                <p className="text-sm">
                Detalles del lugar: {itinerario.detallesLugar}
                </p>
            </div>

            <div className="w-2/3 flex items-center">
                <DiasCarousel dias={itinerario.dias} />
            </div>
        </div>

    </>
  );
};

export default ItinerarioFrame;
