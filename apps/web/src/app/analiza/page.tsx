"use client";

import { useState } from "react";
import styles from "./page.module.css";

type AnalysisState = "idle" | "loading" | "done" | "error";

interface AnalysisResult {
  ticker: string;
  snapshot: {
    name?: string;
    price?: number;
    change_pct?: number;
    sector?: string;
  };
  decision?: string;
  analyst_reports?: Record<string, string>;
  news?: Array<{ title: string; source: string; published_at: string }>;
  error?: string;
}

export default function AnalizaPage() {
  const [ticker, setTicker] = useState("");
  const [state, setState] = useState<AnalysisState>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);

  async function runAnalysis(e: React.FormEvent) {
    e.preventDefault();
    if (!ticker.trim()) return;
    setState("loading");
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: ticker.trim().toUpperCase(), analysts: ["market", "news", "fundamentals"] }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setResult(data);
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Analiza tržišta</p>
        <h1 className={styles.title}>Unesite ticker</h1>
        <p className={styles.subtitle}>
          Fundamentalna, tehnička i sentiment analiza u jednom izveštaju.
        </p>
      </div>

      <form className={styles.form} onSubmit={runAnalysis}>
        <input
          className={styles.input}
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          placeholder="AAPL, NVDA, BTC-USD…"
          maxLength={12}
          autoFocus
          aria-label="Ticker simbol"
        />
        <button
          className={styles.submit}
          type="submit"
          disabled={!ticker.trim() || state === "loading"}
        >
          {state === "loading" ? "Analiza u toku…" : "Pokreni analizu"}
        </button>
      </form>

      {state === "loading" && (
        <div className={styles.loading}>
          <div className={styles.loadingBar} />
          <p className={styles.loadingText}>Analiziramo {ticker}…</p>
        </div>
      )}

      {state === "error" && (
        <div className={styles.errorBlock}>
          <p>Analiza trenutno nije dostupna. Pokušajte ponovo.</p>
        </div>
      )}

      {state === "done" && result && (
        <div className={styles.result}>
          <div className={styles.resultHeader}>
            <div>
              <span className={styles.resultTicker}>{result.ticker}</span>
              {result.snapshot?.name && (
                <span className={styles.resultName}>{result.snapshot.name}</span>
              )}
            </div>
            <div className={styles.resultPrice}>
              {result.snapshot?.price != null && (
                <span className={styles.priceValue}>${result.snapshot.price.toFixed(2)}</span>
              )}
              {result.snapshot?.change_pct != null && (
                <span className={result.snapshot.change_pct >= 0 ? styles.positive : styles.negative}>
                  {result.snapshot.change_pct >= 0 ? "+" : ""}{result.snapshot.change_pct.toFixed(2)}%
                </span>
              )}
            </div>
          </div>

          {result.decision && (
            <div className={styles.decision}>
              <p className={styles.decisionLabel}>Zaključak analize</p>
              <p className={styles.decisionText}>{result.decision}</p>
            </div>
          )}

          {result.error && (
            <div className={styles.infoBlock}>
              <p className="text-secondary">{result.error}</p>
            </div>
          )}

          {result.news && result.news.length > 0 && (
            <div className={styles.newsSection}>
              <h3 className={styles.sectionTitle}>Vesti</h3>
              <div className={styles.newsList}>
                {result.news.slice(0, 5).map((item, i) => (
                  <div key={i} className={styles.newsItem}>
                    <p className={styles.newsTitle}>{item.title}</p>
                    <p className={styles.newsMeta}>{item.source}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
