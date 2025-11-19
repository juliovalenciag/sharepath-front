"use client";

import { Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { updateContentLayout, updateNavbarStyle } from "@/lib/layout-utils";
import { updateThemeMode, updateThemePreset } from "@/lib/theme-utils";
import { setValueToCookie } from "@/server/server-actions";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";
import type {
  SidebarVariant,
  SidebarCollapsible,
  ContentLayout,
  NavbarStyle,
} from "@/types/preferences/layout";
import {
  THEME_PRESET_OPTIONS,
  type ThemePreset,
  type ThemeMode,
} from "@/types/preferences/theme";

type LayoutControlsProps = {
  readonly variant: SidebarVariant;
  readonly collapsible: SidebarCollapsible;
  readonly contentLayout: ContentLayout;
  readonly navbarStyle: NavbarStyle;
};

export function LayoutControls(props: LayoutControlsProps) {
  const { variant, collapsible, contentLayout, navbarStyle } = props;

  const themeMode = usePreferencesStore((s) => s.themeMode);
  const setThemeMode = usePreferencesStore((s) => s.setThemeMode);
  const themePreset = usePreferencesStore((s) => s.themePreset);
  const setThemePreset = usePreferencesStore((s) => s.setThemePreset);

  const handleValueChange = async (key: string, value: any) => {
    if (key === "theme_mode") {
      updateThemeMode(value);
      setThemeMode(value as ThemeMode);
    }

    if (key === "theme_preset") {
      updateThemePreset(value);
      setThemePreset(value as ThemePreset);
    }

    if (key === "content_layout") {
      updateContentLayout(value);
    }

    if (key === "navbar_style") {
      updateNavbarStyle(value);
    }
    await setValueToCookie(key, value);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="icon" variant="outline" className="dark:text-white">
          <Settings />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end">
        <div className="flex flex-col gap-5">
          <div className="space-y-1.5">
            <h4 className="text-sm leading-none font-medium">
              Configuración de diseño
            </h4>
            <p className="text-muted-foreground text-xs">
              Personaliza las preferencias de tu panel.
            </p>
          </div>
          <div className="space-y-3">
            <div className="space-y-1">
              <Select
                value={themePreset}
                onValueChange={(value) =>
                  handleValueChange("theme_preset", value)
                }
              >
                {/* Nota: Si el 'label' viene de THEME_PRESET_OPTIONS, ese texto debe traducirse en el archivo de constantes donde se define. */}
                <SelectContent>
                  {THEME_PRESET_OPTIONS.map((preset) => (
                    <SelectItem
                      key={preset.value}
                      className="text-xs"
                      value={preset.value}
                    >
                      <span
                        className="size-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            themeMode === "dark"
                              ? preset.primary.dark
                              : preset.primary.light,
                        }}
                      />
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Modo</Label>
              <ToggleGroup
                className="w-full **:data-[slot=toggle-group-item]:flex-1 **:data-[slot=toggle-group-item]:text-xs"
                size="sm"
                variant="outline"
                type="single"
                value={themeMode}
                onValueChange={(value) =>
                  handleValueChange("theme_mode", value)
                }
              >
                <ToggleGroupItem value="light" aria-label="Alternar modo claro">
                  Claro
                </ToggleGroupItem>
                <ToggleGroupItem value="dark" aria-label="Alternar modo oscuro">
                  Oscuro
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">
                Variante de barra lateral
              </Label>
              <ToggleGroup
                className="w-full **:data-[slot=toggle-group-item]:flex-1 **:data-[slot=toggle-group-item]:text-xs"
                size="sm"
                variant="outline"
                type="single"
                value={variant}
                onValueChange={(value) =>
                  handleValueChange("sidebar_variant", value)
                }
              >
                <ToggleGroupItem value="inset" aria-label="Alternar insertada">
                  Insertada
                </ToggleGroupItem>
                <ToggleGroupItem value="sidebar" aria-label="Alternar lateral">
                  Lateral
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="floating"
                  aria-label="Alternar flotante"
                >
                  Flotante
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">
                Estilo de navegación
              </Label>
              <ToggleGroup
                className="w-full **:data-[slot=toggle-group-item]:flex-1 **:data-[slot=toggle-group-item]:text-xs"
                size="sm"
                variant="outline"
                type="single"
                value={navbarStyle}
                onValueChange={(value) =>
                  handleValueChange("navbar_style", value)
                }
              >
                <ToggleGroupItem value="sticky" aria-label="Alternar fija">
                  Fija
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="scroll"
                  aria-label="Alternar desplazable"
                >
                  Desplazable
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">
                Colapso de barra lateral
              </Label>
              <ToggleGroup
                className="w-full **:data-[slot=toggle-group-item]:flex-1 **:data-[slot=toggle-group-item]:text-xs"
                size="sm"
                variant="outline"
                type="single"
                value={collapsible}
                onValueChange={(value) =>
                  handleValueChange("sidebar_collapsible", value)
                }
              >
                <ToggleGroupItem value="icon" aria-label="Alternar icono">
                  Icono
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="offcanvas"
                  aria-label="Alternar offcanvas"
                >
                  OffCanvas
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Diseño de contenido</Label>
              <ToggleGroup
                className="w-full **:data-[slot=toggle-group-item]:flex-1 **:data-[slot=toggle-group-item]:text-xs"
                size="sm"
                variant="outline"
                type="single"
                value={contentLayout}
                onValueChange={(value) =>
                  handleValueChange("content_layout", value)
                }
              >
                <ToggleGroupItem
                  value="centered"
                  aria-label="Alternar centrado"
                >
                  Centrado
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="full-width"
                  aria-label="Alternar ancho completo"
                >
                  Ancho completo
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
