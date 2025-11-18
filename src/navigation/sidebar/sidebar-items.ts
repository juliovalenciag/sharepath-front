import {
  ShoppingBag,
  Forklift,
  Mail,
  MessageSquare,
  Calendar,
  Kanban,
  ReceiptText,
  Users,
  Lock,
  User,
  House,
  UserPen,
  Fingerprint,
  LayoutPanelLeft,
  BookMarked,
  Map,
  SquareArrowUpRight,
  LayoutDashboard,
  BookUser,
  type LucideIcon,
  Settings,
} from "lucide-react";

import {
  IconCamera,
  IconFileAi,
  IconFileDescription,
  IconHelp,
  IconInnerShadowTop,
  IconSearch,
  IconSettings,
  IconUsers,
  IconHomeFilled,
  IconCalendarFilled,
  IconMessages,
  IconCompassFilled,
  IconMapPinFilled,
} from "@tabler/icons-react";

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
    label: "Itinerarios",
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
      {
        title: "Mapa",
        url: "/viajero/mapa",
        icon: Map,
      },
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
        url: "/viajero/chat",
        icon: MessageSquare,
      },
      {
        title: "Notificaciones",
        url: "/viajero/notificaciones",
        icon: Calendar,
        comingSoon: true,
      },
    ],
  },
  {
    id: 3,
    label: "Otros",
    items: [
      {
        title: "Configuración",
        url: "/configuracion",
        icon: Settings,
        subItems: [
          {
            title: "Perfil",
            url: "/viajero/configuracion/perfil",
            icon: User,
            newTab: true,
          },
          {
            title: "Cuenta",
            url: "/viajero/configuracion/cuenta",
            icon: UserPen,
            newTab: true,
          },
          {
            title: "Apariencia",
            url: "/viajero/configuracion/apariencia",
            icon: LayoutPanelLeft,
            newTab: true,
         
          },
          {
            title: "Notificaciones",
            url: "/viajero/configuracion/notificaciones",
            newTab: true,
          },
          {
            title: "Pantalla",
            url: "/viajero/configuracion/pantalla",
            newTab: true,
          },
        ],
      },
    ],
  },
];
