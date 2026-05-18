"use client";

import Link from "next/link";
import { useApp } from "@/lib/context";
import AgentDiagram from "@/components/AgentDiagram";
import styles from "./page.module.css";

export default function Home() {
  const { t } = useApp();
  const h = t.home;

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
            {h.steps.map((step, i) => (
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

      {/* ══ USE CASES ═══════════════════════════════════════════ */}
      <section className={`section ${styles.useCasesSection}`}>
        <div className="container">
          <span className="eyebrow">{h.useCasesTitle}</span>
          <div className={styles.useCasesList}>
            {h.useCases.map((uc) => (
              <div key={uc.title} className={styles.useCase}>
                <span className={styles.useCaseIcon} aria-hidden="true">{uc.icon}</span>
                <div>
                  <h4 className={styles.useCaseTitle}>{uc.title}</h4>
                  <p className={styles.useCaseBody}>{uc.body}</p>
                </div>
              </div>
            ))}
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
              {h.trustBadges.map((b) => (
                <span key={b} className={styles.trustBadge}>{b}</span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
