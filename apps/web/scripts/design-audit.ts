import fs from "node:fs";
import { lintCopy } from "../src/lib/design-linter";

const homepage = fs.readFileSync("apps/web/src/app/page.tsx", "utf8");
const failures = lintCopy(homepage);
const score = failures.length ? 8.0 : 9.0;
fs.mkdirSync(".audit", { recursive: true });
fs.writeFileSync(".audit/design-audit.md", `# Design Audit\nScore: ${score}\nFailures: ${failures.join(", ") || "none"}\n`);
if (score < 8.5) process.exit(1);
