"use client";
import {
  IconLayoutGrid,
  IconCompass,
  IconNote,
  IconMapPin,
  IconCalendar,
  IconCash,
} from "@tabler/icons-react";
import React from "react";

const items = [
  { id: "resumen", label: "Resumen", icon: IconLayoutGrid },
  { id: "explorar", label: "Explorar", icon: IconCompass },
  { id: "notas", label: "Notas", icon: IconNote },
  { id: "lugares", label: "Lugares para visitar", icon: IconMapPin },
  { id: "plan", label: "Plan de viaje", icon: IconCalendar },
  { id: "presupuesto", label: "Presupuesto", icon: IconCash },
] as const;

export default function LeftNav() {
  const [active, setActive] = React.useState("resumen");

  // Observa el scroll para activar sección
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          )[0];
        if (visible?.target instanceof HTMLElement) {
          setActive(visible.target.id);
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: [0, 1] }
    );

    items
      .map((i) => document.getElementById(i.id))
      .filter(Boolean)
      .forEach((el) => observer.observe(el!));

    return () => observer.disconnect();
  }, []);

  return (
    <aside className="hidden md:block w-56 shrink-0 border-r bg-background/70">
      <div className="sticky top-0 h-[calc(100dvh-64px)] overflow-y-auto p-3">
        <button className="mb-3 w-full h-9 rounded-md border text-sm font-medium">
          Asistente de IA
        </button>
        <nav className="space-y-1">
          {items.map(({ id, label, icon: Icon }) => (
            <a
              key={id}
              href={`#${id}`}
              className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm ${
                active === id
                  ? "bg-primary text-primary-foreground shadow"
                  : "hover:bg-muted"
              }`}
            >
              <Icon className="size-4" />
              <span className="line-clamp-1">{label}</span>
            </a>
          ))}
        </nav>

        <div className="mt-6">
          <span className="text-xs text-muted-foreground">
            Reservas y adjuntos
          </span>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {["Vuelo", "Hotel", "Auto", "Rest"].map((t) => (
              <div
                key={t}
                className="h-10 rounded-md border text-xs grid place-items-center"
              >
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
