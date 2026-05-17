/**
 * Test suite for CheggieTrade quality rules.
 * Tests are static (no rendering needed) — they parse source files.
 */

import fs from "fs";
import path from "path";

const ROOT = path.join(__dirname, "../../");
const SRC = path.join(ROOT, "src");

function readFile(...parts: string[]) {
  return fs.readFileSync(path.join(...parts), "utf-8");
}

// ── 1. Homepage clarity ────────────────────────────────────────
describe("Homepage clarity — 5-second test", () => {
  const homepage = readFile(SRC, "app/page.tsx");

  test("headline contains the product promise in Serbian", () => {
    expect(homepage).toContain("tržišnu buku");
    expect(homepage).toContain("trading plan");
  });

  test("CTA 'Pokreni analizu' is present", () => {
    expect(homepage).toContain("Pokreni analizu");
  });

  test("logo or brand name is present", () => {
    expect(homepage.toLowerCase()).toContain("cheggie");
  });
});

// ── 2. No forbidden terms ─────────────────────────────────────
describe("No forbidden/technical terms exposed to user", () => {
  const PAGES = [
    path.join(SRC, "app/page.tsx"),
    path.join(SRC, "app/asistent/page.tsx"),
    path.join(SRC, "app/analiza/page.tsx"),
  ];

  const FORBIDDEN = [
    "LLM",
    "GPT",
    "Claude",
    "Anthropic",
    "langchain",
    "langgraph",
    "agent internals",
    "model routing",
  ];

  PAGES.forEach((p) => {
    const name = path.basename(path.dirname(p));
    const content = readFile(p);
    FORBIDDEN.forEach((term) => {
      test(`${name}: does not expose "${term}"`, () => {
        // Case-sensitive check on rendered text (JSX string literals)
        const jsxStrings = content.match(/>([^<{]+)</g) || [];
        const rendered = jsxStrings.join(" ");
        expect(rendered).not.toContain(term);
      });
    });
  });
});

// ── 3. Serbian default ────────────────────────────────────────
describe("Serbian default language", () => {
  const layout = readFile(SRC, "app/layout.tsx");

  test("html lang attribute is 'sr'", () => {
    expect(layout).toContain('lang="sr"');
  });

  test("meta description is in Serbian", () => {
    expect(layout).toMatch(/tržišnu buku|trading plan|analiz/i);
  });
});

// ── 4. Routes correct ─────────────────────────────────────────
describe("All required routes exist", () => {
  const ROUTES = ["analiza", "izvestaji", "watchlist", "asistent", "onboarding"];

  ROUTES.forEach((route) => {
    test(`Route /${route} has page.tsx`, () => {
      const p = path.join(SRC, "app", route, "page.tsx");
      expect(fs.existsSync(p)).toBe(true);
    });
  });

  const API_ROUTES = ["analyze", "assistant", "skills", "status"];
  API_ROUTES.forEach((route) => {
    test(`API route /api/${route} has route.ts`, () => {
      const p = path.join(SRC, "app", "api", route, "route.ts");
      expect(fs.existsSync(p)).toBe(true);
    });
  });
});

// ── 5. Assistant non-technical ────────────────────────────────
describe("Assistant page — non-technical UI", () => {
  const page = readFile(SRC, "app/asistent/page.tsx");

  test("does not mention AI, model, agent, or LLM in UI text", () => {
    const jsxStrings = (page.match(/>([^<{]+)</g) || []).join(" ");
    expect(jsxStrings).not.toMatch(/\bAI\b|\bmodel\b|\bagent\b|\bLLM\b/i);
  });

  test("has voice input capability", () => {
    expect(page).toContain("SpeechRecognition");
  });

  test("has suggested questions in Serbian", () => {
    expect(page).toMatch(/sektor|tržišt|earnings|stop-loss|akcij/i);
  });
});

// ── 6. Design quality ─────────────────────────────────────────
describe("Design quality checks (UDEC proxy)", () => {
  const css = readFile(SRC, "app/globals.css");

  test("uses Cormorant Garamond or Playfair Display (no banned fonts)", () => {
    expect(css).toMatch(/Cormorant Garamond|Playfair Display|DM Serif/);
    expect(css).not.toMatch(/\bArial\b|\bHelvetica\b|\bRoboto\b|\bInter\b/);
  });

  test("uses near-black canvas color (not pure #000 or #fff)", () => {
    expect(css).toMatch(/#0d0f0e|#0e1010|#111412/);
  });

  test("uses single accent color family, no secondary independent accent", () => {
    // Accent tonal variants (--accent-dim, --accent-muted) are fine.
    // A palette violation would be a second unrelated accent like --accent2 or --accent-blue.
    expect(css).toMatch(/--accent\s*:/); // base accent exists
    expect(css).not.toMatch(/--accent2\s*:|--accent-blue\s*:|--accent-secondary\s*:/);
    // Verify no purple or neon (Synthia law: "No purple. No neon.")
    const accentValue = css.match(/--accent\s*:\s*(#[0-9a-fA-F]{6})/)?.[1] ?? "";
    expect(accentValue).not.toMatch(/^#[0-9a-f]{2}00[0-9a-f]{2}$/i); // no pure blue
    expect(accentValue).not.toMatch(/^#[0-9a-f]{2}00ff$/i);           // no neon purple
  });

  test("uses golden ratio spacing system", () => {
    expect(css).toMatch(/0\.618rem|1\.618rem|2\.618rem|4\.236rem/);
  });

  test("no glassmorphism (blur on blur backgrounds)", () => {
    // blur is allowed on nav only (transparent bg), but not as a design pattern
    const blurCount = (css.match(/backdrop-filter/g) || []).length;
    expect(blurCount).toBeLessThanOrEqual(2);
  });

  test("nav has max 5 items", () => {
    const nav = readFile(SRC, "components/Nav.tsx");
    const items = nav.match(/href:/g) || [];
    expect(items.length).toBeLessThanOrEqual(6); // 5 nav + 1 cta
  });

  test("has prefers-reduced-motion fallback", () => {
    expect(css).toContain("prefers-reduced-motion");
  });
});
