"use client";

import * as React from "react";
import { ChatLayout } from "@/components/viajero/chat/ChatLayout"; 

export default function ViajeroChatsPage() {
  return (
    // <div className="min-h-[calc(100dvh-64px)] bg-background">
    <div className="min-h-100dvh bg-background">
      <ChatLayout />
    </div>
  );
}

// LO DE JULIO
// "use client";

// import * as React from "react";
// import { ChatLayout } from "@/components/viajero/chat/ChatLayout";
// import { mockConversations } from "@/components/viajero/chat/_mock";

// export default function ViajeroChatsPage() {
//   // Puedes hidratar desde tu store o backend; por ahora mock local
//   const [conversations, setConversations] = React.useState(mockConversations);

//   return (
//     <div className="min-h-[calc(100dvh-64px)] bg-background">
//       <ChatLayout
//         conversations={conversations}
//         onUpdateConversation={(id, updater) =>
//           setConversations((prev) =>
//             prev.map((c) => (c.id === id ? updater(c) : c))
//           )
//         }
//       />
//     </div>
//   );
// }
