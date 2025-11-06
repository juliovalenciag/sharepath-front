"use client";

import * as React from "react";
import { Conversation } from "./_types";
import { cn } from "@/lib/utils";

export function ChatsSidebar({
  conversations,
  activeId,
  onSelect,
}: {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (id: string) => void;
}) {
  const [q, setQ] = React.useState("");

  const filtered = conversations.filter((c) =>
    (c.title ?? "").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="h-full grid grid-rows-[auto_auto_minmax(0,1fr)]">
      <header className="px-4 py-3 border-b">
        <h2 className="text-lg font-semibold">Chats</h2>
      </header>

      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <input
            className="w-full h-10 rounded-[var(--radius)] border bg-background pl-9 pr-3 outline-none focus:ring-2 focus:ring-[var(--ring)]"
            placeholder="Buscar conversación"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2">🔎</span>
        </div>
        <div className="mt-2 flex gap-2">
          <button className="text-xs px-2 py-1 rounded border">Todos</button>
          <button className="text-xs px-2 py-1 rounded border">No leídos</button>
          <button className="text-xs px-2 py-1 rounded border">Fijados</button>
        </div>
      </div>

      <ul className="overflow-y-auto">
        {filtered.map((c) => (
          <li key={c.id}>
            <button
              onClick={() => onSelect(c.id)}
              className={cn(
                "w-full text-left px-3 py-3 grid grid-cols-[40px_1fr_auto] gap-3 hover:bg-muted",
                activeId === c.id && "bg-muted"
              )}
            >
              {/* Avatar stack */}
              <div className="relative">
                <div className="size-10 rounded-full bg-muted grid place-content-center border">👥</div>
                {/* indicador de online si alguno lo está */}
                <span className="absolute -bottom-0 -right-0 size-3 rounded-full ring-2 ring-card"
                  style={{ background: c.members.some(m => m.online) ? "#16a34a" : "#94a3b8" }} />
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium">{c.title ?? "Grupo"}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {c.lastMessage?.text ?? "Sin mensajes"}
                </p>
              </div>
              <div className="text-right">
                {!!c.unread && (
                  <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded-full text-xs font-semibold bg-[var(--palette-blue)] text-[var(--primary-foreground)]">
                    {c.unread}
                  </span>
                )}
                {c.pinned && <div className="text-xs mt-1">📌</div>}
              </div>
            </button>
            <div className="border-b" />
          </li>
        ))}
      </ul>
    </div>
  );
}
