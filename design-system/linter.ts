/**
 * CheggieTrade Design Linter
 *
 * Runs against built CSS and source files.
 * Fails hard on violations — not warnings.
 */

import fs from "fs";
import path from "path";
import { rules } from "./cheggie";

type Violation = { file: string; rule: string; detail: string };

function scanFile(filePath: string): Violation[] {
  const violations: Violation[] = [];
  const content = fs.readFileSync(filePath, "utf-8");
  const ext = path.extname(filePath);

  // ── Font check (CSS files only) ──────────────────────────────
  if (ext === ".css") {
    const hasForbiddenFont =
      /font-family[^;]*(Arial|Helvetica|Roboto|Montserrat|Poppins|Cormorant|Playfair)/i.test(content);
    if (hasForbiddenFont) {
      violations.push({ file: filePath, rule: "FONT", detail: "Forbidden font in CSS" });
    }

    // Gold palette check
    rules.forbiddenColors.forEach((color) => {
      if (content.toLowerCase().includes(color.toLowerCase())) {
        violations.push({ file: filePath, rule: "COLOR", detail: `Forbidden color: ${color}` });
      }
    });
  }

  // ── Forbidden user-facing terms (JSX/TSX only) ─────────────
  if (ext === ".tsx" || ext === ".jsx") {
    const jsxStrings = (content.match(/>([^<{]+)</g) ?? []).join(" ");
    rules.forbiddenTerms.forEach((term) => {
      // word-boundary match on rendered text strings
      const re = new RegExp(`\\b${term}\\b`, "i");
      if (re.test(jsxStrings)) {
        violations.push({
          file: filePath,
          rule: "FORBIDDEN_TERM",
          detail: `Term "${term}" exposed in UI`,
        });
      }
    });
  }

  return violations;
}

function walk(dir: string): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !["node_modules", ".next", "dist"].includes(entry.name)) {
      results.push(...walk(full));
    } else if (entry.isFile() && /\.(tsx?|css)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

export function runLinter(srcDir: string): void {
  const files = walk(srcDir);
  const allViolations: Violation[] = [];

  files.forEach((f) => {
    allViolations.push(...scanFile(f));
  });

  if (allViolations.length > 0) {
    console.error("\n🔴 Design Linter — VIOLATIONS FOUND:\n");
    allViolations.forEach((v) => {
      console.error(`  [${v.rule}] ${path.relative(srcDir, v.file)}: ${v.detail}`);
    });
    console.error(`\n${allViolations.length} violation(s). Fix before deploying.\n`);
    process.exit(1);
  }

  console.log("✅ Design linter: no violations.");
}

// Run if called directly
if (require.main === module) {
  const target = process.argv[2] ?? path.join(__dirname, "../apps/web/src");
  runLinter(target);
}
