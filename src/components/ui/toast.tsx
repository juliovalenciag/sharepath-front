"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const toastVariants = cva(
  "fixed z-[9999] flex items-center justify-center rounded-md p-4 text-white shadow-lg transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-blue-900",
        destructive: "bg-red-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  show: boolean;
  message: string;
}

export function Toast({ show, message, variant }: ToastProps) {
  return (
    <div
      className={cn(
        toastVariants({ variant }),
        show ? "opacity-100 scale-100" : "opacity-0 scale-90",
        "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      )}
      role="alert"
    >
      {message}
    </div>
  );
}
