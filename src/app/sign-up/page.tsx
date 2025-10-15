"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function SignUpPage() {
  // --- ESTADOS PARA LOS CAMPOS DEL FORMULARIO ---
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [foto, setFoto] = useState<File | null>(null); // Estado para el archivo de la foto
  
  // Estados para la UI
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  // --- LÓGICA DE ENVÍO DEL FORMULARIO ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // 1. Usamos FormData para poder enviar archivos (la foto)
    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("correo", correo);
    formData.append("password", password);
    if (foto) {
      formData.append("foto", foto);
    }

    try {
      // 2. Hacemos la petición POST al endpoint de registro
      const response = await fetch("https://harol-lovers.up.railway.app/auth/register", {
        method: "POST",
        body: formData, 
        // ¡OJO! No establecemos 'Content-Type'. El navegador lo hace automáticamente
        // por nosotros cuando enviamos un objeto FormData.
      });

      const data = await response.json();

      if (!response.ok) {
        // Si el servidor devuelve un error, lo mostramos
        throw new Error(data.message || "Error al registrar el usuario.");
      }
      
      // 3. Mostramos un mensaje de éxito y redirigimos al login
      setSuccessMessage(data.message + ". Serás redirigido para iniciar sesión.");
      setTimeout(() => {
        router.push("/sign-in");
      }, 3000); // Esperamos 3 segundos antes de redirigir

    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  // --- ESTRUCTURA Y DISEÑO (JSX con Tailwind CSS) ---
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <div className="flex w-full max-w-4xl min-h-[600px] overflow-hidden rounded-2xl shadow-2xl">
        
        {/* Panel Izquierdo: Imagen */}
        <div className="hidden lg:block lg:w-1/2">
          <Image
            src="/img/bellas_artes.jpg" // Asegúrate que esta imagen esté en public/img/
            alt="Mural del Palacio de Bellas Artes"
            width={1920}
            height={1080}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Panel Derecho: Formulario */}
        <div className="flex w-full flex-col items-center justify-center bg-card p-8 lg:w-1/2">
          <div className="w-full max-w-sm text-center">
            <form onSubmit={handleSubmit}>
              <h2 className="mb-2 text-3xl font-bold text-foreground">Regístrate</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Crea tu cuenta para empezar a compartir.
              </p>
              
              <div className="space-y-4 text-left">
                {/* NOTA: Tu HTML pedía "Nombre de usuario", pero el backend pide "nombre". Usamos "nombre". */}
                <Input
                  type="text"
                  placeholder="Nombre completo"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
                <Input
                  type="email"
                  placeholder="Correo electrónico"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                />
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {/* Campo para subir la foto de perfil */}
                <div>
                  <label htmlFor="foto" className="text-sm font-medium text-muted-foreground">
                    Foto de perfil (opcional)
                  </label>
                  <Input
                    id="foto"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={(e) => setFoto(e.target.files ? e.target.files[0] : null)}
                    className="mt-1"
                  />
                </div>
              </div>

              <p className="my-4 text-xs text-muted-foreground">
                Al registrarte, aceptas nuestras <Link href="#" className="underline">Condiciones y Política de privacidad</Link>.
              </p>

              {/* Mensajes de éxito o error */}
              {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
              {successMessage && <p className="mb-4 text-sm text-green-600">{successMessage}</p>}

              <Button type="submit" className="w-full py-3 text-lg font-semibold" style={{ backgroundColor: '#555', color: 'white' }}>
                Regístrate
              </Button>

              <div className="my-4 flex items-center">
                <div className="flex-grow border-t border-border"></div>
                <span className="mx-4 text-xs text-muted-foreground">o</span>
                <div className="flex-grow border-t border-border"></div>
              </div>

              <Button type="button" variant="outline" className="w-full">
                <Image src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google logo" width={20} height={20} className="mr-2"/>
                Continuar con Google
              </Button>

              <p className="mt-6 text-sm text-muted-foreground">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/sign-in" className="font-semibold text-primary hover:underline">
                  Iniciar sesión
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
