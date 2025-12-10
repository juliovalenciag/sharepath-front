"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchFiltersProps {
  query: string;
  estadoSeleccionado: string;
  onQueryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEstadoChange: (value: string) => void;
}

export default function SearchFilters({
  query,
  estadoSeleccionado,
  onQueryChange,
  onEstadoChange,
}: SearchFiltersProps) {
  const commonTags = [
    "restaurante", "museo", "parque", "historia", "gastronomía", 
    "naturaleza", "cultura", "aventura", "arquitectura"
  ];

  return (
    <div className="rounded-xl border border-gray-200 p-6 mb-8">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end justify-between">
        <div className="flex-1 min-w-0">
          <label htmlFor="search" className="block text-sm font-medium mb-2">
            Buscar itinerarios
          </label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input
              id="search"
              placeholder="Buscar por destino, usuario o actividad..."
              value={query}
              onChange={onQueryChange}
              className="pl-10 w-full"
            />
          </div>
        </div>
        
        <div className="w-full lg:w-auto">
          <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por estado
          </label>
          <Select value={estadoSeleccionado} onValueChange={onEstadoChange}>
            <SelectTrigger className="w-full lg:w-[200px]">
              <SelectValue placeholder="Selecciona un estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="CDMX">Ciudad de México</SelectItem>
              <SelectItem value="EDOMEX">Estado de México</SelectItem>
              <SelectItem value="Hidalgo">Hidalgo</SelectItem>
              <SelectItem value="Guerrero">Guerrero</SelectItem>
              <SelectItem value="Queretaro">Querétaro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full lg:w-auto pt-2 lg:pt-0">
          <Button 
            type="button" 
            className="w-full lg:w-auto bg-primary hover:bg-secondary"
            onClick={() => {
              onQueryChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
              onEstadoChange('todos');
            }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reiniciar
          </Button>
        </div>
      </div>
      
      {/* Filtros rápidos con tags reales */}
      <div className="flex flex-wrap gap-2 mt-4">
        {commonTags.map(tag => (
          <button
            key={tag}
            onClick={() => onQueryChange({ target: { value: tag } } as React.ChangeEvent<HTMLInputElement>)}
            className="px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-medium text-gray-700 capitalize"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
