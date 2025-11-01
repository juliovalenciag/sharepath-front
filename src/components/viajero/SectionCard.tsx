"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";

export default function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-4 md:p-5 border-border/60 bg-card/70">
      <div className="mb-3">
        <h3 className="text-lg font-semibold leading-none tracking-tight">
          {title}
        </h3>
        {subtitle ? (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </Card>
  );
}
