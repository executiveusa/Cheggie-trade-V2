/**
 * CheggieTrade V2 — Design & UX enforcement tests
 *
 * Covers:
 *  1. 5-second clarity test (homepage)
 *  2. Forbidden user-facing terms
 *  3. Serbian default language
 *  4. Design system tokens (Space Grotesk, Emerald, NO gold)
 *  5. Route completeness
 *  6. Assistant: no technical terms, has voice
 *  7. Language/theme toggles exist
 *  8. No card-grid patterns
 *  9. Nav item count ≤ 5
 * 10. Design linter (fonts, colours)
 */

import fs from "fs";
import path from "path";

const SRC  = path.join(__dirname, "../../src");
const ROOT = path.join(__dirname, "../../");

function read(...parts: string[]) {
  return fs.readFileSync(path.join(...parts), "utf-8");
}

function jsxText(src: string) {
  return (src.match(/>([^<{]+)</g) ?? []).join(" ");
}

// ── 1. 5-second clarity ─────────────────────────────────────────
describe("5-second clarity — homepage", () => {
  const home = read(SRC, "app/page.tsx");
  const i18n = read(SRC, "lib/i18n.ts");

  test("Serbian headline contains the product promise", () => {
    expect(i18n).toContain("tržišnu buku");
    expect(i18n).toContain("trading plan");
  });

  test("eyebrow identifies audience (Balkan)", () => {
    expect(i18n).toMatch(/Balkan/i);
  });

  test("primary CTA 'Pokreni analizu' is present", () => {
    expect(i18n).toContain("Pokreni analizu");
  });

  test("sub-headline mentions multiple analysts / AI agents", () => {
    expect(i18n).toMatch(/analiti[cč]ar|agent/i);
  });

  test("homepage references AgentDiagram (not a ticker board)", () => {
    expect(home).toContain("AgentDiagram");
    expect(home).not.toContain("tickerBoard");
  });
});

// ── 2. Forbidden user-facing terms ──────────────────────────────
describe("Forbidden terms — not exposed in UI", () => {
  const PAGES = [
    "app/page.tsx",
    "app/analiza/page.tsx",
    "app/asistent/page.tsx",
    "app/onboarding/page.tsx",
    "app/izvestaji/page.tsx",
  ];

  const FORBIDDEN = ["GPT", "Grok", "OpenAI", "Hermes", "LangChain", "langgraph", "Anthropic"];

  PAGES.forEach((p) => {
    const content = read(SRC, p);
    const rendered = jsxText(content);
    const name = path.basename(path.dirname(p));

    FORBIDDEN.forEach((term) => {
      test(`${name}: does not render "${term}"`, () => {
        expect(rendered).not.toContain(term);
      });
    });
  });
});

// ── 3. Serbian default ───────────────────────────────────────────
describe("Serbian default language", () => {
  const layout = read(SRC, "app/layout.tsx");
  const i18n   = read(SRC, "lib/i18n.ts");

  test("html lang is sr", () => {
    expect(layout).toContain('lang="sr"');
  });

  test("i18n file has sr as first locale", () => {
    const srIdx = i18n.indexOf('"sr"');
    const enIdx = i18n.indexOf('"en"');
    expect(srIdx).toBeGreaterThanOrEqual(0);
    expect(srIdx).toBeLessThan(enIdx);
  });

  test("default locale state is sr", () => {
    const ctx = read(SRC, "lib/context.tsx");
    expect(ctx).toContain('"sr"');
  });
});

// ── 4. Design system tokens ──────────────────────────────────────
describe("Design system — tokens (globals.css)", () => {
  const css = read(SRC, "app/globals.css");

  test("uses Space Grotesk (not Cormorant/Playfair/Inter alone as display)", () => {
    expect(css).toContain("Space Grotesk");
  });

  test("uses JetBrains Mono for data", () => {
    expect(css).toContain("JetBrains Mono");
  });

  test("uses Inter for body", () => {
    expect(css).toContain("Inter");
  });

  test("uses emerald accent #00c896", () => {
    expect(css.toLowerCase()).toContain("#00c896");
  });

  test("does NOT use old gold palette (#c8a96e)", () => {
    expect(css.toLowerCase()).not.toContain("#c8a96e");
    expect(css.toLowerCase()).not.toContain("#9d7f4a");
  });

  test("uses deep black canvas (not pure #000)", () => {
    expect(css).toMatch(/#080a09|#0a0a0a|#090b0a/);
  });

  test("has dark/light theme via data-theme attribute", () => {
    expect(css).toContain('[data-theme="light"]');
  });

  test("has prefers-reduced-motion", () => {
    expect(css).toContain("prefers-reduced-motion");
  });

  test("no forbidden fonts (Arial, Helvetica, Roboto, Cormorant)", () => {
    expect(css).not.toMatch(/font-family[^;]*(Arial|Helvetica|Roboto|Cormorant\s+Garamond)/i);
  });
});

// ── 5. Route completeness ────────────────────────────────────────
describe("All required routes exist", () => {
  const ROUTES = ["analiza", "izvestaji", "watchlist", "asistent", "onboarding"];

  ROUTES.forEach((route) => {
    test(`/${route}/page.tsx exists`, () => {
      expect(fs.existsSync(path.join(SRC, "app", route, "page.tsx"))).toBe(true);
    });
  });

  const API_ROUTES = ["analyze", "assistant", "skills", "status"];
  API_ROUTES.forEach((route) => {
    test(`/api/${route}/route.ts exists`, () => {
      expect(fs.existsSync(path.join(SRC, "app", "api", route, "route.ts"))).toBe(true);
    });
  });
});

// ── 6. Assistant page ────────────────────────────────────────────
describe("Assistant page — non-technical, accessible", () => {
  const page = read(SRC, "app/asistent/page.tsx");
  const rendered = jsxText(page);

  test("does not expose AI/model/agent/LLM in rendered text", () => {
    expect(rendered).not.toMatch(/\bAI\b|\bmodel\b|\bagent\b|\bLLM\b/i);
  });

  test("has voice input via SpeechRecognition", () => {
    expect(page).toContain("SpeechRecognition");
  });

  test("has suggested questions in Serbian or English (via i18n)", () => {
    // Questions live in i18n, not inline — check there
    const i18n = read(SRC, "lib/i18n.ts");
    expect(i18n).toMatch(/earnings|stop-loss|sektor|tržišt|P\/E/i);
  });

  test("shows welcome state when no messages", () => {
    expect(page).toContain("isEmpty");
  });
});

// ── 7. Theme + language toggles ─────────────────────────────────
describe("Theme and language toggles", () => {
  const nav  = read(SRC, "components/Nav.tsx");
  const ctx  = read(SRC, "lib/context.tsx");

  test("Nav has theme toggle button", () => {
    expect(nav).toContain("toggleTheme");
  });

  test("Nav has language toggle button", () => {
    expect(nav).toContain("setLocale");
  });

  test("context supports dark/light theme", () => {
    expect(ctx).toContain('"dark"');
    expect(ctx).toContain('"light"');
  });

  test("theme persists via localStorage", () => {
    expect(ctx).toContain("localStorage");
  });
});

// ── 8. No card-grid anti-patterns ───────────────────────────────
describe("Anti-pattern guard — no card grids", () => {
  const homeCSS = read(SRC, "app/page.module.css");

  test("homepage does not use grid with >4 equal columns (card grid)", () => {
    // grid-template-columns: repeat(N, 1fr) where N>4 is forbidden
    const cardGridPattern = /grid-template-columns\s*:\s*repeat\s*\(\s*([5-9]|\d{2,})\s*,/;
    expect(homeCSS).not.toMatch(cardGridPattern);
  });

  test("use cases section uses ≤4 columns", () => {
    const colMatch = homeCSS.match(/repeat\((\d+),\s*1fr\)/g) ?? [];
    colMatch.forEach((m) => {
      const n = parseInt(m.match(/\d+/)?.[0] ?? "0");
      expect(n).toBeLessThanOrEqual(4);
    });
  });

  test("homepage has no generic .card class", () => {
    const home = read(SRC, "app/page.tsx");
    expect(home).not.toMatch(/className=.*["']card["']/);
  });
});

// ── 9. Nav item count ────────────────────────────────────────────
describe("Navigation — max 5 items", () => {
  const nav = read(SRC, "components/Nav.tsx");

  test("nav links array has exactly 5 items", () => {
    const linkMatches = nav.match(/href:\s*["']\/[a-z]+["']/g) ?? [];
    expect(linkMatches.length).toBe(5);
  });

  test("nav does NOT contain 'models' or 'skills' routes", () => {
    expect(nav).not.toMatch(/href.*\/models|href.*\/skills/);
  });
});

// ── 10. Design system file exists ────────────────────────────────
describe("Design system", () => {
  test("cheggie.ts token file exists", () => {
    expect(fs.existsSync(path.join(ROOT, "../../design-system/cheggie.ts"))).toBe(true);
  });

  test("i18n provides both sr and en locales", () => {
    const i18n = read(SRC, "lib/i18n.ts");
    expect(i18n).toContain("sr:");
    expect(i18n).toContain("en:");
  });

  test("AgentDiagram component exists (replaces ticker board)", () => {
    expect(fs.existsSync(path.join(SRC, "components/AgentDiagram.tsx"))).toBe(true);
  });

  test("Logo component renders chess knight SVG", () => {
    const logo = read(SRC, "components/Logo.tsx");
    expect(logo).toContain("<svg");
    expect(logo).toContain("KnightMark");
    // Brand name split across spans: Cheggie + Trade
    expect(logo).toContain("Cheggie");
    expect(logo).toContain("Trade");
  });
});
