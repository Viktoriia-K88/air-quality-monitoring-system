import { useEffect, useState, type ReactNode } from "react";

import {
  ThemeContext,
  type ResolvedTheme,
  type ThemeMode,
} from "./ThemeContext";

type ThemeProviderProps = {
  children: ReactNode;
};

const THEME_STORAGE_KEY = "air-quality-theme";

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getSavedTheme(): ThemeMode {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (
    savedTheme === "light" ||
    savedTheme === "dark" ||
    savedTheme === "system"
  ) {
    return savedTheme;
  }

  return "system";
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeMode>(getSavedTheme);

  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);

  const resolvedTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function handleSystemThemeChange(event: MediaQueryListEvent) {
      setSystemTheme(event.matches ? "dark" : "light");
    }

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;

    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  function setTheme(newTheme: ThemeMode) {
    setThemeState(newTheme);

    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
