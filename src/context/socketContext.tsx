//socketCOntext original
"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

//Datos del contexto
interface ISocketContext {
  socket: Socket | null;
  isConnected: boolean;
  userID: string | null;
  username: string | null;
  recargarUsuario: () => void;
}

//Incializacion de datos del contexto
const SocketContext = createContext<ISocketContext>({
  socket: null,
  isConnected: false,
  userID: null,
  username: null,
  recargarUsuario: () => {}
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userID, setUserID] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  const recargarUsuario = () => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("authToken");

    if(!token){
      // console.log("recargarUsuario: No hay token, no se generara socket");
      return;
    }
    // console.log("Ya hay token, generando socket");

    if(storedUser) {
      const datosUsuario = JSON.parse(storedUser);
      setUserID(datosUsuario.correo);
      setUsername(datosUsuario.username);
    }
    else{
      setUserID(null);
      setUsername(null);
    }
  };

  useEffect(() => {
    recargarUsuario();
  }, []);

  useEffect(() => {
    const handleUserChange = () => {
      const storedUser = localStorage.getItem("user");
      if(!storedUser) return;

      const datosUsuario = JSON.parse(storedUser);

      if(datosUsuario.correo !== userID){
        // console.log("Usuario cambio. Reiniciando socket...");

        setIsConnected(false);
        if(socket){
          socket.disconnect();
        }
        setSocket(null);

        localStorage.removeItem("sessionID");

        recargarUsuario();
      }
    };

    window.addEventListener("storage", handleUserChange);

    return () => window.removeEventListener("storage", handleUserChange);
  }, [socket, userID]);

  /*Socket cuando cambia el userID*/
  useEffect(() => {
    //console.log("Iniciando configuracion de SocketConext...");
    if(!userID) return;

    // console.log("Generando socket para usuario...", userID);

    const token = localStorage.getItem("authToken");
    const sessionID = localStorage.getItem("sessionID");

      if(!token){
        // console.log("Buscando token...");
        return;
      }
      // console.log("Token encontrado. Generando Socket...");

      const newSocket = io("https://harol-lovers.up.railway.app", {
        path: "/socket.io/",
        auth: { sessionID, token },
        autoConnect: false,
        // reconnection: true,
      });

      newSocket.connect();
      setSocket(newSocket);
      newSocket.on("connect", () => {
          // console.log("Socket Conectado!");
          setIsConnected(true);
      });

      newSocket.on("session", ({ sessionID, userID, username }) => {
        //console.log("Sesion valida, actualizando datos...");
        localStorage.setItem("sessionID", sessionID);
        newSocket.auth = { sessionID, token };
        setUserID(userID);
        setUsername(username);

        //Pedir amigos aqui
        // console.log("Pidiendo lista de amigos...");
        newSocket.emit("get friends list");
      });

      // newSocket.on("users", (users) => {
        // console.log("Contexto: Recibida lista de amigos: ", users.length);
      // });

      newSocket.on("disconnect", () => setIsConnected(false));
      // newSocket.off("session");
      // newSocket.off("connect");
      // newSocket.off("connect_error");
      // newSocket.off("disconnect");
      //Se pueden poner los .off aqui?

    return () => {
      //console.log("SocketContext: Desconectando usuario...")
      newSocket.off("connect");
      newSocket.off("session");
      newSocket.off("disconnect"),
      newSocket.disconnect();
    };
  }, [userID]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, userID, username, recargarUsuario }}>
      {children}
    </SocketContext.Provider>
  );
};