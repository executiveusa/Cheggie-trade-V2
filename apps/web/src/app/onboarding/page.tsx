"use client";

import Link from "next/link";
import { useApp } from "@/lib/context";
import styles from "./page.module.css";

export default function OnboardingPage() {
  const { t } = useApp();
  const steps = t.home.steps;

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <span className="eyebrow">{t.onboarding.eyebrow}</span>
          <h1 className={styles.title}>{t.onboarding.title}</h1>
          <p className={styles.subtitle}>{t.onboarding.sub}</p>
        </div>

        <div className={styles.stepsWrap}>
          {steps.map((step, i) => (
            <div key={step.n} className={styles.step}>
              <div className={styles.stepLeft}>
                <span className={styles.n}>{step.n}</span>
                {i < steps.length - 1 && <div className={styles.connector} />}
              </div>
              <div className={styles.content}>
                <h2 className={styles.stepTitle}>{step.title}</h2>
                <p className={styles.stepBody}>{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.ctas}>
          <Link href="/analiza" className={styles.ctaPrimary}>{t.onboarding.cta}</Link>
          <Link href="/asistent" className={styles.ctaGhost}>{t.onboarding.ctaSec}</Link>
        </div>
      </div>
    </div>
  );
}
