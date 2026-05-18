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
  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <span className="eyebrow">Arhiva analiza</span>
          <h1 className={styles.title}>Izveštaji</h1>
          <p className={styles.subtitle}>Prethodni izveštaji i arhivirane analize pozicija.</p>
        </div>
        <div className="divider" />
        <div className={styles.list}>
          {REPORTS.map((r) => (
            <a key={r.id} href={`/analiza?ticker=${r.ticker}`} className={styles.item}>
              <div className={styles.itemMeta}>
                <span className={styles.itemType}>{r.type}</span>
                <span className={styles.itemDate}>{r.date}</span>
              </div>
              <div className={styles.itemMain}>
                <span className={styles.itemTicker}>{r.ticker}</span>
                <h2 className={styles.itemTitle}>{r.title}</h2>
              </div>
              <span className={styles.arrow} aria-hidden="true">→</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
