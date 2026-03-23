export type ThemeMode = "light" | "dark";

export const DEFAULT_THEME: ThemeMode = "light";
export const THEME_ATTRIBUTE = "data-theme";
export const THEME_STORAGE_KEY = "hike-this-day-theme";

export function isThemeMode(value: string | null | undefined): value is ThemeMode {
  return value === "light" || value === "dark";
}

export function getThemeBootstrapScript(): string {
  return `
(() => {
  const storageKey = ${JSON.stringify(THEME_STORAGE_KEY)};
  const attribute = ${JSON.stringify(THEME_ATTRIBUTE)};
  const root = document.documentElement;

  const applyTheme = (theme) => {
    root.setAttribute(attribute, theme);
    root.style.colorScheme = theme;
    root.classList.toggle("dark", theme === "dark");
  };

  try {
    const storedTheme = window.localStorage.getItem(storageKey);

    if (storedTheme === "light" || storedTheme === "dark") {
      applyTheme(storedTheme);
      return;
    }

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark ? "dark" : "light");
  } catch {
    applyTheme(${JSON.stringify(DEFAULT_THEME)});
  }
})();
  `.trim();
}
