import React from 'react'
import { Card, CardContent, CardDescription, CardTitle } from './ui/card'
import { GripVertical, Trash2, Star} from 'lucide-react'
import Image from 'next/image'
export default function DiaDetalle() {
  return (
    <div>
        <Card className="p-2 m-3">
            <CardContent className="flex gap-4 items-center">
                {/* Ícono de agarre */}
                <GripVertical className="text-gray-400 w-5 h-5 cursor-grab" />

                {/* Imagen: 1/3 */}
                <div className="w-1/3">
                <Image
                    src="/img/bellas_artes.jpg"
                    alt="Bellas Artes"
                    width={400}
                    height={200}
                    className="rounded-md w-full h-auto object-cover"
                />
                </div>

                {/* Texto: 2/3 */}
                <div className="w-2/3 flex flex-col justify-center">
                <CardTitle className="text-xl font-semibold flex gap-2 justify-between">
                    Palacio de Bellas Artes
                    <Trash2 className="text-red-500"></Trash2>
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 mt-2">
                    <span className='flex gap-2'><Star className='text-dark text-sm'></Star>4.5</span>
                    Uno de los recintos culturales más emblemáticos de México, ubicado en el corazón de la CDMX.
                </CardDescription>
                </div>
            </CardContent>
            </Card>
            
    </div>
  )
}
