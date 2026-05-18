import { DEFAULT_LOCALE, type Locale } from "./i18n";

export const locales: Locale[] = ["sr-RS", "en-US", "es-ES"];

export function nextLocale(current: Locale): Locale {
  const idx = locales.indexOf(current);
  return locales[(idx + 1) % locales.length] ?? DEFAULT_LOCALE;
}
