"use client";

import { Search, MapPin, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

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
    "Pueblos Mágicos", "Gastronomía", "Museos", "Montaña", "Playa", "Historia", "Low Cost"
  ];

  const handleTagClick = (tag: string) => {
    // Simula escribir en el input
    const event = { target: { value: tag } } as React.ChangeEvent<HTMLInputElement>;
    onQueryChange(event);
  };

  const isFiltering = query.length > 0 || estadoSeleccionado !== "todos";

  return (
    <div className="bg-card rounded-2xl shadow-lg border border-border/50 p-4 md:p-6 mb-10 transition-all hover:shadow-xl">
      <div className="flex flex-col lg:flex-row gap-4">
        
        {/* Input de Búsqueda Principal */}
        <div className="flex-1 relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                <Search className="h-5 w-5" />
            </div>
            <Input
              placeholder="¿Qué te gustaría descubrir hoy?"
              value={query}
              onChange={onQueryChange}
              className="pl-10 h-12 rounded-xl border-muted bg-muted/20 focus:bg-background transition-all text-base"
            />
            {query && (
                <button 
                    onClick={() => onQueryChange({ target: { value: '' } } as any)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full text-muted-foreground"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
        
        {/* Selector de Estado */}
        <div className="w-full lg:w-[240px]">
          <Select value={estadoSeleccionado} onValueChange={onEstadoChange}>
            <SelectTrigger className="h-12 rounded-xl border-muted bg-muted/20 focus:bg-background">
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Destino" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="todos">Todo México</SelectItem>
              <SelectItem value="CDMX">Ciudad de México</SelectItem>
              <SelectItem value="EDOMEX">Estado de México</SelectItem>
              <SelectItem value="Hidalgo">Hidalgo</SelectItem>
              <SelectItem value="Morelos">Morelos</SelectItem>
              <SelectItem value="Querétaro">Querétaro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Filtros rápidos (Tags) */}
      <div className="mt-4 pt-4 border-t border-border/40 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
            Tendencias:
        </span>
        <div className="flex flex-wrap gap-2">
            {commonTags.map(tag => (
            <Badge
                key={tag}
                variant="secondary"
                onClick={() => handleTagClick(tag)}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground px-3 py-1.5 rounded-lg transition-all text-sm font-normal"
            >
                {tag}
            </Badge>
            ))}
        </div>
        
        {/* Botón de Limpiar (Solo aparece si hay filtros) */}
        {isFiltering && (
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                    onQueryChange({ target: { value: '' } } as any);
                    onEstadoChange('todos');
                }}
                className="ml-auto text-muted-foreground hover:text-destructive h-8"
            >
                Limpiar todo
            </Button>
        )}
      </div>
    </div>
  );
}