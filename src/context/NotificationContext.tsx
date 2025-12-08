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

  // 1. TIPO: La tarjeta espera 'tipo', no 'type'.
  tipo: n.type,

  // 2. MENSAJE: Tu BD manda 'previewText', la tarjeta espera 'preview.mensaje'
  preview: {
    mensaje: n.previewText || "Nueva notificación",
  },

  // 3. ACTOR (Mapeo crítico)
  actor_nombre: n.emisor?.nombre_completo || n.emisor?.username || "Usuario",
  actor_username: n.emisor?.username || "user",
  actor_avatar: n.emisor?.foto_url || "/img/angel.jpg",

  // 4. RESTO DE DATOS
  fecha: n.createdAt,
  leido: n.isRead,
  linkId: n.resourceId,
});

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
        const historialFormateado = dataDB.map(formatNotification);
        console.log("✅ Historial formateado para UI:", historialFormateado);
        setNotifications(historialFormateado);
      } catch (error) {
        console.error("Error al cargar el historial de notificaciones:", error);
      }
    };

    fetchHistory();
  }, []); // Se ejecuta solo una vez al montar el componente

  // 2. ESCUCHAR TIEMPO REAL (Lo importante)
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleReceiveNotification = (payload: any) => {
      console.log("🔔 Socket: Nueva notificación recibida:", payload);

      const notificacionFormateada = formatNotification(payload);
      // Agregamos la nueva notificación AL INICIO del array
      setNotifications((prev) => [notificacionFormateada, ...prev]);

      // Opcional: Sonido de notificación
      // const audio = new Audio('/notification.mp3');
      // audio.play().catch(e => console.log(e));
    };

    // Nos suscribimos al evento
    socket.on("receive notification", handleReceiveNotification);

    // Limpieza al desmontar
    return () => {
      socket.off("receive notification", handleReceiveNotification);
    };
  }, [socket, isConnected]);

  // Calculamos no leídas para la campanita
  const unreadCount = notifications.filter((n) => !n.leido).length;

  const markAsRead = async (notificationId: string | number) => {
    // Actualización optimista: cambia el estado en la UI al instante.
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, leido: true } : n))
    );

    try {
      // Usamos la instancia de la API en lugar de fetch directo
      const api = ItinerariosAPI.getInstance();
      await api.markNotificationAsRead(notificationId);
      console.log(
        `✅ Notificación ${notificationId} marcada como leída en el servidor.`
      );
    } catch (error) {
      console.error("Error al marcar como leída, revirtiendo cambio:", error);
      // Si falla, revierte el cambio en la UI para mantener la consistencia.
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
