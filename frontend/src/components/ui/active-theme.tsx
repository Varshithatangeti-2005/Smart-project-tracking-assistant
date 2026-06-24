"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

// Constants for localStorage key and default theme
const THEME_STORAGE_KEY = "app-theme";
const DEFAULT_THEME = "default";

type ThemeContextType = {
  activeTheme: string;
  setActiveTheme: (theme: string) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ActiveThemeProvider({
  children,
  initialTheme,
}: {
  children: ReactNode;
  initialTheme?: string;
}) {
  const [activeTheme, setActiveTheme] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (storedTheme) {
        return storedTheme;
      }
    }
    return initialTheme || DEFAULT_THEME;
  });

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, activeTheme);

    const root = document.documentElement; // <html>
    const toRemove = Array.from(root.classList).filter((c) =>
      c.startsWith("theme-")
    );
    if (toRemove.length) root.classList.remove(...toRemove);

    root.classList.add(`theme-${activeTheme}`);

    // Optional extra class when needed
    if (activeTheme.endsWith("-scaled")) {
      root.classList.add("theme-scaled");
    }
  }, [activeTheme]);

  return (
    <ThemeContext.Provider value={{ activeTheme, setActiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeConfig() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error(
      "useThemeConfig must be used within an ActiveThemeProvider"
    );
  }
  return context;
}
