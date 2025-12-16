"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PreguntaWrapper } from "@/components/cuestionario/PreguntaWrapper";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Map,
  UtensilsCrossed,
  Drama,
  Music2,
  Footprints,
  ShoppingBag,
  Popcorn,
  Landmark,
  Moon,
  CheckCircle2,
} from "lucide-react";

// --- CONFIGURACIÓN VISUAL (Iconos de Actividades) ---
const ACTIVITY_CONFIG: Record<
  string,
  { icon: any; color: string; bgColor: string }
> = {
  Tours: {
    icon: Map,
    color: "text-blue-600",
    bgColor: "group-hover:bg-blue-50",
  },
  "Probar comida": {
    icon: UtensilsCrossed,
    color: "text-orange-500",
    bgColor: "group-hover:bg-orange-50",
  },
  Culturales: {
    icon: Drama,
    color: "text-purple-600",
    bgColor: "group-hover:bg-purple-50",
  },
  Bailar: {
    icon: Music2,
    color: "text-pink-500",
    bgColor: "group-hover:bg-pink-50",
  },
  Caminatas: {
    icon: Footprints,
    color: "text-emerald-600",
    bgColor: "group-hover:bg-emerald-50",
  },
  Compras: {
    icon: ShoppingBag,
    color: "text-indigo-600",
    bgColor: "group-hover:bg-indigo-50",
  },
  Entretenimiento: {
    icon: Popcorn,
    color: "text-red-500",
    bgColor: "group-hover:bg-red-50",
  },
  "Visitar Museos": {
    icon: Landmark,
    color: "text-amber-700",
    bgColor: "group-hover:bg-amber-50",
  },
  "Vida nocturna": {
    icon: Moon,
    color: "text-slate-700",
    bgColor: "group-hover:bg-slate-50",
  },
};

const PreguntaSchema = z.object({
  pregunta3: z
    .array(z.string())
    .min(1, "Seleccione al menos una opción")
    .max(3, "Seleccione máximo tres"),
});
type PreguntaValues = z.infer<typeof PreguntaSchema>;

// Funciones de utilidad para localStorage
const loadFormData = () => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("form-data");
    return stored ? JSON.parse(stored) : {};
  }
  return {};
};

const updateFormData = (data: Partial<PreguntaValues>) => {
  if (typeof window !== "undefined") {
    const currentData = loadFormData();
    localStorage.setItem(
      "form-data",
      JSON.stringify({ ...currentData, ...data })
    );
  }
};

export default function Pregunta3Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const totalPreguntas = 3;

  // 1. Inicializamos vacío para evitar Hydration Error
  const form = useForm<PreguntaValues>({
    resolver: zodResolver(PreguntaSchema),
    defaultValues: { pregunta3: [] },
  });

  // 2. Cargamos datos del cliente después de montar
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = loadFormData();
      if (stored.pregunta3 && Array.isArray(stored.pregunta3)) {
        form.setValue("pregunta3", stored.pregunta3);
      }
    }
  }, [form]);

  // Variables para la UI
  const currentSelection = form.watch("pregunta3") || [];
  const selectedCount = currentSelection.length;

  const toggleValue = (
    currentArray: string[] = [],
    value: string
  ): string[] => {
    if (currentArray.includes(value)) {
      return currentArray.filter((v) => v !== value);
    }
    return [...currentArray, value];
  };

  const onGuardar = async (data: PreguntaValues) => {
    setIsLoading(true);

    // 1. Guardar la respuesta localmente primero
    updateFormData(data);

    // 2. Obtener TODAS las respuestas acumuladas
    const finalData = loadFormData();
    console.log("Datos FINALES enviados:", finalData);

    try {
      const token = localStorage.getItem("authToken");
      console.log("token del new user: ", token);

      // Petición al Backend
      const res = await fetch(
        "https://harol-lovers.up.railway.app/preferencias/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: `Bearer ${token}`, // Mantenemos tu formato de token
          },
          body: JSON.stringify({
            lugares_preferidos: finalData.pregunta1 || [],
            estados_visitados: finalData.pregunta2 || [],
            actividades_preferidas: data.pregunta3, // Usamos la data actual
          }),
        }
      );

      const text = await res.text();
      console.log("response:", text);

      if (!res.ok) throw new Error(text);

      toast.success("¡Preferencias guardadas con éxito!");

      // Limpiar localStorage opcionalmente si ya no se necesita
      // localStorage.removeItem('form-data');

      router.push("/viajero");
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar preferencias", {
        description: "Por favor intenta de nuevo.",
      });
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onGuardar)} className="w-full">
        <PreguntaWrapper
          preguntaActual={3}
          totalPreguntas={totalPreguntas}
          // En la última pregunta, onSiguiente suele no usarse o redirigir a guardar
          onSiguiente={form.handleSubmit(onGuardar)}
          onGuardar={form.handleSubmit(onGuardar)}
          isLoading={isLoading}
          selectedCount={selectedCount}
        >
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="pregunta3"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  {/* Encabezado */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                    <FormLabel className="text-2xl font-bold text-blue-950">
                      3) ¿Qué actividades prefieres hacer?
                    </FormLabel>
                    <span
                      className={cn(
                        "text-xs font-medium px-3 py-1 rounded-full border transition-colors shrink-0",
                        selectedCount > 3
                          ? "bg-red-100 text-red-700 border-red-200"
                          : selectedCount === 0
                          ? "bg-gray-100 text-gray-500"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      )}
                    >
                      Seleccionados: {selectedCount} / 3
                    </span>
                  </div>

                  <FormControl>
                    {/* Grid Layout */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                      {Object.keys(ACTIVITY_CONFIG).map((opt) => {
                        const isSelected = (field.value || []).includes(opt);
                        const config = ACTIVITY_CONFIG[opt] || {
                          icon: Map,
                          color: "text-gray-500",
                          bgColor: "bg-gray-50",
                        };
                        const IconComponent = config.icon;
                        const isDisabledSelection =
                          !isSelected && field.value?.length >= 3;

                        return (
                          <div
                            key={opt}
                            onClick={() => {
                              if (isDisabledSelection) return;
                              field.onChange(toggleValue(field.value, opt));
                            }}
                            className={cn(
                              "group relative cursor-pointer flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 h-32 select-none",
                              isSelected
                                ? "border-primary bg-primary/5 shadow-md scale-[1.02] z-10"
                                : "border-gray-100 bg-white hover:border-primary/30 hover:shadow-sm hover:-translate-y-1",
                              isDisabledSelection &&
                                "opacity-50 cursor-not-allowed hover:transform-none hover:border-gray-100 grayscale-[50%]"
                            )}
                          >
                            <div
                              className={cn(
                                "p-3 rounded-full transition-all duration-300",
                                isSelected
                                  ? "bg-white shadow-sm"
                                  : `bg-gray-50 ${config.bgColor}`
                              )}
                            >
                              <IconComponent
                                className={cn(
                                  "w-6 h-6 transition-colors duration-300",
                                  isSelected
                                    ? config.color
                                    : `text-gray-400 group-hover:${config.color}`
                                )}
                              />
                            </div>

                            <span
                              className={cn(
                                "text-sm font-medium text-center leading-tight transition-colors",
                                isSelected
                                  ? "text-primary font-semibold"
                                  : "text-gray-600"
                              )}
                            >
                              {opt}
                            </span>

                            {isSelected && (
                              <div className="absolute top-2 right-2 animate-in zoom-in duration-200">
                                <CheckCircle2 className="w-4 h-4 text-primary fill-white" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage className="text-center font-medium bg-red-50 p-2 rounded-md border border-red-100" />
                </FormItem>
              )}
            />
          </div>
        </PreguntaWrapper>
      </form>
    </Form>
  );
}
