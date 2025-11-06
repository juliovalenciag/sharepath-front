
"use client";
export default function TripChecklist() {
  const items = [
    { id: 1, label: "Comprar seguro de viaje", done: true },
    { id: 2, label: "Descargar mapas offline", done: false },
    { id: 3, label: "Reservar restaurante domingo", done: false },
  ];
  const progress = Math.round(100 * (items.filter(i => i.done).length / items.length));

  return (
    <div className="p-4 rounded-[var(--radius-lg)] ring-1 ring-border bg-card/80">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Checklist del viaje</h3>
        <span className="text-xs text-muted-foreground">{progress}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
        <div className="h-full bg-[var(--palette-blue)]" style={{ width: `${progress}%` }} />
      </div>
      <ul className="space-y-2">
        {items.map(i => (
          <li key={i.id} className="flex items-center gap-2">
            <input type="checkbox" checked={i.done} readOnly className="accent-[var(--palette-blue)] size-4"/>
            <span className={i.done ? "line-through text-muted-foreground" : ""}>{i.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
