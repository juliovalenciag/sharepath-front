"use client";

import Link from "next/link";
import Image from "next/image";
import { UserPlus, MessageCircle, Heart, Bell, Signpost, UserRoundCheck} from "lucide-react";
import { useNotificationsC } from "@/context/NotificationContext";

// 1. Mapeo simple de iconos según el TIPO que llega en tu JSON
const getIconAndColor = (type: string) => {
  // Convertimos a mayúsculas para evitar errores (friend_request vs FRIEND_REQUEST)
  const normalized = type?.toUpperCase() || "GENERIC";

  switch (normalized) {
    case "NEW_POST":
    case "NUEVA_PUBLICACION":
      return {
        icon: <Signpost size={16} className="text-white" />,
        color: "bg-green-500",
      };
    case "FRIEND_REQUEST":
    case "SOLICITUD":
      return {
        icon: <UserPlus size={16} className="text-white" />,
        color: "bg-indigo-600",
      };
    case "FRIEND_ACCEPTED":
      return{
        icon: <UserRoundCheck size={16} className="text-white" />,
        color: "bg-indigo-600",
      }
    case "COMMENT":
      
    case "COMENTARIO":
      return {
        icon: <MessageCircle size={16} className="text-white" />,
        color: "bg-blue-500",
      };
    case "LIKE":
      return {
        icon: <Heart size={16} className="text-white" />,
        color: "bg-red-500",
      };
    default:
      return {
        icon: <Bell size={16} className="text-white" />,
        color: "bg-gray-400",
      };
  }
};

export const NotificationCard = ({ notification }: { notification: any }) => {
  const { setNotifications, markAsRead } = useNotificationsC();

  const {
    id,
    tipo,
    actor_nombre,
    actor_avatar,
    actor_username,
    preview,
    leido,
    linkId,
  } = notification;

  // Si no hay preview, usamos un objeto vacío para que no rompa
  const mensaje = notification.preview?.mensaje || "Nueva notificación";

  // Determinamos el estilo visual
  const { icon, color } = getIconAndColor(tipo);
  // Normalizamos el tipo a mayúsculas para que la comparación sea consistente
  const isRequest =
    tipo?.toUpperCase() === "FRIEND_REQUEST" ||
    tipo?.toUpperCase() === "SOLICITUD";
  const bgClass = leido ? "bg-white" : "bg-blue-50/60";

  // Función para eliminar visualmente al aceptar/rechazar
  const removeNotification = () => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleAction = async (e: React.MouseEvent, action: string) => {
    e.preventDefault(); // Evita navegar al Link
    e.stopPropagation();
    console.log(`Acción: ${action} enviada para ID: ${id}`);

    // Aquí harías tu fetch al backend...
    // await fetch(...)

    removeNotification(); // La quitamos de la lista
  };

  // Función para marcar como leída al hacer clic
  const handleNotificationClick = () => {
    // Solo marcamos como leída si no lo está ya
    if (!leido) {
      markAsRead(id);
    }
  };

  // URL destino: Si es solicitud va al perfil, si no, va al post/itinerario
  const destination = isRequest
    ? `/perfil/${actor_username}`
    : `/itinerario/${linkId}`;

  return (
    <div
      className={`relative w-full p-3 mb-2 rounded-xl border shadow-sm transition-all hover:shadow-md ${bgClass} border-gray-200 cursor-pointer`}
      onClick={handleNotificationClick}
    >
      <div className="flex gap-3 items-start">
        {/* 1. AVATAR + ICONO */}
        <Link
          href={`/perfil/${actor_username}`}
          className="relative shrink-0 cursor-pointer"
        >
          <Image
            src={ "/img/angel.jpg"}
            alt={actor_nombre || "User"}
            width={48}
            height={48}
            className="rounded-full object-cover w-10 h-10 sm:w-12 sm:h-12 border border-gray-100"
          />
          <div
            className={`absolute -bottom-1 -right-1 p-1 rounded-full border-2 border-white ${color}`}
          >
            {icon}
          </div>
        </Link>

        {/* 2. CONTENIDO TEXTO */}
        <div className="flex-1 min-w-0">
          <Link
            href={destination}
            className="block"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm text-gray-800 leading-snug">
              <span className="font-bold text-gray-900">{actor_nombre}</span>{" "}
              {mensaje}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {/* Formato de fecha simple */}
              {notification.fecha
                ? new Date(notification.fecha).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Ahora"}
            </p>
          </Link>

          {/* 3. BOTONES (Solo si es solicitud de amistad) */}
          {isRequest && (
            <div className="flex gap-2 mt-2">
              <button
                onClick={(e) => handleAction(e, "accept")}
                className="px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-md hover:bg-indigo-700 transition"
              >
                Aceptar
              </button>
              <button
                onClick={(e) => handleAction(e, "decline")}
                className="px-3 py-1 bg-white border border-gray-300 text-gray-700 text-xs font-semibold rounded-md hover:bg-gray-50 transition"
              >
                Rechazar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
