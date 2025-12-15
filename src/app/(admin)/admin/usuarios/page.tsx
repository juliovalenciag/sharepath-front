"use client";

import { useState, useEffect } from 'react';
import { Pencil, Lock, Trash2, Loader2 } from 'lucide-react';
import { ItinerariosAPI } from '@/api/ItinerariosAPI';
import { Usuario } from '@/api/interfaces/ApiRoutes';


interface User {
  id: string;
  nombre: string;
  username: string;
  correo: string;
  ultimoAcceso: string;
  role: string;
  account_status: boolean;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ItinerariosAPI.getInstance().getAllUsers();
      
      console.log('Respuesta de la API:', response);
      // Aceptar múltiples formatos de respuesta: array directo, { users }, { data: users }
      const usersArray = Array.isArray(response)
        ? response
        : (response as any)?.users || (response as any)?.data?.users || (response as any)?.data;

      if (!usersArray || !Array.isArray(usersArray)) {
        console.warn('La API no devolvió usuarios en el formato esperado:', response);
        setUsuarios([]);
        return;
      }
      
      // Mapear los datos de Usuario a nuestro formato User
      const mappedUsers: User[] = usersArray.map((u: any) => {
        const correo = u?.correo || u?.email || u?.mail || u?.user_email || "";
        const username = u?.username || u?.user || u?.nick || u?.login || "";
        const nombre = u?.nombre_completo || u?.nombre || u?.full_name || u?.name || "";
        const role = u?.role || u?.rol || u?.tipo || "user";
        const account_status =
          u?.account_status ?? u?.is_active ?? u?.activo ?? (u?.status === "active" ? true : u?.status === "blocked" ? false : true);

        return {
          id: correo || username || String(u?.id || u?._id || crypto.randomUUID?.() || Math.random()),
          nombre,
          username,
          correo,
          ultimoAcceso: 'N/A',
          role,
          account_status: Boolean(account_status),
        } as User;
      });

      setUsuarios(mappedUsers);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError('No se pudieron cargar los usuarios. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    console.log('Editar usuario:', id);
    // TODO: Implementar modal de edición
  };

  const handleBlock = async (id: string) => {
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) return;

    const confirmMessage = usuario.account_status 
      ? '¿Estás seguro de que deseas bloquear este usuario?' 
      : '¿Estás seguro de que deseas desbloquear este usuario?';
    
    if (!confirm(confirmMessage)) return;

    try {
      if (usuario.account_status) {
        await ItinerariosAPI.getInstance().block(usuario.correo);
      } else {
        await ItinerariosAPI.getInstance().unblock(usuario.correo);
      }
      
      // Recargar la lista de usuarios
      await loadUsuarios();
      alert(`Usuario ${usuario.account_status ? 'bloqueado' : 'desbloqueado'} exitosamente`);
    } catch (error) {
      console.error('Error al cambiar estado del usuario:', error);
      alert('Error al cambiar el estado del usuario');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      // TODO: Implementar endpoint de eliminación de usuario por admin
      // Por ahora solo mostramos mensaje
      console.log('Eliminar usuario:', id);
      alert('Función de eliminación pendiente de implementación en el backend');
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      alert('Error al eliminar el usuario');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Gestionar usuarios</h1>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Cargando usuarios...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Gestionar usuarios</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
          <button 
            onClick={loadUsuarios}
            className="ml-4 text-red-800 underline hover:text-red-900"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestionar usuarios</h1>
        <div className="text-sm text-gray-600">
          Total de usuarios: <span className="font-semibold">{usuarios.length}</span>
        </div>
      </div>
      
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
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
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No hay usuarios registrados
                </td>
              </tr>
            ) : (
              usuarios.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {usuario.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {usuario.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {usuario.correo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      usuario.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {usuario.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      usuario.account_status 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {usuario.account_status ? 'Activo' : 'Bloqueado'}
                    </span>
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
                        className={`transition ${
                          usuario.account_status 
                            ? 'text-yellow-600 hover:text-yellow-800' 
                            : 'text-green-600 hover:text-green-800'
                        }`}
                        title={usuario.account_status ? 'Bloquear' : 'Desbloquear'}
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}