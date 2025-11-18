import Image from "next/image";

import { DashedLine } from "./dashed-line";

import { cn } from "@/lib/utils";

const topItems = [
  {
    title: "Plantillas rápidas de itinerario.",
    description:
      "Crea días completos con horarios, bloques y actividades listas para ajustar a tu forma de viajar.",
    images: [
      {
        src: "/test2.webp",
        alt: "Interfaz de plantillas de itinerario",
        width: 495,
        height: 186,
      },
    ],
    className:
      "flex-1 [&>.title-container]:mb-5 md:[&>.title-container]:mb-8 xl:[&>.image-container]:translate-x-6 [&>.image-container]:translate-x-2",
    fade: [""],
  },
  {
    title: "Explora 5 estados desde un solo lugar.",
    description:
      "Planea tus rutas por Ciudad de México, Estado de México, Morelos, Querétaro e Hidalgo sin cambiar de aplicación.",
    images: [
      {
        src: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Mapa_M%C3%A9xico%2C_D._F..svg",
        alt: "Ciudad de México",
        width: 60,
        height: 60,
      },
      {
        src: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Regions_of_the_state_of_Mexico_%28blank%29.svg",
        alt: "Estado de México",
        width: 60,
        height: 60,
      },
      {
        src: "https://upload.wikimedia.org/wikipedia/commons/9/91/Blank_map_of_Morelos.svg",
        alt: "Morelos",
        width: 60,
        height: 60,
      },
      {
        src: "https://upload.wikimedia.org/wikipedia/commons/2/26/QUE-mun-map.svg",
        alt: "Querétaro",
        width: 60,
        height: 60,
      },
      {
        src: "https://upload.wikimedia.org/wikipedia/commons/2/26/Blank_map_of_Hidalgo.svg",
        alt: "Hidalgo",
        width: 60,
        height: 60,
      },
    ],
    className:
      "flex-1 justify-normal [&>.title-container]:mb-5 md:[&>.title-container]:mb-0 [&>.image-container]:flex-1 md:[&>.image-container]:place-items-center md:[&>.image-container]:-translate-y-3",
    fade: [],
  },
];

const bottomItems = [
  {
    title: "Archiva lo que no va.",
    description:
      "Marca y guarda aquellas ideas, lugares o rutas que no usarás en este viaje, pero que quieres considerar más adelante.",
    images: [
      {
        src: "/test.webp",
        alt: "Interfaz de archivo de rutas",
        width: 305,
        height: 280,
      },
    ],
    className:
      "[&>.title-container]:mb-5 md:[&>.title-container]:mb-8 xl:[&>.image-container]:translate-x-6 [&>.image-container]:translate-x-2",
    fade: ["bottom"],
  },
  {
    title: "Notas y comentarios.",
    description:
      "Agrega comentarios sobre cada día o lugar: recomendaciones, horarios especiales o detalles que no quieres olvidar.",
    images: [
      {
        src: "/test.webp",
        alt: "Interfaz de notas del itinerario",
        width: 320,
        height: 103,
      },
    ],
    className:
      "justify-normal [&>.title-container]:mb-5 md:[&>.title-container]:mb-0 [&>.image-container]:flex-1 md:[&>.image-container]:place-items-center md:[&>.image-container]:-translate-y-3",
    fade: [""],
  },
  {
    title: "Recordatorios inteligentes.",
    description:
      "Recibe avisos sobre traslados largos, actividades muy cargadas en un mismo día o cambios que puedan mejorar tu ruta.",
    images: [
      {
        src: "/test.webp",
        alt: "Interfaz de notificaciones",
        width: 305,
        height: 280,
      },
    ],
    className:
      "[&>.title-container]:mb-5 md:[&>.title-container]:mb-8 xl:[&>.image-container]:translate-x-6 [&>.image-container]:translate-x-2",
    fade: ["bottom"],
  },
];

export const ResourceAllocation = () => {
  return (
    <section
      id="resource-allocation"
      className="overflow-hidden pb-28 lg:pb-32"
    >
      <div className="">
        <h2 className="container text-center text-3xl tracking-tight text-balance sm:text-4xl md:text-5xl lg:text-6xl">
          Organiza y visualiza tus rutas de viaje con SharePath
        </h2>

        <div className="mt-8 md:mt-12 lg:mt-20">
          <DashedLine
            orientation="horizontal"
            className="container scale-x-105"
          />

          {/* Top Features Grid - 2 items */}
          <div className="relative container flex max-md:flex-col">
            {topItems.map((item, i) => (
              <Item key={i} item={item} isLast={i === topItems.length - 1} />
            ))}
          </div>
          <DashedLine
            orientation="horizontal"
            className="container max-w-7xl scale-x-110"
          />

          {/* Bottom Features Grid - 3 items */}
          <div className="relative container grid max-w-7xl md:grid-cols-3">
            {bottomItems.map((item, i) => (
              <Item
                key={i}
                item={item}
                isLast={i === bottomItems.length - 1}
                className="md:pb-0"
              />
            ))}
          </div>
        </div>
        <DashedLine
          orientation="horizontal"
          className="container max-w-7xl scale-x-110"
        />
      </div>
    </section>
  );
};

interface ItemProps {
  item: (typeof topItems)[number] | (typeof bottomItems)[number];
  isLast?: boolean;
  className?: string;
}

const Item = ({ item, isLast, className }: ItemProps) => {
  return (
    <div
      className={cn(
        "relative flex flex-col justify-between px-0 py-6 md:px-6 md:py-8",
        className,
        item.className
      )}
    >
      <div className="title-container text-balance">
        <h3 className="inline font-semibold">{item.title} </h3>
        <span className="text-muted-foreground"> {item.description}</span>
      </div>

      {item.fade.includes("bottom") && (
        <div className="from-muted/80 absolute inset-0 z-10 bg-linear-to-t via-transparent to-transparent md:hidden" />
      )}

      {/* 🔹 AQUÍ el ajuste: una sola fila para los estados */}
      {item.images.length > 4 ? (
        <div className="image-container mt-4">
          <div className="flex flex-row flex-wrap gap-4">
            {item.images.map((image, j) => (
              <div
                key={j}
                className="bg-background grid aspect-square size-16 place-items-center rounded-2xl p-2 lg:size-20"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="image-container grid grid-cols-1 gap-4">
          {item.images.map((image, j) => (
            <Image
              key={j}
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              className="object-contain object-left-top"
            />
          ))}
        </div>
      )}

      {!isLast && (
        <>
          <DashedLine
            orientation="vertical"
            className="absolute top-0 right-0 max-md:hidden"
          />
          <DashedLine
            orientation="horizontal"
            className="absolute inset-x-0 bottom-0 md:hidden"
          />
        </>
      )}
    </div>
  );
};
