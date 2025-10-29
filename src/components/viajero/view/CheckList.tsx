"use client";
import * as React from "react";
import { Card } from "@/components/ui/card";
import type { ViewTask } from "@/lib/constants/view-types";

export function Checklist({ title="Checklist", items }: { title?: string; items: ViewTask[] }) {
  if (!items?.length) return null;
  return (
    <Card className="p-3">
      <h4 className="font-semibold mb-2">{title}</h4>
      <ul className="space-y-1">
        {items.map(t => (
          <li key={t.id} className="flex items-center gap-2">
            <span className={[
              "inline-block size-4 rounded border",
              t.done ? "bg-[var(--palette-blue)]" : "bg-muted/40"
            ].join(" ")} />
            <span className={t.done ? "line-through text-muted-foreground" : ""}>{t.text}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
