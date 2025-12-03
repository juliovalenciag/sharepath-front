"use client";

import Link from "next/link";
import Image from "next/image";
import { useNotificationsC } from "@/context/NotificationContext";
import { Star, Map, MessageCircle, Users, UserPlus } from "lucide-react";
import { useState } from "react";

const mapDbTypeToUiType = (dbType: string) => {
  const normalized = dbType ? dbType.toString().trim().toUpperCase() : "POST";

  switch (normalized) {
    case "SOLICITUD":
    case "FRIEND_REQUEST":
      return "friend_request";

    case "ACEPTACION":
    case "FRIEND_ACCEPTED":
      return "friend_accepted";

    case "COMENTARIO":
    case "COMMENT":
      return "comment";

    case "RATING":
    case "RESEÑA":
    case "RESENA":
      return "rating";

    case "NUEVO_POST":
    case "POST":
      return "post";

    default:
      return "post";
  }
};

const getIconByType = (type: string) => {
  const iconProps = { size: 16, className: "text-white" };
  const wrapperClass =
    "absolute -bottom-1 -right-1 p-1.5 rounded-full border-2 border-white";

  switch (type) {
    case "rating":
      return (
        <div className={`${wrapperClass} bg-yellow-400`}>
          <Star {...iconProps} />
        </div>
      );
    case "post":
      return (
        <div className={`${wrapperClass} bg-sky-500`}>
          <Map {...iconProps} />
        </div>
      );
    case "comment":
      return (
        <div className={`${wrapperClass} bg-blue-500`}>
          <MessageCircle {...iconProps} />
        </div>
      );
    case "friend_accepted":
      return (
        <div className={`${wrapperClass} bg-green-500`}>
          <Users {...iconProps} />
        </div>
      );
    case "friend_request":
      return (
        <div className={`${wrapperClass} bg-indigo-600`}>
          <UserPlus {...iconProps} />
        </div>
      );
    default:
      return null;
  }
};

const NotificationCard = ({ notification }: { notification: any }) => {
  const [isReadState, setIsReadState] = useState(notification.leido);

  const type = mapDbTypeToUiType(
    notification.tipo || notification.type || notification.tipo_evento
  );
  const preview = notification.preview || notification.datos_preview || {};

  const user = {
    name: notification.actor_nombre || preview.nombre || "Usuario",
    username:
      notification.actor_username ||
      preview.username ||
      notification.origen ||
      "user",
    avatarUrl: notification.actor_avatar || preview.avatar || "/img/angel.jpg",
    mutualContacts: preview.mutualContacts,
  };
  const message = preview.mensaje || notification.mensaje || "Nueva notificación";
  const linkId = notification.linkId || notification.referencia_id;

  // Lógica de URL
  const getDestinationUrl = () => {
    switch (type) {
      case "friend_request":
        return `/perfil/${user.username}`;
      case "friend_accepted":
        return `/viajero/amigos`;
      case "post":
      case "comment":
      case "rating":
        return `/itinerario/${linkId}`;
      default:
        return "#";
    }
  };

  const handleCardClick = async () => {
    if (isReadState) return;
    setIsReadState(true);
    try {
      await fetch(
        `http://localhost:3001/notificaciones/${notification.id}/leido`,
        { method: "PATCH" }
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleAction = async (
    e: React.MouseEvent,
    action: "accept" | "decline"
  ) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`Acción: ${action}`);
    // Aquí iría tu fetch para aceptar/rechazar
  };

  const bgClass = !isReadState
    ? "bg-gray-100 hover:bg-gray-200"
    : "bg-white hover:bg-gray-50";

  return (
    <Link
      href={getDestinationUrl()}
      onClick={handleCardClick}
      className={`block w-full p-4 rounded-2xl shadow-sm border border-gray-100 transition-colors cursor-pointer ${bgClass}`}
    >
      <div className="flex gap-4 items-center">
        <div className="relative shrink-0">
          <Image
            src={user.avatarUrl}
            alt={user.name}
            width={56}
            height={56}
            className="rounded-full object-cover w-14 h-14"
          />
          {getIconByType(type)}
        </div>

        <div className="flex-1">
          {type === "friend_request" ? (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h4 className="font-bold text-gray-900 text-lg leading-tight hover:underline">
                  {user.name}
                </h4>
                <p className="text-gray-500 text-sm">@{user.username}</p>
                <p className="text-gray-500 text-sm mt-1"> {message}</p>
              </div>

              <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0 relative z-10">
                <button
                  onClick={(e) => handleAction(e, "decline")}
                  className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition"
                >
                  Eliminar
                </button>
                <button
                  onClick={(e) => handleAction(e, "accept")}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                >
                  Aceptar
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-800 text-base">
                <span className="font-bold">{user.name}</span>{" "}
                {preview.mensaje || notification.mensaje}
              </p>
              <span className="text-gray-400 text-sm mt-1 block">
                {notification.fecha
                  ? new Date(notification.fecha).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Ahora"}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default function Notificaciones() {
  const { notifications } = useNotificationsC();

  return (
    <div className="max-w-3xl mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Notificaciones</h1>
      <div className="space-y-4">
        {notifications.length === 0 && (
          <p className="text-gray-400 text-center">Sin notificaciones.</p>
        )}
        {notifications.map((notif: any) => (
          <NotificationCard key={notif.id} notification={notif} />
        ))}
      </div>
    </div>
  );
}
