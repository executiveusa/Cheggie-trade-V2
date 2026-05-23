"use client";

import { useState, useEffect } from "react";
import styles from "./ServiceBanner.module.css";

interface StatusResponse {
  ok: boolean;
  services?: {
    api?: string;
    hermes?: string;
  };
}

const LABELS = {
  sr: {
    degraded: "Servis za analizu je trenutno ograničen — rezultati možda neće biti dostupni.",
    dismiss: "Zatvori",
  },
  es: {
    degraded: "El servicio de análisis está limitado — los resultados pueden no estar disponibles.",
    dismiss: "Cerrar",
  },
  en: {
    degraded: "Analysis service is currently limited — results may be unavailable.",
    dismiss: "Dismiss",
  },
};

export default function ServiceBanner({ locale = "sr" }: { locale?: "sr" | "es" | "en" }) {
  const [status, setStatus] = useState<"ok" | "degraded" | "loading">("loading");
  const [dismissed, setDismissed] = useState(false);
  const labels = LABELS[locale];

  useEffect(() => {
    let mounted = true;

    async function checkStatus() {
      try {
        const res = await fetch("/api/status", { signal: AbortSignal.timeout(5000) });
        if (!res.ok) throw new Error();
        const data: StatusResponse = await res.json();
        if (mounted) {
          setStatus(data.ok ? "ok" : "degraded");
        }
      } catch {
        if (mounted) {
          setStatus("degraded");
        }
      }
    }

    checkStatus();

    // Re-check every 60 seconds
    const interval = setInterval(checkStatus, 60_000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (status === "loading" || status === "ok" || dismissed) {
    return null;
  }

  return (
    <div className={styles.banner} role="alert">
      <div className={styles.inner}>
        <WarningIcon />
        <p className={styles.text}>{labels.degraded}</p>
        <button
          className={styles.dismiss}
          onClick={() => setDismissed(true)}
          aria-label={labels.dismiss}
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}

function WarningIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={styles.icon}
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
