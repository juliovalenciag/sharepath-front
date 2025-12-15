'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { PreguntaWrapper } from '@/components/cuestionario/PreguntaWrapper';
import { useState, useEffect } from 'react';

const PreguntaSchema = z.object({
  pregunta1: z.array(z.string()).min(1, "Seleccione al menos una opcion ").max(3, "Seleccione maximo tres"),
});

type PreguntaValues = z.infer<typeof PreguntaSchema>;

const loadFormData = () => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('form-data');
        return stored ? JSON.parse(stored) : { pregunta1: [] };
    }
    return { pregunta1: [] };
};
const updateFormData = (data: Partial<PreguntaValues>) => {
    if (typeof window !== 'undefined') {
        const currentData = loadFormData();
        localStorage.setItem('form-data', JSON.stringify({ ...currentData, ...data }));
    }
};

export default function Pregunta1Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const totalPreguntas = 3; 

  const form = useForm<PreguntaValues>({
    resolver: zodResolver(PreguntaSchema),
    defaultValues: loadFormData(), 
  });
  const selectedCount = (form.watch('pregunta1') || []).length;
  
  const toggleValue = (currentArray: string[] = [], value: string): string[] => {
    if (currentArray.includes(value)) {
      return currentArray.filter((v) => v !== value);
    }
    return [...currentArray, value];
  };
  
  // Función para avanzar a la siguiente página (pregunta 2)
  const onSiguiente = (data: PreguntaValues) => {
    setIsLoading(true);
    // 1. Guardar la respuesta actual en el almacenamiento temporal (localStorage o Context)
    updateFormData(data);
    
    // 2. Redirigir a la siguiente pregunta
    router.push('/preferencias/pregunta2');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSiguiente)}>
        <PreguntaWrapper
          preguntaActual={1}
          totalPreguntas={totalPreguntas}
          onSiguiente={form.handleSubmit(onSiguiente)}
          isLoading={isLoading}
          selectedCount={selectedCount}
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="pregunta1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-blue-950'>1) ¿Qué lugares prefieres para turistear?</FormLabel>
                  
                  <FormControl>
                    <div className="flex flex-wrap gap-3 mt-4">
                      {['Pueblos mágicos', 'Zonas arqueológicas', 'Museos', 'Parques','Zoológicos', 'Parques de diversión', 'Campamentos', 'Restaurantes', 'Cafes', 'Bares'].map((opt) => {
                        const isSelected = (field.value || []).includes(opt);
                        
                        return (
                          <Button
                            key={opt}
                            type="button" 
                            onClick={() => field.onChange(toggleValue(field.value, opt))}
                            className={`
                              rounded-full px-4 py-2 text-sm transition-colors duration-200 
                              ${
                                isSelected
                                  ? 'bg-primary text-white shadow-md hover:bg-secondary' 
                                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200' 
                              }
                            `}
                          >
                            {opt}
                          </Button>
                        );
                      })}
                    </div>
                  </FormControl>                  
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </PreguntaWrapper>
      </form>
    </Form>
  );
}