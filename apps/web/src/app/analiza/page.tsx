"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/lib/context";
import styles from "./page.module.css";

type State = "idle" | "loading" | "done" | "error";

interface Result {
  ticker: string;
  snapshot: { name?: string; price?: number; change_pct?: number; sector?: string };
  decision?: string;
  analyst_reports?: Record<string, string>;
  news?: Array<{ title: string; source: string; published_at: string; url?: string }>;
  error?: string;
}

const EXAMPLES = ["AAPL", "NVDA", "TSLA", "BTC-USD", "SPY"];

export default function AnalizaPage() {
  const { t } = useApp();
  const s = t.analiza;
  const [ticker, setTicker] = useState("");
  const [state, setState] = useState<State>("idle");
  const [result, setResult] = useState<Result | null>(null);
  const [elapsed, setElapsed] = useState(0);

  // Progress counter during loading
  useEffect(() => {
    if (state !== "loading") { setElapsed(0); return; }
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, [state]);

  async function run(sym: string) {
    if (!sym.trim()) return;
    setState("loading");
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: sym.trim().toUpperCase(), analysts: ["market", "news", "fundamentals"] }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResult(data);
      setState("done");
    } catch {
      setState("error");
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    run(ticker);
  }

  const isPositive = (result?.snapshot?.change_pct ?? 0) >= 0;

  return (
    <div className={styles.page}>
      <div className="container">
        {/* ── Header ── */}
        <div className={styles.header}>
          <span className="eyebrow">{s.eyebrow}</span>
          <h1 className={styles.title}>{s.title}</h1>
          <p className={styles.subtitle}>{s.subtitle}</p>
        </div>

        {/* ── Input ── */}
        <form className={styles.form} onSubmit={onSubmit}>
          <div className={styles.inputWrap}>
            <input
              className={styles.input}
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder={s.placeholder}
              maxLength={12}
              autoFocus
              aria-label={s.tickerAria}
              autoComplete="off"
              autoCapitalize="characters"
            />
          </div>
          <button
            className={styles.submit}
            type="submit"
            disabled={!ticker.trim() || state === "loading"}
          >
            {state === "loading" ? s.loading : s.cta}
          </button>
        </form>

        {/* ── Example tickers ── */}
        {state === "idle" && (
          <div className={styles.examples}>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                className={styles.exampleChip}
                onClick={() => { setTicker(ex); run(ex); }}
              >
                {ex}
              </button>
            ))}
          </div>
        )}

        {/* ── Loading state ── */}
        {state === "loading" && (
          <div className={styles.loadingBlock}>
            <div className={styles.loadingBar} />
            <div className={styles.loadingAgents}>
              {s.loadingAgents.map((a, i) => (
                <span
                  key={a}
                  className={styles.loadingAgent}
                  style={{ animationDelay: `${i * 0.3}s` }}
                >
                  {a}
                </span>
              ))}
            </div>
            <p className={styles.loadingMeta}>{elapsed}s</p>
          </div>
        )}

        {/* ── Error ── */}
        {state === "error" && (
          <div className={styles.errorBlock}>
            <span className={styles.errorIcon}>⚠</span>
            <p>{s.errorMsg}</p>
          </div>
        )}

        {/* ── Result ── */}
        {state === "done" && result && (
          <div className={styles.result}>
            {/* Ticker header */}
            <div className={styles.resultHeader}>
              <div>
                <span className={styles.resultTicker}>{result.ticker}</span>
                {result.snapshot?.name && (
                  <span className={styles.resultName}>{result.snapshot.name}</span>
                )}
              </div>
              <div className={styles.resultPrice}>
                {result.snapshot?.price != null && (
                  <span className={styles.price}>${result.snapshot.price.toFixed(2)}</span>
                )}
                {result.snapshot?.change_pct != null && (
                  <span className={isPositive ? "positive mono" : "negative mono"}>
                    {isPositive ? "+" : ""}{result.snapshot.change_pct.toFixed(2)}%
                  </span>
                )}
              </div>
            </div>

            <div className={styles.resultDivider} />

            {/* Decision / signal */}
            {result.decision && (
              <div className={styles.signalBlock}>
                <p className={`eyebrow`}>{s.decisionLabel}</p>
                <p className={styles.decisionText}>{result.decision}</p>
              </div>
            )}

            {result.error && !result.decision && (
              <p className="muted" style={{ fontSize: "0.9rem" }}>{result.error}</p>
            )}

            {/* News */}
            {result.news && result.news.length > 0 && (
              <div className={styles.newsBlock}>
                <p className="eyebrow">{s.newsLabel}</p>
                <div className={styles.newsList}>
                  {result.news.slice(0, 5).map((item, i) => (
                    <div key={i} className={styles.newsItem}>
                      <p className={styles.newsTitle}>{item.title}</p>
                      <span className={`tertiary mono`} style={{ fontSize: "0.75rem" }}>{item.source}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
