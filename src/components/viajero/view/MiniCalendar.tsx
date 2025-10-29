// components/viajero/read/parts/MiniCalendar.tsx
"use client";
export default function MiniCalendar() {
  const days = ["31", "01", "02", "03", "04"];
  const covered = new Set(["01", "02", "03", "04"]); // días con actividades
  return (
    <div className="p-4 rounded-[var(--radius-lg)] ring-1 ring-border bg-card/80">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Calendario</h3>
        <span className="text-xs text-muted-foreground">31 oct – 4 nov</span>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {days.map((d) => (
          <button
            key={d}
            className={`
              aspect-square rounded-xl text-sm font-medium
              ring-1 ring-border
              ${
                covered.has(d)
                  ? "bg-[var(--palette-blue)] text-white"
                  : "bg-muted/40 hover:bg-muted"
              }
            `}
          >
            {d}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Días cubiertos: {covered.size}/4
      </p>
    </div>
  );
}
