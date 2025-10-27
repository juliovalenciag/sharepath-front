"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CambiarContraseñaPage() {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validaciones básicas
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("Por favor llena todos los campos.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Las contraseñas nuevas no coinciden.");
      return;
    }
    if (newPassword.length < 8) {
      alert("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("https://harol-lovers.up.railway.app/user/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("authToken") || "",
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      if (res.ok) {
        alert("Contraseña actualizada correctamente.");
        router.push("/dashboard/cuenta");
      } else {
        const msg = await res.text();
        alert("Error al cambiar la contraseña: " + msg);
      }
    } catch (error) {
      console.error(error);
      alert("Hubo un problema al cambiar la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto flex flex-col gap-6">
      {/* Botón de regreso */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-sm text-muted-foreground hover:text-primary transition"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver
      </button>

      {/* Título */}
      <h1 className="text-2xl font-semibold mb-4">Cambiar contraseña</h1>

      {/* Formulario */}
      <div className="flex flex-col gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Contraseña actual</label>
          <Input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="********"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Nueva contraseña</label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="********"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Mínimo 8 caracteres con al menos 2 caracteres especiales.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Ingrese de nuevo la nueva contraseña
          </label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="********"
          />
        </div>

        <div className="flex justify-end mt-6">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#699197] text-white hover:bg-[#5c8288]"
          >
            {loading ? "Guardando..." : "Aceptar cambios"}
          </Button>
        </div>
      </div>
    </div>
  );
}
