"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoFull } from "./Logo";
import styles from "./Nav.module.css";

const NAV_ITEMS = [
  { href: "/analiza",    label: "Analiza" },
  { href: "/izvestaji",  label: "Izveštaji" },
  { href: "/watchlist",  label: "Watchlist" },
  { href: "/asistent",   label: "Asistent" },
  { href: "/onboarding", label: "Onboarding" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} role="navigation" aria-label="Primarna navigacija">
      <div className={styles.inner}>
        <Link href="/" className={styles.logo} aria-label="CheggieTrade početna">
          <LogoFull />
        </Link>

        <ul className={styles.links} role="list">
          {NAV_ITEMS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`${styles.link} ${pathname === href ? styles.active : ""}`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <Link href="/analiza" className={styles.cta}>
          Pokreni analizu
        </Link>
      </div>
    </nav>
  );
}
