"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/lib/context";
import styles from "./page.module.css";

type State = "idle" | "loading" | "done" | "error";

interface Analysis {
  dcf: any;
  comps: any;
  technical: any;
  thesis: any;
}

interface Result {
  ok: boolean;
  ticker: string;
  snapshot: { name?: string; price?: number; change_pct?: number; sector?: string };
  analysis?: Analysis;
  recommendation?: string;
  news?: Array<{ title: string; source: string; published_at: string; url?: string }>;
  error?: string;
}

const EXAMPLES = ["AAPL", "NVDA", "TSLA", "MSFT", "SPY"];

export default function AnalizaPage() {
  const { t } = useApp();
  const s = t.analiza;
  const [ticker, setTicker] = useState("");
  const [state, setState] = useState<State>("idle");
  const [result, setResult] = useState<Result | null>(null);
  const [elapsed, setElapsed] = useState(0);

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
        body: JSON.stringify({ ticker: sym.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Analysis failed");
      setResult(data);
      setState("done");
    } catch (err) {
      console.error(err);
      setState("error");
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    run(ticker);
  }

  const isPositive = (result?.snapshot?.change_pct ?? 0) >= 0;
  const analysis = result?.analysis;

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <span className="eyebrow">{s.eyebrow}</span>
          <h1 className={styles.title}>{s.title}</h1>
          <p className={styles.subtitle}>{s.subtitle}</p>
        </div>

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
            {state === "loading" ? `Analyzing... ${elapsed}s` : "Analyze"}
          </button>
        </form>

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

        {state === "loading" && (
          <div className={styles.loadingBlock}>
            <div className={styles.loadingBar} />
            <div className={styles.loadingAgents}>
              {["📊 DCF Model", "🔍 Comparables", "📈 Technical", "🎯 Thesis"].map((a, i) => (
                <span
                  key={a}
                  className={styles.loadingAgent}
                  style={{ animationDelay: `${i * 0.3}s` }}
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {state === "error" && (
          <div className={styles.errorBlock}>
            <span className={styles.errorIcon}>⚠</span>
            <p>Unable to analyze {ticker}. Please try another symbol.</p>
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

            {result.recommendation && (
              <div className={styles.recommendationBlock}>
                <div className={styles.recommendationBadge}>
                  {result.recommendation}
                </div>
              </div>
            )}

            {analysis?.thesis && (
              <div className={styles.valuationSection}>
                <h3 className="eyebrow">💰 Valuation Analysis</h3>
                <div className={styles.valuationGrid}>
                  <div className={styles.valuationBox}>
                    <span className={styles.label}>DCF Fair Value</span>
                    <span className={styles.value}>${analysis.dcf.fair_value}</span>
                    <span className={styles.meta}>{analysis.dcf.upside > 0 ? "+" : ""}{analysis.dcf.upside}% upside</span>
                  </div>
                  <div className={styles.valuationBox}>
                    <span className={styles.label}>Comps Fair Value</span>
                    <span className={styles.value}>${analysis.comps.fair_value_estimate}</span>
                    <span className={styles.meta}>{analysis.comps.upside > 0 ? "+" : ""}{analysis.comps.upside}% upside</span>
                  </div>
                  <div className={styles.valuationBox}>
                    <span className={styles.label}>Fair Value Range</span>
                    <span className={styles.value}>${analysis.thesis.fair_value_range[0]} - ${analysis.thesis.fair_value_range[1]}</span>
                    <span className={styles.meta}>Based on multiple methods</span>
                  </div>
                </div>
              </div>
            )}

            {analysis?.technical && (
              <div className={styles.technicalSection}>
                <h3 className="eyebrow">📈 Technical Setup</h3>
                <div className={styles.technicalGrid}>
                  <div className={styles.techItem}>
                    <span className={styles.label}>RSI (14)</span>
                    <span className={styles.value}>{analysis.technical.rsi}</span>
                    <span className={styles.meta}>{analysis.technical.rsi_signal}</span>
                  </div>
                  <div className={styles.techItem}>
                    <span className={styles.label}>52-Week Range</span>
                    <span className={styles.value}>${analysis.technical["52w_low"]} - ${analysis.technical["52w_high"]}</span>
                    <span className={styles.meta}>{analysis.technical.trend}</span>
                  </div>
                </div>
              </div>
            )}

            {analysis?.thesis && (
              <div className={styles.thesisSection}>
                <h3 className="eyebrow">🎯 Investment Thesis</h3>
                <div className={styles.caseGrid}>
                  <div className={styles.bullCase}>
                    <span className={styles.caseIcon}>🟢</span>
                    <h4>{analysis.thesis.bull_case.title}</h4>
                    <p className={styles.caseThesis}>{analysis.thesis.bull_case.thesis}</p>
                    <div className={styles.catalysts}>
                      {analysis.thesis.bull_case.catalysts.map((c: string) => (
                        <span key={c} className={styles.catalyst}>{c}</span>
                      ))}
                    </div>
                    <div className={styles.casePrice}>
                      <span className={styles.label}>Upside Target</span>
                      <span className={styles.priceTarget}>${analysis.thesis.bull_case.target_price}</span>
                      <span className={styles.priceUpside}>+{analysis.thesis.bull_case.upside}%</span>
                    </div>
                  </div>

                  <div className={styles.bearCase}>
                    <span className={styles.caseIcon}>🔴</span>
                    <h4>{analysis.thesis.bear_case.title}</h4>
                    <p className={styles.caseThesis}>{analysis.thesis.bear_case.thesis}</p>
                    <div className={styles.risks}>
                      {analysis.thesis.bear_case.risks.map((r: string) => (
                        <span key={r} className={styles.risk}>{r}</span>
                      ))}
                    </div>
                    <div className={styles.casePrice}>
                      <span className={styles.label}>Downside Target</span>
                      <span className={styles.priceTarget}>${analysis.thesis.bear_case.downside_target}</span>
                      <span className={styles.priceDownside}>{analysis.thesis.bear_case.downside}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {result.news && result.news.length > 0 && (
              <div className={styles.newsBlock}>
                <p className="eyebrow">📰 Recent News</p>
                <div className={styles.newsList}>
                  {result.news.slice(0, 3).map((item, i) => (
                    <div key={i} className={styles.newsItem}>
                      <p className={styles.newsTitle}>{item.title}</p>
                      <span className={`tertiary mono`} style={{ fontSize: "0.75rem" }}>{item.source}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.disclaimer}>
              <p className="small">
                <strong>Disclaimer:</strong> This analysis is for educational purposes only and does not constitute investment advice.
                Always conduct your own due diligence and consult with a financial advisor before making investment decisions.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
