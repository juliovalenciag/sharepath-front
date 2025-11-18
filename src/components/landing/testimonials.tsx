import Image from "next/image";

import { ArrowRight } from "lucide-react";

import { DashedLine } from "./dashed-line";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const items = [
  {
    quote: "Descubre lo imperdible de CDMX en solo 2 días.",
    author: "Ciudad de México",
    role: "Itinerario de 2 días",
    company: "Itinerario SharePath",
    image: "https://images.unsplash.com/photo-1521216774850-01bc1c5fe0da?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote: "Un día completo para disfrutar la ciudad y su gastronomía.",
    author: "Morelos",
    role: "Itinerario de 1 día",
    company: "Itinerario SharePath",
    image: "https://images.pexels.com/photos/14159886/pexels-photo-14159886.jpeg",
  },
  {
    quote: "Equilibrio perfecto entre gastronomía, cultura y relax.",
    author: "Hidalgo y alrededores",
    role: "Itinerario de 3 días",
    company: "Itinerario SharePath",
    image: "https://images.pexels.com/photos/6942986/pexels-photo-6942986.jpeg",
  },
  {
    quote: "Historia, arte y buen ambiente en un fin de semana.",
    author: "Estado de México",
    role: "Itinerario de 2 días",
    company: "Itinerario SharePath",
    image: "https://images.pexels.com/photos/17123700/pexels-photo-17123700.jpeg",
  },
  {
    quote: "Un recorrido relajado por pueblos mágicos y naturaleza.",
    author: "Querétaro",
    role: "Itinerario de 2 días",
    company: "Itinerario SharePath",
    image: "https://images.pexels.com/photos/28572676/pexels-photo-28572676.jpeg",
  },
];

export const Testimonials = ({
  className,
  dashedLineClassName,
}: {
  className?: string;
  dashedLineClassName?: string;
}) => {
  return (
    <>
      <section className={cn("overflow-hidden py-28 lg:py-32", className)}>
        <div className="container">
          <div className="space-y-4">
            <h2 className="text-2xl tracking-tight md:text-4xl lg:text-5xl">
              Itinerarios creados con SharePath
            </h2>
            <p className="text-muted-foreground max-w-md leading-snug">
              Explora algunos ejemplos de rutas completas planeadas con
              SharePath: días bien organizados, tiempos reales de traslado y
              actividades equilibradas para disfrutar cada destino.
            </p>
            <Button variant="outline" className="shadow-md">
              Ver itinerarios destacados <ArrowRight className="size-4" />
            </Button>
          </div>

          <div className="relative mt-8 -mr-[max(3rem,calc((100vw-80rem)/2+3rem))] md:mt-12 lg:mt-20">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {items.map((itinerary, index) => (
                  <CarouselItem
                    key={index}
                    className="xl:basis-1/3.5 grow basis-4/5 sm:basis-3/5 md:basis-2/5 lg:basis-[28%] 2xl:basis-[24%]"
                  >
                    <Card className="bg-muted h-full overflow-hidden border-none">
                      <CardContent className="flex h-full flex-col p-0">
                        <div className="relative h-[288px] lg:h-[328px]">
                          <Image
                            src={itinerary.image}
                            alt={itinerary.author}
                            fill
                            className="object-cover object-top"
                          />
                        </div>
                        <div className="flex flex-1 flex-col justify-between gap-10 p-6">
                          <blockquote className="font-display text-lg leading-none! font-medium md:text-xl lg:text-2xl">
                            {itinerary.quote}
                          </blockquote>
                          <div className="space-y-0.5">
                            <div className="text-primary font-semibold">
                              {itinerary.author}
                            </div>
                            <div className="text-muted-foreground text-sm">
                              {itinerary.role} · {itinerary.company}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="mt-8 flex gap-3">
                <CarouselPrevious className="bg-muted hover:bg-muted/80 static size-14.5 translate-x-0 translate-y-0 transition-colors [&>svg]:size-6 lg:[&>svg]:size-8" />
                <CarouselNext className="bg-muted hover:bg-muted/80 static size-14.5 translate-x-0 translate-y-0 transition-colors [&>svg]:size-6 lg:[&>svg]:size-8" />
              </div>
            </Carousel>
          </div>
        </div>
      </section>
      <DashedLine
        orientation="horizontal"
        className={cn("mx-auto max-w-[80%]", dashedLineClassName)}
      />
    </>
  );
};
