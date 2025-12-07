import React from "react";
import { NotificationCard } from "@/components/NotificacionesCard";
import { useNotificationsC } from "@/context/NotificationContext";

export default function Notificaciones() {
  const { notifications } = useNotificationsC();

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Notificaciones</h1>
      
      {/* Depuración visual: Si esto aparece, el array tiene datos */}
      <p className="text-xs text-gray-400 mb-2">Total: {notifications.length}</p>

      <div className="space-y-2">
        {notifications.map((notif: any, i) => (
          // Usamos 'i' como fallback key por si el ID viene repetido o null en pruebas
          <NotificationCard key={notif.id || i} notification={notif} />
        ))}
      </div>
    </div>
  );
}