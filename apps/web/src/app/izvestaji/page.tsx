import styles from "./page.module.css";

const MOCK_REPORTS = [
  { id: "1", ticker: "AAPL",  title: "Apple Inc. — Kvartalni pregled",  date: "15. maj 2025", type: "Kvartalni" },
  { id: "2", ticker: "NVDA",  title: "NVIDIA — AI infrastruktura",       date: "12. maj 2025", type: "Sektorski" },
  { id: "3", ticker: "SPY",   title: "S&P 500 — Mesečni outlook",        date: "10. maj 2025", type: "Mesečni"  },
  { id: "4", ticker: "MSFT",  title: "Microsoft — Cloud rast Q2",        date: "8. maj 2025",  type: "Kvartalni" },
  { id: "5", ticker: "BTC",   title: "Bitcoin — Ciklus i podrška",       date: "5. maj 2025",  type: "Nedeljni" },
];

export default function IzvestajiPage() {
  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <p className={styles.eyebrow}>Arhiva analiza</p>
          <h1 className={styles.title}>Izveštaji</h1>
          <p className={styles.subtitle}>
            Prethodni izveštaji i arhivirane analize pozicija.
          </p>
        </div>

        <div className={styles.divider} />

        <div className={styles.reportList}>
          {MOCK_REPORTS.map((r) => (
            <a key={r.id} href={`/analiza?ticker=${r.ticker}`} className={styles.reportItem}>
              <div className={styles.reportMeta}>
                <span className={styles.reportType}>{r.type}</span>
                <span className={styles.reportDate}>{r.date}</span>
              </div>
              <div className={styles.reportMain}>
                <span className={styles.reportTicker}>{r.ticker}</span>
                <h2 className={styles.reportTitle}>{r.title}</h2>
              </div>
              <span className={styles.reportArrow}>→</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
