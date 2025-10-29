"use client";
import * as React from "react";
import { Card } from "@/components/ui/card";
import type { ViewDay } from "@/lib/constants/view-types";

const ICON: Record<string,string> = {
  walk:"🚶", car:"🚗", metro:"🚇", bus:"🚌", uber:"🚕", bike:"🚲"
};

export function TransportChips({ day }:{ day: ViewDay }) {
  if (!day.transport?.length) return null;
  return (
    <Card className="p-3">
      <h4 className="font-semibold mb-2">Traslados del día</h4>
      <div className="flex flex-wrap gap-2 text-sm">
        {day.transport.map((h,i)=>(
          <span key={i} className="rounded-full border px-3 py-1">
            {ICON[h.mode] ?? "➡️"} {h.timeMin ? `${h.timeMin} min` : ""} {h.distanceKm ? `· ${h.distanceKm} km` : ""} {h.note ? `· ${h.note}` : ""}
          </span>
        ))}
      </div>
    </Card>
  );
}
