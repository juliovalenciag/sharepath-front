"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "sonner";
import Login from "@/components/Google/Login";
import { GoogleOAuthProvider } from "@react-oauth/google"; // API DE GOOGLE OAUTH 
import { Usuario } from "@/api/interfaces/ApiRoutes";
import { ItinerariosAPI } from "@/api/ItinerariosAPI";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  correo: z.string()
    .refine((email) => {
      const emailRegex = /^[^\s@]+@(gmail\.com|hotmail\.com|alumno\.ipn\.mx)$/i;
      return emailRegex.test(email);
    }, {
      message: "El correo debe terminar con @gmail.com, @hotmail.com, @alumno.ipn.mx.",
    }),
  password: z.string()
    .min(8, {
      message: "La contraseña debe tener mínimo 8 caracteres.",
    })
    .refine((password) => {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$_?¿*]).{8,}$/;
      return passwordRegex.test(password);
    }, {
      message: "La contraseña debe contener mayúscula, minúscula, número y un carácter especial válido (#, $, _, ?, ¿, *).",
    })
})

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Uso de la API
  const api = ItinerariosAPI.getInstance();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      correo: "",
      password: ""
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    const promise: Promise<Usuario> = api.doLogin(values.correo, values.password);

    toast.promise(promise, {
      loading: "Iniciando sesión...",
      success: (data) => {
        const userRole = data.role;
        let redirectPath = '/viajero';

        if (userRole === 'admin') {
          redirectPath = '/admin-dashboard';
        }
        router.push(redirectPath)
        return `¡Bienvenido de vuelta ${data.username}`;
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
    <GoogleOAuthProvider clientId="934272342967-it58ahq1jmjt347vm7t1mopi7hnql9dl.apps.googleusercontent.com">
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

              <Form {...form}>
                <form onSubmit={ form.handleSubmit(handleSubmit) } >
                  <Image
                    src="/img/login.png"
                    alt="Icono de login"
                    width={60}
                    height={60}
                    className="mx-auto mb-4"
                  />
                  <h2 className="mb-6 text-3xl font-bold text-foreground">Iniciar Sesión</h2>

                  <FormField
                    control={form.control}
                    name="correo"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="email"
                            placeholder="Correo(@gmail.com, @hotmail.com, @alumno.ipn.mx)" {...field}
                            className="py-6"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Contraseña"
                              {...field}
                              className="py-6 pr-10 mt-4"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            aria-label="Toggle password visibility"
                          >
                            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="mb-6 text-right">
                    <Link href="/recover-password"
                      className="text-sm text-muted-foreground hover:text-primary hover:underline"
                    >
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
                  {/* Funcion de google */}
                  <div className="flex justify-center"><Login /></div>


                  <p className="mt-8 text-sm text-muted-foreground">
                    ¿Aún no tienes una cuenta?{" "}
                    <Link href="/sign-up" className="font-semibold text-primary hover:underline">
                      Regístrate
                    </Link>
                  </p>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </main>
    </GoogleOAuthProvider>
  );
}

