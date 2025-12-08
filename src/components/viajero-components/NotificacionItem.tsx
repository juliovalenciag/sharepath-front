"use client";

import React from "react";
// Importa iconos de lucide-react (o la librería que uses)
import { MapPin, UserPlus, Heart, MessageCircle, Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

// Importamos tus componentes de Avatar existentes
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; 
import { useNotificationsC } from "@/context/NotificationContext"; // Asegúrate que la ruta sea correcta

// --- CONFIGURACIÓN DE ICONOS ---
// Define aquí qué icono y color corresponde a cada tipo de notificación
const NOTIFICATION_STYLES: Record<string, { icon: any; color: string; bg: string }> = {
  POST: { 
    icon: MapPin, 
    color: "text-green-600", 
    bg: "bg-green-100" 
  },
  FRIEND_REQUEST: { 
    icon: UserPlus, 
    color: "text-blue-600", 
    bg: "bg-blue-100" 
  },
  LIKE: { 
    icon: Heart, 
    color: "text-red-500", 
    bg: "bg-red-100" 
  },
  COMMENT: { 
    icon: MessageCircle, 
    color: "text-yellow-600", 
    bg: "bg-yellow-100" 
  },
  DEFAULT: { 
    icon: Bell, 
    color: "text-gray-500", 
    bg: "bg-gray-100" 
  },
};

interface NotificationItemProps {
  notification: any; // O usa tu interfaz Notification definida
}

export const NotificationItem = ({ notification }: NotificationItemProps) => {
  const { markAsRead } = useNotificationsC();

  // 1. Determinar estilo según el tipo
  const style = NOTIFICATION_STYLES[notification.tipo] || NOTIFICATION_STYLES.DEFAULT;
  const IconComponent = style.icon;

  const handleClick = () => {
    if (!notification.leido) {
      markAsRead(notification.id);
    }
    // Aquí puedes añadir navegación si quieres: router.push(...)
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative flex items-start gap-4 p-4 border-b border-gray-100 
        hover:bg-gray-50 transition-all cursor-pointer w-full
        ${!notification.leido ? "bg-blue-50/40" : "bg-white"}
      `}
    >
      {/* --- ZONA DEL AVATAR CON ÍCONO --- */}
      <div className="relative flex-shrink-0">
        <Avatar className="h-10 w-10 border border-gray-200">
          {/* Aquí usamos la URL que viene del contexto */}
          <AvatarImage 
            src={notification.actor_avatar} 
            alt={notification.actor_nombre}
            className="object-cover" 
          />
          <AvatarFallback className="font-semibold text-gray-500">
            {notification.actor_nombre?.substring(0, 2).toUpperCase() || "US"}
          </AvatarFallback>
        </Avatar>

        {/* ÍCONO FLOTANTE (Badge) */}
        <div className={`
          absolute -bottom-1 -right-1 
          flex items-center justify-center 
          w-5 h-5 rounded-full border-2 border-white 
          shadow-sm ${style.bg}
        `}>
          <IconComponent className={`w-3 h-3 ${style.color}`} />
        </div>
      </div>

      {/* --- CONTENIDO DE TEXTO --- */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 leading-snug">
          <span className="font-semibold text-black mr-1">
            {notification.actor_nombre}
          </span>
          {notification.preview?.mensaje || notification.mensaje}
        </p>
        
        <p className="text-xs text-gray-400 mt-1">
          {notification.fecha 
            ? formatDistanceToNow(new Date(notification.fecha), { addSuffix: true, locale: es }) 
            : "Hace un momento"}
        </p>
      </div>

      {/* --- INDICADOR DE NO LEÍDO (Punto azul) --- */}
      {!notification.leido && (
        <span className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-blue-600 mt-2" />
      )}
    </div>
  );
};