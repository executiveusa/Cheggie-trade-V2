"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoWordmark } from "./Logo";
import { useApp } from "@/lib/context";
import styles from "./Nav.module.css";

export default function Nav() {
  const pathname = usePathname();
  const { t, locale, setLocale, theme, toggleTheme } = useApp();

  const links = [
    { href: "/analiza",    label: t.nav.analiza },
    { href: "/watchlist",  label: t.nav.watchlist },
    { href: "/asistent",   label: t.nav.asistent },
    { href: "/izvestaji",  label: t.nav.izvestaji },
    { href: "/onboarding", label: t.nav.onboarding },
  ];

  return (
    <nav className={styles.nav} role="navigation" aria-label="Primarna navigacija">
      <div className={styles.inner}>
        <Link href="/" className={styles.logo} aria-label="CheggieTrade početna">
          <LogoWordmark />
        </Link>

        <ul className={styles.links} role="list">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`${styles.link} ${pathname?.startsWith(href) ? styles.active : ""}`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className={styles.controls}>
          {/* Language toggle — cycles sr → es → en → sr */}
          <button
            className={styles.toggle}
            onClick={() => setLocale(locale === "sr" ? "es" : locale === "es" ? "en" : "sr")}
            aria-label="Switch language"
          >
            {locale === "sr" ? "ES" : locale === "es" ? "EN" : "SR"}
          </button>

          {/* Theme toggle */}
          <button
            className={styles.toggle}
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* CTA */}
          <Link href="/analiza" className={styles.cta}>
            {t.nav.cta}
          </Link>
        </div>
      </div>
    </nav>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}
