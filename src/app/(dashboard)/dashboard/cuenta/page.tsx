"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil } from "lucide-react";
import Link from "next/link";

interface User{
    correo: string;
    username: string;
    nombre_completo: string;
    foto_url: string;
    role: string;
    privacity_mode: string;
    verified_email: string; 
}

export default function AccountPage() {
    // Esto es para obtener la información del usuario
    const [user, setUser] = useState<User | null>(null);    

  useEffect(() => {
    async function fetchUser() {
      try {
        const res   = await fetch("https://harol-lovers.up.railway.app/user", { 
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            token: localStorage.getItem('authToken') || ""
          }
        }); // endpoint del backend
        console.log(res.statusText);
        // Cuando no esta autenticado.
        if( res.status == 401 ) {
          const message = await res.text();
          console.log(message);
        }
        console.log(res.status);
        
        const data  = await res.json();        
        setUser(data);
      } catch (error) {
        console.error("Error al cargar usuario:", error);
      }
    }

    fetchUser();
  }, []);

  if (!user) {
    return <p className="p-6 text-muted-foreground">Cargando perfil...</p>;
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-6">
        {/* Avatar */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Avatar className="h-24 w-24 text-3xl">
            {/* En src ={user.avatarUrl || ""} */}
            <AvatarImage src={`https://harol-lovers.up.railway.app${user.foto_url}`} alt="Foto de perfil" /> 
            {/* Cambiar A por {user.fullName?.charAt(0).toUpperCase() || "U"} */}
            <AvatarFallback>A</AvatarFallback>
          </Avatar>

          {/* Información básica */}
          <div className="flex flex-col gap-1 text-center sm:text-left">
            <h1 className="text-lg font-semibold"> { user.username } </h1>
            <div className="flex flex-col sm:flex-row gap-2 text-sm text-muted-foreground">
              {/* Cambiar 100 por {user.itineraries} */}
              <span>100 Itinerarios publicados</span>
              <span className="hidden sm:block">•</span>
              {/* Cambiar 14K por {user.friends} */}
              <span>14k Amigos</span>
            </div>
          </div>
        </div>

        {/* Boton para editar información */}
        <Link href="/dashboard/cuenta/editar">
          <Button variant="outline" className="flex items-center gap-2 self-end sm:self-auto">
            <Pencil className="h-4 w-4"/>
            <span>Editar perfil</span>
        </Button>
        </Link>
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
              <p className="text-sm text-muted-foreground"> { user.nombre_completo } </p>
            </div>

            {/* Nombre de usuario */}
            <div>
              <p className="text-sm font-medium">Nombre de usuario</p>
              {/* Cambiar Nombre de usuario por {user.username} */}
              <p className="text-sm text-muted-foreground"> { user.username } </p>
            </div>

            {/* Correo electrónico */}
            <div>
              <p className="text-sm font-medium">Correo electrónico</p>
              {/* Cambiar correo por {user.email} */}
              <p className="text-sm text-muted-foreground">
                { user.correo }
              </p>
            </div>

            {/* Tipo de cuenta u otro dato */}
            <div>
              <p className="text-sm font-medium">Tipo de cuenta</p>
              <p className="text-sm text-muted-foreground"> { user.role } </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}