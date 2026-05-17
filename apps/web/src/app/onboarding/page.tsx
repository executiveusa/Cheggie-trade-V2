import Link from "next/link";
import styles from "./page.module.css";

const STEPS = [
  {
    number: "01",
    title: "Unesite ticker",
    body: "Svaka analiza počinje od jednog simbola. Dionice, ETF-ovi, kripto — sve na jednom mestu.",
  },
  {
    number: "02",
    title: "Pokrenite analizu",
    body: "Sistem simultano analizira fundamentale, vesti i tržišni sentiment. Traje oko 30 sekundi.",
  },
  {
    number: "03",
    title: "Pročitajte signal",
    body: "Dobijate jasan zaključak — kupuj, drži, ili prodaj — sa kontekstom koji ga podupire.",
  },
  {
    number: "04",
    title: "Pratite pozicije",
    body: "Dodajte ticker na watchlist. Sistem prati kretanje i upozorava na promenu teze.",
  },
];

export default function OnboardingPage() {
  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <p className={styles.eyebrow}>Kako funkcioniše</p>
          <h1 className={styles.title}>
            Od buke do<br />
            <em>jasnog plana.</em>
          </h1>
          <p className={styles.subtitle}>
            CheggieTrade analizira tržište umesto vas. Ovako izgleda proces.
          </p>
        </div>

        <div className={styles.stepsLayout}>
          {STEPS.map((step) => (
            <div key={step.number} className={styles.step}>
              <span className={styles.stepNumber}>{step.number}</span>
              <div className={styles.stepContent}>
                <h2 className={styles.stepTitle}>{step.title}</h2>
                <p className={styles.stepBody}>{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.cta}>
          <Link href="/analiza" className={styles.ctaBtn}>
            Pokreni analizu
          </Link>
          <Link href="/asistent" className={styles.ctaSecondary}>
            Postavite pitanje asistentu
          </Link>
        </div>
      </div>
    </div>
  );
}
