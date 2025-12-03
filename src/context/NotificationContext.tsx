"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

// ... (Tus interfaces de Notification siguen igual) ...
interface Notification {
  id: number;
  tipo: string;
  mensaje: string;
  linkId?: number;
  preview?: any;
  leido: boolean;
  fecha: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
});

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    // 1. Obtener email del Storage
    const storedData = localStorage.getItem("user"); // OJO: Tu llave real
    if (!storedData) return;

    const parsed = JSON.parse(storedData);
    const email = parsed.correo; // OJO: Tu estructura real

    if (!email) return;

    // --- PARTE A: CARGAR HISTORIAL (Lo nuevo) ---
    const fetchHistory = async () => {
      try {
        console.log("📥 Cargando historial para:", email);
        const res = await fetch(
          `http://localhost:3001/notificaciones?userId=${encodeURIComponent(
            email
          )}`
        );
        console.log ("respuesta", res);
        if (res.ok) {
          const history = await res.json();

          // Actualizamos la lista
          setNotifications(history);
          const sinLeer = history.filter((n) => !n.leido).length;
          setUnreadCount(sinLeer);
        }
      } catch (error) {
        console.error("Error cargando historial:", error);
      }
    };

    fetchHistory(); // Ejecutamos la carga inicial

    // --- PARTE B: CONECTAR TIEMPO REAL (Lo que ya tenías) ---
    console.log("🔌 Iniciando conexión SSE...");
    const url = `http://localhost:3001/sse/sistema?userId=${encodeURIComponent(
      email
    )}`;
    console.log ("url que se esta mandando", url);
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      if (event.data.includes("keep-alive") || event.data.includes("Conectado"))
        return;

      try {
        const newNotification = JSON.parse(event.data);
        console.log("🔔 Nueva Notificación en vivo:", newNotification);

        // Agregamos la nueva AL PRINCIPIO de la lista existente
        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      } catch (e) {
        console.error("Error leyendo SSE", e);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);
  return (
    <NotificationContext.Provider value={{ notifications, unreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationsC = () => useContext(NotificationContext);
