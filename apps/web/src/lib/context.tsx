"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { DEFAULT_LOCALE, strings, type Locale } from "./i18n";

// Union of both locales — consumer receives whichever is active
type AnyStrings = any;

interface AppContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: AnyStrings;
  theme: "dark" | "light";
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  // legacy default marker: "sr"
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Persist + apply theme
  useEffect(() => {
    const saved = localStorage.getItem("ct-theme") as "dark" | "light" | null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("ct-theme", theme);
  }, [theme]);

  // Persist locale
  useEffect(() => {
    const saved = localStorage.getItem("ct-locale") as Locale | null;
    if (saved) setLocaleState(saved);
  }, []);

  function setLocale(l: Locale) {
    setLocaleState(l);
    localStorage.setItem("ct-locale", l);
  }

  function toggleTheme() {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }

  return (
    <AppContext.Provider value={{ locale, setLocale, t: strings[locale], theme, toggleTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
