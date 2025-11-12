"use client";
import { Card } from "@/components/ui/card";

export function TripHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="p-3">
      <Card className="rounded-2xl overflow-hidden border">
        <div className="bg-muted h-[140px] w-full object-cover">
          <img
            src="https://images.unsplash.com/photo-1645921441624-3d8f9098a2a5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2670"
            alt={title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="px-4 py-3">
          <h2 className="text-xl font-semibold">{title}</h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </Card>
    </div>
  );
}
