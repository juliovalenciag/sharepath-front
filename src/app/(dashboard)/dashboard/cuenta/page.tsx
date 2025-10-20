"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil } from "lucide-react";

interface User{
    fullname: string;
    username: string;
    email: string;
    itineraries: number;
    friends: string;
    avatarUrl?: string;
    accountType?: string; 
}

export default function AccountPage() {
    //Esto es para obtener la información del usuario
    {/* const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // 🔹 Ejemplo: simulación de fetch a un backend o API
    // Aquí reemplazas por tu API real
    async function fetchUser() {
      try {
        const res = await fetch("/api/user"); // endpoint de tu backend
        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.error("Error al cargar usuario:", error);
      }
    }

    fetchUser();
  }, []);

  if (!user) {
    return <p className="p-6 text-muted-foreground">Cargando perfil...</p>;
  } */}

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar */}
        <div className="relative">
          <Avatar className="h-24 w-24 text-3xl">
            {/* En src ={user.avatarUrl || ""} */}
            <AvatarImage src="" alt="Foto de perfil" /> 
            {/* Cambiar A por {user.fullName?.charAt(0).toUpperCase() || "U"} */}
            <AvatarFallback>A</AvatarFallback>
          </Avatar>

          {/* Botón de editar */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute bottom-0 right-0 rounded-full bg-white border shadow-sm hover:bg-gray-100"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>

        {/* Información básica */}
        <div className="flex flex-col gap-1 text-center sm:text-left">
            {/* Aqui cambiar Social por {user.fullName} */}
          <h1 className="text-lg font-semibold">Social Media User</h1>
          <div className="flex flex-col sm:flex-row gap-2 text-sm text-muted-foreground">
            {/* Cambiar 100 por {user.itineraries} */}
            <span>100 Itinerarios publicados</span>
            <span className="hidden sm:block">•</span>
            {/* Cambiar 14K por {user.friends} */}
            <span>14k Amigos</span>
          </div>
        </div>
      </div>

      {/* Información detallada */}
      <div>
        <h2 className="text-base font-medium mb-3">Información</h2>
        <Card className="bg-muted/40">
          <CardContent className="grid sm:grid-cols-2 gap-6 p-6">
            {/* Nombre completo */}
            <div>
              <p className="text-sm font-medium">Nombre completo</p>
              {/* Cambiar Nombre completo por {user.fullName} */}
              <p className="text-sm text-muted-foreground">Nombre completo</p>
            </div>

            {/* Nombre de usuario */}
            <div>
              <p className="text-sm font-medium">Nombre de usuario</p>
              {/* Cambiar Nombre de usuario por {user.username} */}
              <p className="text-sm text-muted-foreground">Nombre de usuario</p>
            </div>

            {/* Correo electrónico */}
            <div>
              <p className="text-sm font-medium">Correo electrónico</p>
              {/* Cambiar correo por {user.email} */}
              <p className="text-sm text-muted-foreground">
                correo@ejemplo.com
              </p>
            </div>

            {/* Tipo de cuenta u otro dato */}
            <div>
              <p className="text-sm font-medium">Tipo de cuenta</p>
              <p className="text-sm text-muted-foreground">Usuario estándar</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}