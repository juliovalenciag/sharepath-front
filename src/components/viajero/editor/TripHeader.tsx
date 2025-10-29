"use client";

import * as React from "react";
import { IconSparkles } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export function TripHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="relative">
      <div className="h-28 md:h-32 w-full overflow-hidden">
        <div className="h-full w-full bg-[url('/images/cdmx-hero.jpg')] bg-cover bg-center opacity-80" />
      </div>

      <div className="px-4 md:px-6 -mt-9 md:-mt-12">
        <div className="rounded-2xl shadow-sm border bg-card p-4 md:p-5 max-w-[840px]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg md:text-xl font-semibold">{title}</h1>
              {subtitle && (
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm",
                "hover:bg-muted"
              )}
            >
              <IconSparkles className="size-4 text-palette-blue" />
              Planifica inteligentemente
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
