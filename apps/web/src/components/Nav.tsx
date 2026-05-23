"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoWordmark } from "./Logo";
import { useApp } from "@/lib/context";
import styles from "./Nav.module.css";

export default function Nav() {
  const pathname = usePathname();
  const { t, locale, setLocale, theme, toggleTheme } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/analiza",    label: t.nav.analiza },
    { href: "/watchlist",  label: t.nav.watchlist },
    { href: "/asistent",   label: t.nav.asistent },
    { href: "/izvestaji",  label: t.nav.izvestaji },
    { href: "/onboarding", label: t.nav.onboarding },
  ];

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setIsOpen(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  return (
    <>
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
                  className={`${styles.link} ${(pathname === href || pathname?.startsWith(`${href}/`)) ? styles.active : ""}`}
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

            {/* CTA - desktop only */}
            <Link href="/analiza" className={styles.cta}>
              {t.nav.cta}
            </Link>

            {/* Hamburger - mobile only */}
            <button
              className={styles.hamburger}
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              <span className={`${styles.hamburgerLine} ${isOpen ? styles.open : ""}`} />
              <span className={`${styles.hamburgerLine} ${isOpen ? styles.open : ""}`} />
              <span className={`${styles.hamburgerLine} ${isOpen ? styles.open : ""}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ""}`}
        aria-hidden={!isOpen}
      >
        <div className={styles.overlayContent}>
          <ul className={styles.overlayLinks} role="list">
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`${styles.overlayLink} ${(pathname === href || pathname?.startsWith(`${href}/`)) ? styles.overlayActive : ""}`}
                  onClick={() => setIsOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/analiza" className={styles.overlayCta} onClick={() => setIsOpen(false)}>
            {t.nav.cta}
          </Link>
        </div>
      </div>
    </>
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
