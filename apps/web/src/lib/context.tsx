"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { DEFAULT_LOCALE, strings, type Locale } from "./i18n";
import { locales } from "./locale";

// Union of all locales — consumer receives whichever is active
type AnyStrings = (typeof strings)[Locale];

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

  // Persist locale + keep <html lang> in sync
  useEffect(() => {
    const saved = localStorage.getItem("ct-locale") as Locale | null;
    if (saved && locales.includes(saved)) setLocaleState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    localStorage.setItem("ct-locale", locale);
  }, [locale]);

  function setLocale(l: Locale) {
    setLocaleState(l);
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
