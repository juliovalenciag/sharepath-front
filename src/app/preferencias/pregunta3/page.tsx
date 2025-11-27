'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { PreguntaWrapper } from '@/components/cuestionario/PreguntaWrapper';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const PreguntaSchema = z.object({
  pregunta3: z.array(z.string()).min(1, "Seleccione al menos una opcion ").max(3, "Seleccione maximo tres"), 
});
type PreguntaValues = z.infer<typeof PreguntaSchema>;

const loadFormData = () => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('form-data');
        return stored ? JSON.parse(stored) : { pregunta3: [] };
    }
    return { pregunta3: [] };
};
const updateFormData = (data: Partial<PreguntaValues>) => {
    if (typeof window !== 'undefined') {
        const currentData = loadFormData();
        localStorage.setItem('form-data', JSON.stringify({ ...currentData, ...data }));
    }
};


export default function Pregunta3Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const totalPreguntas = 3; 

  const form = useForm<PreguntaValues>({
    resolver: zodResolver(PreguntaSchema),
    defaultValues: loadFormData(), 
  });
  
  const toggleValue = (currentArray: string[] = [], value: string): string[] => {
    if (currentArray.includes(value)) {
      return currentArray.filter((v) => v !== value);
    }
    return [...currentArray, value];
  };
  
  const onGuardar = async (data: PreguntaValues) => {
    setIsLoading(true);
    // 1. Guardar la respuesta de la última pregunta
    updateFormData(data);

    // 2. Obtener TODAS las respuestas
    const finalData = loadFormData();
    console.log('Datos FINALES enviados:', finalData);

    // 3. Simular el envío al servidor
    // await new Promise(resolve => setTimeout(resolve, 1000)); 
    //implementacion del back 
    const token = localStorage.getItem("token"); 
    console.log("token del new user: ", token); 

    const promise = await fetch("http://localhost:3000/preferencias/register", {
      method: "POST", 
      headers: {
        "Content-Type": "application/json",
        "Token": `Bearer ${token}`
      }, 
      body: JSON.stringify({
        lugares_preferidos: finalData.pregunta1, 
        estados_visitados:finalData.pregunta2, 
        actividades_preferidas: finalData.pregunta3 }), 
      })
         if (!promise.ok) 
          //throw new Error(text); 

        toast.success('Preferencias guardadas con éxito', {
          description: 'Gracias tus respuestas han sido registradas.',
        });
      router.push('/viajero');

       // return res.json();
  

  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onGuardar)}>
        <PreguntaWrapper
          preguntaActual={3}
          totalPreguntas={totalPreguntas}
          onSiguiente={form.handleSubmit(() => {})} 
          onGuardar={form.handleSubmit(onGuardar)}
          isLoading={isLoading}
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="pregunta3"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-blue-950'>3) ¿Qué actividades prefieres hacer?</FormLabel>
                  
                  <FormControl>
                    <div className="flex flex-wrap gap-3 mt-4">
                      {['Tours', 'Probar comida', 'Culturales', 'Bailar', 'Caminatas', 'Compras', 'Entretenimiento', 'Visitar Museos', 'Vida nocturna'].map((opt) => {
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