"use client";

interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 32, className = "" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="CheggieTrade"
    >
      {/* Chess knight — stylised, geometric */}
      <path
        d="M8 28h16v-2H8v2z"
        fill="var(--accent)"
        opacity="0.5"
      />
      <path
        d="M10 26v-3h2v-2l-2-1V18l1-2h2l1-3 2-1 1-2h3l1 1-1 2 1 1v2l2 1v4l-2 1v2h-4v-2h-3v3H10z"
        fill="var(--accent)"
      />
      <path
        d="M14 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
        fill="var(--canvas)"
      />
    </svg>
  );
}

export function LogoFull({ className = "" }: { className?: string }) {
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        fontFamily: "var(--font-display)",
        fontWeight: 400,
        fontSize: "1.2rem",
        letterSpacing: "-0.01em",
        color: "var(--text-primary)",
      }}
    >
      <Logo size={28} />
      Cheggie<span style={{ color: "var(--accent)" }}>Trade</span>
    </span>
  );
}
