
"use client";
export default function TripBudget() {
  const rows = [
    { k: "Entradas museos", v: 650 },
    { k: "Comidas", v: 1200 },
    { k: "Transporte", v: 200 },
  ];
  const total = rows.reduce((s, r) => s + r.v, 0);
  return (
    <div className="p-4 rounded-[var(--radius-lg)] ring-1 ring-border bg-card/80">
      <h3 className="font-semibold mb-3">Presupuesto global</h3>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.k} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{r.k}</span>
            <span className="font-medium">{r.v.toLocaleString()} MXN</span>
          </div>
        ))}
        <div className="pt-2 mt-2 border-t flex items-center justify-between">
          <span className="font-semibold">Total</span>
          <span className="font-semibold">{total.toLocaleString()} MXN</span>
        </div>
      </div>
    </div>
  );
}
