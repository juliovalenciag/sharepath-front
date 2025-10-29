"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Conversation, Message } from "./_types";
import { ChatsSidebar } from "./ChatsSidebar";
import { ChatThread } from "./ChatThread";
import { ChatDetails } from "./ChatDetails";
import { currentUser } from "./_mock";

export function ChatLayout({
  conversations,
  onUpdateConversation,
}: {
  conversations: Conversation[];
  onUpdateConversation: (id: string, updater: (c: Conversation) => Conversation) => void;
}) {
  const [activeId, setActiveId] = React.useState(conversations[0]?.id);
  const active = conversations.find((c) => c.id === activeId);

  function sendMessage(text: string) {
    if (!active) return;
    const msg: Message = {
      id: crypto.randomUUID(),
      authorId: currentUser.id,
      text,
      createdAt: new Date().toISOString(),
      status: "sent",
    };
    onUpdateConversation(active.id, (c) => ({
      ...c,
      messages: [...c.messages, msg],
      lastMessage: msg,
      unread: 0,
    }));
  }

  const [showDetails, setShowDetails] = React.useState(true);

  return (
    <div
      className={cn(
        "grid h-[calc(100dvh-64px)]",
        "grid-cols-1 md:grid-cols-[minmax(280px,360px)_minmax(0,1fr)_minmax(280px,360px)]"
      )}
    >
      {/* Sidebar conversaciones */}
      <aside className="border-r bg-card/50 overflow-hidden">
        <ChatsSidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={setActiveId}
        />
      </aside>

      {/* Thread */}
      <main className="min-w-0">
        {active ? (
          <ChatThread
            conversation={active}
            onSend={sendMessage}
            onToggleDetails={() => setShowDetails((v) => !v)}
          />
        ) : (
          <div className="h-full grid place-content-center text-center text-muted-foreground">
            Selecciona una conversación
          </div>
        )}
      </main>

      {/* Detalles */}
      <aside className={cn("border-l bg-card/40", showDetails ? "block" : "hidden md:block")}>
        {active && <ChatDetails conversation={active} />}
      </aside>
    </div>
  );
}
