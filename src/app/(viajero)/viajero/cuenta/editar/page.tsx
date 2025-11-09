"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Globe, Lock, Camera, ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

interface User {
  correo: string;
  username: string;
  nombre_completo: string;
  foto_url: string;
  role: string;
  privacity_mode: string;
}

export default function EditAccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [nombre, setNombre] = useState("");
  const [username, setUsername] = useState("");
  const [privacidad, setPrivacidad] = useState("publica");
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Obtener datos del usuario al montar
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("https://harol-lovers.up.railway.app/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("authToken") || "",
          },
        });

        if (!res.ok) {
          console.error("Error al obtener usuario:", res.statusText);
          return;
        }

        const data = await res.json();
        setUser(data);
        setNombre(data.nombre_completo || "");
        setUsername(data.username || "");
        setPrivacidad(data.privacity_mode || "publica");
      } catch (error) {
        console.error("Error:", error);
      }
    }

    fetchUser();
  }, []);

  const handleSave = async () => {
    if (!user) return;

    try {
      const res = await fetch("https://harol-lovers.up.railway.app/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("authToken") || "",
        },
        body: JSON.stringify({
          nombre_completo: nombre,
          username,
          privacity_mode: privacidad,
        }),
      });

      if (res.ok) {
        alert("Perfil actualizado correctamente");
        router.back();
      } else {
        alert("Error al actualizar el perfil");
      }
    } catch (error) {
      console.error("Error al actualizar:", error);
    }
  };

  const handleDelete = async () =>{
    if (loadingDelete) return;

    const confirmDelete = confirm("¿Esta seguro de eliminar la cuenta?");
    if (!confirmDelete) return;

    setLoadingDelete(true);


    try {
      const res = await fetch("https://harol-lovers.up.railway.app/user", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("authToken") || "",
        },
      });

      if (!res.ok) {
        const msg = await res.text();
        alert("Error al eliminar la cuenta: " + msg);
        setLoadingDelete(false);
        return;
      }

      alert("Cuenta eliminada correctamente");

      localStorage.removeItem("authToken");
      router.push("/sign-up");
      

    } catch (error) {
      console.error("Error al eliminar la cuenta:", error);
      alert("Hubo un problema al intentar eliminar la cuenta, intentelo nuevamente");
    } finally {
      setLoadingDelete(false);
    }
  };

  if (!user) {
    return <p className="p-6 text-muted-foreground">Cargando datos...</p>;
  }

  return (
    <div className="p-6 max-w-xl mx-auto flex flex-col gap-6">
      {/* Botón regresar */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-sm text-muted-foreground hover:text-primary transition"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver
      </button>

      {/* Avatar y formulario */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Avatar className="h-24 w-24">
            <AvatarImage
              src={`https://harol-lovers.up.railway.app${user.foto_url}`}
              alt="Foto de perfil"
            />
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 border shadow-sm cursor-pointer hover:bg-gray-50">
            <Camera className="h-4 w-4 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Formulario */}
      <Card className="bg-muted/30">
        <CardContent className="p-6 flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <Input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Usuario</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nombre de usuario"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Privacidad de la cuenta
            </label>
            <Select value={privacidad} onValueChange={setPrivacidad}>
              <SelectTrigger>
                <SelectValue>
                  {privacidad === "publica" ? (
                    <span className="flex items-center gap-2">
                      Pública <Globe className="h-4 w-4" />
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Privada <Lock className="h-4 w-4" />
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="publica">
                  <span className="flex items-center gap-2">
                    Pública <Globe className="h-4 w-4" />
                  </span>
                </SelectItem>
                <SelectItem value="privada">
                  <span className="flex items-center gap-2">
                    Privada <Lock className="h-4 w-4" />
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-4">
            <Link href="/viajero/cuenta/editar/cambContr">
                  <Button variant="secondary" className="w-full sm:w-auto">
                    Cambiar contraseña
                  </Button>
            </Link>
            <Button
              onClick={handleSave}
              className="bg-primary text-white hover:bg-primary/90 w-full sm:w-auto"
            >
              Aceptar cambios
            </Button>
            <Button
              variant="destructive"
              className="w-full sm:w-auto"
              onClick={handleDelete}
              disabled={loadingDelete}
            >
              {loadingDelete ? "Eliminando..." : "Eliminar cuenta"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

