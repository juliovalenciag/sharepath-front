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
interface ItinerarioFrameProps {
  itinerario: ItinerarioPrincipal; // Recibe la estructura completa
}
import { Star } from "lucide-react";

function Estrellas({ calificacion }: { calificacion: number }) {
  const totalEstrellas = 5;
  const estrellasLlenas = Math.floor(calificacion);
  const tieneMedia = calificacion - estrellasLlenas >= 0.5;

  return (
    <div className="flex gap-1 text-yellow-400">
      {Array.from({ length: totalEstrellas }).map((_, i) => {
        if (i < estrellasLlenas) {
          return <Star key={i} fill="currentColor" stroke="currentColor" />;
        } else if (i === estrellasLlenas && tieneMedia) {
          return <Star key={i} fill="currentColor" strokeWidth={1.5} />;
        } else {
          return <Star key={i} stroke="currentColor" />;
        }
      })}
    </div>
  );
}
const ItinerarioFrame: React.FC<ItinerarioFrameProps> = ({ itinerario }) => {
    const [showNewDialog, setShowNewDialog] = useState(false)
    const [showShareDialog, setShowShareDialog] = useState(false)
  return (
    <>
        <div className="bg-gray-900 text-white p-6 flex rounded-lg min-h-[300px] w-full">
            <div className="d-none">
                    <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                <Button variant="outline" aria-label="Open menu" size="icon-sm">
                    <MoreHorizontalIcon />
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40" align="end">
                <DropdownMenuItem>Editar</DropdownMenuItem>
                <DropdownMenuGroup>
                    <DropdownMenuItem onSelect={() => setShowNewDialog(true)}>
                    <p className="">Eliminar</p>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Descargar</DropdownMenuItem>
                </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            {/*Aquí es el dialogo que se muestra cuando se escoge una de las opciones, hay que quitarlo*/ }
            <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
                <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New File</DialogTitle>
                    <DialogDescription>
                    Provide a name for your new file. Click create when you&apos;re
                    done.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Create</Button>
                </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
                <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Share File</DialogTitle>
                    <DialogDescription>
                    Anyone with the link will be able to view this file.
                    </DialogDescription>
                </DialogHeader>
                <FieldGroup className="py-3">
                    <Field>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="shadcn@vercel.com"
                        autoComplete="off"
                    />
                    </Field>
                    <Field>
                    <FieldLabel htmlFor="message">Message (Optional)</FieldLabel>
                    <Textarea
                        id="message"
                        name="message"
                        placeholder="Check out this file"
                    />
                    </Field>
                </FieldGroup>
                <DialogFooter>
                    <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Send Invite</Button>
                </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Hasta aca terminan los dialogos que salen al darle clic al drpdown menu, hay que checar que sirve y que no*/}
            
            </div>
            <div className="w-1/3 p-4 flex flex-col justify-center">
                <Estrellas calificacion={itinerario.calificacion} />
                <h1 className="text-3xl font-bold text-blue-400 mb-2">
                {itinerario.tituloPrincipal}
                </h1>
                <h2 className="text-xl font-semibold mb-6">
                {itinerario.subtitulo}
                </h2>
                <p className="text-blue-400 mb-2">
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
