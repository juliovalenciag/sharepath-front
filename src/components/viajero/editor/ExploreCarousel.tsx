// src/components/viajero/editor/ExploreCarousel.tsx
"use client";
import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import {
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
} from "@tabler/icons-react";
import { Place } from "@/lib/constants/mock";
import { cn } from "@/lib/utils";
import { UI } from "@/lib/constants/mock";

export function ExploreCarousel({
  title,
  items,
  onPick,
}: {
  title: string;
  items: Place[];
  onPick: (p: Place) => void;
}) {
  const [ref, api] = useEmblaCarousel({ align: "start", loop: false });

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex gap-2">
          <button
            className="rounded-full size-9 grid place-items-center border hover:bg-muted"
            onClick={() => api?.scrollPrev()}
          >
            <IconChevronLeft className="size-5" />
          </button>
          <button
            className="rounded-full size-9 grid place-items-center border hover:bg-muted"
            onClick={() => api?.scrollNext()}
          >
            <IconChevronRight className="size-5" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden" ref={ref}>
        <div className="flex -ml-3">
          {items.map((it) => (
            <article
              key={it.id}
              className="min-w-[240px] md:min-w-[280px] pl-3"
            >
              <div
                className={cn("rounded-lg border overflow-hidden", UI.glass)}
              >
                <div className="relative h-[150px]">
                  <Image
                    src={
                      it.img ||
                      "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?q=80&w=1200&auto=format&fit=crop"
                    }
                    alt={it.name}
                    fill
                    sizes="280px"
                    className="object-cover"
                  />
                </div>
                <div className="p-3">
                  <h4 className="line-clamp-2 font-medium">{it.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {it.city} • {it.tag}
                  </p>
                  <button
                    className={cn(
                      "mt-2 w-full inline-flex items-center justify-center gap-2 text-sm rounded-md border py-1.5",
                      "hover:bg-muted",
                      UI.brand.primaryHover
                    )}
                    onClick={() => onPick(it)}
                  >
                    <IconPlus className="size-4" /> Añadir
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
