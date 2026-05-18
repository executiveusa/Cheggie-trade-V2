"use client";

interface Props {
  size?: number;
  color?: string;
  className?: string;
}

export function KnightMark({ size = 32, color = "currentColor", className = "" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Base platform */}
      <rect x="8" y="43" width="32" height="2.5" rx="1.25" fill={color} opacity="0.3" />
      {/* Pedestal */}
      <path d="M14 43v-5c0-.6.4-1 1-1h18c.6 0 1 .4 1 1v5H14z" fill={color} opacity="0.55" />
      {/* Knight body — stylised horse head profile */}
      <path
        d="M17 37c0 0-1.5-3-1.5-7.5 0-2.5.8-4.5 2.5-6
           C19.5 22 20 21 20 20
           l2-3.5c.6-1 1.4-1.5 2.5-1.5h3
           c1.8 0 3 1.2 3 3v1.5
           c1.2.6 2 1.8 2 3.2 0 2-1.2 3.3-3 3.3
           h-2c-.8 0-1.3.5-1.3 1.3v1.2
           c0 3-1.2 5.8-3 8H17z"
        fill={color}
      />
      {/* Eye */}
      <circle cx="28.5" cy="16.5" r="1.3" fill="var(--bg, #080a09)" />
      {/* Mouth detail */}
      <path
        d="M20.5 26.5c1.2 1 2.5 1.5 3.5 1.3"
        stroke="var(--bg, #080a09)"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LogoWordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        fontFamily: "var(--font-display)",
        fontWeight: 600,
        fontSize: "1.125rem",
        letterSpacing: "-0.02em",
        color: "var(--text-1)",
      }}
    >
      <KnightMark size={26} color="var(--accent)" />
      Cheggie<span style={{ color: "var(--accent)" }}>Trade</span>
    </span>
  );
}
