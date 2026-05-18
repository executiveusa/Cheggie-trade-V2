"use client";

import { useApp } from "@/lib/context";
import { locales } from "@/lib/locale";

export default function LocaleSwitcher() {
  const { locale, setLocale } = useApp();
  return (
    <select aria-label="Locale" value={locale} onChange={(e) => setLocale(e.target.value as typeof locale)}>
      {locales.map((value) => (
        <option key={value} value={value}>{value}</option>
      ))}
    </select>
  );
}
