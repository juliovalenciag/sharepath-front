"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Conversation, Message, User } from "./_types";
import { ChatsSidebar } from "./ChatsSidebar";
import { ChatThread } from "./ChatThread";
import { ChatDetails } from "./ChatDetails";
import { useSocket } from "@/context/socketContext"; //
//import { currentUser } from "./_mock"; //

//Datos que se reciben del servidor
type SocketUser = {
  userID: string;
  username: string;
  connected: boolean;
  messages: any[];
  hasNewMessages?: boolean;
};

//Funciones auxiliar para adaptar datos del socket al front
function adaptSocketMessageToUIMessage(socketMsg: any, selfUserID: string): Message {
  const isMine = socketMsg.from === selfUserID;
  return {
    id: crypto.randomUUID(),
    authorId: socketMsg.from,
    text: socketMsg.content,
    createdAt: new Date().toISOString(),
    status: isMine ? "sent" : undefined,
  };
}

function adaptSocketUserToConversation(user: SocketUser, selfUser: User): Conversation {
  const uiMessages: Message[] = user.messages.map((msg) =>
    adaptSocketMessageToUIMessage(msg, selfUser.id)
  );
  return {
    id: user.userID,
    title: user.username,
    members: [selfUser, { id: user.userID, name: user.username, online: user.connected }],
    messages: uiMessages,
    lastMessage: uiMessages[uiMessages.length - 1],
    unread: user.hasNewMessages ? 1 : 0,
    tripId: undefined,
  };
}
//////

export function ChatLayout() {
  const { socket, userID, username } = useSocket();
  const [socketUsers, setSocketUsers] = React.useState<SocketUser[]>([]);
  const [activeId, setActiveId] = React.useState<string | undefined>(undefined); 

  React.useEffect(() => {
    if (!socket || !userID || !username) {
        //console.log("ChatLayout: Esperando username socket y userID...");
        return;
    }
    
    //console.log("ChatLayout: Socket y userID listos. Configurando listeners...");

    socket.on("users", (users: SocketUser[]) => {
      //console.log("ChatLayout: Recibido evento 'users'", users);
      const allUsers = users.map((u) => ({ ...u, hasNewMessages: false }));
      setSocketUsers(allUsers);
      
      if (allUsers.length > 0 && !activeId) {
        setActiveId(allUsers[0].userID);
      }
    });

    socket.on("user connected", (user: SocketUser) => {
      //console.log("ChatLayout: Recibido evento 'user connected'", user);
      setSocketUsers((prev) =>
        prev.map((u) =>
          u.userID === user.userID ? { ...u, connected: true } : u
        )
      );
    });

    socket.on("user disconnected", (disconnectedID: string) => {
      //console.log(`${disconnectedID} desconectado`);
      
      setSocketUsers((prev) => {
        return prev.map((u) => {
          if (u.userID === disconnectedID) {
             //console.log(`${u.username} desconectado.`);
             return { ...u, connected: false };
          } else {
             // console.log(`Comparando "${u.userID}" con "${disconnectedID}" no coincide`);
             return u;
          }
        });
      });
    });

    socket.on("private message", (message: { content: string; from: string; to: string }) => {
        //console.log("ChatLayout: Recibido evento 'private message'", message);
        setSocketUsers((prev) =>
          prev.map((u) => {
            const fromSelf = message.from === userID;
            const targetUserID = fromSelf ? message.to : message.from;
            
            if (u.userID === targetUserID) {
              return {
                ...u,
                messages: [...u.messages, message],
                hasNewMessages: u.userID !== activeId,
              };
            }
            return u;
          })
        );
      }
    );

    //console.log("ChatLayout: Pidiendo la lista de amigos al servidor...");
    socket.emit("get friends list");

    return () => {
      //console.log("ChatLayout: Limpiando listeners de socket");
      socket.off("users");
      socket.off("user connected");
      socket.off("user disconnected");
      socket.off("private message");
      socket.off("get friends list");
    };
  }, [socket, activeId, userID, username]);
  
  const selfUser: User | null = React.useMemo(() => {
    if (!userID || !username) return null;
    return {
        id: userID,
        name: username,
        avatar: "", //foto_url para el contexto del socket
        online: true,
    };
  }, [userID, username]);

  const conversationsForUI: Conversation[] = React.useMemo(() => {
    if (!selfUser) return []; //Si aun no sabemos quienes somos, no muestra nada
    //Pasa 'selfUser' a la funcion que adapta los sockets al front
    return socketUsers.map((u) => adaptSocketUserToConversation(u, selfUser));
  }, [socketUsers, selfUser]);

  const active = conversationsForUI.find((c) => c.id === activeId);

  function sendMessage(text: string) {
    if (!active || !socket || !userID) return; //userID del contexto del socket
    
    //console.log(`ChatLayout: Enviando mensaje a ${active.id}`);
    socket.emit("private message", {
      content: text,
      to: active.id,
    });

    const socketMsg = {
      content: text,
      from: userID, //userID del contexto
      to: active.id,
    };

    setSocketUsers((prev) =>
      prev.map((u) =>
        u.userID === active.id
          ? { ...u, messages: [...u.messages, socketMsg] }
          : u
    ))
  }
  const handleSelectConversation = (id: string) => {
    setActiveId(id);
    setSocketUsers((prev) =>
      prev.map((u) =>
        u.userID === id ? { ...u, hasNewMessages: false } : u
      )
    );
  };

  const [showDetails, setShowDetails] = React.useState(true);

if (!selfUser) {
      return (
          <div className="h-full grid place-content-center text-center text-muted-foreground">
              Cargando datos de usuario...
          </div>
      );
  }

return (
  <div className="grid grid-cols-[1fr_2fr] gap-2 h-160">
      {/* Barra lateral de Chats (contactos) */}
      <aside>
        {
          active &&
          <ChatsSidebar
            conversations={conversationsForUI}
            activeId={activeId}
            onSelect={handleSelectConversation}
            //selfUserId={selfUser.id}
          ></ChatsSidebar>
        }
      </aside>
      {/* <aside className="border-r bg-card/50 overflow-hidden">
        <ChatsSidebar
          conversations={conversationsForUI}
          activeId={activeId}
          onSelect={handleSelectConversation}
        />
      </aside> */}

      {/* Chat activo */}
      <main className="min-w-0">
        {active ? (
          <ChatThread
            conversation={active}
            onSend={sendMessage}
            onToggleDetails={() => setShowDetails((v) => !v)}
            selfUserId={selfUser.id}
          />
        ) : (
          <div className="h-full grid place-content-center text-center text-muted-foreground">
            {socketUsers.length > 0
              ? "Selecciona una conversación"
              : "No tienes amigos en tu lista"}
          </div>
        )}
      </main>

      {/* Detalles del contacto */}
      {/* <aside className={cn("border-l bg-card/40", showDetails ? "block" : "hidden md:block")}>
        {active && <ChatDetails conversation={active} />}
      </aside> */}
  </div>
  );
}


//LO DE JULIO
// "use client";

// import * as React from "react";
// import { cn } from "@/lib/utils";
// import { Conversation, Message } from "./_types";
// import { ChatsSidebar } from "./ChatsSidebar";
// import { ChatThread } from "./ChatThread";
// import { ChatDetails } from "./ChatDetails";
// import { currentUser } from "./_mock";

// export function ChatLayout({
//   conversations,
//   onUpdateConversation,
// }: {
//   conversations: Conversation[];
//   onUpdateConversation: (id: string, updater: (c: Conversation) => Conversation) => void;
// }) {
//   const [activeId, setActiveId] = React.useState(conversations[0]?.id);
//   const active = conversations.find((c) => c.id === activeId);

//   function sendMessage(text: string) {
//     if (!active) return;
//     const msg: Message = {
//       id: crypto.randomUUID(),
//       authorId: currentUser.id,
//       text,
//       createdAt: new Date().toISOString(),
//       status: "sent",
//     };
//     onUpdateConversation(active.id, (c) => ({
//       ...c,
//       messages: [...c.messages, msg],
//       lastMessage: msg,
//       unread: 0,
//     }));
//   }

//   const [showDetails, setShowDetails] = React.useState(true);

//   return (
//     <div
//       className={cn(
//         "grid h-[calc(100dvh-64px)]",
//         "grid-cols-1 md:grid-cols-[minmax(280px,360px)_minmax(0,1fr)_minmax(280px,360px)]"
//       )}
//     >
//       {/* Sidebar conversaciones */}
//       <aside className="border-r bg-card/50 overflow-hidden">
//         <ChatsSidebar
//           conversations={conversations}
//           activeId={activeId}
//           onSelect={setActiveId}
//         />
//       </aside>

//       {/* Thread */}
//       <main className="min-w-0">
//         {active ? (
//           <ChatThread
//             conversation={active}
//             onSend={sendMessage}
//             onToggleDetails={() => setShowDetails((v) => !v)}
//           />
//         ) : (
//           <div className="h-full grid place-content-center text-center text-muted-foreground">
//             Selecciona una conversación
//           </div>
//         )}
//       </main>

//       {/* Detalles */}
//       <aside className={cn("border-l bg-card/40", showDetails ? "block" : "hidden md:block")}>
//         {active && <ChatDetails conversation={active} />}
//       </aside>
//     </div>
//   );
// }
