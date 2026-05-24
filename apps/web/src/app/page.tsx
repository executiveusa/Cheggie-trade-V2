"use client";

import { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/context";
import { DEMO_RESULT, DEMO_LABELS } from "@/lib/demo-result";
import AgentDiagram from "@/components/AgentDiagram";
import { TrendingUpIcon, BitcoinIcon, EyeIcon, FileTextIcon } from "@/components/UseCaseIcons";
import styles from "./page.module.css";

// Map use case index to icon component
const USE_CASE_ICONS = [TrendingUpIcon, BitcoinIcon, EyeIcon, FileTextIcon];

export default function Home() {
  const { t, locale } = useApp();
  const h = t.home;
  const demoLabels = DEMO_LABELS[locale];
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  return (
    <>
      {/* ══ HERO ════════════════════════════════════════════════ */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div className={`${styles.heroLeft} fade-up`}>
            <span className="eyebrow">{h.eyebrow}</span>
            <h1 className={styles.headline}>{h.headline}</h1>
            <p className={styles.sub}>{h.sub}</p>
            <div className={styles.heroActions}>
              <Link href="/analiza" className={styles.ctaPrimary}>{h.ctaPrimary}</Link>
              <Link href="/onboarding" className={styles.ctaGhost}>{h.ctaSecondary}</Link>
            </div>
          </div>

          <div className={`${styles.heroRight} fade-in`} style={{ animationDelay: "0.15s" }}>
            <AgentDiagram />
          </div>
        </div>

        {/* subtle grid overlay */}
        <div className={styles.heroGrid_bg} aria-hidden="true" />
      </section>

      <div className="divider" />

      {/* ══ PROBLEM → SOLUTION ══════════════════════════════════ */}
      <section className={`section ${styles.psSection}`}>
        <div className={`container ${styles.psGrid}`}>
          <div className={styles.psBlock}>
            <span className="eyebrow">{h.problemLabel}</span>
            <h2 className={styles.psTitle}>{h.problemTitle}</h2>
            <p className={styles.psBody}>{h.problemBody}</p>
          </div>

          <div className={styles.psDivider} aria-hidden="true">
            <div className={styles.psDividerLine} />
            <span className={styles.psDividerIcon}>→</span>
            <div className={styles.psDividerLine} />
          </div>

          <div className={styles.psBlock}>
            <span className="eyebrow" style={{ color: "var(--accent)" }}>{h.solutionLabel}</span>
            <h2 className={styles.psTitle}>{h.solutionTitle}</h2>
            <p className={styles.psBody}>{h.solutionBody}</p>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ══ HOW IT WORKS ════════════════════════════════════════ */}
      <section className={`section ${styles.howSection}`}>
        <div className="container">
          <span className="eyebrow">{h.howTitle}</span>
          <div className={styles.steps}>
            {h.steps.map((step: { n: string; title: string; body: string }, i: number) => (
              <div key={step.n} className={styles.step}>
                <div className={styles.stepLeft}>
                  <span className={styles.stepN}>{step.n}</span>
                  {i < h.steps.length - 1 && (
                    <div className={styles.stepConnector} aria-hidden="true" />
                  )}
                </div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepBody}>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ══ LIVE DEMO ═══════════════════════════════════════════ */}
      <section className={`section ${styles.demoSection}`}>
        <div className="container">
          <div className={styles.demoHeader}>
            <span className="eyebrow">{demoLabels.eyebrow}</span>
            <h2 className={styles.demoTitle}>{demoLabels.title}</h2>
            <p className={styles.demoSubtitle}>{demoLabels.subtitle}</p>
          </div>

          <div className={styles.demoResult}>
            {/* Ticker header */}
            <div className={styles.demoResultHeader}>
              <div>
                <span className={styles.demoTicker}>{DEMO_RESULT.ticker}</span>
                <span className={styles.demoName}>{DEMO_RESULT.snapshot.name}</span>
              </div>
              <div className={styles.demoPrice}>
                <span className={styles.demoPriceValue}>${DEMO_RESULT.snapshot.price.toFixed(2)}</span>
                <span className={`mono ${DEMO_RESULT.snapshot.change_pct >= 0 ? "positive" : "negative"}`}>
                  {DEMO_RESULT.snapshot.change_pct >= 0 ? "+" : ""}{DEMO_RESULT.snapshot.change_pct.toFixed(2)}%
                </span>
              </div>
            </div>

            <div className={styles.demoDivider} />

            {/* Signal */}
            <div className={styles.demoSignal}>
              <p className="eyebrow">{demoLabels.decisionLabel}</p>
              <p className={styles.demoDecision}>{DEMO_RESULT.decision}</p>
            </div>

            {/* Analyst breakdown */}
            <div className={styles.demoAnalysts}>
              <p className="eyebrow">{demoLabels.analystsLabel}</p>
              <div className={styles.demoAgentList}>
                {Object.entries(DEMO_RESULT.analyst_reports).map(([key, report]) => (
                  <div key={key} className={styles.demoAgentItem}>
                    <button
                      className={styles.demoAgentHeader}
                      onClick={() => setExpandedAgent(expandedAgent === key ? null : key)}
                      aria-expanded={expandedAgent === key}
                    >
                      <span className={styles.demoAgentName}>
                        {demoLabels.agents[key as keyof typeof demoLabels.agents]}
                      </span>
                      <ChevronIcon expanded={expandedAgent === key} />
                    </button>
                    {expandedAgent === key && (
                      <p className={styles.demoAgentReport}>{report}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* News */}
            <div className={styles.demoNews}>
              <p className="eyebrow">{demoLabels.newsLabel}</p>
              <div className={styles.demoNewsList}>
                {DEMO_RESULT.news.slice(0, 3).map((item, i) => (
                  <div key={i} className={styles.demoNewsItem}>
                    <p className={styles.demoNewsTitle}>{item.title}</p>
                    <span className="tertiary mono" style={{ fontSize: "0.75rem" }}>{item.source}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.demoCta}>
            <Link href="/analiza" className={styles.ctaPrimary}>{demoLabels.cta}</Link>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ══ USE CASES ═══════════════════════════════════════════ */}
      <section className={`section ${styles.useCasesSection}`}>
        <div className="container">
          <span className="eyebrow">{h.useCasesTitle}</span>
          <div className={styles.useCasesList}>
            {h.useCases.map((uc: { icon: string; title: string; body: string }, index: number) => {
              const IconComponent = USE_CASE_ICONS[index] || TrendingUpIcon;
              return (
                <div key={uc.title} className={styles.useCase}>
                  <span className={styles.useCaseIcon} aria-hidden="true">
                    <IconComponent />
                  </span>
                  <div>
                    <h4 className={styles.useCaseTitle}>{uc.title}</h4>
                    <p className={styles.useCaseBody}>{uc.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ══ TRUST / METHODOLOGY ════════════════════════════════ */}
      <section className={`section ${styles.trustSection}`}>
        <div className="container">
          <div className={styles.trustInner}>
            <div className={styles.trustLeft}>
              <span className="eyebrow">{h.trustTitle}</span>
              <p className={styles.trustBody}>{h.trustBody}</p>
            </div>
            <div className={styles.trustBadges}>
              {h.trustBadges.map((b: string) => (
                <span key={b} className={styles.trustBadge}>{b}</span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      style={{
        transition: "transform 0.2s ease",
        transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
