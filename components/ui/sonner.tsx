"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";
import { useThemeStore } from "@/store/use-theme-store";

/** shadcn/ui Sonner toaster, themed from the app's own theme store instead of next-themes. */
export function Toaster(props: ToasterProps) {
  const theme = useThemeStore((state) => state.theme);

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--card)",
          "--normal-text": "var(--card-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "0.75rem",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}
