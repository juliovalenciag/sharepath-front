"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { type Icon } from "@tabler/icons-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavSecondary({
  items,
  label,
  ...props
}: {
  items: { title: string; url: string; icon: Icon }[];
  label?: string;
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const pathname = usePathname();

  return (
    <SidebarGroup {...props}>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive =
              item.url !== "#" &&
              (pathname === item.url || pathname.startsWith(item.url));
            const isDisabled = item.url === "#";

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild={!isDisabled}
                  isActive={isActive}
                  className={isDisabled ? "opacity-60 cursor-not-allowed" : ""}
                >
                  {isDisabled ? (
                    <div className="flex items-center gap-2">
                      <item.icon />
                      <span>{item.title}</span>
                    </div>
                  ) : (
                    <Link href={item.url} className="flex items-center gap-2">
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
