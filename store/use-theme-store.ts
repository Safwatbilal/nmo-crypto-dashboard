"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { THEME_STORAGE_KEY } from "@/components/layout/theme-script";

export type Theme = "light" | "dark";

type ThemeStore = {
  theme: Theme;
  hasHydrated: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
};

const applyThemeClass = (theme: Theme) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
};

/** Dark grows from the bottom-left corner, light from the top-right. */
const setTransitionOrigin = (theme: Theme) => {
  const root = document.documentElement;
  const isDark = theme === "dark";
  root.style.setProperty("--vt-origin-x", isDark ? "0%" : "100%");
  root.style.setProperty("--vt-origin-y", isDark ? "100%" : "0%");
};

const applyWithViewTransition = (theme: Theme, apply: () => void) => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || reduceMotion) {
    apply();
    return;
  }
  setTransitionOrigin(theme);
  try {
    document.startViewTransition(apply);
  } catch {
    apply();
  }
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: "light",
      hasHydrated: false,
      toggleTheme: () => get().setTheme(get().theme === "light" ? "dark" : "light"),
      setTheme: (theme) => {
        applyWithViewTransition(theme, () => {
          applyThemeClass(theme);
          set({ theme });
        });
      },
    }),
    {
      name: THEME_STORAGE_KEY,
      partialize: ({ theme }) => ({ theme }),
      // ThemeScript already applied the stored theme (or the OS preference) before
      // first paint, so the DOM is the source of truth when nothing was stored yet.
      onRehydrateStorage: () => () => {
        const theme: Theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
        useThemeStore.setState({ theme, hasHydrated: true });
      },
    },
  ),
);
