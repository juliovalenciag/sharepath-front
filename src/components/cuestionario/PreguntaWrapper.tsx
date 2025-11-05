'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const ProgressBar = ({ current, total }: { current: number; total: number }) => {
  const progressPercentage = (current / total) * 100;
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
      <div 
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
        style={{ width: `${progressPercentage}%` }}
      ></div>
    </div>
  );
};

interface PreguntaWrapperProps {
  children: ReactNode;
  preguntaActual: number;
  totalPreguntas: number;
  onSiguiente: () => void;
  onGuardar?: () => void;
  isLoading: boolean;
}

export const PreguntaWrapper = ({
  children,
  preguntaActual,
  totalPreguntas,
  onSiguiente,
  onGuardar,
  isLoading,
}: PreguntaWrapperProps) => {
  const router = useRouter();
  const esPrimeraPregunta = preguntaActual === 1;
  const esUltimaPregunta = preguntaActual === totalPreguntas;

  const onAnterior = () => {
    if (!esPrimeraPregunta) {
      router.push(`/preferencias/pregunta${preguntaActual - 1}`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-4xl rounded-xl bg-white p-8 shadow-2xl">
        
        <ProgressBar current={preguntaActual} total={totalPreguntas} />
        
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-950">Pregunta {preguntaActual} de {totalPreguntas}</h1>
          <p className="text-sm text-blue-500">Completa la pregunta o avanza.</p>
        </div>

        {children}

        <div className="flex justify-between mt-10">
          <Button
            type="button"
            onClick={onAnterior}
            disabled={esPrimeraPregunta || isLoading}
            className="bg-gray-400 hover:bg-gray-500 text-gray-800"
          >
            Anterior
          </Button>

          {esUltimaPregunta ? (
            <Button
              type="submit"
              onClick={onGuardar}
              disabled={isLoading}
              className="bg-blue-700 hover:bg-gray-900 text-white"
            >
              {isLoading ? 'Guardando...' : 'Guardar y Finalizar'}
            </Button>
          ) : (
            <Button
              type="submit"
              onClick={onSiguiente}
              disabled={isLoading}
              className="bg-blue-700 hover:bg-gray-900 text-white"
            >
              Siguiente
            </Button>
          )}
        </div>
        <div className="flex justify-end mt-4">
          <Button
            type="button"
            onClick={() => router.push('/viajero')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            Omitir 
          </Button>
        </div>
      </div>
    </div>
  );
};