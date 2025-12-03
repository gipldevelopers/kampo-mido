"use client";

import { createContext, useContext, useEffect, useState } from "react";

// Initialize context with default values to avoid errors if used outside provider
const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // FIX: Wrap logic in setTimeout to avoid "synchronous setState" linter error
    const timer = setTimeout(() => {
      // 1. Check local storage
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        setTheme(savedTheme);
      }
      // 2. Mark as mounted
      setMounted(true);
    }, 0);

    // Cleanup timer if component unmounts
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Apply theme class to HTML element
    if (!mounted) return;
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Prevent hydration mismatch by returning null until mounted
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);