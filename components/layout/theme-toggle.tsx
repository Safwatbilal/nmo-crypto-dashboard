"use client";

import { IconRenderer } from "@/assets/icons/iconRenderer";
import type { MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { THEME_STORAGE_KEY } from "./theme-script";

function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, dark ? "dark" : "light");
  } catch {
    // ignore blocked storage
  }
}

/**
 * Both icons are rendered and swapped with the `dark:` variant, so the button
 * needs no React state and is identical on server and client.
 */
export function ThemeToggle() {
  const toggle = (event: MouseEvent<HTMLButtonElement>) => {
    const root = document.documentElement;
    const next = !root.classList.contains("dark");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!document.startViewTransition || reduceMotion) {
      applyTheme(next);
      return;
    }
    root.style.setProperty("--vt-x", `${event.clientX}px`);
    root.style.setProperty("--vt-y", `${event.clientY}px`);
    document.startViewTransition(() => applyTheme(next));
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle dark mode">
      <IconRenderer name="morning_sun_outlined" aria-hidden className="size-[1.1rem] dark:hidden" />
      <IconRenderer name="moon_outlined" aria-hidden className="hidden size-[1.1rem] dark:block" />
    </Button>
  );
}
