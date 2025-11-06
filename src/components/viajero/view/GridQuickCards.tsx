// components/viajero/read/GridQuickCards.tsx
"use client";

import { clsx } from "clsx";

export default function GridQuickCards() {
  return (
    <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      <TripStats />
      <WeatherCard />

      <QuickActions />
      <SocialPulse />
    </section>
  );
}

/* ---------- tarjetas ---------- */

function TripStats() {
  const stats = [
    { label: "Días", value: "4", hint: "31 oct – 4 nov" },
    { label: "Actividades", value: "12", hint: "Museos, parques, comida" },
  ];
  return (
    <Card
      title="Resumen del viaje"
      className="bg-gradient-to-br from-[oklch(0.97_0.02_240)] to-[oklch(0.94_0.04_230)] dark:from-[oklch(0.26_0.02_240)] dark:to-[oklch(0.22_0.04_230)]"
    >
      <ul className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <li
            key={s.label}
            className="rounded-xl ring-1 ring-border bg-card/70 p-3 text-center"
          >
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-xl font-semibold tracking-tight">{s.value}</p>
            <p className="text-[11px] text-muted-foreground">{s.hint}</p>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        {["Cultura", "Parques", "Gastronomía", "Historia"].map((t) => (
          <span
            key={t}
            className="px-2.5 py-1 text-xs rounded-full ring-1 ring-border bg-[oklch(0.98_0_0)] dark:bg-[oklch(0.28_0_0)]"
          >
            {t}
          </span>
        ))}
      </div>
    </Card>
  );
}

function WhereStay() {
  return (
    <Card title="Hospedaje">
      <div className="flex items-center gap-3">
        <img
          alt="Hotel"
          src="https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg"
          className="h-16 w-24 object-cover rounded-lg ring-1 ring-border"
        />
        <div className="min-w-0">
          <p className="font-medium truncate">Hotel Histórico Centro</p>
          <p className="text-xs text-muted-foreground truncate">
            Check-in 31/10 • 3:00 PM — Conf. HH:HC-8KP2
          </p>
          <div className="mt-2 flex gap-2">
            <Button>Ver reserva</Button>
            <Button variant="ghost">Cómo llegar</Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function WeatherCard() {
  return (
    <Card title="Clima promedio" className="overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-semibold tracking-tight">23°</p>
          <p className="text-xs text-muted-foreground">Rango 18° – 27°</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span>☀️</span>
          <span>Prob. lluvia 20%</span>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-5 text-center gap-2">
        {["jue", "vie", "sáb", "dom", "lun"].map((d, i) => (
          <div key={d} className="rounded-lg ring-1 ring-border p-2">
            <p className="text-[11px] text-muted-foreground">{d}</p>
            <p className="text-sm">{["⛅", "☀️", "☀️", "⛅", "🌦️"][i]}</p>
            <p className="text-[11px] text-muted-foreground">26°</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function QuickActions() {
  return (
    <Card title="Acciones rápidas">
      <div className="grid grid-cols-2 gap-2">
        <Button className="justify-center">Editar itinerario</Button>
        <Button className="justify-center" variant="secondary">
          Duplicar
        </Button>
        <Button className="justify-center" variant="outline">
          Exportar PDF
        </Button>
        <Button className="justify-center" variant="ghost">
          Imprimir
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Consejo: puedes compartir un enlace público desde “Exportar”.
      </p>
    </Card>
  );
}

function SocialPulse() {
  const pills = [
    { k: "Vistas", v: "1.9k" },
    { k: "Guardados", v: "128" },
    { k: "Comentarios", v: "23" },
  ];
  return (
    <Card title="Pulso social">
      <div className="flex flex-wrap gap-2">
        {pills.map((p) => (
          <div
            key={p.k}
            className="px-3 py-1.5 rounded-full ring-1 ring-border bg-[oklch(0.97_0_0)] dark:bg-[oklch(0.26_0_0)]"
          >
            <span className="font-medium">{p.v}</span>{" "}
            <span className="text-xs text-muted-foreground">{p.k}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <Button variant="outline">Seguir autor</Button>
        <Button variant="ghost">Abrir comentarios</Button>
      </div>
    </Card>
  );
}

function TransportTips() {
  return (
    <Card title="Transporte & tips">
      <ul className="text-sm space-y-1 list-disc pl-4">
        <li>Tarjeta MI para metro y metrobús.</li>
        <li>Taxi por app con placa verificada.</li>
        <li>Evitar horas pico en Línea 3/1.</li>
      </ul>
      <div className="mt-3 rounded-lg ring-1 ring-border p-2 text-xs bg-[oklch(0.97_0.02_240)]/50 dark:bg-[oklch(0.22_0.02_240)]/50">
        Tiempo total a pie estimado: <b>1.2 km</b> (día 1)
      </div>
    </Card>
  );
}

/* ---------- UI helpers ---------- */

function Card({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={clsx(
        "p-4 rounded-[var(--radius-lg)] ring-1 ring-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60",
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Button({
  children,
  variant = "primary",
  className,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  className?: string;
}) {
  const base =
    "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm ring-1 ring-transparent transition";
  const variants = {
    primary: "bg-[var(--palette-blue)] text-white hover:opacity-90",
    secondary:
      "bg-[oklch(0.96_0_0)] dark:bg-[oklch(0.28_0_0)] ring-border hover:bg-muted/70",
    outline: "bg-transparent ring-border hover:bg-muted/40",
    ghost: "bg-transparent hover:bg-muted/40",
  } as const;
  return (
    <button className={clsx(base, variants[variant], className)}>
      {children}
    </button>
  );
}
