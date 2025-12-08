"use client";
import React, { useState, useEffect } from "react";
import { useSocket } from "@/context/socketContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Notificaciones from "@/components/viajero/Notificaciones";
type SocketUser = {
  userID: string;
  username: string;
  connected: boolean;
  messages: any[];
  hasNewMessages?: boolean;
};

export default function NotificacionesPage2() {
  return <Notificaciones />;
}
