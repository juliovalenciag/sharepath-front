// components/DiaCard.tsx

import Image from 'next/image';
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// Importa tus componentes Card de shadcn/ui

interface DiaCardProps {
  diaDetalle: DiaDetalle;
}
const DiaCard2: React.FC<DiaCardProps> = ({ diaDetalle }) => {
  return (
    <>
    <Card className="w-full max-w-sm">
      <CardHeader className='flex justify-between items-center m-0'>
        {diaDetalle.dia}
        <div> ⭐{diaDetalle.calificacion}</div>
      </CardHeader>
      <CardContent>
         <Image 
      src={diaDetalle.urlImagen}
      alt={diaDetalle.titulo}
      width={300}
      height={120}
      className="rounded-lg object-cover w-full h-40"
    />
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <CardTitle>{diaDetalle.titulo}</CardTitle>
        <CardDescription>
          {diaDetalle.categoria}
        </CardDescription>
      </CardFooter>
    </Card>
    </>
  );
}

export default DiaCard2;