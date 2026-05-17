"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

interface WatchItem {
  ticker: string;
  price?: number;
  change_pct?: number;
  name?: string;
}

const DEFAULT_WATCHLIST = ["AAPL", "NVDA", "MSFT", "SPY", "BTC-USD"];

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchItem[]>(
    DEFAULT_WATCHLIST.map((t) => ({ ticker: t }))
  );
  const [addInput, setAddInput] = useState("");
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Load prices for all items on mount
    items.forEach((item) => fetchPrice(item.ticker));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchPrice(ticker: string) {
    setLoading((p) => ({ ...p, [ticker]: true }));
    try {
      const res = await fetch(`/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker, analysts: [] }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setItems((prev) =>
        prev.map((item) =>
          item.ticker === ticker
            ? {
                ...item,
                price: data.snapshot?.price,
                change_pct: data.snapshot?.change_pct,
                name: data.snapshot?.name,
              }
            : item
        )
      );
    } catch {
      // silent — keep placeholder
    } finally {
      setLoading((p) => ({ ...p, [ticker]: false }));
    }
  }

  function addTicker() {
    const t = addInput.trim().toUpperCase();
    if (!t || items.find((i) => i.ticker === t)) return;
    const newItem: WatchItem = { ticker: t };
    setItems((p) => [...p, newItem]);
    setAddInput("");
    fetchPrice(t);
  }

  function removeTicker(ticker: string) {
    setItems((p) => p.filter((i) => i.ticker !== ticker));
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Vaš watchlist</p>
            <h1 className={styles.title}>Praćene pozicije</h1>
          </div>

          <form
            className={styles.addForm}
            onSubmit={(e) => { e.preventDefault(); addTicker(); }}
          >
            <input
              className={styles.addInput}
              value={addInput}
              onChange={(e) => setAddInput(e.target.value.toUpperCase())}
              placeholder="Dodaj ticker…"
              maxLength={12}
              aria-label="Dodaj ticker"
            />
            <button className={styles.addBtn} type="submit">Dodaj</button>
          </form>
        </div>

        <div className={styles.divider} />

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Naziv</th>
              <th className={styles.right}>Cena</th>
              <th className={styles.right}>Promena</th>
              <th className={styles.right}>Akcija</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.ticker} className={styles.row}>
                <td>
                  <a href={`/analiza?ticker=${item.ticker}`} className={styles.tickerLink}>
                    {item.ticker}
                  </a>
                </td>
                <td className={styles.nameCell}>
                  {loading[item.ticker] ? (
                    <span className={styles.skeleton} />
                  ) : (
                    item.name || "—"
                  )}
                </td>
                <td className={`${styles.right} ${styles.priceCell}`}>
                  {loading[item.ticker] ? (
                    <span className={styles.skeleton} />
                  ) : item.price != null ? (
                    `$${item.price.toFixed(2)}`
                  ) : "—"}
                </td>
                <td className={styles.right}>
                  {loading[item.ticker] ? (
                    <span className={styles.skeleton} />
                  ) : item.change_pct != null ? (
                    <span className={item.change_pct >= 0 ? styles.positive : styles.negative}>
                      {item.change_pct >= 0 ? "+" : ""}{item.change_pct.toFixed(2)}%
                    </span>
                  ) : "—"}
                </td>
                <td className={styles.right}>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeTicker(item.ticker)}
                    aria-label={`Ukloni ${item.ticker}`}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {items.length === 0 && (
          <div className={styles.empty}>
            <p>Watchlist je prazan. Dodajte ticker iznad.</p>
          </div>
        )}
      </div>
    </div>
  );
}
