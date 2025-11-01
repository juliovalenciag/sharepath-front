// components/viajero/read/parts/DayCard.tsx
"use client";
type Item = {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  img: string;
  tags?: string[];
  km?: string;
  min?: string;
};
export function DayCard({
  dateLabel,
  weather,
  items,
  dayCosts = [],
  transfersText,
}: {
  dateLabel: string;
  weather?: { icon: string; temp: string; note: string };
  items: Item[];
  dayCosts?: { k: string; v: number }[];
  transfersText?: string;
}) {
  const dayTotal = dayCosts.reduce((s, r) => s + r.v, 0);
  return (
    <article className="rounded-[var(--radius-lg)] ring-1 ring-border bg-card/80 overflow-hidden">
      <header className="px-4 md:px-5 py-3 flex items-center justify-between bg-[oklch(0.97_0.02_250)]/60 dark:bg-[oklch(0.20_0.02_250)]/60">
        <h3 className="font-semibold">{dateLabel}</h3>
        {weather && (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <span>{weather.icon}</span>
            <span>{weather.temp}</span>
            <span>• {weather.note}</span>
          </div>
        )}
      </header>

      <div className="p-4 md:p-5 grid lg:grid-cols-[1fr_280px] gap-4">
        {/* Timeline */}
        <ol className="space-y-4">
          {items.length === 0 && (
            <li className="text-sm text-muted-foreground">
              Sin lugares todavía.
            </li>
          )}
          {items.map((it, idx) => (
            <li key={it.id} className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
              <div className="pl-8">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-1 size-6 grid place-content-center rounded-full bg-[var(--palette-blue)] text-white text-xs font-bold">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{it.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {it.subtitle}
                        </p>
                      </div>
                      <img
                        src={it.img}
                        className="w-40 h-24 object-cover rounded-md ring-1 ring-border"
                        alt={it.title}
                      />
                    </div>
                    <p className="text-sm mt-2">{it.desc}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {it.tags?.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 text-xs rounded-full ring-1 ring-border bg-muted/50"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    {it.km && it.min && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        🚶 {it.min} · {it.km} • Direcciones
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>

        {/* Panel lateral del día */}
        <aside className="space-y-3">
          {transfersText && (
            <div className="p-3 rounded-lg ring-1 ring-border bg-[oklch(0.97_0.02_250)]/50 dark:bg-[oklch(0.22_0.02_250)]/40">
              <p className="text-sm">Traslados del día</p>
              <p className="text-xs text-muted-foreground">{transfersText}</p>
            </div>
          )}
          <div className="p-3 rounded-lg ring-1 ring-border">
            <p className="text-sm font-medium mb-2">Costos del día</p>
            <div className="space-y-1 text-sm">
              {dayCosts.map((r) => (
                <div key={r.k} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{r.k}</span>
                  <span className="font-medium">{r.v} MXN</span>
                </div>
              ))}
              {dayCosts.length > 0 && (
                <div className="pt-2 mt-2 border-t flex items-center justify-between font-semibold">
                  <span>Total</span>
                  <span>{dayTotal} MXN</span>
                </div>
              )}
            </div>
          </div>
          <div className="p-3 rounded-lg ring-1 ring-border">
            <p className="text-sm font-medium mb-2">Notas rápidas</p>
            <ul className="list-disc pl-4 text-sm">
              <li>Tomar fotos frente al Palacio al atardecer.</li>
              <li>Reservar café cercano para descansar.</li>
            </ul>
          </div>
        </aside>
      </div>
    </article>
  );
}
