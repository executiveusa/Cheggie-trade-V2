import Link from "next/link";
import styles from "./page.module.css";

// Static — no locale needed; content is universal here
const STEPS = [
  { n: "01", title: "Unesi ticker",          body: "Ukucaj simbol dionice ili kripta — AAPL, NVDA, BTC-USD." },
  { n: "02", title: "Izaberi strategiju",     body: "Konzervativna, umjerena ili agresivna — sistem prilagođava analizu." },
  { n: "03", title: "AI agenti analiziraju",  body: "Fundamentali, vesti, sentiment i tehnički indikatori — sve istovremeno." },
  { n: "04", title: "Risk layer proverava",   body: "Nezavisni sloj filtrira odluke i upozorava na visok rizik." },
  { n: "05", title: "Dobijaš jasan signal",   body: "Kupuj, drži, ili prodaj — sa konkretnim razlogom." },
];

export default function OnboardingPage() {
  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <span className="eyebrow">Kako funkcioniše</span>
          <h1 className={styles.title}>
            Od buke do<br />jasnog plana.
          </h1>
          <p className={styles.subtitle}>
            CheggieTrade analizira tržište umesto vas.
          </p>
        </div>

        <div className={styles.stepsWrap}>
          {STEPS.map((step, i) => (
            <div key={step.n} className={styles.step}>
              <div className={styles.stepLeft}>
                <span className={styles.n}>{step.n}</span>
                {i < STEPS.length - 1 && <div className={styles.connector} />}
              </div>
              <div className={styles.content}>
                <h2 className={styles.stepTitle}>{step.title}</h2>
                <p className={styles.stepBody}>{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.ctas}>
          <Link href="/analiza" className={styles.ctaPrimary}>Pokreni prvu analizu</Link>
          <Link href="/asistent" className={styles.ctaGhost}>Razgovarajte s asistentom</Link>
        </div>
      </div>
    </div>
  );
}
