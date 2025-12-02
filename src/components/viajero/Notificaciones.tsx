'use client';

import Image from 'next/image';
import { 
  Star, 
  Map, 
  MessageCircle, 
  UserPlus, 
  Users 
} from 'lucide-react';

// 1. Definimos los tipos de datos
type NotificationType = 'rating' | 'post' | 'comment' | 'friend_request' | 'friend_accepted';

interface User {
  name: string;
  avatarUrl: string;
  username?: string; // Opcional, para la tarjeta de solicitud de amistad
  mutualContacts?: number; // Opcional
}

interface NotificationItem {
  id: string;
  type: NotificationType;
  user: User;
  message: string; // "ha calificado tu publicación", etc.
  timestamp: string;
  isRead: boolean; // Controla el color de fondo
}

// Datos de prueba (MOCK DATA) basados en tu imagen
const mockNotifications: NotificationItem[] = [
  {
    id: '1',
    type: 'rating',
    user: { name: 'Fátima', avatarUrl: "/img/angel.jpg" },
    message: 'ha calificado tu publicación',
    timestamp: '1 min',
    isRead: true, // Visto -> Blanco
  },
  {
    id: '2',
    type: 'post',
    user: { name: 'Fátima', avatarUrl: "/img/angel.jpg" },
    message: 'ha hecho una publicación',
    timestamp: '1 min',
    isRead: true, // Visto -> Blanco
  },
  {
    id: '3',
    type: 'friend_request',
    user: { 
      name: 'Pedro Gonzales Pérez', 
      username: 'pedrongon',
      avatarUrl: "./img/angel.jpg",
      mutualContacts: 50
    },
    message: '', // En friend request el layout cambia un poco
    timestamp: '',
    isRead: true, // Visto -> Blanco
  },
  {
    id: '4',
    type: 'comment',
    user: { name: 'Fátima', avatarUrl: "/img/angel.jpg" },
    message: 'ha comentado tu publicación',
    timestamp: '1 min',
    isRead: false, // No visto -> Gris
  },
  {
    id: '5',
    type: 'friend_accepted',
    user: { name: 'Fátima', avatarUrl: "/img/angel.jpg" },
    message: 'ha aceptado tu solicitud de amistad',
    timestamp: '',
    isRead: false, // No visto -> Gris
  },
];

// 2. Componente auxiliar para obtener el ícono según el tipo
const getIconByType = (type: NotificationType) => {
  const iconProps = { size: 16, className: "text-white" };
  const wrapperClass = "absolute -bottom-1 -right-1 p-1.5 rounded-full border-2 border-white";
  
  switch (type) {
    case 'rating':
      return <div className={`${wrapperClass} bg-blue-500`}><Star {...iconProps} fill="white" /></div>;
    case 'post':
      return <div className={`${wrapperClass} bg-sky-500`}><Map {...iconProps} /></div>;
    case 'comment':
      return <div className={`${wrapperClass} bg-blue-500`}><MessageCircle {...iconProps} /></div>;
    case 'friend_request':
      return null; // La solicitud de amistad tiene un diseño diferente sin ícono superpuesto en tu imagen, o se puede agregar
    case 'friend_accepted':
      return <div className={`${wrapperClass} bg-blue-500`}><Users {...iconProps} /></div>;
    default:
      return null;
  }
};

// 3. Componente de Tarjeta Individual
const NotificationCard = ({ notification }: { notification: NotificationItem }) => {
  const { type, user, message, timestamp, isRead } = notification;

  // Lógica de fondo: Si NO está vista (gris), si está vista (blanco)
  // Nota: Ajusté los colores para que coincidan con la lógica visual estándar, pero siguiendo tu regla.
  const bgClass = !isRead ? 'bg-gray-100' : 'bg-white';

  return (
    <div className={`w-full p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-center transition-colors ${bgClass}`}>
      
      {/* Columna Izquierda: Avatar e Ícono */}
      <div className="relative shrink-0">
        <Image 
          src="/img/angel.jpg" 
          alt={user.name} 
          width={56} 
          height={56} 
          className="rounded-full object-cover w-14 h-14"
        />
        {getIconByType(type)}
      </div>

      {/* Columna Derecha: Contenido */}
      <div className="flex-1">
        {type === 'friend_request' ? (
          // --- Layout Especial: Solicitud de Amistad ---
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h4 className="font-bold text-gray-900 text-lg leading-tight">{user.name}</h4>
              <p className="text-gray-500 text-sm">@{user.username}</p>
              {user.mutualContacts && (
                <div className="flex items-center gap-2 mt-1">
                  {/* Pequeños avatares simulados */}
                  <div className="flex -space-x-2">
                     {[1,2,3].map(i => (
                       <div key={i} className="w-5 h-5 rounded-full bg-gray-300 border border-white"></div>
                     ))}
                  </div>
                  <span className="text-xs text-gray-500">{user.mutualContacts} shared contacts</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <button className="flex-1 sm:flex-none px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition">
                Decline
              </button>
              <button className="flex-1 sm:flex-none px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
                Accept
              </button>
            </div>
          </div>
        ) : (
          // --- Layout Estándar: Notificación normal ---
          <div>
            <p className="text-gray-800 text-base">
              <span className="font-bold">{user.name}</span> {message}
            </p>
            {timestamp && <span className="text-gray-400 text-sm mt-1 block">{timestamp}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

// 4. Componente Principal de Lista
export default function NotificationsPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Notificaciones</h1>
      
      <div className="space-y-4">
        {mockNotifications.map((notif) => (
          <NotificationCard key={notif.id} notification={notif} />
        ))}
      </div>
    </div>
  );
}