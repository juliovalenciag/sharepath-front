"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useSocket } from "@/context/socketContext"; // <--- El socket de tu compañero

// Definimos el tipo básico (puedes ajustarlo si usas TS estricto)
interface NotificationContextType {
  notifications: any[];
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

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
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.log(
          "NotificationContext: No hay token, no se puede cargar el historial."
        );
        return;
      }

      try {
        // Asumimos que tu endpoint es /notificaciones y usa el mismo método de auth
        const response = await fetch("http://localhost:4000/notificacion", {
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
        });

        if (!response.ok) throw new Error("Respuesta no válida del servidor");
        const dataDB = await response.json();
        console.log(dataDB);
        const historialFormateado = dataDB.map((n: any) => ({
          id: n.id,

          // 1. TIPO: Convertimos a mayúsculas por si acaso
          tipo: n.type,

          // 2. MENSAJE: Tu BD manda 'previewText', la tarjeta espera 'preview.mensaje'
          preview: {
            mensaje: n.previewText || "Nueva notificación",
          },
          // (Opcional) Ponlo también en la raíz por seguridad
          mensaje: n.previewText,

          // 3. ACTOR (Mapeo crítico)
          // BD: n.emisor.username -> UI: actor_nombre
          actor_nombre: n.emisor?.username || "Usuario",

          // BD: n.emisor.correo -> UI: actor_username
          actor_username: n.emisor?.correo || "user",

          // BD: n.emisor.foto_url -> UI: actor_avatar
          // ¡OJO! Si es null, usamos la imagen por defecto
          actor_avatar:  "/img/angel.jpg",

          // 4. RESTO DE DATOS
          fecha: n.createdAt,
          leido: n.isRead,
          linkId: n.resourceId, // Importante para el botón de aceptar
        }));
        console.log("✅ Historial formateado para UI:", historialFormateado);
        setNotifications(historialFormateado);
      } catch (error) {
        console.error("Error al cargar el historial de notificaciones:", error);
      }
    };

    fetchHistory();
  }, []);

  // 2. ESCUCHAR TIEMPO REAL (Lo importante)
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleReceiveNotification = (payload: any) => {
      console.log("🔔 Socket: Nueva notificación recibida:", payload);

      // Agregamos la nueva notificación AL INICIO del array
      setNotifications((prev) => [payload, ...prev]);

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

  return (
    <NotificationContext.Provider
      value={{ notifications, setNotifications, unreadCount }}
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
