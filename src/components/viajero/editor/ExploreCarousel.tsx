"use client";
import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import {
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

type Item = {
  id: string;
  name: string;
  city: string;
  tag: string;
  image?: string;
};

export function ExploreCarousel({
  title,
  items,
  onPick,
}: {
  title: string;
  items: Item[];
  onPick: (p: Item) => void;
}) {
  const [emblaRef, embla] = useEmblaCarousel({ align: "start", loop: false });
  const [canPrev, setCanPrev] = React.useState(false);
  const [canNext, setCanNext] = React.useState(true);

  React.useEffect(() => {
    if (!embla) return;
    const onSel = () => {
      setCanPrev(embla.canScrollPrev());
      setCanNext(embla.canScrollNext());
    };
    embla.on("select", onSel);
    onSel();
  }, [embla]);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold"> {title} </h3>
        <div className="flex gap-2">
          <button
            className={cn(
              "rounded-full size-9 grid place-items-center border",
              canPrev ? "hover:bg-muted" : "opacity-40 cursor-not-allowed"
            )}
            onClick={() => embla?.scrollPrev()}
            disabled={!canPrev}
          >
            <IconChevronLeft className="size-5" />
          </button>
          <button
            className={cn(
              "rounded-full size-9 grid place-items-center border",
              canNext ? "hover:bg-muted" : "opacity-40 cursor-not-allowed"
            )}
            onClick={() => embla?.scrollNext()}
            disabled={!canNext}
          >
            <IconChevronRight className="size-5" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-3">
          {items.map((it) => (
            <article
              key={it.id}
              className="min-w-[240px] md:min-w-[280px] pl-3"
            >
              <div className="rounded-lg border overflow-hidden bg-card shadow-sm">
                <div className="relative h-[150px]">
                  <Image
                    src={
                      it.image ||
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
                    className="mt-2 w-full inline-flex items-center justify-center gap-2 text-sm rounded-md border hover:bg-muted py-1.5"
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
