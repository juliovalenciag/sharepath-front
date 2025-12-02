'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

// Define la forma de tu notificación (coincide con tu BD)
interface Notification {
  id: number;
  tipo: string;
  mensaje: string;
  linkId?: number; // Para redirigir
  origen?: string; // 'amistad', 'post', etc.
  preview?: any;
  leido: boolean;
  fecha: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  isLoading: true,
});

export const NotificationProvider = ({ 
  children, 
  userEmail 
}: { 
  children: React.ReactNode, 
  userEmail: string // Necesitamos el correo del usuario logueado
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) return;

    // 1. Conectamos al Endpoint SSE de Bun
    // Asegúrate de que la URL coincida con tu backend
    const url = `http://localhost:3000/sse/sistema?userId=${encodeURIComponent(userEmail)}`;
    console.log("🔌 Conectando SSE a:", url);
    
    const eventSource = new EventSource(url);

    // 2. Escuchar evento genérico 'message' (o nombres específicos como 'SOLICITUD')
    eventSource.onmessage = (event) => {
      // Ignorar mensajes de keep-alive o inicio
      if (event.data.includes("keep-alive") || event.data.includes("Conectado")) return;

      try {
        const newNotification = JSON.parse(event.data);
        console.log("🔔 Notificación recibida en Front:", newNotification);

        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);
        
        // Opcional: Sonido de notificación
        // new Audio('/ding.mp3').play().catch(e => console.log('Audio bloqueado'));
        
      } catch (error) {
        console.error("Error parseando notificación:", error);
      }
    };

    // Escuchar eventos específicos (si tu backend manda event: TIPO)
    eventSource.addEventListener("SOLICITUD", (e: MessageEvent) => {
        const data = JSON.parse(e.data);
        setNotifications(prev => [data, ...prev]);
        setUnreadCount(prev => prev + 1);
    });

    eventSource.onerror = (error) => {
      console.error("Error en SSE:", error);
      eventSource.close();
    };

    setIsLoading(false);

    return () => {
      console.log("🔌 Desconectando SSE");
      eventSource.close();
    };
  }, [userEmail]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, isLoading }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);