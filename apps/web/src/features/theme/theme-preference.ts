import { isThemePreference, ThemePreference } from "@daycraft/domain";

/** Cookie holding the device's theme preference (decision W2). Read before first paint. */
const THEME_COOKIE = "daycraft-theme";
const THEME_CHANGE_EVENT = "daycraft-theme-change";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function readThemePreference(): ThemePreference {
  const match = document.cookie.match(new RegExp(`(?:^|; )${THEME_COOKIE}=([^;]*)`));
  const value = match?.[1];
  return isThemePreference(value) ? value : ThemePreference.SYSTEM;
}

export function writeThemePreference(preference: ThemePreference): void {
  document.cookie = `${THEME_COOKIE}=${preference}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function subscribeToThemePreference(onChange: () => void): () => void {
  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, onChange);
}

/**
 * Sets the `dark` class before first paint and follows the OS while the preference is System.
 * Mirrors resolveColorScheme from @daycraft/domain, because it runs before React loads.
 */
export const themeScript = `(() => {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const apply = () => {
    const match = document.cookie.match(/(?:^|; )${THEME_COOKIE}=(system|light|dark)/);
    const preference = match ? match[1] : "system";
    const dark = preference === "dark" || (preference === "system" && media.matches);
    document.documentElement.classList.toggle("dark", dark);
  };
  apply();
  media.addEventListener("change", apply);
  window.addEventListener("${THEME_CHANGE_EVENT}", apply);
})();`;
