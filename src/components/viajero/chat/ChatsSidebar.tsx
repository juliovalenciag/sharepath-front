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

  //console.log(conversations);

  const filtered = conversations.filter((c) =>
    (c.title ?? "").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="h-full grid grid-rows-[auto_auto_minmax(0,1fr)] bg-white border-1 border-gray-800 rounded-3xl shadow-sm overflow-hidden dark:bg-[#111b21] dark:border-gray-700 transition-colors">
      <header className="px-4 py-3 border-b bg-[#2196F3] dark:bg-[#1565C0] dark:border-gray-700 transition-colors">
        {/* <h2 className="text-lg font-semibold">Chats</h2> */}
        <h2 className="text-xl font-bold text-white">Chats</h2>
      </header>

      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <input
            className="text-sm w-full h-10 rounded-lg border pl-9 pr-3 outline-none focus:ring-2 focus:ring-[#2196F3] border-gray-300 bg-white text-gray-900 placeholder-gray-500 dark:border-gray-600 dark:bg-[#202c33] dark:text-gray-100 dark:placeholder-gray-400 transition-colors"
            placeholder="Buscar un chat"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          
          <svg xmlns="http://www.w3.org/2000/svg"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          >
            <path strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {/* <div className="mt-2 flex gap-2">
          <button className="text-xs px-2 py-1 rounded border">Todos</button>
          <button className="text-xs px-2 py-1 rounded border">No leídos</button>
          <button className="text-xs px-2 py-1 rounded border">Fijados</button>
        </div> */}
      </div>

      <ul className="overflow-y-auto">
        {filtered.map((c) => (
          <li key={c.id}>
            <button
              onClick={() => onSelect(c.id)}
              className={cn(
                "w-full cursor-pointer text-left px-3 py-3 grid items-center grid-cols-[40px_1fr_auto] gap-3 hover:bg-[#e8f0ff] dark:hover:bg-[#202c33] transition-colors",
                // activeId === c.id && "bg-muted"
                activeId === c.id
                ? "bg-[#e8f0ff] dark:bg-[#2a3942]" 
                : "bg-transparent" 
              )}
            >
              {/* Avatar stack */}
              <div className="relative">
                <div className="size-10 rounded-full bg-muted grid place-content-center border">👥</div>
                {/* indicador de online si algun amigo esta en linea */}
                <span className="absolute -bottom-0 -right-0 size-3 rounded-full ring-2 ring-card"
                  // style={{ background: c.members.some(m => m.online) ? "#16a34a" : "#94a3b8" }} />
                  style={{ background: c.members[1]?.online ? "#16a34a" : "#94a3b8" }} />
                  {/* Verifcar esta parte porque cuando un usuario envia mensaje a otro, y este usuario se desconecta, en el otro, al abrir el mensaje, aparece como conectado */}
                  {/* Ejemplo de esto, Maria envia "Adios Harol" a Harol y Maria se desconecta, Harol esta en el chat de Alan, por lo que cuando recibe el mensaje de Maria,
                  aparece la notificación y Maria se muestra como desconectada (circulo gris), Maria ya esta desconectada cuando Harol recibio el mensaje, pero si Harol da clic
                  en el mensaje nuevo que tiene la notificacion, el circulo se muestra verde, en lugar de gris */}
                  {/* Lo de arriba ya se reviso */}
              </div>
              <div className="min-w-0 rounded-xl p-2 border shadow-sm bg-white border-gray-200 dark:bg-[#202c33] dark:border-gray-700 dark:shadow-md dark:text-gray-200 transition-all">
                <p className="truncate font-medium text-black dark:text-white">{c.title ?? "Grupo"}</p>
                {/* <p className="text-xs text-muted-foreground truncate">
                  {c.lastMessage?.text ?? "Sin mensajes"}
                </p> */}
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
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


//LO DE JULIO
// "use client";

// import * as React from "react";
// import { Conversation } from "./_types";
// import { cn } from "@/lib/utils";

// export function ChatsSidebar({
//   conversations,
//   activeId,
//   onSelect,
// }: {
//   conversations: Conversation[];
//   activeId?: string;
//   onSelect: (id: string) => void;
// }) {
//   const [q, setQ] = React.useState("");

//   const filtered = conversations.filter((c) =>
//     (c.title ?? "").toLowerCase().includes(q.toLowerCase())
//   );

//   return (
//     <div className="h-full grid grid-rows-[auto_auto_minmax(0,1fr)]">
//       <header className="px-4 py-3 border-b">
//         <h2 className="text-lg font-semibold">Chats</h2>
//       </header>

//       <div className="px-3 pt-3 pb-2">
//         <div className="relative">
//           <input
//             className="w-full h-10 rounded-[var(--radius)] border bg-background pl-9 pr-3 outline-none focus:ring-2 focus:ring-[var(--ring)]"
//             placeholder="Buscar conversación"
//             value={q}
//             onChange={(e) => setQ(e.target.value)}
//           />
//           <span className="absolute left-3 top-1/2 -translate-y-1/2">🔎</span>
//         </div>
//         <div className="mt-2 flex gap-2">
//           <button className="text-xs px-2 py-1 rounded border">Todos</button>
//           <button className="text-xs px-2 py-1 rounded border">No leídos</button>
//           <button className="text-xs px-2 py-1 rounded border">Fijados</button>
//         </div>
//       </div>

//       <ul className="overflow-y-auto">
//         {filtered.map((c) => (
//           <li key={c.id}>
//             <button
//               onClick={() => onSelect(c.id)}
//               className={cn(
//                 "w-full text-left px-3 py-3 grid grid-cols-[40px_1fr_auto] gap-3 hover:bg-muted",
//                 activeId === c.id && "bg-muted"
//               )}
//             >
//               {/* Avatar stack */}
//               <div className="relative">
//                 <div className="size-10 rounded-full bg-muted grid place-content-center border">👥</div>
//                 {/* indicador de online si alguno lo está */}
//                 <span className="absolute -bottom-0 -right-0 size-3 rounded-full ring-2 ring-card"
//                   style={{ background: c.members.some(m => m.online) ? "#16a34a" : "#94a3b8" }} />
//               </div>
//               <div className="min-w-0">
//                 <p className="truncate font-medium">{c.title ?? "Grupo"}</p>
//                 <p className="text-xs text-muted-foreground truncate">
//                   {c.lastMessage?.text ?? "Sin mensajes"}
//                 </p>
//               </div>
//               <div className="text-right">
//                 {!!c.unread && (
//                   <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded-full text-xs font-semibold bg-[var(--palette-blue)] text-[var(--primary-foreground)]">
//                     {c.unread}
//                   </span>
//                 )}
//                 {c.pinned && <div className="text-xs mt-1">📌</div>}
//               </div>
//             </button>
//             <div className="border-b" />
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }
