import { lugar } from "@/app/(dashboard)/dashboard/vermapa/page"

interface ListaProps
{
    lugares: lugar[],
    onAddLugar: (lugar: lugar) => void;
}

export default function ListaLugares({ lugares, onAddLugar } : ListaProps) {
  return <div className="space-y-2">
    {lugares.map( (lugar) => (
        <div
            key={lugar.id}
            className="p-3 border rounded-lg shadow-sm flex justify-between items-center"
        >
            <div>
                <h4 className="font-semibold">{lugar.nombre}</h4>
            </div>

            <button
                onClick={() => onAddLugar(lugar)}
                className="bg-primary text-white pt-[2px] pb-[2px] pl-[10px] pr-[10px] rounded-lg text-md hover:bg-secondary transition-colors"
            >
                + Agregar
            </button>
        </div>
    ))}
  </div>
}