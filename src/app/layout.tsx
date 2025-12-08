import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import "sweetalert2/dist/sweetalert2.min.css";

import { cookies } from "next/headers";

import { cn } from "@/lib/utils";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { ActiveThemeProvider } from "@/components/active-theme";
import { StyleGlideProvider } from "@/components/styleglide-provider";
import { Toaster } from "@/components/ui/sonner";
import { createContext } from "react";
import { ItinerariosAPI } from "@/api/ItinerariosAPI";

import { APP_CONFIG } from "@/config/app-config";
import { getPreference } from "@/server/server-actions";
import { PreferencesStoreProvider } from "@/stores/preferences/preferences-provider";
import {
  THEME_MODE_VALUES,
  THEME_PRESET_VALUES,
  type ThemePreset,
  type ThemeMode,
} from "@/types/preferences/theme";

import { SocketProvider } from "@/context/socketContext";
import {NotificationProvider} from "@/context/NotificationContext";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Share Path",
  description: "Itinerario turistico personalizado y compartible",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const activeThemeValue = cookieStore.get("active_theme")?.value;
  const isScaled = activeThemeValue?.endsWith("-scaled");
  const themeMode = await getPreference<ThemeMode>(
    "theme_mode",
    THEME_MODE_VALUES,
    "light"
  );
  const themePreset = await getPreference<ThemePreset>(
    "theme_preset",
    THEME_PRESET_VALUES,
    "default"
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "bg-background overscroll-none font-sans antialiased",
          activeThemeValue ? `theme-${activeThemeValue}` : "",
          isScaled ? "theme-scaled" : ""
        )}
      >
        <PreferencesStoreProvider
          themeMode={themeMode}
          themePreset={themePreset}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            enableColorScheme
          >
            <ActiveThemeProvider initialTheme={activeThemeValue}>
              <SocketProvider>
              <StyleGlideProvider />
              <NotificationProvider>
              {children}
               </NotificationProvider>
              </SocketProvider>
            </ActiveThemeProvider>
          </ThemeProvider>

          <Toaster richColors position="top-right" />
        </PreferencesStoreProvider>
      </body>
    </html>
  );
}
