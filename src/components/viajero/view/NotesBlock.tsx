"use client";
import * as React from "react";
import { Card } from "@/components/ui/card";
import type {
  ViewNote,
  Money,
  ViewReservation,
  ViewWeather,
} from "@/lib/constants/view-types";

export function NotesBlock({
  title = "Notas",
  notes,
}: {
  title?: string;
  notes?: ViewNote[];
}) {
  if (!notes?.length) return null;
  return (
    <Card className="p-3">
      <h4 className="font-semibold mb-2">{title}</h4>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        {notes.map((n) => (
          <li key={n.id}>
            <strong>{n.title ? `${n.title}: ` : ""}</strong>
            {n.content}
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function BudgetBlock({
  title = "Costos estimados",
  items,
}: {
  title?: string;
  items?: Money[];
}) {
  if (!items?.length) return null;
  const total = items.reduce((s, x) => s + (x.amount || 0), 0);
  const currency = items[0]?.currency ?? "MXN";
  return (
    <Card className="p-3">
      <h4 className="font-semibold mb-2">{title}</h4>
      <div className="space-y-1 text-sm">
        {items.map((m, i) => (
          <div key={i} className="flex justify-between">
            <span>{m.label}</span>
            <span>
              {m.amount.toLocaleString()} {m.currency ?? currency}
            </span>
          </div>
        ))}
        <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
          <span>Total</span>
          <span>
            {total.toLocaleString()} {currency}
          </span>
        </div>
      </div>
    </Card>
  );
}

export function ReservationsBlock({ items }: { items?: ViewReservation[] }) {
  if (!items?.length) return null;
  return (
    <Card className="p-3">
      <h4 className="font-semibold mb-2">Reservas</h4>
      <ul className="space-y-2 text-sm">
        {items.map((r) => (
          <li key={r.id} className="rounded border p-2">
            <div className="font-medium">{r.title}</div>
            <div className="text-muted-foreground">
              {new Date(r.whenISO).toLocaleString()} • {r.where ?? r.kind}
              {r.code ? ` • Código: ${r.code}` : ""}
            </div>
            {r.links?.length ? (
              <div className="mt-1 flex flex-wrap gap-2">
                {r.links.map((l) => (
                  <a
                    key={l.href}
                    className="underline underline-offset-2"
                    target="_blank"
                    href={l.href}
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function TipsBlock({
  title = "Saber antes de ir",
  items,
}: {
  title?: string;
  items?: string[];
}) {
  if (!items?.length) return null;
  return (
    <Card className="p-3">
      <h4 className="font-semibold mb-2">{title}</h4>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        {items.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </Card>
  );
}

export function WeatherInline({ w }: { w?: ViewWeather }) {
  if (!w) return null;
  return (
    <div className="text-sm rounded-md border px-2 py-1 inline-flex items-center gap-2">
      <span>{w.icon}</span>
      <span>
        {" "}
        {w.tmin}
        {w.unit} / {w.tmax}
        {w.unit}{" "}
      </span>
      {typeof w.rainProb === "number" && (
        <span className="text-muted-foreground">• Lluvia {w.rainProb}%</span>
      )}
    </div>
  );
}
