import Image from "next/image";

import {
  ArrowRight,
  Blend,
  ChartNoAxesColumn,
  CircleDot,
  Diamond,
} from "lucide-react";

import { DashedLine } from "./dashed-line";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "Itinerarios a tu medida",
    description:
      "Crea días completos con horarios, lugares y actividades según tu forma de viajar.",
    icon: CircleDot,
  },
  {
    title: "Colabora y comparte fácilmente",
    description:
      "Comparte tu ruta con amigos, pareja o clientes usando un enlace claro y bonito.",
    icon: Blend,
  },
  {
    title: "Viajes organizados por días y fases",
    description:
      "Divide tu viaje en días y bloques: llegada, recorridos, comida y tiempo libre.",
    icon: Diamond,
  },
  {
    title: "Insights de tu ruta",
    description:
      "Visualiza tiempos de traslado, número de lugares por día y la carga de cada jornada.",
    icon: ChartNoAxesColumn,
  },
];

export const Hero = () => {
  return (
    <section className="py-28 lg:py-32 lg:pt-44">
      <div className="container flex flex-col justify-between gap-8 md:gap-14 lg:flex-row lg:gap-20">
        {/* Left side - Main content */}
        <div className="flex-1">
          <h1 className="text-foreground max-w-160 text-3xl tracking-tight md:text-4xl lg:text-5xl xl:whitespace-nowrap">
            SharePath — planifica tu viaje ideal
          </h1>

          <p className="text-muted-foreground text-1xl mt-5 md:text-3xl">
            Crea itinerarios visuales, organiza tus días y optimiza tus rutas en
            minutos, sin hojas de cálculo ni mil pestañas abiertas.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4 lg:flex-nowrap">
            <Button asChild>
              <a href="/sign-in">Ingresar</a>
            </Button>
            <Button
              variant="outline"
              className="from-background h-auto gap-2 bg-linear-to-r to-transparent shadow-md"
              asChild
            >
              <a
                href="#feature-modern-teams"
                className="max-w-56 truncate text-start md:max-w-none"
              >
                Ver cómo funciona SharePath
                <ArrowRight className="stroke-3" />
              </a>
            </Button>
          </div>
        </div>

        {/* Right side - Features */}
        <div className="relative flex flex-1 flex-col justify-center space-y-5 max-lg:pt-10 lg:pl-10">
          <DashedLine
            orientation="vertical"
            className="absolute top-0 left-0 max-lg:hidden"
          />
          <DashedLine
            orientation="horizontal"
            className="absolute top-0 lg:hidden"
          />
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="flex gap-2.5 lg:gap-5">
                <Icon className="text-foreground mt-1 size-4 shrink-0 lg:size-5" />
                <div>
                  <h2 className="font-text text-foreground font-semibold">
                    {feature.title}
                  </h2>
                  <p className="text-muted-foreground max-w-76 text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-12 max-lg:ml-6 md:mt-20 lg:container lg:mt-24">
        <div className="relative w-full aspect-[4/5] lg:aspect-video">
          <Image
            src="/hero.jpg"
            alt="hero"
            fill
            className="rounded-2xl object-cover object-left-top shadow-lg max-lg:rounded-tr-none"
          />
        </div>
      </div>
    </section>
  );
};
