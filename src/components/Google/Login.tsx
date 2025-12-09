"use client";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState<string | null>(null);
  const router = useRouter();

  async function handleSuccess(credentialResponse: CredentialResponse) {
    try {
      if (!credentialResponse.credential) {
        toast.error("No se recibió el token de Google.");
        return;
      }
      // const { payload } = decodeJwt(credentialResponse.credential);
      // console.log("payload credential", payload);
      // setEmail(payload.email);
      const response = await fetch("/api/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: credentialResponse.credential,
        }),
      });

      const json = await response.json();
      console.log("verify:", json);

      //validacion de cuenta
      if (!response.ok && json.registered === false) {
        toast.error(json.message || "Cuenta no registrada.");
        setTimeout(() => router.push("/sign-up"), 1500);
        return;
      }

      if (response.ok && json.username) {
        setEmail(json.email);
        localStorage.setItem("authToken", json.token); 
      toast.success(`¡Bienvenido de vuelta!, ${json.username}`);

        const redirect = json.role === "admin" ? "/admin-dashboard" : "/viajero";
        
        setTimeout(() => router.push(redirect), 1000);
        return;
      }

      toast.error("No se pudo iniciar sesión.");
    } catch (error) {
      console.error(error);
      toast.error("Error al conectarse con el servidor.");
    }
  }

  function handleError() {
    toast.error("Error al iniciar sesión con Google.");
  }
  return (
    // verificar email
    <div>
      {!email && (
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          //useOneTap
        />
      )}
    </div>
  );
}