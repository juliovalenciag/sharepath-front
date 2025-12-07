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
    if(storedUser) {
      const datosUsuario = JSON.parse(storedUser);
      setUserID(datosUsuario.correo);
      setUsername(datosUsuario.username);
    }
  };

  useEffect(() => {
    recargarUsuario();
  }, []);

  useEffect(() => {
    //console.log("Iniciando configuracion de SocketConext...");
    // if(loadingUser) return;
    if(socket) return;

    const intentarConectar = () => {
      const token = localStorage.getItem("authToken");
      const sessionID = localStorage.getItem("sessionID");

      if(!token){
        // console.log("Buscando token...");
        return false;
      }

      // console.log("Token encontrado. Generando Socket...");

      const newSocket = io("http://localhost:4000", {
        path: "/socket.io/",
        auth: { sessionID, token },
        autoConnect: false,
      });

      newSocket.on("connect", () => {
          console.log("Socket Conectado");
          setIsConnected(true);
      });

      newSocket.on("session", ({ sessionID, userID, username }) => {
        console.log("Sesion valida, actualizando datos...");
        localStorage.setItem("sessionID", sessionID);
        newSocket.auth = { sessionID, token };
        setUserID(userID);
        setUsername(username);

        console.log("Pidiendo lista de amigos...");
        newSocket.emit("get friends list");
      });

      newSocket.on("users", (users) => {
        console.log("📦 Contexto: Recibida lista de amigos global: ", users.length);
      });

      newSocket.on("private message", ()  => console.log("Mensaje privado"));

      newSocket.on("disconnect", () => setIsConnected(false));
      // newSocket.off("session");
      // newSocket.off("connect");
      // newSocket.off("connect_error");
      // newSocket.off("disconnect");
      //Se pueden poner los .off aqui?

      setSocket(newSocket);
      return true; //Se encontro el token y se conecto el Socket
    }

    const exito = intentarConectar();
    
    let intervalo: NodeJS.Timeout;
    if (!exito) {
        console.log("Token no listo. Esperando token...");
        intervalo = setInterval(() => {
            const conecto = intentarConectar();
            if (conecto) {
                clearInterval(intervalo); // Si se conecta, se deja de esperar
            }
        }, 500); //Revisa cada medio segundo
    }

    return () => {
      //console.log("SocketContext: Desconectando usuario...")
      if (intervalo) clearInterval(intervalo);
    };
  }, [socket]);

  //   const handleGlobalMessage = (message: any) => {
  //     console.log("Se recibio un mensaje");
  //     //const currentUserID = userIDRef.current;

  //     //if(currentUserID && message.from !== currentUserID)
  //     //{
  //     //  socket.emit("mark messages received", { withUserID: message.from });
  //     //}
  //   };

  return (
    <SocketContext.Provider value={{ socket, isConnected, userID, username, recargarUsuario }}>
      {children}
    </SocketContext.Provider>
  );
};