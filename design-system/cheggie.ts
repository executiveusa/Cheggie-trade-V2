/**
 * CheggieTrade Design System — Single Source of Truth
 *
 * Rules:
 *  - Headings: Space Grotesk
 *  - Data/numbers: JetBrains Mono
 *  - Body: Inter
 *  - Accent: Emerald (#00C896 family) — no gold
 *  - Background: deep black (#080a09)
 *  - NO card grids, NO repeated layouts, NO generic SaaS patterns
 */

export const tokens = {
  color: {
    // Canvas
    bg:          "#080a09",
    bgAlt:       "#0d110e",
    surface:     "#111610",
    surfaceAlt:  "#181e16",
    border:      "#1e261c",
    borderAlt:   "#283026",

    // Text
    textPrimary:   "#f0f0ee",
    textSecondary: "#7a8078",
    textTertiary:  "#4a4f48",
    textInverse:   "#080a09",

    // Accent (Emerald)
    accent:      "#00c896",
    accentDim:   "#009b74",
    accentFaint: "#00c89614",  // 8% opacity for backgrounds
    accentGlow:  "#00c89630",  // 19% for glow effects

    // Semantic
    danger:  "#ff4757",
    warning: "#f9a825",
    success: "#00c896",  // same as accent
    info:    "#3d9df6",

    // Light mode overrides (via [data-theme="light"])
    light: {
      bg:          "#f8f9f7",
      bgAlt:       "#f0f2ee",
      surface:     "#ffffff",
      surfaceAlt:  "#f4f6f2",
      border:      "#dde3da",
      borderAlt:   "#c8d0c5",
      textPrimary:   "#0d110e",
      textSecondary: "#4a5448",
      textTertiary:  "#8a9488",
    },
  },

  font: {
    display: "'Space Grotesk', system-ui, sans-serif",
    body:    "'Inter', system-ui, sans-serif",
    mono:    "'JetBrains Mono', 'Fira Code', monospace",
  },

  size: {
    // 8pt grid
    "1": "0.5rem",    // 8px
    "2": "1rem",      // 16px
    "3": "1.5rem",    // 24px
    "4": "2rem",      // 32px
    "5": "2.5rem",    // 40px
    "6": "3rem",      // 48px
    "8": "4rem",      // 64px
    "10": "5rem",     // 80px
    "12": "6rem",     // 96px
    "16": "8rem",     // 128px
    "20": "10rem",    // 160px
  },

  radius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    full: "9999px",
  },

  ease: "cubic-bezier(0.16, 1, 0.3, 1)",
} as const;

/** Design rules — enforced by linter */
export const rules = {
  forbiddenPatterns: [
    "card-grid",
    "repeated-layout",
    "template-section",
    "glassmorphism",
  ],
  forbiddenTerms: [
    "GPT", "Grok", "OpenAI", "Hermes", "LangChain",
    "LangGraph", "Claude", "Anthropic", "model",
  ],
  requiredFonts: ["Space Grotesk", "JetBrains Mono", "Inter"],
  accentColor: "#00c896",
  forbiddenColors: ["#c8a96e", "#9d7f4a", "gold"],
} as const;

export type Theme = "dark" | "light";
export type Locale = "sr" | "en";
