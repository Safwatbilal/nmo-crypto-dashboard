/** zustand persist key used by `useThemeStore`; its stored shape is `{ state: { theme } }`. */
export const THEME_STORAGE_KEY = "coinpulse:theme-storage";

/**
 * Runs before first paint: applies the stored theme (or the OS preference)
 * so there is no light→dark flash. See Next docs "Preventing flash before hydration".
 * The `type` switch avoids React's client-side <script> warning.
 */
const script = `(function(){try{var s=localStorage.getItem("${THEME_STORAGE_KEY}");var t=s&&JSON.parse(s).state.theme;var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

export function ThemeScript() {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}
