export type User = {
  id: string;
  name: string;
  avatar?: string;
  online?: boolean;
};

export type Message = {
  id: string;
  authorId: string;
  text?: string;
  images?: string[];
  createdAt: string; // ISO
  status?: string;
  // status?: "sent" | "delivered" | "seen";
  // status?: number;
  reactions?: { by: string; emoji: string }[];
  system?: boolean;
};

export type Conversation = {
  id: string;
  title?: string;           // p.ej. "CDMX 1-4 nov"
  tripId?: string;          // vínculo al itinerario
  members: User[];
  lastMessage?: Message;
  unread?: number;
  pinned?: boolean;
  muted?: boolean;
  messages: Message[];
};
