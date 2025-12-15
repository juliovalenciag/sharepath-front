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
import { Usuario } from "@/api/interfaces/ApiRoutes";
import { ItinerariosAPI } from "@/api/ItinerariosAPI";
import { toast } from "sonner";
import { z, ZodError } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

function isZodError(err: unknown): err is ZodError {
  return err instanceof ZodError;
}

export default function EditAccountPage() {
  const api = ItinerariosAPI.getInstance();

  const router = useRouter();
  const [user, setUser] = useState<Usuario | null>(null);
  // estado local solo para preview/foto/privacidad
  const [privacidad, setPrivacidad] = useState("publica");
  const [loadingDelete, setLoadingDelete] = useState(false);

  // foto seleccionada y preview local
  const [foto, setFoto] = useState<File | undefined>(undefined);
  const [preview, setPreview] = useState<string | null>(null);

  // Zod schema para validaciones (nombre y username)
  const profileSchema = z.object({
    nombre_completo: z
      .string()
      .trim()
      .min(1, "El nombre es requerido")
      .regex(
        /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/,
        "El nombre solo puede contener letras y espacios"
      ),
    username: z
      .string()
      .trim()
      .min(5, "El nombre de usuario debe tener al menos 5 caracteres"),
  });

  type ProfileForm = z.infer<typeof profileSchema>;

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nombre_completo: "",
      username: "",
    },
  });

  // --- Estado y validaciones para cambio de contraseña ---
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [verified, setVerified] = useState(false); // Es un booleano
  const [verifying, setVerifying] = useState(false);
  const [updating, setUpdating] = useState(false);

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$_?¿*]).{8,}$/;

  const verifySchema = z.string().min(1, "Ingresa tu contraseña actual");
  const newPasswordSchema = z
    .string()
    .min(8, "La contraseña debe tener mínimo 8 caracteres.")
    .regex(passwordRegex, {
      message:
        "La contraseña debe contener mayúscula, minúscula, número y un carácter especial válido (#, $, _, ?, ¿, *).",
    });

  // Obtener datos del usuario al montar
  useEffect(() => {
    api.getUser().then((data) => {
      setUser(data);
      // reset del formulario con valores del usuario
      form.reset({
        nombre_completo: data.nombre_completo || "",
        username: data.username || "",
      });
      setPrivacidad(data.privacity_mode ? "publica" : "privada");
      // establecer preview inicial desde la URL del usuario
      setPreview(data.foto_url || null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (values: ProfileForm) => {
    if (!user) return;

    const body: any = {
      nombre_completo: values.nombre_completo.trim(),
      username: values.username.trim(),
      privacity_mode: privacidad === "publica",
      ...(foto ? { foto } : {}),
    };

    toast.promise(
      api.updateUser(body),
      {
        loading: "Guardando cambios...",
        success: (data) => {
          setUser(data);
          form.reset({
            nombre_completo: data.nombre_completo || "",
            username: data.username || "",
          });
          setPrivacidad(data.privacity_mode ? "publica" : "privada");
          setPreview(data.foto_url || null);
          return "Perfil actualizado correctamente";
        },
        error: (err) => {
          return `${err.message}`;
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

  const executeDelete = async () => {
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
    });
  };

  const handleDeleteClick = () => {
    toast("¿Estás seguro de eliminar tu cuenta?", {
      description: "Esta acción es permanente y perderás todos tus datos.",
      action: {
        label: "Eliminar definitivamente",
        onClick: () => executeDelete(),
      },
      cancel: {
        label: "Cancelar",
        onClick: () => {}, // No hace nada, solo cierra el toast
      },
      // Estilo rojo para indicar peligro (consistente con tu FriendsPage)
      actionButtonStyle: { backgroundColor: "var(--destructive)", color: "white" },
      duration: 5000, 
    });
  };

  const handleVerifyCurrent = async () => {
    try {
      verifySchema.parse(currentPassword);
    } catch (err) {
      if (isZodError(err)) {
        toast.error(err.issues[0].message);
      } else {
        toast.error("Contraseña inválida");
      }
      return;
    }

    setVerifying(true);
    try {
      const resp = await api.verifyPassword({ password: currentPassword });
      toast.success(resp.message);      
      
      // CORRECCIÓN PRINCIPAL: verified es booleano, no string.
      setVerified(true); 

    } catch (error: any) {      
      toast.error(error?.message || "Error al verificar contraseña.");
      setVerified(false);
    } finally {
      setVerifying(false);
    }
  };

  const handleUpdatePassword = async () => {
    try {
      newPasswordSchema.parse(newPassword);
    } catch (err) {
      if (isZodError(err)) {
        toast.error(err.issues[0].message);
      } else {
        toast.error("Contraseña inválida");
      }
      return;
    }

    if (!verified) {
      toast.error("Primero verifica tu contraseña actual.");
      return;
    }

    setUpdating(true);
    // Ajusta los campos según lo que espere el backend si es necesario
    const bodyd = {
      newPassword: newPassword,
    };

    toast.promise(
      api.updatePassword(bodyd),
      {
        loading: "Cambiando contraseña...",
        success: (data) => {
          setVerified(false);
          setCurrentPassword("");
          setNewPassword("");
          setUpdating(false); // CORRECCIÓN: Resetear estado de carga
          return "Contraseña actualizada correctamente";
        },
        error: (err) => {
          setUpdating(false); // CORRECCIÓN: Resetear estado de carga en error
          return err.message || "Error al actualizar contraseña";
        },
      }
    ); // CORRECCIÓN: Se agregó ;
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
                {user.username ? user.username.slice(0, 2).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
          </label>
           <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 border shadow-sm cursor-pointer hover:bg-gray-50">
             <Camera className="h-4 w-4 text-gray-600" />
           </div>
         </div>
       </div>

      {/* Formulario usando react-hook-form + zod */}
      <Card className="bg-muted/30">
        <CardContent className="p-6 flex flex-col gap-5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)}>
              <FormField
                control={form.control}
                name="nombre_completo"
                render={({ field }) => (
                  <FormItem>
                    <label className="block text-sm font-medium mb-1">Nombre</label>
                    <FormControl>
                      <Input
                        placeholder="Nombre completo"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <label className="block text-sm font-medium mb-1">Usuario</label>
                    <FormControl>
                      <Input
                        placeholder="Nombre de usuario"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                <Button
                  type="submit"
                  className="bg-primary text-white dark:text-black hover:bg-primary/90 w-full sm:w-auto"
                >
                  Aceptar cambios
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  className="w-full sm:w-auto"
                  onClick={handleDeleteClick}
                  disabled={loadingDelete}
                >
                  {loadingDelete ? "Eliminando..." : "Eliminar cuenta"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>

        {/* Formulario para verificar y actualizar contraseña */}
        <CardContent className="p-6 border-t">
          <h3 className="text-lg font-medium mb-3">Actualizar contraseña</h3>

          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Contraseña actual</label>
              <Input
                type="password"
                placeholder="Ingresa tu contraseña actual"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={handleVerifyCurrent} disabled={verifying}>
                {verifying ? "Verificando..." : "Verificar contraseña"}
              </Button>
              {verified && <span className="text-sm text-green-600">Contraseña verificada</span>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nueva contraseña</label>
              <Input
                type="password"
                placeholder="Nueva contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={!verified}
              />
              <p className="text-xs text-muted-foreground mt-1">
                La contraseña debe tener mínimo 8 caracteres, incluir mayúscula, minúscula, número y un carácter especial (#, $, _, ?, ¿, *).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={handleUpdatePassword} disabled={!verified || updating}>
                {updating ? "Actualizando..." : "Cambiar contraseña"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}