import React from "react";
import ItineraryReadView from "./components/ItineraryReadView";

interface PageProps {
  params: {
    itineraryId: string;
  };
}

export const metadata = {
  title: "Ver Itinerario | Harol Lovers",
  description: "Detalles y mapa de tu itinerario de viaje.",
};

export default function VerItinerarioPage({ params }: PageProps) {
  return (
    <div className="w-full h-full">
      <ItineraryReadView id={params.itineraryId} />
    </div>
  );
}
