import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroLayout}>
          <div className={styles.heroLeft}>
            <p className={styles.eyebrow}>Trading intelligence</p>
            <h1 className={styles.headline}>
              CheggieTrade pretvara<br />
              <em>tržišnu buku</em><br />
              u jasan trading plan.
            </h1>
            <p className={styles.subhead}>
              Institucionalni nivo analize dostupan svakom investitoru.
              Bez šuma. Bez nagađanja. Samo signal.
            </p>
            <div className={styles.actions}>
              <Link href="/analiza" className={styles.ctaPrimary}>
                Pokreni analizu
              </Link>
              <Link href="/onboarding" className={styles.ctaSecondary}>
                Saznaj više
              </Link>
            </div>
          </div>

          <div className={styles.heroRight} aria-hidden="true">
            <div className={styles.tickerBoard}>
              <TickerRow symbol="AAPL"  change="+1.24%" positive />
              <TickerRow symbol="NVDA"  change="+3.87%" positive />
              <TickerRow symbol="TSLA"  change="-0.92%" />
              <TickerRow symbol="BTC"   change="+2.11%" positive />
              <TickerRow symbol="SPY"   change="+0.47%" positive />
            </div>
          </div>
        </div>

        <div className={styles.scrollIndicator}>
          <span />
        </div>
      </section>

      {/* ── Divider ─────────────────────────────────────────────── */}
      <div className="divider" />

      {/* ── Value props ─────────────────────────────────────────── */}
      <section className={styles.props}>
        <div className="container">
          <div className={styles.propsGrid}>
            <Prop
              number="01"
              title="Analiza u sekundi"
              body="Višestruki agenti simultano analiziraju fundamentale, sentiment i tehničke indikatore."
            />
            <Prop
              number="02"
              title="Jasan signal"
              body="Nema buke. Nema komentara. Samo kupuj, drži, ili prodaj — sa razlogom."
            />
            <Prop
              number="03"
              title="Vaš watchlist, uvek živ"
              body="Pratite pozicije u realnom vremenu. Upozorenja kada se teza menja."
            />
          </div>
        </div>
      </section>

      {/* ── Divider ─────────────────────────────────────────────── */}
      <div className="divider" />

      {/* ── Statement ───────────────────────────────────────────── */}
      <section className={styles.statement}>
        <div className="container">
          <blockquote className={styles.quote}>
            Tržište nagrađuje disciplinu,{" "}
            <span className="text-accent">ne predviđanje.</span>
          </blockquote>
          <Link href="/analiza" className={styles.ctaPrimary}>
            Pokreni analizu
          </Link>
        </div>
      </section>
    </>
  );
}

function TickerRow({ symbol, change, positive }: { symbol: string; change: string; positive?: boolean }) {
  return (
    <div className={styles.tickerRow}>
      <span className={styles.tickerSymbol}>{symbol}</span>
      <span className={`${styles.tickerChange} ${positive ? styles.positive : styles.negative}`}>
        {change}
      </span>
    </div>
  );
}

function Prop({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <div className={styles.prop}>
      <span className={styles.propNumber}>{number}</span>
      <h3 className={styles.propTitle}>{title}</h3>
      <p className={styles.propBody}>{body}</p>
    </div>
  );
}
