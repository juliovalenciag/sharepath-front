// src/app/(viajero)/viajero/publicaciones/[publicacionId]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { PublicacionReadView } from "@/components/viajero/view/PublicacionReadView";

export default function PublicacionDetailPage() {
  const params = useParams<{ publicacionId: string }>();
  const publicacionId = Number(params.publicacionId);

  return <PublicacionReadView publicacionId={publicacionId} />;
}
