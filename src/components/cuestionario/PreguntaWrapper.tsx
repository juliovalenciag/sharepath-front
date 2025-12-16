'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const ProgressBar = ({ current, total }: { current: number; total: number }) => {
  const progressPercentage = (current / total) * 100;
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
      <div 
        className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out" 
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
  selectedCount: number; // número de opciones seleccionadas en la pregunta actual
}

export const PreguntaWrapper = ({
  children,
  preguntaActual,
  totalPreguntas,
  onSiguiente,
  onGuardar,
  isLoading,
  selectedCount,
}: PreguntaWrapperProps) => {
  const router = useRouter();
  const esPrimeraPregunta = preguntaActual === 1;
  const esUltimaPregunta = preguntaActual === totalPreguntas;

  // Validación: mínimo 1 y máximo 3 opciones
  const isValid = selectedCount >= 1 && selectedCount <= 3;
  const showErrorNone = selectedCount === 0;
  const showErrorTooMany = selectedCount > 3;

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

        {/* Mensajes de validación */}
        <div className="mt-4">
          {showErrorNone && (
            <p className="text-sm text-red-600">
              Debes escoger al menos 1 opción.
            </p>
          )}
          {showErrorTooMany && (
            <p className="text-sm text-red-600">
              Selecciona máximo 3 opciones.
            </p>
          )}
          {!showErrorNone && !showErrorTooMany && selectedCount >= 1 && (
            <p className="text-sm text-emerald-700">
              Perfecto: {selectedCount} seleccionada(s). Puedes continuar.
            </p>
          )}
        </div>

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
              onClick={() => {
                if (isValid && onGuardar) onGuardar();
              }}
              disabled={isLoading || !isValid}
              className={`${
                isValid ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300"
              } text-white`}
            >
              {isLoading ? 'Guardando...' : 'Guardar y Finalizar'}
            </Button>
          ) : (
            <Button
              type="submit"
              onClick={() => {
                if (isValid) onSiguiente();
              }}
              disabled={isLoading || !isValid}
              className={`${
                isValid ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300"
              } text-white`}
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