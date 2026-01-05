import {
  MessageSquare,
  House,
  BookMarked,
  BookUser,
  type LucideIcon,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Itinerario",
    items: [
      {
        title: "Descubre",
        url: "/viajero",
        icon: House,
      },
      {
        title: "Itinerarios",
        url: "/viajero/itinerarios",
        icon: BookMarked,
      },
      // {
      //   title: "Mapa",
      //   url: "/viajero/mapa",
      //   icon: Map,
      // },
      // {
      //   title: "Analytics",
      //   url: "/dashboard/coming-soon",
      //   icon: Gauge,
      //   comingSoon: true,
      // },
    ],
  },
  {
    id: 2,
    label: "Social",
    items: [
      {
        title: "Amigos",
        url: "/viajero/amigos",
        icon: BookUser,
      },
      {
        title: "Chat",
        url: "/viajero/chats",
        icon: MessageSquare,
        comingSoon: false,
      },
      // {
      //   title: "Notificaciones",
      //   url: "/viajero/notificaciones",
      //   icon: Calendar,
      //   comingSoon: true,
      // },
    ],
  },
  // {
  //   id: 3,
  //   label: "Otros",
  //   items: [
  //     {
  //       title: "Configuración",
  //       url: "/configuracion",
  //       icon: Settings,
  //       subItems: [
  //         {
  //           title: "Perfil",
  //           url: "/viajero/configuracion/perfil",
  //           icon: User,
  //           newTab: false,
  //         },
  //         {
  //           title: "Cuenta",
  //           url: "/viajero/configuracion/cuenta",
  //           icon: UserPen,
  //           newTab: false,
  //         },
  //         {
  //           title: "Apariencia",
  //           url: "/viajero/configuracion/apariencia",
  //           icon: LayoutPanelLeft,
  //           newTab: false,

  //         },
  //         {
  //           title: "Notificaciones",
  //           url: "/viajero/configuracion/notificaciones",
  //           newTab: false,
  //         },
  //         {
  //           title: "Pantalla",
  //           url: "/viajero/configuracion/pantalla",
  //           newTab: false,
  //         },
  //       ],
  //     },
  //   ],
  // },
];
