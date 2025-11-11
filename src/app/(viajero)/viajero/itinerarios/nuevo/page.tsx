"use client";

import CreateItineraryForm from "@/components/viajero/CreateItineraryForm";

export default function NuevaRutaPage() {
  return (
    <main className="h-full flex items-start md:items-center justify-center">
      <div className="w-full max-w-3xl">
        <CreateItineraryForm />
      </div>
    </main>
  );
}
