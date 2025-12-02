import React from "react";
import Notificaciones from "@/components/viajero/Notificaciones";
// import { useNotifications } from './NotificationContext';
import { Bell } from "lucide-react";

// export const NavbarBell = () => {
//   const { unreadCount } = useNotifications(); // Se conecta al cerebro

export default function page() {
  return (
    <>
      <div className="relative">
        <Bell />
         {/* {unreadCount > 0 && (  */}
        <span className="relative -top-10 -right-4 bg-red-500 text-white text-xs rounded-full px-1">
         {/* {unreadCount}  */}2
        </span>
      </div>

      <div>
        <Notificaciones></Notificaciones>
      </div>
    </>
  );
}
