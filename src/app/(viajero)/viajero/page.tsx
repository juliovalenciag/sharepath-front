"use client";

import * as React from "react";
import Link from "next/link";
import { SUGGESTIONS } from "@/lib/constants/mock";

// Utilidades
function Section({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <section className={`max-w-7xl mx-auto px-4 md:px-6 ${className}`}>
      {children}
    </section>
  );
}
const btn = {
  primary:
    "inline-flex items-center justify-center h-11 px-5 rounded-[var(--radius)] bg-[var(--palette-blue)] text-[var(--primary-foreground)] hover:opacity-90 transition",
  ghost:
    "inline-flex items-center justify-center h-11 px-5 rounded-[var(--radius)] border hover:bg-muted transition",
};

// Carrusel genérico (sin libs)
function SnapCarousel({
  children,
  title,
  onPrev,
  onNext,
  className = "",
}: React.PropsWithChildren<{
  title?: string;
  onPrev?: () => void;
  onNext?: () => void;
  className?: string;
}>) {
  const ref = React.useRef<HTMLDivElement>(null);
  function prev() {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: -el.clientWidth * 0.9, behavior: "smooth" });
    onPrev?.();
  }
  function next() {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * 0.9, behavior: "smooth" });
    onNext?.();
  }
  return (
    <div className={className}>
      {title && (
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg md:text-xl font-semibold">{title}</h3>
          <div className="flex gap-2">
            <button
              onClick={prev}
              className="size-9 grid place-items-center rounded-full border hover:bg-muted"
              aria-label="Anterior"
            >
              ‹
            </button>
            <button
              onClick={next}
              className="size-9 grid place-items-center rounded-full border hover:bg-muted"
              aria-label="Siguiente"
            >
              ›
            </button>
          </div>
        </div>
      )}
      <div
        ref={ref}
        className="overflow-x-auto snap-x snap-mandatory scroll-pl-4 mask-fade-x"
      >
        <div className="flex gap-4 pr-4">{children}</div>
      </div>
    </div>
  );
}

// Tarjeta de sugerencia (desde mock)
function PlaceCard({
  name,
  city,
  tag,
  img,
}: {
  name: string;
  city: string;
  tag: string;
  img: string;
}) {
  return (
    <article className="snap-start min-w-[240px] md:min-w-[280px] rounded-xl border bg-card overflow-hidden hover:shadow-sm transition">
      <div className="relative h-[150px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt={name} className="object-cover w-full h-full" />
      </div>
      <div className="p-3">
        <h4 className="font-medium line-clamp-2">{name}</h4>
        <p className="text-xs text-muted-foreground">
          {city} • {tag}
        </p>
        <Link
          href="/viajero/itinerarios/crear"
          className="mt-2 w-full block text-center border rounded-md py-2 hover:bg-muted text-sm"
        >
          Añadir al itinerario
        </Link>
      </div>
    </article>
  );
}

export default function ViajeroLanding() {
  const destacados = SUGGESTIONS.slice(0, 6);
  const naturaleza = SUGGESTIONS.filter((x) => x.tag === "Naturaleza");
  const cultura = SUGGESTIONS.filter((x) => x.tag === "Cultura");

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-background text-foreground">
      {/* HERO */}
      <div className="relative">
        <div className="absolute inset-0 opacity-[.12] bg-[url('https://images.pexels.com/photos/14071000/pexels-photo-14071000.jpeg')] bg-cover bg-center" />
        <Section className="relative pt-10 md:pt-16 pb-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 text-xs md:text-sm px-2.5 py-1 rounded-full border bg-card/70 backdrop-blur">
              ✈️ Social + Planner • Comparte, sigue y planifica en equipo
            </span>
            <h1 className="mt-3 text-3xl md:text-5xl font-extrabold tracking-tight">
              Tu viaje,{" "}
              <span className="text-[var(--palette-blue)]">perfectamente</span>{" "}
              planificado.
            </h1>
            <p className="mt-3 text-muted-foreground max-w-prose">
              Crea itinerarios bellos y prácticos, descubre lugares confiables y
              comparte tu plan con amigos. Todo sincronizado con mapa, tiempos y
              recomendaciones.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link href="/viajero/itinerarios/nuevo" className={btn.primary}>
                Crear mi itinerario
              </Link>
              <a href="#feed" className={btn.ghost}>
                Ver comunidad
              </a>
            </div>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="rounded-xl border p-3 bg-card/60">
                <b>Itinerarios</b>
                <div className="text-muted-foreground">por día, con mapa</div>
              </div>
              <div className="rounded-xl border p-3 bg-card/60">
                <b>Colaboración</b>
                <div className="text-muted-foreground">invita a tus amigos</div>
              </div>
              <div className="rounded-xl border p-3 bg-card/60">
                <b>Explorar</b>
                <div className="text-muted-foreground">lugares verificados</div>
              </div>
              <div className="rounded-xl border p-3 bg-card/60">
                <b>Red social</b>
                <div className="text-muted-foreground">sigue y comenta</div>
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* CARRUSEL DESTACADOS */}
      <Section className="py-8">
        <SnapCarousel title="Destacados para inspirarte">
          {destacados.map((p) => (
            <PlaceCard key={p.id} {...p} />
          ))}
        </SnapCarousel>
      </Section>

      {/* BLOQUE DOBLE CON SLIDERS TEMÁTICOS */}
      <Section className="py-2 md:py-4">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border p-4 bg-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Naturaleza que impresiona</h3>
              <Link
                href="/viajero/itinerarios/nuevo"
                className="text-sm underline"
              >
                Armar ruta
              </Link>
            </div>
            <SnapCarousel>
              {naturaleza.map((p) => (
                <PlaceCard key={p.id} {...p} />
              ))}
            </SnapCarousel>
          </div>
          <div className="rounded-2xl border p-4 bg-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Joyas culturales</h3>
              <Link
                href="/viajero/itinerarios/nuevo"
                className="text-sm underline"
              >
                Armar ruta
              </Link>
            </div>
            <SnapCarousel>
              {cultura.map((p) => (
                <PlaceCard key={p.id} {...p} />
              ))}
            </SnapCarousel>
          </div>
        </div>
      </Section>

      {/* LLAMADO INTERMEDIO */}
      <Section className="py-10">
        <div className="relative overflow-hidden rounded-2xl border">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "color-mix(in oklch, var(--palette-blue) 18%, transparent)",
            }}
          />
          <div className="relative p-6 md:p-10 grid md:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">
                Planifica con tu equipo
              </h2>
              <p className="text-muted-foreground max-w-prose mt-2">
                Crea listas compartidas, comenta, vota y asigna lugares por día.
                Todo se ve en el mapa y se puede optimizar la ruta.
              </p>
            </div>
            <Link href="/viajero/itinerarios/nuevo" className={btn.primary}>
              Empezar ahora
            </Link>
          </div>
        </div>
      </Section>

      {/* BLOQUE SOCIAL (feed preview) */}
      <Section id="feed" className="py-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg md:text-xl font-semibold">De la comunidad</h3>
          <Link href="/viajero/itinerarios/nuevo" className="text-sm underline">
            Publicar mi viaje
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUGGESTIONS.slice(0, 3).map((p, i) => (
            <article
              key={`feed-${p.id}`}
              className="rounded-xl border overflow-hidden bg-card hover:shadow-sm transition"
            >
              <div className="relative h-[160px]">
                <img
                  src={p.img}
                  alt=""
                  className="object-cover w-full h-full"
                />
                <div className="absolute left-2 top-2 text-xs px-2 py-0.5 rounded-full bg-[var(--palette-blue)] text-[var(--primary-foreground)]">
                  Itinerario
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <span className="size-6 rounded-full bg-muted grid place-content-center">
                    🧑‍💻
                  </span>
                  <span>@kelo</span>
                  <span>·</span>
                  <span>{["Ayer", "Hoy", "Hace 2 d"][i % 3]}</span>
                </div>
                <h4 className="font-semibold line-clamp-1">{p.name}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {p.city} • {p.tag} — día {i + 1} del viaje
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    ❤️ 248 · 💬 32
                  </div>
                  <Link
                    href="/viajero/itinerarios/nuevo"
                    className="text-sm underline"
                  >
                    Duplicar
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* FOOT CTA */}
      <Section className="py-12">
        <div className="rounded-2xl border p-6 md:p-10 bg-card text-center">
          <h2 className="text-2xl md:text-3xl font-bold">
            ¿Listo para tu próximo viaje?
          </h2>
          <p className="text-muted-foreground mt-2">
            Empieza tu itinerario en segundos. Es gratis.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <Link href="/viajero/itinerarios/nuevo" className={btn.primary}>
              Crear itinerario
            </Link>
            <Link href="/viajero/itinerarios/nuevo" className={btn.ghost}>
              Explorar ideas
            </Link>
          </div>
        </div>
      </Section>

      <div className="h-8" />
    </div>
  );
}
