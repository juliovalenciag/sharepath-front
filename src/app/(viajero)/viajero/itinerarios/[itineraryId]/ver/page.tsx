"use client";
import ItineraryReadView from "@/components/viajero/view/ItineraryReadView";
import {useParams} from "next/navigation";

export default function Page() {
  const Params = useParams();
  const { itineraryId} = Params;
  return <ItineraryReadView id={itineraryId}/>;
}
