"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FiMail, FiUser } from "react-icons/fi";
import { toast } from "sonner";

export default function RecoverPasswordPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Expresiones regulares
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  const usernameRegex = /^[a-zA-Z0-9]{3,15}$/;

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación del correo
    if (!gmailRegex.test(correo)) {
      toast.error("Por favor ingresa un correo válido que termine en @gmail.com");
      return;
    }

    // Validación del nombre de usuario
    if (!usernameRegex.test(username)) {
      toast.error("El nombre de usuario debe tener entre 3 y 15 caracteres alfanuméricos.");
      return;
    }

    setIsLoading(true);

    const promise = fetch("http://localhost:4000/auth/recover", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ correo, username }),
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al enviar el código.");
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: "Enviando código de verificación...",
      success: (data) => {
        setTimeout(() => router.push("/verify-code"), 1500);
        return `Código enviado al correo ${correo}`;
      },
      error: (error) => error.message || "Error al enviar el código.",
      finally: () => setIsLoading(false),
    });
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <div className="flex w-full max-w-4xl min-h-[600px] overflow-hidden rounded-2xl shadow-2xl">
        
        {/* Panel Izquierdo: Imagen */}
        <div className="hidden lg:block lg:w-1/2">
          <Image
            src="/img/cdmx-light.jpg"
            alt="Ciudad de México"
            width={1920}
            height={1080}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Panel Derecho: Formulario */}
        <div className="flex w-full flex-col items-center justify-center bg-card p-8 lg:w-1/2">
          <div className="w-full max-w-sm text-center">
            <form onSubmit={handleRecover}>
              <Image 
                src="/img/candado.png" 
                alt="Icono candado"
                width={60}
                height={60}
                className="mx-auto mb-4"
              />
              <h2 className="mb-6 text-3xl font-bold text-foreground">
                Recuperar contraseña
              </h2>

              <div className="mb-4 space-y-2">
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  <Input
                    type="text"
                    placeholder="Nombre de usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                    className="py-6 pl-10"
                  />
                </div>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  <Input
                    type="email"
                    placeholder="Correo electrónico (solo Gmail)"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    required
                    disabled={isLoading}
                    className="py-6 pl-10"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-6 text-lg font-semibold"
                style={{ backgroundColor: "#555", color: "white" }}
                disabled={isLoading}
              >
                {isLoading ? "Enviando..." : "Enviar código de verificación"}
              </Button>

              <p className="mt-6 text-sm text-muted-foreground">
                ¿Ya recuerdas tu contraseña?{" "}
                <Link href="/sign-in" className="font-semibold text-primary hover:underline">
                  Inicia sesión
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
