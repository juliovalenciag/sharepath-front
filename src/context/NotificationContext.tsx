"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useSocket } from "@/context/socketContext"; // <--- El socket de tu compañero
import { ItinerariosAPI } from "@/api/ItinerariosAPI";
import { RawNotification } from "@/api/interfaces/ApiRoutes";

// Definimos el tipo básico (puedes ajustarlo si usas TS estricto)
interface NotificationContextType {
  notifications: any[];
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>;
  markAsRead: (notificationId: string | number) => Promise<void>;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

// --- FUNCIÓN HELPER PARA FORMATEAR ---
// Centraliza la lógica de transformación de datos del backend a la UI.
const formatNotification = (n: RawNotification) => ({
  id: n.id,
  tipo: n.type,
  preview: {
    mensaje: n.previewText || "Nueva notificación",
  },
  actor_nombre: n.emisor.nombre_completo || "Usuario",
  actor_username: n.emisor.username || "user",
  actor_avatar: n.emisor.foto_url || "/img/angel.jpg",
  // 4. RESTO DE DATOS
  fecha: n.createdAt,
  leido: n.isRead,
  linkId: n.resourceId,
}
);

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { socket, isConnected } = useSocket(); // Obtenemos la conexión existente
  const [notifications, setNotifications] = useState<any[]>([]);
  // 1. Cargar historial de notificaciones desde la base de datos al iniciar
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const api = ItinerariosAPI.getInstance();
        const dataDB = await api.getNotifications();
        console.log("🔔 Historial de notificaciones desde la base de datos:", dataDB);
        const historialFormateado = dataDB.map(formatNotification);
        console.log("✅ Historial formateado para UI:", historialFormateado);
        setNotifications(historialFormateado);
      } catch (error) {
        console.error("Error al cargar el historial de notificaciones:", error);
      }
    };

    fetchHistory();
  }, []); 


  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleReceiveNotification = (payload: any) => {
      console.log("🔔 Socket: Nueva notificación recibida:", payload);

      const notificacionFormateada = formatNotification(payload);
      console.log("✅ Notificación formateada para UI:", notificacionFormateada);
      setNotifications((prev) => [notificacionFormateada, ...prev]);

       const audio = new Audio('/audio/notification.mp3');
       audio.play().catch(e => console.log(e));
    };

    socket.on("receive notification", handleReceiveNotification);

    return () => {
      socket.off("receive notification", handleReceiveNotification);
    };
  }, [socket, isConnected]);

  const unreadCount = notifications.filter((n) => !n.leido).length;

  const markAsRead = async (notificationId: string | number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, leido: true } : n))
    );

    try {
      const api = ItinerariosAPI.getInstance();
      await api.markNotificationAsRead(notificationId);
      console.log(
        `✅ Notificación ${notificationId} marcada como leída en el servidor.`
      );
    } catch (error) {
      console.error("Error al marcar como leída, revirtiendo cambio:", error);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, leido: false } : n))
      );
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        unreadCount,
        markAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationsC = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotificationsC debe usarse dentro de un NotificationProvider"
    );
  }
  return context;
};
