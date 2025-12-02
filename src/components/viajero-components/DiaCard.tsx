// components/DiaCard.tsx

import {
  getCategoryName,
  getDefaultImageForCategory,
} from "@/lib/category-utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DiaDetalle {
  id: string | number;
  dia: string;
  categoria: string;
  titulo: string;
  urlImagen: string;
  calificacion: number;
}

interface DiaCardProps {
  diaDetalle: DiaDetalle;
}
const DiaCard2: React.FC<DiaCardProps> = ({ diaDetalle }) => {
  const imageUrl =
    diaDetalle.urlImagen && diaDetalle.urlImagen !== "/img/default.jpg"
      ? diaDetalle.urlImagen
      : getDefaultImageForCategory(diaDetalle.categoria);

  const categoryName = getCategoryName(diaDetalle.categoria);

  return (
    <>
      <Card className="w-full h-full border-0 shadow-none">
        <CardHeader className="flex justify-between items-center m-0">
          {diaDetalle.dia}
          {/* <div> ⭐{diaDetalle.calificacion.toFixed(1)}</div> */}
        </CardHeader>
        <CardContent>
          <Image
            src={imageUrl}
            alt={diaDetalle.titulo}
            width={300}
            height={120}
            className="rounded-lg object-cover w-full h-40"
          />
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <CardTitle>{diaDetalle.titulo}</CardTitle>
          <CardDescription>{categoryName}</CardDescription>
        </CardFooter>
      </Card>
    </>
  );
};

export default DiaCard2;
