"use client";
import ItineraryReadPublic from "@/components/viajero/view/ItineraryReadPublic";
import {useParams} from "next/navigation";

export default function Page() {
  const Params = useParams();
  const { itineraryId} = Params;
  return <ItineraryReadPublic id={itineraryId}/>;
}
