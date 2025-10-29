// components/viajero/read/parts/QuickNotes.tsx
"use client";
export default function QuickNotes() {
  const notes = [
    {
      title: "Notas generales",
      bullets: [
        "Efectivo para entradas pequeñas; muchas taquillas no aceptan tarjeta.",
        "Tarjeta de Movilidad Integrada para metro y metrobús.",
      ],
    },
    {
      title: "Saber antes de ir",
      bullets: [
        "Compra boletos con anticipación para Chapultepec.",
        "Lunes muchos museos cierran.",
      ],
    },
    {
      title: "Reservas",
      bullets: [
        "Hotel Histórico Centro – 31/10 15:00 (HH:HC-8KP2)",
        "Tour Centro + Templo Mayor – 1/11 10:00 (TOUR-213A)",
      ],
    },
    {
      title: "Seguridad",
      bullets: [
        "Evita calles poco iluminadas tarde.",
        "Usa apps oficiales de taxi.",
      ],
    },
  ];
  return (
    <div className="xl:col-span-3 grid md:grid-cols-2 xl:grid-cols-4 gap-4">
      {notes.map((n) => (
        <div
          key={n.title}
          className="p-4 rounded-[var(--radius-lg)] ring-1 ring-border bg-card/80"
        >
          <h4 className="font-semibold mb-2">{n.title}</h4>
          <ul className="space-y-1 text-sm">
            {n.bullets.map((b, i) => (
              <li key={i} className="pl-4 list-disc">
                {b}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
