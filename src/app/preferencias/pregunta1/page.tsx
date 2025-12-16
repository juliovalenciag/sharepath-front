'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { PreguntaWrapper } from '@/components/cuestionario/PreguntaWrapper';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  MapPin, 
  Landmark, 
  Trees, 
  Tent, 
  Utensils, 
  Coffee, 
  Beer, 
  Ticket, 
  PawPrint,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

// ... (MANTÉN TU CONFIGURACIÓN DE ICONOS IGUAL) ...
const CATEGORY_CONFIG: Record<string, { icon: any, color: string }> = {
  'Pueblos mágicos': { icon: Sparkles, color: 'text-purple-500' },
  'Zonas arqueológicas': { icon: MapPin, color: 'text-amber-600' },
  'Museos': { icon: Landmark, color: 'text-blue-500' },
  'Parques': { icon: Trees, color: 'text-green-500' },
  'Zoológicos': { icon: PawPrint, color: 'text-orange-500' },
  'Parques de diversión': { icon: Ticket, color: 'text-red-500' },
  'Campamentos': { icon: Tent, color: 'text-emerald-600' },
  'Restaurantes': { icon: Utensils, color: 'text-slate-600' },
  'Cafes': { icon: Coffee, color: 'text-amber-800' },
  'Bares': { icon: Beer, color: 'text-yellow-500' },
};

const PreguntaSchema = z.object({
  pregunta1: z.array(z.string()).min(1, "Seleccione al menos una opción").max(3, "Seleccione máximo tres"),
});

type PreguntaValues = z.infer<typeof PreguntaSchema>;

// Función auxiliar simple para leer (la usaremos dentro del efecto)
const getStoredData = () => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('form-data');
        return stored ? JSON.parse(stored) : null;
    }
    return null;
};

const updateFormData = (data: Partial<PreguntaValues>) => {
    if (typeof window !== 'undefined') {
        // Leemos directo del localStorage para no perder otras respuestas
        const stored = localStorage.getItem('form-data');
        const currentData = stored ? JSON.parse(stored) : {};
        localStorage.setItem('form-data', JSON.stringify({ ...currentData, ...data }));
    }
};

export default function Pregunta1Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const totalPreguntas = 3; 

  // 1. CAMBIO IMPORTANTE: Inicializamos SIEMPRE vacío para evitar el error de hidratación
  const form = useForm<PreguntaValues>({
    resolver: zodResolver(PreguntaSchema),
    defaultValues: { pregunta1: [] }, 
  });

  // 2. CAMBIO IMPORTANTE: Cargamos los datos SOLO después de que el componente se monta
  useEffect(() => {
    const stored = getStoredData();
    if (stored && stored.pregunta1) {
      // Reseteamos el formulario con los datos guardados
      form.reset({ pregunta1: stored.pregunta1 });
    }
  }, [form]); // Se ejecuta una sola vez al montar
  
  const toggleValue = (currentArray: string[] = [], value: string): string[] => {
    if (currentArray.includes(value)) {
      return currentArray.filter((v) => v !== value);
    }
    return [...currentArray, value];
  };
  
  const onSiguiente = (data: PreguntaValues) => {
    setIsLoading(true);
    updateFormData(data);
    router.push('/preferencias/pregunta2');
  };

  const currentSelection = form.watch('pregunta1') || [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSiguiente)} className="w-full">
        <PreguntaWrapper
          preguntaActual={1}
          totalPreguntas={totalPreguntas}
          onSiguiente={form.handleSubmit(onSiguiente)}
          isLoading={isLoading}
        >
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="pregunta1"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                    <FormLabel className='text-2xl font-bold text-blue-950'>
                      ¿Qué lugares prefieres para turistear?
                    </FormLabel>
                    <span className={cn(
                      "text-xs font-medium px-3 py-1 rounded-full border transition-colors",
                      currentSelection.length > 3 
                        ? "bg-red-100 text-red-700 border-red-200" 
                        : currentSelection.length === 0 
                          ? "bg-gray-100 text-gray-500" 
                          : "bg-blue-50 text-blue-700 border-blue-200"
                    )}>
                      Seleccionados: {currentSelection.length} / 3
                    </span>
                  </div>
                  
                  <FormControl>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                      {Object.keys(CATEGORY_CONFIG).map((opt) => {
                        const isSelected = (field.value || []).includes(opt);
                        const config = CATEGORY_CONFIG[opt] || { icon: Sparkles, color: 'text-gray-500' };
                        const IconComponent = config.icon;
                        
                        return (
                          <div
                            key={opt}
                            onClick={() => {
                                if (!isSelected && field.value?.length >= 3) return;
                                field.onChange(toggleValue(field.value, opt));
                            }}
                            className={cn(
                              "group relative cursor-pointer flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 h-32 select-none",
                              isSelected
                                ? "border-primary bg-primary/5 shadow-md scale-[1.02]"
                                : "border-gray-100 bg-white hover:border-primary/30 hover:shadow-sm hover:-translate-y-1",
                              (!isSelected && field.value?.length >= 3) && "opacity-50 cursor-not-allowed hover:transform-none hover:border-gray-100"
                            )}
                          >
                            <div className={cn(
                              "p-3 rounded-full transition-all duration-300",
                              isSelected ? "bg-white shadow-sm" : "bg-gray-50 group-hover:bg-blue-50"
                            )}>
                              <IconComponent 
                                className={cn(
                                  "w-6 h-6 transition-colors duration-300", 
                                  isSelected ? config.color : "text-gray-400 group-hover:text-primary"
                                )} 
                              />
                            </div>

                            <span className={cn(
                              "text-sm font-medium text-center leading-tight transition-colors",
                              isSelected ? "text-primary font-semibold" : "text-gray-600"
                            )}>
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