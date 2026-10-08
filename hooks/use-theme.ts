"use client";

import { useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY } from "@/components/layout/theme-script";

export type Theme = "light" | "dark";

/**
 * The `dark` class on <html> is the single source of truth: ThemeScript sets
 * it before first paint, `toggleTheme` flips it. Consumers subscribe to the
 * class itself, so no store (Redux or otherwise) has to mirror it.
 */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

const getSnapshot = (): Theme => (document.documentElement.classList.contains("dark") ? "dark" : "light");
// The server can't know the stored theme; React re-renders with the real value right after hydration.
const getServerSnapshot = (): Theme => "light";

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage blocked (private mode): the theme still applies for this page view.
  }
}

/** Flips the theme with the circular View Transition reveal (skipped for reduced motion). */
export function toggleTheme() {
  const next: Theme = getSnapshot() === "dark" ? "light" : "dark";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || reduceMotion) {
    applyTheme(next);
    return;
  }
  // Dark grows from the bottom-left corner, light from the top-right.
  const root = document.documentElement;
  root.style.setProperty("--vt-origin-x", next === "dark" ? "0%" : "100%");
  root.style.setProperty("--vt-origin-y", next === "dark" ? "100%" : "0%");
  try {
    document.startViewTransition(() => applyTheme(next));
  } catch {
    applyTheme(next);
  }
}
