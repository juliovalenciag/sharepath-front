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
import { Usuario } from "@/api/interfaces/ApiRoutes";
import { ItinerariosAPI } from "@/api/ItinerariosAPI";
import { toast } from "sonner";

export default function EditAccountPage() {
  const api = ItinerariosAPI.getInstance();

  const router = useRouter();
  const [user, setUser] = useState<Usuario | null>(null);
  const [nombre, setNombre] = useState("");
  const [username, setUsername] = useState("");
  const [privacidad, setPrivacidad] = useState("publica");
  const [loadingDelete, setLoadingDelete] = useState(false);

  // foto seleccionada y preview local
  const [foto, setFoto] = useState<File | undefined>(undefined);
  const [preview, setPreview] = useState<string | null>(null);

  // Obtener datos del usuario al montar
  useEffect(() => {
    api.getUser().then((data) => {
      setUser(data);
      setNombre(data.nombre_completo || "");
      setUsername(data.username || "");
      setPrivacidad(data.privacity_mode ? "publica" : "privada");
      // establecer preview inicial desde la URL del usuario
      setPreview(data.foto_url || null);
    });
  }, []);

  const handleSave = async () => {
    if (!user) return;
    const body = {
      nombre_completo: nombre,
      username,
      privacity_mode: privacidad === "publica",
      ...(foto ? { foto } : {}),
    }
    toast.promise(
      api.updateUser(body),
      {
        loading: "Guardando cambios...",
        success: (data) => {
          setUser(data);
          setNombre(data.nombre_completo || "");
          setUsername(data.username || "");
          setPrivacidad(data.privacity_mode ? "publica" : "privada");
          // establecer preview inicial desde la URL del usuario
          setPreview(data.foto_url || null);
          return "Perfil actualizado correctamente";
        },
        error: (err) => {
          return `${err.message}`
        },
      }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    setFoto(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const handleDelete = async () => {
    if (loadingDelete) return;

    setLoadingDelete(true);


    toast.promise(api.deleteUser(), {
      loading: "Eliminando cuenta...",
      success: () => {
        localStorage.removeItem("authToken");
        router.push("/sign-up");
        setLoadingDelete(false);
        return "Cuenta eliminada correctamente";
      },
      error: (err) => {
        setLoadingDelete(false);
        return `Error al eliminar la cuenta: ${err.message}`;
      }
    })
    
    
    
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
          {/* input oculto para seleccionar foto; avatar clickable mediante label */}
          <input
            id="foto-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <label htmlFor="foto-input" className="cursor-pointer">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={preview || user.foto_url || ""}
                alt="Foto de perfil"
              />
              <AvatarFallback>
                { `${user.username?.charAt(0).toUpperCase()}${user.username?.charAt(1)?.toUpperCase()}` || "U" }
              </AvatarFallback>
            </Avatar>
          </label>
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

