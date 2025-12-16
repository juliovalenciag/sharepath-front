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
import { useState, useEffect } from "react"; // Asegúrate de tener useEffect
import { cn } from "@/lib/utils";
import {
  MapPin,
  Mountain,
  Landmark,
  Sun,
  Compass,
  CheckCircle2,
} from "lucide-react";

// --- CONFIGURACIÓN VISUAL ---
const STATE_CONFIG: Record<
  string,
  { icon: any; color: string; bgColor: string }
> = {
  "Ciudad de México": {
    icon: MapPin,
    color: "text-rose-600",
    bgColor: "group-hover:bg-rose-50",
  },
  "Estado de México": {
    icon: Compass,
    color: "text-slate-600",
    bgColor: "group-hover:bg-slate-50",
  },
  Querétaro: {
    icon: Landmark,
    color: "text-amber-600",
    bgColor: "group-hover:bg-amber-50",
  },
  Morelos: {
    icon: Sun,
    color: "text-orange-500",
    bgColor: "group-hover:bg-orange-50",
  },
  Hidalgo: {
    icon: Mountain,
    color: "text-emerald-600",
    bgColor: "group-hover:bg-emerald-50",
  },
};

const PreguntaSchema = z.object({
  pregunta2: z
    .array(z.string())
    .min(1, "Seleccione al menos una opción")
    .max(3, "Seleccione máximo tres"),
});

type PreguntaValues = z.infer<typeof PreguntaSchema>;

// Función auxiliar para guardar datos
const updateFormData = (data: Partial<PreguntaValues>) => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("form-data");
    const currentData = stored ? JSON.parse(stored) : {};
    localStorage.setItem(
      "form-data",
      JSON.stringify({ ...currentData, ...data })
    );
  }
};

export default function Pregunta2Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const totalPreguntas = 3;

  // 1. CORRECCIÓN: Inicializamos SIEMPRE vacío para evitar el error de hidratación
  const form = useForm<PreguntaValues>({
    resolver: zodResolver(PreguntaSchema),
    defaultValues: { pregunta2: [] }, // Empieza vacío siempre
  });

  // 2. CORRECCIÓN: Cargamos los datos del LocalStorage después de montar el componente
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("form-data");
      if (stored) {
        const parsed = JSON.parse(stored);
        // Si hay datos guardados para la pregunta 2, actualizamos el formulario
        if (parsed.pregunta2 && Array.isArray(parsed.pregunta2)) {
          form.setValue("pregunta2", parsed.pregunta2);
        }
      }
    }
  }, [form]);

  const toggleValue = (
    currentArray: string[] = [],
    value: string
  ): string[] => {
    if (currentArray.includes(value)) {
      return currentArray.filter((v) => v !== value);
    }
    return [...currentArray, value];
  };

  const onSiguiente = (data: PreguntaValues) => {
    setIsLoading(true);
    updateFormData(data);
    router.push("/preferencias/pregunta3");
  };

  const currentSelection = form.watch("pregunta2") || [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSiguiente)} className="w-full">
        <PreguntaWrapper
          preguntaActual={2}
          totalPreguntas={totalPreguntas}
          onSiguiente={form.handleSubmit(onSiguiente)}
          isLoading={isLoading}
        >
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="pregunta2"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                    <FormLabel className="text-2xl font-bold text-blue-950">
                      2) ¿Qué estado visitas con mayor frecuencia?
                    </FormLabel>
                    <span
                      className={cn(
                        "text-xs font-medium px-3 py-1 rounded-full border transition-colors shrink-0",
                        currentSelection.length > 3
                          ? "bg-red-100 text-red-700 border-red-200"
                          : currentSelection.length === 0
                          ? "bg-gray-100 text-gray-500"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      )}
                    >
                      Seleccionados: {currentSelection.length} / 3
                    </span>
                  </div>

                  <FormControl>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                      {Object.keys(STATE_CONFIG).map((opt) => {
                        const isSelected = (field.value || []).includes(opt);
                        const config = STATE_CONFIG[opt] || {
                          icon: MapPin,
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
                              "group relative cursor-pointer flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 h-36 select-none",
                              isSelected
                                ? "border-primary bg-primary/5 shadow-md scale-[1.02] z-10"
                                : "border-gray-100 bg-white hover:border-primary/30 hover:shadow-sm hover:-translate-y-1",
                              isDisabledSelection &&
                                "opacity-50 cursor-not-allowed hover:transform-none hover:border-gray-100 grayscale-[50%]"
                            )}
                          >
                            <div
                              className={cn(
                                "p-3 rounded-full transition-all duration-300 mb-1",
                                isSelected
                                  ? "bg-white shadow-sm"
                                  : `bg-gray-50 ${config.bgColor}`
                              )}
                            >
                              <IconComponent
                                className={cn(
                                  "w-7 h-7 transition-colors duration-300",
                                  isSelected
                                    ? config.color
                                    : `text-gray-400 group-hover:${config.color}`
                                )}
                              />
                            </div>

                            <span
                              className={cn(
                                "text-sm font-medium text-center leading-tight transition-colors px-1",
                                isSelected
                                  ? "text-primary font-semibold"
                                  : "text-gray-600"
                              )}
                            >
                              {opt}
                            </span>

                            {isSelected && (
                              <div className="absolute top-3 right-3 animate-in zoom-in duration-200">
                                <CheckCircle2 className="w-5 h-5 text-primary fill-white" />
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
