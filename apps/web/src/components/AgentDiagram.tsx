"use client";

import styles from "./AgentDiagram.module.css";

const AGENTS = [
  { id: "market",       label: "Market",       angle: -90, delay: "0s" },
  { id: "news",         label: "News",         angle: -30, delay: "0.2s" },
  { id: "fundamentals", label: "Fundamentals", angle:  30, delay: "0.4s" },
  { id: "risk",         label: "Risk Layer",   angle:  90, delay: "0.6s" },
];

const R = 90; // radius from center

function polarToXY(angleDeg: number, r: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: 130 + r * Math.cos(rad), y: 130 + r * Math.sin(rad) };
}

export default function AgentDiagram() {
  return (
    <div className={styles.wrap} aria-hidden="true">
      <svg viewBox="0 0 260 260" className={styles.svg}>
        {/* Connecting lines */}
        {AGENTS.map((agent) => {
          const { x, y } = polarToXY(agent.angle, R);
          return (
            <line
              key={agent.id + "-line"}
              x1={x} y1={y}
              x2={130} y2={130}
              stroke="var(--accent)"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.25"
              className={styles.line}
              style={{ animationDelay: agent.delay }}
            />
          );
        })}

        {/* Agent nodes */}
        {AGENTS.map((agent) => {
          const { x, y } = polarToXY(agent.angle, R);
          return (
            <g key={agent.id} className={styles.agentNode} style={{ animationDelay: agent.delay }}>
              <circle cx={x} cy={y} r="22" fill="var(--surface)" stroke="var(--border-alt)" strokeWidth="1" />
              <circle cx={x} cy={y} r="22" fill="none" stroke="var(--accent)" strokeWidth="1" opacity="0.4" className={styles.pulse} style={{ animationDelay: agent.delay }} />
              <text
                x={x} y={y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="7.5"
                fontFamily="var(--font-mono)"
                fontWeight="500"
                fill="var(--text-1)"
                letterSpacing="0.04em"
              >
                {agent.label}
              </text>
            </g>
          );
        })}

        {/* Central decision node */}
        <circle cx={130} cy={130} r="32" fill="var(--accent-faint)" stroke="var(--accent)" strokeWidth="1.5" />
        <circle cx={130} cy={130} r="32" fill="none" stroke="var(--accent)" strokeWidth="1.5" opacity="0.5" className={styles.centerPulse} />
        <text x={130} y={127} textAnchor="middle" fontSize="8" fontFamily="var(--font-mono)" fontWeight="500" fill="var(--accent)" letterSpacing="0.08em">SIGNAL</text>
        <text x={130} y={138} textAnchor="middle" fontSize="6.5" fontFamily="var(--font-mono)" fill="var(--text-2)" letterSpacing="0.04em">BUY / HOLD / SELL</text>
      </svg>

      {/* Active dot indicators */}
      <div className={styles.indicators}>
        {AGENTS.map((a) => (
          <div key={a.id} className={styles.indicator} style={{ animationDelay: a.delay }}>
            <span className={styles.dot} />
            <span className={styles.indicatorLabel}>{a.label} Analysis</span>
          </div>
        ))}
      </div>
    </div>
  );
}
