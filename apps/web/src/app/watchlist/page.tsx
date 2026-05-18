"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/lib/context";
import styles from "./page.module.css";

interface WatchItem {
  ticker: string;
  price?: number;
  change_pct?: number;
  name?: string;
  loading?: boolean;
}

const DEFAULTS = ["AAPL", "NVDA", "MSFT", "SPY", "BTC-USD"];

export default function WatchlistPage() {
  const { t } = useApp();
  const s = t.watchlist;
  const [items, setItems] = useState<WatchItem[]>(
    DEFAULTS.map((ticker) => ({ ticker, loading: true }))
  );
  const [addInput, setAddInput] = useState("");

  useEffect(() => {
    DEFAULTS.forEach(fetchPrice);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchPrice(ticker: string) {
    setItems((prev) =>
      prev.map((i) => i.ticker === ticker ? { ...i, loading: true } : i)
    );
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker, analysts: [] }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setItems((prev) =>
        prev.map((i) =>
          i.ticker === ticker
            ? { ...i, price: data.snapshot?.price, change_pct: data.snapshot?.change_pct, name: data.snapshot?.name, loading: false }
            : i
        )
      );
    } catch {
      setItems((prev) => prev.map((i) => i.ticker === ticker ? { ...i, loading: false } : i));
    }
  }

  function add() {
    const t = addInput.trim().toUpperCase();
    if (!t || items.find((i) => i.ticker === t)) return;
    setItems((prev) => [...prev, { ticker: t, loading: true }]);
    setAddInput("");
    fetchPrice(t);
  }

  function remove(ticker: string) {
    setItems((prev) => prev.filter((i) => i.ticker !== ticker));
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <span className="eyebrow">{s.eyebrow}</span>
            <h1 className={styles.title}>{s.title}</h1>
          </div>
          <form className={styles.addForm} onSubmit={(e) => { e.preventDefault(); add(); }}>
            <input
              className={styles.addInput}
              value={addInput}
              onChange={(e) => setAddInput(e.target.value.toUpperCase())}
              placeholder={s.addPlaceholder}
              maxLength={12}
              aria-label="Dodaj ticker"
            />
            <button className={styles.addBtn} type="submit">{s.addBtn}</button>
          </form>
        </div>

        <div className="divider" />

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Naziv</th>
              <th className={styles.r}>Cena</th>
              <th className={styles.r}>%</th>
              <th className={styles.r} />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.ticker} className={styles.row}>
                <td>
                  <a href={`/analiza?ticker=${item.ticker}`} className={styles.sym}>{item.ticker}</a>
                </td>
                <td className="muted">
                  {item.loading ? <Skel w={100} /> : (item.name ?? "—")}
                </td>
                <td className={`${styles.r} ${styles.price}`}>
                  {item.loading ? <Skel w={60} /> : item.price != null ? `$${item.price.toFixed(2)}` : "—"}
                </td>
                <td className={styles.r}>
                  {item.loading ? <Skel w={48} /> : item.change_pct != null ? (
                    <span className={`mono ${item.change_pct >= 0 ? "positive" : "negative"}`}>
                      {item.change_pct >= 0 ? "+" : ""}{item.change_pct.toFixed(2)}%
                    </span>
                  ) : "—"}
                </td>
                <td className={styles.r}>
                  <button className={styles.removeBtn} onClick={() => remove(item.ticker)} aria-label={`Ukloni ${item.ticker}`}>×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {items.length === 0 && (
          <p className={`${styles.empty} muted`}>{s.emptyMsg}</p>
        )}
      </div>
    </div>
  );
}

function Skel({ w }: { w: number }) {
  return <span className={styles.skel} style={{ width: w }} />;
}
