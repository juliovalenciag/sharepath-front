"use client";

import * as React from "react";
import { Conversation, Message } from "./_types";
import { currentUser } from "./_mock";
import { cn } from "@/lib/utils";

function formatDay(dateISO: string) {
  const d = new Date(dateISO);
  return d.toLocaleDateString("es-MX", { weekday: "long", month: "long", day: "numeric" });
}

function sameDay(a: string, b: string) {
  const da = new Date(a), db = new Date(b);
  return da.toDateString() === db.toDateString();
}

export function ChatThread({
  conversation,
  onSend,
  onToggleDetails,
}: {
  conversation: Conversation;
  onSend: (text: string) => void;
  onToggleDetails: () => void;
}) {
  const [text, setText] = React.useState("");
  const [typing, setTyping] = React.useState(false);

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (text.trim()) {
        onSend(text.trim());
        setText("");
      }
    }
  }

  React.useEffect(() => {
    if (!text) return;
    setTyping(true);
    const t = setTimeout(() => setTyping(false), 1200);
    return () => clearTimeout(t);
  }, [text]);

  const msgs = conversation.messages;

  return (
    <div className="h-full grid grid-rows-[auto_minmax(0,1fr)_auto]">
      <header className="px-4 py-3 border-b flex items-center justify-between bg-card/60">
        <div>
          <h3 className="font-semibold">{conversation.title ?? "Chat"}</h3>
          <p className="text-xs text-muted-foreground">
            {conversation.members.length} miembros ·{" "}
            {conversation.members.filter((m) => m.online).length} en línea
          </p>
        </div>
        <div className="flex items-center gap-2">
          {conversation.tripId && (
            <a href={`/viajero/itinerarios/${conversation.tripId}`} className="text-sm underline">
              Ver itinerario
            </a>
          )}
          <button onClick={onToggleDetails} className="text-sm border rounded px-2 py-1 hover:bg-muted">
            Detalles
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="overflow-y-auto px-3 py-4">
        {msgs.map((m, i) => {
          const prev = msgs[i - 1];
          const showDay = !prev || !sameDay(prev.createdAt, m.createdAt);
          const mine = m.authorId === currentUser.id;

          return (
            <React.Fragment key={m.id}>
              {showDay && (
                <div className="my-4 text-center">
                  <span className="text-xs px-3 py-1 rounded-full border bg-card/60">
                    {formatDay(m.createdAt)}
                  </span>
                </div>
              )}
              <div className={cn("mb-2 flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3 py-2 border",
                    mine
                      ? "bg-[var(--palette-blue)] text-[var(--primary-foreground)] rounded-tr-sm"
                      : "bg-card/70 rounded-tl-sm"
                  )}
                >
                  {!!m.text && <p className="whitespace-pre-wrap">{m.text}</p>}
                  {!!m.images?.length && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {m.images.map((src) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={src} src={src} alt="" className="rounded-lg border object-cover" />
                      ))}
                    </div>
                  )}
                  <div className={cn("mt-1 text-[10px] opacity-75", mine ? "text-white/80" : "text-muted-foreground")}>
                    {new Date(m.createdAt).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                    {mine && m.status && <> · {m.status === "seen" ? "visto" : m.status}</>}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}

        {typing && (
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="size-2 rounded-full bg-[var(--palette-blue)] animate-pulse" />
            Alguien está escribiendo…
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t p-3 bg-card/60">
        <div className="flex items-end gap-2">
          <button className="h-10 px-3 rounded border hover:bg-muted">📎</button>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            placeholder="Escribe un mensaje"
            className="flex-1 max-h-40 rounded-[var(--radius)] border bg-background px-3 py-2 resize-y outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
          <button
            disabled={!text.trim()}
            onClick={() => {
              if (!text.trim()) return;
              onSend(text.trim());
              setText("");
            }}
            className={cn(
              "h-10 px-4 rounded-[var(--radius)]",
              text.trim()
                ? "bg-[var(--palette-blue)] text-[var(--primary-foreground)] hover:opacity-90"
                : "border text-muted-foreground cursor-not-allowed"
            )}
          >
            Enviar
          </button>
        </div>
        <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
          <div>Enter para enviar · Shift+Enter para nueva línea</div>
          <div className="flex gap-2">
            <button className="underline">Programar</button>
            <button className="underline">Plantillas</button>
          </div>
        </div>
      </div>
    </div>
  );
}
