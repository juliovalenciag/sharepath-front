"use client";

import CreateItineraryForm from "@/components/viajero/CreateItineraryForm";

export default function NuevaRutaPage() {
  return (
    <main className="min-h-[calc(100dvh-64px)] flex items-start md:items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl">
        <CreateItineraryForm />
      </div>
    </main>
  );
}
