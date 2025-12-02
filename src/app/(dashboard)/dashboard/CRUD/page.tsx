"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconEye,
  IconTrash,
  IconSettings,
  IconSearch,
} from "@tabler/icons-react";

// Datos de ejemplo para los itinerarios
const itinerariosData = [
  {
    id: "ITN-001",
    username: "maria.gonzalez",
    nombreItinerario: "Aventura en CDMX",
    fecha: "2025-11-15",
    estado: "Aprobado",
  },
  {
    id: "ITN-002",
    username: "carlos.ramirez",
    nombreItinerario: "Tour Teotihuacán",
    fecha: "2025-11-14",
    estado: "En revisión",
  },
  {
    id: "ITN-003",
    username: "ana.lopez",
    nombreItinerario: "Gastronomía CDMX",
    fecha: "2025-11-13",
    estado: "Aprobado",
  },
  {
    id: "ITN-004",
    username: "juan.perez",
    nombreItinerario: "Playas de Cancún",
    fecha: "2025-11-12",
    estado: "Reportado",
  },
  {
    id: "ITN-005",
    username: "laura.martinez",
    nombreItinerario: "Pueblos Mágicos",
    fecha: "2025-11-11",
    estado: "En revisión",
  },
  {
    id: "ITN-006",
    username: "pedro.sanchez",
    nombreItinerario: "Ruta del Tequila",
    fecha: "2025-11-10",
    estado: "Aprobado",
  },
  {
    id: "ITN-007",
    username: "sofia.torres",
    nombreItinerario: "Oaxaca Cultural",
    fecha: "2025-11-09",
    estado: "Aprobado",
  },
  {
    id: "ITN-008",
    username: "diego.morales",
    nombreItinerario: "Chiapas Natural",
    fecha: "2025-11-08",
    estado: "Reportado",
  },
];

export default function Page() {
  const [busqueda, setBusqueda] = useState("");

  // Filtrar itinerarios según la búsqueda
  const itinerariosFiltrados = itinerariosData.filter(
    (item) =>
      item.username.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.nombreItinerario.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.id.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Función para determinar el color del badge según el estado
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Aprobado":
        return <Badge className="bg-green-500 hover:bg-green-600">Aprobado</Badge>;
      case "En revisión":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">En revisión</Badge>;
      case "Reportado":
        return <Badge className="bg-red-500 hover:bg-red-600">Reportado</Badge>;
      default:
        return <Badge variant="secondary">{estado}</Badge>;
    }
  };

  const handleVerItinerario = (id: string) => {
    console.log("Ver itinerario:", id);
    // Aquí puedes agregar la lógica para ver el itinerario
  };

  const handleEliminar = (id: string) => {
    console.log("Eliminar itinerario:", id);
    // Aquí puedes agregar la lógica para eliminar
  };

  const handleConfiguracion = (id: string) => {
    console.log("Configurar itinerario:", id);
    // Aquí puedes agregar la lógica para configuración
  };

  const handleVerDetalle = (id: string) => {
    console.log("Ver detalle del itinerario:", id);
    // Aquí puedes agregar la lógica para ver detalle
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header con título y buscador */}
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-3xl font-bold">CRUD de Itinerarios</h1>
              <p className="text-muted-foreground mt-1">
                Gestiona y administra todos los itinerarios de la plataforma
              </p>
            </div>

            {/* Buscador */}
            <div className="flex items-center gap-2 max-w-md">
              <div className="relative flex-1">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar itinerario..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Tabla de itinerarios */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Itinerarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Nombre del Itinerario</TableHead>
                      <TableHead>Itinerario</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itinerariosFiltrados.length > 0 ? (
                      itinerariosFiltrados.map((itinerario) => (
                        <TableRow key={itinerario.id}>
                          <TableCell className="font-mono text-sm">
                            {itinerario.id}
                          </TableCell>
                          <TableCell className="font-medium">
                            {itinerario.username}
                          </TableCell>
                          <TableCell>{itinerario.nombreItinerario}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleVerItinerario(itinerario.id)}
                            >
                              Ver itinerario
                            </Button>
                          </TableCell>
                          <TableCell>{itinerario.fecha}</TableCell>
                          <TableCell>{getEstadoBadge(itinerario.estado)}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleVerDetalle(itinerario.id)}
                                title="Ver"
                              >
                                <IconEye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleEliminar(itinerario.id)}
                                title="Eliminar"
                              >
                                <IconTrash className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleConfiguracion(itinerario.id)}
                                title="Configuración"
                              >
                                <IconSettings className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <p className="text-muted-foreground">
                            No se encontraron itinerarios
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Información de resultados */}
              {itinerariosFiltrados.length > 0 && (
                <div className="mt-4 text-sm text-muted-foreground">
                  Mostrando {itinerariosFiltrados.length} de {itinerariosData.length} itinerarios
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
