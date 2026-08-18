import { createContext } from "react";

export type ThemeMode = "system" | "light" | "dark";

export type ResolvedTheme = "light" | "dark";

export type ThemeContextValue = {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);
