"use client";

import * as React from "react";
import { Conversation } from "./_types";

export function ChatDetails({ conversation }: { conversation: Conversation }) {
  return (
    <div className="h-full grid grid-rows-[auto_auto_minmax(0,1fr)]">
      <header className="px-4 py-3 border-b">
        <h3 className="font-semibold">Detalles</h3>
        <p className="text-xs text-muted-foreground">{conversation.title}</p>
      </header>

      <div className="px-4 py-3 border-b">
        <p className="text-sm font-medium mb-2">Miembros</p>
        <ul className="space-y-2">
          {conversation.members.map((m) => (
            <li key={m.id} className="flex items-center gap-3">
              <div className="size-8 rounded-full bg-muted grid place-content-center border">👤</div>
              <div className="text-sm">
                <div className="font-medium">{m.name}</div>
                <div className="text-xs text-muted-foreground">{m.online ? "En línea" : "Desconectado"}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 overflow-y-auto">
        <div className="rounded-xl border p-3 bg-card/60">
          <p className="text-sm font-medium mb-1">Vínculos</p>
          {conversation.tripId ? (
            <a
              href={`/viajero/itinerarios/${conversation.tripId}`}
              className="text-sm underline"
            >
              Abrir itinerario
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">Sin itinerario enlazado</p>
          )}
        </div>

        <div className="mt-3 rounded-xl border p-3 bg-card/60 space-y-2">
          <button className="w-full h-10 rounded border hover:bg-muted">Silenciar</button>
          <button className="w-full h-10 rounded border hover:bg-muted">Salir del grupo</button>
          <button className="w-full h-10 rounded border hover:bg-muted">Reportar</button>
        </div>
      </div>
    </div>
  );
}
