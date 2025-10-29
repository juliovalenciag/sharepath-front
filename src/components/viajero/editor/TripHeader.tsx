"use client";
import Image from "next/image";
import { Card } from "@/components/ui/card";

export function TripHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="relative">
      <div className="relative h-[140px] md:h-[180px] w-full overflow-hidden rounded-xl">
        <Image
          src="https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=1600&auto=format&fit=crop"
          alt="Cover"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-background/20 to-transparent" />
      </div>

      <Card className="-mt-10 ml-3 md:ml-4 max-w-[760px] px-4 py-3 md:px-5 md:py-4 rounded-xl shadow-lg bg-card/95 backdrop-blur">
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </Card>
    </div>
  );
}
