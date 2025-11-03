'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const FormSchema = z.object({
  pregunta1: z.array(z.string()).min(1, { message: 'Selecciona al menos una opción para la pregunta 1.' }),
  pregunta2: z.array(z.string()).min(1, { message: 'Selecciona al menos una opción para la pregunta 2.' }),
  pregunta3: z.array(z.string()).min(1, { message: 'Selecciona al menos una opción para la pregunta 3.' }),
  pregunta4: z.array(z.string()).min(1, { message: 'Selecciona al menos una opción para la pregunta 4.' }),
  pregunta5: z.array(z.string()).min(1, { message: 'Selecciona al menos una opción para la pregunta 5.' }),
  pregunta6: z.array(z.string()).min(1, { message: 'Selecciona al menos una opción para la pregunta 6.' }), 
});

type FormValues = z.infer<typeof FormSchema>;

export default function SeleccionMultiplePreguntas() {
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pregunta1: [],
      pregunta2: [],
      pregunta3: [],
      pregunta4: [],
      pregunta5: [],
      pregunta6: [], 
    },
  });

  function onSubmit(data: FormValues) {
    console.log('Datos enviados:', data);
    toast.success('Preferencias guardadas con éxito', {
      description: 'Gracias tus respuestas han sido registradas.',
    });
      window.location.href = '/viajero';
  }

  const onSkip = () => {
    toast.info('Cuestionario omitido', {
      description: 'Continuando sin guardar las preferencias.',
      duration: 3000,
    });
      window.location.href = '/viajero';
  }

  const toggleValue = (currentArray: string[] = [], value: string): string[] => {
    if (currentArray.includes(value)) {
      return currentArray.filter((v) => v !== value);
    }
    return [...currentArray, value];
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-4xl rounded-xl bg-white p-8 shadow-2xl">
        
        <div className="text-center">
            <h1 className="mb-2 text-3xl font-bold text-blue-950">Benvenid@</h1>
            <p className="mb-8 text-base text-blue-500">Queremos conocer tus gustos para recomendarte mejores destinos</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

              {/* Pregunta 1 */}
              <FormField
                control={form.control}
                name="pregunta1"
                render={({ field }) => (
                  
                  <FormItem>
                    <FormLabel className='text-blue-950'>1) ¿Qué lugares prefieres para turistear?</FormLabel>
                    <FormControl>
                      <div className="flex flex-col space-y-2 mt-2">
                        {['Eventos culturales', 'Montañas', 'Pueblos mágicos', 'Parques', 'Restaurantes', 'Lugares históricos'].map((opt) => (
                          <label key={opt} className="inline-flex items-center space-x-2 cursor-pointer">
                            <Checkbox
                              checked={(field.value || []).includes(opt)}
                              onCheckedChange={() => field.onChange(toggleValue(field.value, opt))}
                            />
                            <span className="text-sm capitalize">{opt === 'montañas' ? 'Montañas' : opt}</span>
                          </label>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Pregunta 2 */}
              <FormField
                control={form.control}
                name="pregunta2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-blue-950'>2)¿Qué actividades prefieres hacer?</FormLabel>
                    <FormControl>
                      <div className="flex flex-col space-y-2 mt-2">
                       {['Museos y arte', 'gastronomia', 'Actividades culturales', 'Bares o discos', 'Caminatas', 'Compras o entretenimiento'].map((opt) => (
                          <label key={opt} className="inline-flex items-center space-x-2 cursor-pointer">
                            <Checkbox
                              checked={(field.value || []).includes(opt)}
                              onCheckedChange={() => field.onChange(toggleValue(field.value, opt))}
                            />
                            <span className="text-sm capitalize">{opt === 'gastronomia' ? 'Gastronomía' : opt}</span>
                          </label>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Pregunta 3 */}
              <FormField
                control={form.control}
                name="pregunta3"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-blue-950'>3) ¿Prefieres destinos populares o poco conocidos?</FormLabel>
                    <FormControl>
                      <div className="flex flex-col space-y-2 mt-2">
                        {['Muy conocidos', 'Poco conocidos'].map((opt) => (
                          <label key={opt} className="inline-flex items-center space-x-2 cursor-pointer">
                            <Checkbox
                              checked={(field.value || []).includes(opt)}
                              onCheckedChange={() => field.onChange(toggleValue(field.value, opt))}
                            />
                            <span className="text-sm capitalize">{opt === 'Poco conocidos' ? 'Poco conocidos' : opt}</span>
                          </label>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Pregunta 4 */}
              <FormField
                control={form.control}
                name="pregunta4"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-blue-950'>4) ¿Con quién te gusta viajar?</FormLabel>
                    <FormControl>
                      <div className="flex flex-col space-y-2 mt-2">
                         {['Sólo', 'Familia', 'Amigos', 'pareja', 'Hijos'].map((opt) => (
                          <label key={opt} className="inline-flex items-center space-x-2 cursor-pointer">
                            <Checkbox
                              checked={(field.value || []).includes(opt)}
                              onCheckedChange={() => field.onChange(toggleValue(field.value, opt))}
                            />
                            <span className="text-sm capitalize">{opt === 'pareja' ? 'Pareja' : opt}</span>
                          </label>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Pregunta 5 */}
              <FormField
                control={form.control}
                name="pregunta5"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-blue-950'>5) ¿Qué te motiva más a viajar?</FormLabel>
                    <FormControl>
                      <div className="flex flex-col space-y-2 mt-2">
                        {['Conocer nuevas culturas', 'descansar', 'Aventura y adrenalina', 'Gastronomía'].map((opt) => (
                          <label key={opt} className="inline-flex items-center space-x-2 cursor-pointer">
                            <Checkbox
                              checked={(field.value || []).includes(opt)}
                              onCheckedChange={() => field.onChange(toggleValue(field.value, opt))}
                            />
                            <span className="text-sm capitalize">{opt === 'descansar' ? 'Descansar' : opt}</span>
                          </label>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Pregunta 6 */}
              <FormField
                control={form.control}
                name="pregunta6"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-blue-950'>6) ¿Con qué frecuencia visitas nuevos lugares o sales?</FormLabel>
                    <FormControl>
                      <div className="flex flex-col space-y-2 mt-2">
                        {['Muy poco', 'Todos los fines de semana', 'Varias veces al año', 'Una vez al año', 'frecuentemente'].map((opt) => (
                          <label key={opt} className="inline-flex items-center space-x-2 cursor-pointer">
                            <Checkbox
                              checked={(field.value || []).includes(opt)}
                              onCheckedChange={() => field.onChange(toggleValue(field.value, opt))}
                            />
                            <span className="text-sm capitalize">{opt === 'frecuentemente' ? 'Frecuentemente' : opt}</span>
                          </label>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>
            <div className="flex flex-col items-end space-y-3 mt-10">
            <Button type="submit" className="w-40 py-4 text-lg font-semibold bg-blue-700 hover:bg-gray-900 text-white">
              Guardar 
            </Button>
            <Button type="button" onClick={onSkip} className="w-40 py-3 text-lg font-semibold bg-gray-400 hover:bg-gray-500 text-gray-800">
              Omitir
            </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
