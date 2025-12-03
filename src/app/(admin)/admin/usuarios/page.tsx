"use client";

import { useState } from 'react';
import { Pencil, Lock, Trash2 } from 'lucide-react';


interface User {
  id: string;
  nombre: string;
  username: string;
  correo: string;
  ultimoAcceso: string;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<User[]>([
    {
      id: '1',
      nombre: 'Juan Pérez',
      username: 'jperez',
      correo: 'juan.perez@example.com',
      ultimoAcceso: '2024-01-15 10:30',
    },
    {
      id: '2',
      nombre: 'María García',
      username: 'mgarcia',
      correo: 'maria.garcia@example.com',
      ultimoAcceso: '2024-01-14 16:45',
    },
  ]);

  const handleEdit = (id: string) => {
    console.log('Editar usuario:', id);
  };

  const handleBlock = (id: string) => {
    console.log('Bloquear usuario:', id);
  };

  const handleDelete = (id: string) => {
    console.log('Eliminar usuario:', id);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Gestionar usuarios</h1>
      
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Correo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Último Acceso
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {usuario.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {usuario.nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {usuario.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {usuario.correo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {usuario.ultimoAcceso}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(usuario.id)}
                      className="text-blue-600 hover:text-blue-800 transition"
                      title="Editar"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleBlock(usuario.id)}
                      className="text-yellow-600 hover:text-yellow-800 transition"
                      title="Bloquear"
                    >
                      <Lock size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(usuario.id)}
                      className="text-red-600 hover:text-red-800 transition"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}