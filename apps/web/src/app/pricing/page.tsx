"use client";

import { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/context";
import styles from "./page.module.css";

const TIERS = {
  sr: [
    {
      name: "Besplatno",
      price: { monthly: 0, annual: 0 },
      description: "Za početnike koji istražuju tržište.",
      features: [
        "3 analize dnevno",
        "Osnovni market podaci",
        "Javne vesti",
        "Email podrška",
      ],
      cta: "Započni besplatno",
      href: "/analiza",
      popular: false,
    },
    {
      name: "Pro",
      price: { monthly: 29, annual: 24 },
      description: "Za aktivne tradere koji žele prednost.",
      features: [
        "Neograničene analize",
        "AI asistent 24/7",
        "30 dana istorije",
        "Watchlist sinhronizacija",
        "Prioritetna obrada",
        "Napredni indikatori",
      ],
      cta: "Pretplati se",
      href: "/analiza",
      popular: true,
    },
    {
      name: "Tim",
      price: { monthly: 99, annual: 82 },
      description: "Za timove i profesionalne tradere.",
      features: [
        "Sve iz Pro plana",
        "5 korisničkih mesta",
        "Deljeni watchlist-ovi",
        "PDF eksport izveštaja",
        "API pristup",
        "Dedicirani menadžer",
      ],
      cta: "Kontaktiraj nas",
      href: "/analiza",
      popular: false,
    },
  ],
  es: [
    {
      name: "Gratis",
      price: { monthly: 0, annual: 0 },
      description: "Para principiantes explorando el mercado.",
      features: [
        "3 análisis por día",
        "Datos de mercado básicos",
        "Noticias públicas",
        "Soporte por email",
      ],
      cta: "Comenzar gratis",
      href: "/analiza",
      popular: false,
    },
    {
      name: "Pro",
      price: { monthly: 29, annual: 24 },
      description: "Para traders activos que buscan ventaja.",
      features: [
        "Análisis ilimitados",
        "Asistente IA 24/7",
        "30 días de historial",
        "Sincronización watchlist",
        "Procesamiento prioritario",
        "Indicadores avanzados",
      ],
      cta: "Suscribirse",
      href: "/analiza",
      popular: true,
    },
    {
      name: "Equipo",
      price: { monthly: 99, annual: 82 },
      description: "Para equipos y traders profesionales.",
      features: [
        "Todo de Pro",
        "5 puestos de usuario",
        "Watchlists compartidos",
        "Exportación PDF",
        "Acceso API",
        "Gerente dedicado",
      ],
      cta: "Contáctanos",
      href: "/analiza",
      popular: false,
    },
  ],
  en: [
    {
      name: "Free",
      price: { monthly: 0, annual: 0 },
      description: "For beginners exploring the market.",
      features: [
        "3 analyses per day",
        "Basic market data",
        "Public news",
        "Email support",
      ],
      cta: "Start free",
      href: "/analiza",
      popular: false,
    },
    {
      name: "Pro",
      price: { monthly: 29, annual: 24 },
      description: "For active traders seeking an edge.",
      features: [
        "Unlimited analyses",
        "AI assistant 24/7",
        "30-day history",
        "Watchlist sync",
        "Priority processing",
        "Advanced indicators",
      ],
      cta: "Subscribe",
      href: "/analiza",
      popular: true,
    },
    {
      name: "Team",
      price: { monthly: 99, annual: 82 },
      description: "For teams and professional traders.",
      features: [
        "Everything in Pro",
        "5 user seats",
        "Shared watchlists",
        "PDF export",
        "API access",
        "Dedicated manager",
      ],
      cta: "Contact us",
      href: "/analiza",
      popular: false,
    },
  ],
};

const LABELS = {
  sr: {
    eyebrow: "Cenovnik",
    title: "Jednostavno, transparentno.",
    subtitle: "Bez skrivenih troškova. Otkažite bilo kada.",
    monthly: "Mesečno",
    annual: "Godišnje",
    save: "Uštedi 2 meseca",
    perMonth: "/mesec",
    popular: "Najpopularniji",
    disclaimer: "CheggieTrade nije finansijski savetnik. Koristite kao alat za istraživanje.",
  },
  es: {
    eyebrow: "Precios",
    title: "Simple, transparente.",
    subtitle: "Sin costos ocultos. Cancela cuando quieras.",
    monthly: "Mensual",
    annual: "Anual",
    save: "Ahorra 2 meses",
    perMonth: "/mes",
    popular: "Más popular",
    disclaimer: "CheggieTrade no es asesor financiero. Úsalo como herramienta de investigación.",
  },
  en: {
    eyebrow: "Pricing",
    title: "Simple, transparent.",
    subtitle: "No hidden fees. Cancel anytime.",
    monthly: "Monthly",
    annual: "Annual",
    save: "Save 2 months",
    perMonth: "/month",
    popular: "Most popular",
    disclaimer: "CheggieTrade is not a financial advisor. Use as a research tool.",
  },
};

export default function PricingPage() {
  const { locale } = useApp();
  const [annual, setAnnual] = useState(false);
  const tiers = TIERS[locale];
  const labels = LABELS[locale];

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <span className="eyebrow">{labels.eyebrow}</span>
          <h1 className={styles.title}>{labels.title}</h1>
          <p className={styles.subtitle}>{labels.subtitle}</p>
        </div>

        {/* Billing toggle */}
        <div className={styles.toggleWrap}>
          <button
            className={`${styles.toggleBtn} ${!annual ? styles.toggleActive : ""}`}
            onClick={() => setAnnual(false)}
          >
            {labels.monthly}
          </button>
          <button
            className={`${styles.toggleBtn} ${annual ? styles.toggleActive : ""}`}
            onClick={() => setAnnual(true)}
          >
            {labels.annual}
            <span className={styles.saveBadge}>{labels.save}</span>
          </button>
        </div>

        {/* Tiers */}
        <div className={styles.tiers}>
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`${styles.tier} ${tier.popular ? styles.tierPopular : ""}`}
            >
              {tier.popular && (
                <span className={styles.popularBadge}>{labels.popular}</span>
              )}
              <h2 className={styles.tierName}>{tier.name}</h2>
              <p className={styles.tierDesc}>{tier.description}</p>
              <div className={styles.priceRow}>
                <span className={styles.priceValue}>
                  ${annual ? tier.price.annual : tier.price.monthly}
                </span>
                <span className={styles.pricePeriod}>{labels.perMonth}</span>
              </div>
              <ul className={styles.features}>
                {tier.features.map((f) => (
                  <li key={f} className={styles.feature}>
                    <CheckIcon />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={tier.href}
                className={`${styles.tierCta} ${tier.popular ? styles.tierCtaPrimary : ""}`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className={styles.disclaimer}>{labels.disclaimer}</p>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={styles.checkIcon}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
