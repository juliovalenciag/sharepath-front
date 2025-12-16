"use client";

import * as React from "react";
import { Conversation, Message } from "./_types";
// import { currentUser } from "./_mock";
import { cn } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";

function formatDay(dateISO: string) {
  const d = new Date(dateISO);
  return d.toLocaleDateString("es-MX", { weekday: "long", month: "long", day: "numeric" });
}

function sameDay(a: string, b: string) {
  const da = new Date(a), db = new Date(b);
  return da.toDateString() === db.toDateString();
}

function MessageStatus({ status }: { status?: string | number }){
  if(status === undefined) return null; //Es mensaje recibido, no se muestra nada

  if(status === "read" || status === 2){
    return <span className="text-blue-500 text-[10px]">✓✓</span>
  }

  if(status === "received" || status === 1){
    return <span className="text-gray-500 text-[10px]">✓✓</span>
  }

  return <span className="text-gray-500 text-[10px]">✓</span>
}

export function ChatThread({
  conversation,
  onSend,
  onToggleDetails,
  selfUserId,
}: {
  conversation: Conversation;
  onSend: (text: string) => void;
  onToggleDetails: () => void;
  selfUserId: string;
}) {
  const [text, setText] = React.useState("");
  const [typing, setTyping] = React.useState(false);

  /*Para que los mensajes se muestren hasta abajo*/
  const messagesRef = React.useRef<HTMLDivElement | null>(null);
  /**/

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

  // React.useEffect(() => {
  //   bottomRef.current?.scrollIntoView({ behavior: "smooth"});
  // }, [conversation.messages]);

  const msgs = conversation.messages;

  /* Para que los mensajes se muestren hasta abajo */
  React.useEffect(() => {
    if(messagesRef.current){
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [msgs]);
  /**/

  //Amigos menos yo
  const otherMember = conversation.members.find((m) => m.id !== selfUserId);

  //Si un amigo esta en linea, se muestra En linea y el circulo verde
  const isFriendOnline = otherMember?.online;

  return (
    <div className="h-full grid grid-rows-[auto_minmax(0,1fr)_auto] bg-white overflow-hidden dark:bg-[#0b141a] rounded-3xl border dark:border-gray-700 shadow-xl">
      {/* <header className="px-4 py-3 border-b flex items-center justify-between bg-card/60"> */}
      <header className="px-4 py-3 border-b bg-[#2196F3] dark:bg-[#1565C0] dark:border-gray-700 text-white rounded-t-3xl flex items-center justify-between transition-colors">
        <div className="text-center w-full">
          {/* <h3 className="font-semibold text-md">{conversation.title ?? "Chat"}</h3> */}
          <h3 className="font-semibold text-md text-white">{conversation.title ?? "Chat"}</h3>
          {/* <p className="text-xs text-muted-foreground"> */}
          {/* <p className="text-sm text-white"> */}
            {/* {conversation.members.length} miembros ·{" "} */}
            {/* {conversation.members.filter((m) => m.online).length > 1 ? "En línea" : "Desconectado"} */}
          {/* </p> */}

          {/* <p className="text-xs text-muted-foreground flex items-center gap-2 justify-center"> */}
          <p className="text-sm font-semibold text-black dark:text-white flex items-center gap-2 justify-center">
            {isFriendOnline ? (
                <>
                    <span className="size-2 rounded-full bg-green-500"></span> {/* Circulo Verde */}
                    En línea
                </>
            ) : (
                "Desconectado"
            )}
          </p>

        </div>
        <div className="flex items-center gap-2">
          {conversation.tripId && (
            <a href={`/viajero/itinerarios/${conversation.tripId}`} className="text-sm underline">
              Ver itinerario
            </a>
          )}
          {/* <button onClick={onToggleDetails} className="text-sm border rounded px-2 py-1 hover:bg-muted">
            Detalles
          </button> */}
        </div>
      </header>

      {/* Messages ref messagesRef*/}
      <div ref={messagesRef} className="overflow-y-auto h-110 px-3 py-4"> {/* La altura h-110 se puso considerando ChatsSidebar.tsx */}
        {msgs.map((m, i) => {
          const prev = msgs[i - 1];
          const showDay = !prev || !sameDay(prev.createdAt, m.createdAt);
          const mine = m.authorId === selfUserId;

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
                  // className={cn(
                  //   "max-w-[80%] rounded-2xl px-3 py-2 border",
                  //   mine
                  //     ? "bg-[var(--palette-blue)] text-[var(--primary-foreground)] rounded-tr-sm"
                  //     : "bg-card/70 rounded-tl-sm"
                  // )}
                  
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2 shadow-sm",
                    mine
                      ? "bg-white text-black rounded-tr-sm border border-gray-300 shadow-sm dark:bg-[#4b5563] dark:text-white dark:border-none"
                      : "bg-blue-800 rounded-tl-sm text-white"
                  )}
                >
                  {/* {!!m.text && <p className="whitespace-pre-wrap">{m.text}</p>} */}
                  {/* word-wrap: break-word; es overflow-wrap: break-word; */}
                  {!!m.text && <p className="break-words">{m.text}</p>}

                  {/* Hora y estado */}
                  <div className={cn("flex justify-end items-center gap-1 mt-1", mine ? "text-right" : "")}>
                    <span className="text-[10px] opacity-70 text-gray-500 dark:text-gray-300">
                      {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>

                    {/* Se muestran las palomitas si el mensaje es mio */}
                    {mine && <MessageStatus status={m.status}></MessageStatus>}
                  </div>

                  {/* {!!m.images?.length && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {m.images.map((src) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={src} src={src} alt="" className="rounded-lg border object-cover" />
                      ))}
                    </div>
                  )} */}


                  {/* Hora del mensaje, corregir porque se muestra la misma hora en todos */}
                  {/* <div className={cn("mt-1 text-[10px] opacity-75", mine ? "text-black" : "text-white")}> */}
                    {/* {new Date(m.createdAt).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })} */}
                    {/* {mine && m.status && <> · {m.status === "seen" ? "visto" : m.status}</>} */}
                  {/* </div> */}
                </div>
              </div>
            </React.Fragment>
          );
        })}

        {/* <div ref={bottomRef}></div> */}

        {/* Cuando alguien escribe, corregir porque no se muestra en el otro usuario */}
        {/* {typing && (
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="size-2 rounded-full bg-[var(--palette-blue)] animate-pulse" />
            Alguien está escribiendo…
          </div>
        )} */}
      </div>

      {/* Composer */}
      <div className="border-t p-3 bg-gray-50 dark:bg-[#202c33] dark:border-gray-700">
        <div className="flex items-end gap-2">
          {/* <button className="h-10 px-3 rounded border hover:bg-muted">📎</button> */}
          {/* <button className="h-10 px-3 rounded border hover:bg-muted bg-black/5">📎</button> */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            placeholder="Escribe un mensaje"
            // className="flex-1 max-h-40 rounded-[var(--radius)] border bg-background px-3 py-2 resize-y outline-none focus:ring-2 focus:ring-[var(--ring)]"
            className="flex-1 max-h-40 rounded-xl border border-gray-300 bg-white px-3 py-2 resize-none outline-none focus:ring-2 focus:ring-[#2196F3] dark:bg-[#2a3942] dark:border-none dark:text-white dark:placeholder-gray-400"
          />
          <button
            disabled={!text.trim()}
            onClick={() => {
              if (!text.trim()) return;
              onSend(text.trim());
              setText("");
            }}
            className={cn(
              "h-10 px-4 rounded-[var(--radius)] text-white transition",
              text.trim()
                ? "bg-[#2196F3] text-white hover:opacity-90"
                // : "border text-muted-foreground cursor-not-allowed"
                : "border text-black cursor-not-allowed bg-black/5 dark:bg-[#2a3942] dark:text-gray-400 dark:border-none"
            )}
          >
            Enviar
          </button>
        </div>
        {/* <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground"> */}
        <div className="flex items-center justify-center mt-1 text-xs text-gray-500">
          <div>Enter para enviar · Shift+Enter para nueva línea</div>
          {/* <div className="flex gap-2">
            <button className="underline">Programar</button>
            <button className="underline">Plantillas</button>
          </div> */}
        </div>
      </div>
    </div>
  );
}


//LO DE JULIO
// "use client";

// import * as React from "react";
// import { Conversation, Message } from "./_types";
// import { currentUser } from "./_mock";
// import { cn } from "@/lib/utils";

// function formatDay(dateISO: string) {
//   const d = new Date(dateISO);
//   return d.toLocaleDateString("es-MX", { weekday: "long", month: "long", day: "numeric" });
// }

// function sameDay(a: string, b: string) {
//   const da = new Date(a), db = new Date(b);
//   return da.toDateString() === db.toDateString();
// }

// export function ChatThread({
//   conversation,
//   onSend,
//   onToggleDetails,
// }: {
//   conversation: Conversation;
//   onSend: (text: string) => void;
//   onToggleDetails: () => void;
// }) {
//   const [text, setText] = React.useState("");
//   const [typing, setTyping] = React.useState(false);

//   function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       if (text.trim()) {
//         onSend(text.trim());
//         setText("");
//       }
//     }
//   }

//   React.useEffect(() => {
//     if (!text) return;
//     setTyping(true);
//     const t = setTimeout(() => setTyping(false), 1200);
//     return () => clearTimeout(t);
//   }, [text]);

//   const msgs = conversation.messages;

//   return (
//     <div className="h-full grid grid-rows-[auto_minmax(0,1fr)_auto]">
//       <header className="px-4 py-3 border-b flex items-center justify-between bg-card/60">
//         <div>
//           <h3 className="font-semibold">{conversation.title ?? "Chat"}</h3>
//           <p className="text-xs text-muted-foreground">
//             {conversation.members.length} miembros ·{" "}
//             {conversation.members.filter((m) => m.online).length} en línea
//           </p>
//         </div>
//         <div className="flex items-center gap-2">
//           {conversation.tripId && (
//             <a href={`/viajero/itinerarios/${conversation.tripId}`} className="text-sm underline">
//               Ver itinerario
//             </a>
//           )}
//           <button onClick={onToggleDetails} className="text-sm border rounded px-2 py-1 hover:bg-muted">
//             Detalles
//           </button>
//         </div>
//       </header>

//       {/* Messages */}
//       <div className="overflow-y-auto px-3 py-4">
//         {msgs.map((m, i) => {
//           const prev = msgs[i - 1];
//           const showDay = !prev || !sameDay(prev.createdAt, m.createdAt);
//           const mine = m.authorId === currentUser.id;

//           return (
//             <React.Fragment key={m.id}>
//               {showDay && (
//                 <div className="my-4 text-center">
//                   <span className="text-xs px-3 py-1 rounded-full border bg-card/60">
//                     {formatDay(m.createdAt)}
//                   </span>
//                 </div>
//               )}
//               <div className={cn("mb-2 flex", mine ? "justify-end" : "justify-start")}>
//                 <div
//                   className={cn(
//                     "max-w-[80%] rounded-2xl px-3 py-2 border",
//                     mine
//                       ? "bg-[var(--palette-blue)] text-[var(--primary-foreground)] rounded-tr-sm"
//                       : "bg-card/70 rounded-tl-sm"
//                   )}
//                 >
//                   {!!m.text && <p className="whitespace-pre-wrap">{m.text}</p>}
//                   {!!m.images?.length && (
//                     <div className="mt-2 grid grid-cols-2 gap-2">
//                       {m.images.map((src) => (
//                         // eslint-disable-next-line @next/next/no-img-element
//                         <img key={src} src={src} alt="" className="rounded-lg border object-cover" />
//                       ))}
//                     </div>
//                   )}
//                   <div className={cn("mt-1 text-[10px] opacity-75", mine ? "text-white/80" : "text-muted-foreground")}>
//                     {new Date(m.createdAt).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
//                     {mine && m.status && <> · {m.status === "seen" ? "visto" : m.status}</>}
//                   </div>
//                 </div>
//               </div>
//             </React.Fragment>
//           );
//         })}

//         {typing && (
//           <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
//             <span className="size-2 rounded-full bg-[var(--palette-blue)] animate-pulse" />
//             Alguien está escribiendo…
//           </div>
//         )}
//       </div>

//       {/* Composer */}
//       <div className="border-t p-3 bg-card/60">
//         <div className="flex items-end gap-2">
//           <button className="h-10 px-3 rounded border hover:bg-muted">📎</button>
//           <textarea
//             value={text}
//             onChange={(e) => setText(e.target.value)}
//             onKeyDown={handleKey}
//             rows={1}
//             placeholder="Escribe un mensaje"
//             className="flex-1 max-h-40 rounded-[var(--radius)] border bg-background px-3 py-2 resize-y outline-none focus:ring-2 focus:ring-[var(--ring)]"
//           />
//           <button
//             disabled={!text.trim()}
//             onClick={() => {
//               if (!text.trim()) return;
//               onSend(text.trim());
//               setText("");
//             }}
//             className={cn(
//               "h-10 px-4 rounded-[var(--radius)]",
//               text.trim()
//                 ? "bg-[var(--palette-blue)] text-[var(--primary-foreground)] hover:opacity-90"
//                 : "border text-muted-foreground cursor-not-allowed"
//             )}
//           >
//             Enviar
//           </button>
//         </div>
//         <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
//           <div>Enter para enviar · Shift+Enter para nueva línea</div>
//           <div className="flex gap-2">
//             <button className="underline">Programar</button>
//             <button className="underline">Plantillas</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
