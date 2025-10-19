import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { HeroHeader } from "@/components/landing-components/hero-header";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";

export default function HeroSection() {
  return (
    <>
      {/* <HeroHeader /> */}
      <main className="overflow-x-hidden">
        <section className="relative overflow-hidden">
          {/* Video del Hero */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover -z-20"
          >
            <source src="/videos/video_bandera.mp4" type="video/mp4"/>
            Tu navegador no soporta el tag de video
          </video>

        <div className="absolute top-0 left-0 w-full h-full bg-black/20 dark:bg-black/60 -z-10"></div>

          <div className="pb-24 pt-12 md:pb-32 lg:pb-56 lg:pt-44">
            <div className="relative mx-auto flex max-w-6xl flex-col px-6 lg:block">
              <div className="mx-auto max-w-lg text-center lg:ml-0 lg:w-1/2 lg:text-left">
                <h1 className="mt-8 max-w-2xl text-balance text-5xl font-medium md:text-6xl lg:mt-16 xl:text-7xl">
                  Share Path
                </h1>
                <p className="mt-8 max-w-2xl text-pretty text-lg">
                  Viajar es la mejor forma de encontrarte con lo desconocido y
                  contigo mismo. Descubre nuevos horizontes y vive experiencias
                  inolvidables con nosotros.
                </p>

                <div className="mt-12 flex flex-col items-center justify-center gap-2 sm:flex-row lg:justify-start">
                  <Button asChild size="lg" className="px-5 text-base">
                    <Link href="#link">
                      <span className="text-nowrap">Comienza la aventura</span>
                    </Link>
                  </Button>
                  <Button
                    key={2}
                    asChild
                    size="lg"
                    variant="ghost"
                    className="px-5 text-base"
                  >
                    <Link href="#link">
                      <span className="text-nowrap">Ingresar</span>
                    </Link>
                  </Button>
                </div>
              </div>
              {/* <Image
                className="-z-10 order-first ml-auto h-56 w-full object-cover invert sm:h-96 lg:absolute lg:inset-0 lg:-right-20 lg:-top-96 lg:order-last lg:h-max lg:w-2/3 lg:object-contain dark:mix-blend-lighten dark:invert-0"
                src="https://res.cloudinary.com/dg4jhba5c/image/upload/v1741605150/abstract-bg_wq4f8w.jpg"
                alt="Abstract Object"
                height="4000"
                width="3000"
              /> */}
            </div>
          </div>
        </section>
        <section className="bg-background pb-16 md:pb-32">
          <div className="group relative m-auto max-w-6xl px-6">
            <div className="flex flex-col items-center md:flex-row">
              <div className="md:max-w-44 md:border-r md:pr-6">
                <p className="text-end text-sm">Explora estos estados</p>
              </div>
              <div className="relative py-6 md:w-[calc(100%-11rem)]">
                <InfiniteSlider speedOnHover={20} speed={40} gap={150}>
                  
                  <div className="flex">
                    <img
                      className="mx-auto h-4 w-fit dark:invert"
                      src="https://upload.wikimedia.org/wikipedia/commons/e/ea/Mapa_M%C3%A9xico%2C_D._F..svg"
                      alt="CDMX"
                      height="1000"
                      width="auto"
                    />
                  </div>
                  <div className="flex">
                    <img
                      className="mx-auto h-5 w-fit dark:invert"
                      src="https://upload.wikimedia.org/wikipedia/commons/9/91/Blank_map_of_Morelos.svg"
                      alt="Morelos"
                      height="1000"
                      width="auto"
                    />
                  </div>
                  <div className="flex">
                    <img
                      className="mx-auto h-5 w-fit dark:invert"
                      src="https://upload.wikimedia.org/wikipedia/commons/2/26/Blank_map_of_Hidalgo.svg"
                      alt="Hidalgo"
                      height="1000"
                      width="auto"
                    />
                  </div>
                  <div className="flex">
                    <img
                      className="mx-auto h-4 w-fit dark:invert"
                      src="https://upload.wikimedia.org/wikipedia/commons/f/f3/Regions_of_the_state_of_Mexico_%28blank%29.svg"
                      alt="Estado de México"
                      height="1000"
                      width="auto"
                    />
                  </div>
                  <div className="flex">
                    <img
                      className="mx-auto h-7 w-fit dark:invert"
                      src="https://upload.wikimedia.org/wikipedia/commons/2/26/QUE-mun-map.svg"
                      alt="Queretaro"
                      height="1000"
                      width="auto"
                    />
                  </div>

            
                </InfiniteSlider>

                <div className="bg-linear-to-r from-background absolute inset-y-0 left-0 w-20"></div>
                <div className="bg-linear-to-l from-background absolute inset-y-0 right-0 w-20"></div>
                <ProgressiveBlur
                  className="pointer-events-none absolute left-0 top-0 h-full w-20"
                  direction="left"
                  blurIntensity={1}
                />
                <ProgressiveBlur
                  className="pointer-events-none absolute right-0 top-0 h-full w-20"
                  direction="right"
                  blurIntensity={1}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
