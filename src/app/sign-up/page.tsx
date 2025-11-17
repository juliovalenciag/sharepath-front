"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

// Importaciones de los componentes de Formulario de Shadcn UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FiEye, FiEyeOff } from "react-icons/fi";

// 1. Definimos el "contrato" de validación con Zod
const formSchema = z.object({
  nombre_completo: z.string()
    .min(10, {
      message: "El nombre debe tener al menos 10 caracteres.",
    })
    .refine((name) => {
      // Solo acepta letras y espacios, no números ni caracteres especiales
      const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
      return nameRegex.test(name);
    }, {
      message: "El nombre solo debe contener letras, sin números ni caracteres especiales.",
    })
    .refine((name) => {
      // No debe contener múltiples espacios consecutivos o puntos inválidos
      const invalidPattern = /\s{2,}|\.\s|\s\./;
      return !invalidPattern.test(name);
    }, {
      message: "El nombre no puede contener múltiples espacios consecutivos o puntos inválidos.",
    }),
  
  correo: z.string()
    .min(1, {
      message: "El correo es requerido.",
    })
    .refine((email) => {
      // Valida: @gmail.com, @hotmail.com, @alumno.ipn.mx
      const emailRegex = /^[^\s@]+@(gmail\.com|hotmail\.com|alumno\.ipn\.mx|[^\s@]+\.com)$/i;
      return emailRegex.test(email);
    }, {
      message: "El correo debe terminar con @gmail.com, @hotmail.com, @alumno.ipn.mx.",
    }),
  
  password: z.string()
    .min(8, {
      message: "La contraseña debe tener mínimo 8 caracteres.",
    })
    .refine((password) => {
      // Debe contener mayúscula, minúscula, número y caracteres especiales válidos (#, $, _, ?, ¿, *)
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$_?¿*]).{8,}$/;
      return passwordRegex.test(password);
    }, {
      message: "La contraseña debe contener mayúscula, minúscula, número y un carácter especial válido (#, $, _, ?, ¿, *).",
    }),
  
  username: z.string()
    .min(5, {
      message: "El username debe tener al menos 5 caracteres.",
    })
    .refine((username) => {
      // Debe iniciar con una letra, no con número ni carácter especial
      const startsWithLetter = /^[a-zA-Z]/.test(username);
      return startsWithLetter;
    }, {
      message: "El username debe comenzar con una letra.",
    })
    .refine((username) => {
      // No debe contener múltiples espacios consecutivos o puntos inválidos
      const invalidPattern = /\s{2,}|\.\s|\s\./;
      return !invalidPattern.test(username);
    }, {
      message: "El username no puede contener múltiples espacios consecutivos o puntos inválidos.",
    }),
  
  foto: z.instanceof(File).optional(),
});

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // 2. Configuramos el formulario con React Hook Form y el resolver de Zod
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre_completo: "",
      correo: "",
      password: "",
      username: "",
    },
  });

  // 3. La lógica de envío ahora recibe los datos validados del formulario
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append("nombre_completo", values.nombre_completo);
    formData.append("correo", values.correo);
    formData.append("password", values.password);
    formData.append("username", values.username);
    if (values.foto) {
      formData.append("foto", values.foto);
    }

    const promise = fetch("https://harol-lovers.up.railway.app/auth/register", {
      method: "POST",
      body: formData,
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "No se pudo completar el registro.");
      }
      // Necesario el token del usuario 
      const formJSON = Object.fromEntries(formData.entries()); 
     const loginRes = await fetch("https://harol-lovers.up.railway.app/auth", { // espera a promise 
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ correo: formJSON.correo, password: formJSON.password }),
      })
    const loginData = await loginRes.json(); 
    localStorage.setItem("token", loginData.token); // obtener el token 
    console.log("token new user: ",loginData.token); 

      return res.json();
    });

    toast.promise(promise, {
      loading: "Creando tu cuenta...",
      success: (data) => {
        setTimeout(() => router.push("/preferencias/pregunta1"), 3000);
        return "¡Registro exitoso! Serás redirigido para darnos tus preferencias.";
      },
      error: (error) => error.message,
      finally: () => setIsLoading(false),
    });
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <div className="flex w-full max-w-4xl min-h-[600px] overflow-hidden rounded-2xl shadow-2xl">
        {/* Panel Izquierdo: Imagen */}
        <div className="hidden lg:block lg:w-1/2">
          <Image src="/img/bellas_artes.jpg" alt="Mural" width={1920} height={1080} className="h-full w-full object-cover" />
        </div>

        {/* Panel Derecho: Formulario */}
        <div className="flex w-full flex-col items-center justify-center bg-card p-8 lg:w-1/2">
          <div className="w-full max-w-sm text-center">
            <h2 className="mb-2 text-3xl font-bold">Regístrate</h2>
            <p className="mb-6 text-sm text-muted-foreground">Crea tu cuenta para empezar a explorar.</p>

            {/* 4. Envolvemos el formulario con los componentes de Shadcn UI */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nombre_completo"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Nombre completo" {...field} className="py-6" disabled={isLoading} />
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
                      <FormControl>
                        <Input placeholder="Username" {...field} className="py-6" disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="correo"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="email" placeholder="Correo electrónico" {...field} className="py-6" disabled={isLoading} />
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
                            className="py-6 pr-10"
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
                
                <p className="text-xs text-muted-foreground">
                    Al registrarte, aceptas nuestras <Link href="/sign-up/terminos" className="underline">Terminos y Condiciones</Link>.
                </p>

                <Button type="submit" className="w-full py-6 text-lg font-semibold" style={{ backgroundColor: '#555', color: 'white' }} disabled={isLoading}>
                  {isLoading ? "Registrando..." : "Regístrate"}
                </Button>
              </form>
            </Form>
            
            <p className="mt-8 text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/sign-in" className="font-semibold text-primary hover:underline">
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

