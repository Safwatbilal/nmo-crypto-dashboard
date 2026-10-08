export const THEME_STORAGE_KEY = "coinpulse:theme";

/**
 * Runs before first paint: applies the stored theme (or the OS preference)
 * so there is no light→dark flash. See Next docs "Preventing flash before hydration".
 * The `type` switch avoids React's client-side <script> warning.
 */
const script = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

export function ThemeScript() {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}
