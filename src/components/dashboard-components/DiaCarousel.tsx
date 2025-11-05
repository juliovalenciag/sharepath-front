// components/DiasCarousel.tsx

import DiaCard from './DiaCard';
// Importa tu implementación de carrusel aquí
import {
  Carousel, 
  CarouselContent, 
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

interface DiasCarouselProps {
  dias: DiaDetalle[];
}

const CarouselDias: React.FC<DiasCarouselProps> = ({ dias }) => {
  return (
    <Carousel
      opts={{
        align: "start",
      }}
      className="w-full"
    >
      <CarouselContent>
        {dias.map((dia) => (
        <CarouselItem key={dia.id} className="md:basis-1/3" >
          <div className='p-1'>
          <DiaCard diaDetalle={dia} />
          </div>
        </CarouselItem>
      ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
export default CarouselDias;