"use client";

import { IconRenderer } from "@/assets/icons/iconRenderer";
import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/store/use-theme-store";

const iconBase = "absolute size-[1.1rem] transition-all duration-300";

/**
 * The icon states are driven by the `dark:` variant rather than store state, so
 * the button renders correctly before the store hydrates and never flashes.
 */
export function ThemeToggle() {
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle dark mode">
      <span className="relative flex size-[1.1rem] items-center justify-center">
        <IconRenderer
          name="morning_sun_outlined"
          aria-hidden
          className={`${iconBase} rotate-0 scale-100 opacity-100 dark:-rotate-90 dark:scale-0 dark:opacity-0`}
        />
        <IconRenderer
          name="moon_outlined"
          aria-hidden
          className={`${iconBase} rotate-90 scale-0 opacity-0 dark:rotate-0 dark:scale-100 dark:opacity-100`}
        />
      </span>
    </Button>
  );
}
