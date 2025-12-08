"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

//Datos del contexto
interface ISocketContext {
  socket: Socket | null;
  isConnected: boolean;
  userID: string | null;
  username: string | null;
}

//Incializacion de datos del contexto
const SocketContext = createContext<ISocketContext>({
  socket: null,
  isConnected: false,
  userID: null,
  username: null,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userID, setUserID] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    //console.log("Iniciando configuracion de SocketConext...");
    
    const sessionID = localStorage.getItem("sessionID");
    const token = localStorage.getItem("authToken");

    if (!token) { 
      console.log('No se encontró token');
      return;
    }

    const newSocket = io("https://harol-lovers.up.railway.app", {
     //const newSocket = io("http://localhost:4000", {
      //withCredentials: true,
      path: "/socket.io/",
      autoConnect: false,
      auth: {
        sessionID: sessionID,
        token: token
      },
    });

    // newSocket.auth = { 
    //     sessionID: sessionID,
    //     token: token 
    // };

    newSocket.on("session", ({ sessionID, userID, username }) => {
      //console.log(`Evento session - SocketContext: Sesión recibida. ID: ${userID}, Nombre: ${username}, Sesion ID: ${sessionID}`);
      newSocket.auth = { sessionID, token }; 
      localStorage.setItem("sessionID", sessionID);
      setUserID(userID);
      setUsername(username);//Guarda el username en el navegador y estado de react
    });

    newSocket.on("connect", () => {
      //console.log("SocketContext: Conectado al servidor");
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      //console.log("SocketContext: Se perdió la conexión");
      setIsConnected(false);
    });

    newSocket.on("connect_error", (err) => {
      console.error(`SocketContext: Error de conexion ${err.message}`);

      //Si el servidor rechaza el token o el sessionID, se borran para evitar bucles, es decir, se borra sessionID y se asigna una nueva.
      if(err.message.includes("inválido") || err.message.includes("No se proporcionó"))
      {
        console.error("Credenciales inválidas, limpiando sessionID...");
        localStorage.remove("sessionID");
      }
    })

    //console.log("Intentando conectar...");
    newSocket.connect();

    //Guardar el socket en el estado de react
    setSocket(newSocket);

    return () => {
      //console.log("SocketContext: Desconectando usuario...")
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, userID, username }}>
      {children}
    </SocketContext.Provider>
  );
};