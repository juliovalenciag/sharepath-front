import { Conversation } from "./_types";

export const me = { id: "u_me", name: "Kelo", avatar: "https://i.pravatar.cc/80?img=12", online: true };

const ana = { id: "u_ana", name: "Ana", avatar: "https://i.pravatar.cc/80?img=5", online: true };
const luis = { id: "u_luis", name: "Luis", avatar: "https://i.pravatar.cc/80?img=3", online: false };

export const mockConversations: Conversation[] = [
  {
    id: "c1",
    title: "CDMX • 1–4 nov (3 noches)",
    tripId: "trip_cdmx_1101",
    members: [me, ana, luis],
    unread: 2,
    lastMessage: {
      id: "m7",
      authorId: "u_ana",
      text: "¿Reservamos restaurante cerca de Bellas Artes?",
      createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      status: "delivered",
    },
    messages: [
      {
        id: "m1",
        authorId: "u_me",
        text: "¡Armo el itinerario! Palacio de Bellas Artes va el sábado.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
        status: "seen",
      },
      {
        id: "m2",
        authorId: "u_luis",
        text: "Yo agrego Alameda y Casa de los Azulejos.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25.5).toISOString(),
        status: "seen",
      },
      {
        id: "m3",
        authorId: "u_ana",
        text: "Perfecto. ¿El domingo Chapultepec?",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25.4).toISOString(),
        reactions: [{ by: "u_me", emoji: "👍" }],
        status: "seen",
      },
      {
        id: "m4",
        authorId: "u_me",
        text: "Sí. Llevo cámara 📷",
        createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
        status: "seen",
      },
      {
        id: "m5",
        authorId: "u_luis",
        text: "Les paso un café cerca.",
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        status: "delivered",
      },
      {
        id: "m6",
        authorId: "u_me",
        text: "De lujo 🔥",
        createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        status: "delivered",
      },
      {
        id: "m7",
        authorId: "u_ana",
        text: "¿Reservamos restaurante cerca de Bellas Artes?",
        createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
        status: "delivered",
      },
    ],
  },
  {
    id: "c2",
    title: "Grutas de Tolantongo",
    tripId: "trip_tolantongo",
    members: [me, ana],
    unread: 0,
    lastMessage: {
      id: "x1",
      authorId: "u_me",
      text: "Subí las fotos al feed 😎",
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      status: "seen",
    },
    messages: [
      {
        id: "x1",
        authorId: "u_me",
        text: "Subí las fotos al feed 😎",
        createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        status: "seen",
      },
    ],
  },
];

export const currentUser = me;
