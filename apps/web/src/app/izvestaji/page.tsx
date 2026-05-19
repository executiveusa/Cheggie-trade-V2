"use client";

import Link from "next/link";
import { useApp } from "@/lib/context";
import styles from "./page.module.css";

const REPORTS = [
  { id: "1", ticker: "AAPL",  type: "Kvartalni",  title: "Apple Inc. — Q2 2025 pregled",         date: "15. maj 2025" },
  { id: "2", ticker: "NVDA",  type: "Sektorski",  title: "NVIDIA — AI infrastruktura 2025",       date: "12. maj 2025" },
  { id: "3", ticker: "SPY",   type: "Mesečni",    title: "S&P 500 — Maj outlook",                 date: "10. maj 2025" },
  { id: "4", ticker: "MSFT",  type: "Kvartalni",  title: "Microsoft — Cloud rast Q2",             date: "8. maj 2025"  },
  { id: "5", ticker: "BTC",   type: "Nedeljni",   title: "Bitcoin — Analiza ciklusa i podrške",   date: "5. maj 2025"  },
  { id: "6", ticker: "TSLA",  type: "Kvartalni",  title: "Tesla — Isporuke i margine",            date: "3. maj 2025"  },
];

export default function IzvestajiPage() {
  const { t } = useApp();

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <span className="eyebrow">{t.izvestaji.eyebrow}</span>
          <h1 className={styles.title}>{t.izvestaji.title}</h1>
          <p className={styles.subtitle}>{t.izvestaji.subtitle}</p>
        </div>
        <div className="divider" />
        <div className={styles.list}>
          {REPORTS.map((r) => (
            <Link key={r.id} href={`/analiza?ticker=${r.ticker}`} className={styles.item}>
              <div className={styles.itemMeta}>
                <span className={styles.itemType}>{r.type}</span>
                <span className={styles.itemDate}>{r.date}</span>
              </div>
              <div className={styles.itemMain}>
                <span className={styles.itemTicker}>{r.ticker}</span>
                <h2 className={styles.itemTitle}>{r.title}</h2>
              </div>
              <span className={styles.arrow} aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
