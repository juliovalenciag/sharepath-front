"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "sonner"; 

export default function SignInPage() {
<<<<<<< HEAD
=======
  // --- LÓGICA DEL FORMULARIO ---
>>>>>>> c6c41dc (first-landing)
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); 

    
    const promise = fetch("https://harol-lovers.up.railway.app/auth", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ correo, password }),
    }).then(async (res) => {
        if (!res.ok) {
            
            const errorData = await res.json();
            throw new Error(errorData.message || 'Ocurrió un error.');
        }
        return res.json(); 
    });

    toast.promise(promise, {
      loading: "Iniciando sesión...",
      success: (data) => {
        if (data && data.token) {
            localStorage.setItem("authToken", data.token);
            setTimeout(() => router.push("/dashboard"), 1000); 
            return "¡Bienvenido de vuelta!";
        }
        
        throw new Error("Respuesta inválida del servidor.");
      },
      error: (error) => {
       
        return error.message || "Credenciales incorrectas o error de red.";
      },
      finally: () => {
        setIsLoading(false); 
      }
    });
  };

  // --- ESTRUCTURA Y DISEÑO (JSX) ---
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
       <div className="flex w-full max-w-4xl min-h-[600px] overflow-hidden rounded-2xl shadow-2xl">
        
        {/* Panel Izquierdo: Imagen */}
        <div className="hidden lg:block lg:w-1/2">
          <Image
            src="/img/bellas_artes.jpg"
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
              <Image 
                src="/img/login.png" 
                alt="Icono de login"
                width={60}
                height={60}
                className="mx-auto mb-4"
              />
              <h2 className="mb-6 text-3xl font-bold text-foreground">Iniciar Sesión</h2>
              
              <div className="mb-4 space-y-2">
                <Input
                  type="email"
                  placeholder="Correo electrónico"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                  disabled={isLoading}
                  className="py-6"
                />
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="py-6 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
              </div>

              <div className="mb-6 text-right">
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary hover:underline">
                  Olvidé mi contraseña
                </Link>
              </div>

              

              <Button type="submit" className="w-full py-6 text-lg font-semibold" style={{ backgroundColor: '#555', color: 'white' }} disabled={isLoading}>
                {isLoading ? "Verificando..." : "Iniciar sesión"}
              </Button>

              <div className="my-6 flex items-center">
                <div className="flex-grow border-t border-border"></div>
                <span className="mx-4 text-xs text-muted-foreground">o</span>
                <div className="flex-grow border-t border-border"></div>
              </div>

              <Button type="button" variant="outline" className="w-full py-6" disabled={isLoading}>
                <Image 
                  src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" 
                  alt="Google logo"
                  width={22}
                  height={22}
                  className="mr-3"
                />
                Iniciar Sesión con Google
              </Button>

              <p className="mt-8 text-sm text-muted-foreground">
                ¿Aún no tienes una cuenta?{" "}
                <Link href="/sign-up" className="font-semibold text-primary hover:underline">
                  Regístrate
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

