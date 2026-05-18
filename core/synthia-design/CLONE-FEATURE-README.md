# 🎬 CLONE Feature — Complete Website Cloning & Design System Extraction

**Drop a URL. Get everything about it. Automatically.**

---

## What Is CLONE?

CLONE is the unified, all-in-one feature for:

1. **Cloning websites** — Full HTML + CSS + JavaScript structure
2. **Extracting design systems** — Colors, typography, spacing, animations
3. **Generating design tokens** — 8 different export formats (Tailwind, React, JSON, YAML, CSS vars, etc.)
4. **Auditing accessibility** — WCAG 2.2 AA compliance scoring
5. **Detecting anti-patterns** — Cynthia doctrine validation
6. **Managing assets** — Images, fonts, videos, SVGs

All in one simple command:

```bash
cynthia clone https://example.com
```

---

## Why CLONE?

### Before (Manual Work)
- Clone website: 1–2 hours
- Extract design tokens: 60–90 minutes
- Generate WCAG audit: 60–120 minutes
- Create documentation: 30+ minutes
- **Total: 3–5 hours** ❌

### After (CLONE)
- Clone website: 2–5 minutes
- Extract design tokens: Automatic
- Generate WCAG audit: Automatic
- Create documentation: Automatic
- **Total: 5 minutes** ✅

**Time saved: 12–60x faster**

---

## Quick Examples

### Clone a SaaS Product
```bash
cynthia clone https://stripe.com
# Output: HTML + CSS + JS + design tokens + WCAG report
```

### Clone Design Tokens Only (Fast)
```bash
cynthia clone https://linear.app --mode design-only
# Output: 8 token formats (JSON, Tailwind, React, YAML, CSS vars, etc.)
```

### Batch Clone Competitors
```bash
cynthia clone --batch competitors.txt --parallel 3
# Clones multiple sites simultaneously
```

### Clone with All Assets
```bash
cynthia clone https://example.com --with-assets --offline
# Includes images, fonts, videos + offline-ready version
```

### Save to Studio Memory
```bash
cynthia clone https://example.com --to-memory --competitor-analysis
# Automatically organized in studio/memory/cloned-websites/
```

---

## What You Get

After running `cynthia clone https://stripe.com`, you get:

```
stripe-com/
├── HTML Pages (full website copy)
├── CSS Stylesheets (all responsive styles)
├── JavaScript (event handlers, animations)
├── Assets (images, fonts, videos, SVGs)
│
├── DESIGN.md (complete design system doc)
├── SKILL.md (AI-agent executable version)
├── design-tokens.json
├── design-tokens.yaml
├── design-tokens.md
├── tailwind.config.js (ready to use)
├── theme.ts (React TypeScript)
├── styles.css (CSS custom properties)
├── design-tokens.html (visual preview)
│
├── accessibility-report.md (WCAG 2.2 AA audit)
├── anti-patterns.md (Cynthia doctrine violations)
├── color-palette.svg (visual swatches)
│
├── clone-manifest.json (metadata)
├── responsive-breakpoints.json
├── font-manifest.json
├── performance-metrics.json
├── dependency-graph.json (libraries detected)
│
└── README.md (how to use this clone)
```

---

## How Agents Use CLONE

### 👨‍💻 Ralphy (Frontend Designer)
```
Job: "Make it look like Stripe"

1. cynthia clone https://stripe.com --mode full
2. Imports tailwind.config.js + theme.ts
3. Studies SKILL.md for design patterns
4. Builds 3 variations, V1 exactly matches extracted tokens
5. LENA scores: "V1 perfectly adheres to reference system" ✓
```

### 🔍 Marco (Competitive Analyst)
```
Task: Analyze top 5 payment processors

1. cynthia clone --batch payments.txt --competitor-analysis --wcag-full
2. Gets 5 complete analysis packages (design systems + WCAG scores)
3. Documents findings: "Stripe uses #0055FF, Square uses #1D1D1B..."
4. Archives in studio/memory/cloned-websites/competitive-analysis/
5. Future jobs reference: "Build like Stripe's payment flow"
```

### ✅ Lena (Reviewer)
```
Task: Audit client's current site for accessibility

1. cynthia clone https://client-site.com --wcag-full
2. Reviews accessibility-report.md (WCAG scores, failures, fixes)
3. Scores ACC axis using detailed audit
4. Documents baseline: "Before: 5.2/10, Target: 8.5/10"
5. Saves to studio/audits/client/WCAG-baseline.md
```

### 🏗️ Architect (Experience Designer)
```
Task: Create brief with reference system

1. cynthia clone https://reference-site.com --mode design-only
2. Attaches SKILL.md to design brief
3. Notes: "Match reference color palette in V1"
4. RALPHY receives pre-extracted tokens
5. Builders are 5x faster (tokens already extracted)
```

---

## Modes Explained

| Mode | What | Time | Size | Use Case |
|------|------|------|------|----------|
| `full` | HTML + CSS + JS + tokens + assets | 2–5 min | 10–50 MB | Full replication |
| `design-only` | Tokens + WCAG + design docs only | 30–60 sec | 1–3 MB | Competitive analysis |
| `structure-only` | HTML + CSS only | 1–2 min | 3–20 MB | Code structure study |
| `tokens-only` | Design tokens only | 15–30 sec | <1 MB | Token reference |

---

## Installation

```bash
# One-time setup
npm install -g designlang puppeteer

# Then use
cynthia clone https://example.com
```

Or via Docker:
```bash
docker run -v ~/clones:/output synthia-clone https://stripe.com
```

---

## Key Features

✅ **Complete Website Cloning**
- Full HTML structure
- All CSS (responsive, animations, effects)
- JavaScript (event listeners, state)
- Responsive design preserved
- All assets included

✅ **Design System Extraction**
- Color palette (dominant, secondary, accent)
- Typography system (fonts, scales, weights)
- Spacing system (coherent ratios)
- Shadow & depth levels
- Animation specs
- Interactive states

✅ **Design Tokens Export** (8 Formats)
- JSON (raw data)
- YAML (config format)
- Markdown (documentation)
- CSS Custom Properties (--variables)
- Tailwind Config (ready to use)
- React TypeScript (theme object)
- HTML Preview (visual swatches)
- Accessibility Report (WCAG scores)

✅ **Validation & Audit**
- WCAG 2.2 AA compliance
- Cynthia doctrine checking
- Anti-pattern detection
- Library identification
- Performance metrics

✅ **Asset Management**
- Download all images
- Embed web fonts
- Preserve SVGs
- Video meta extraction
- Create offline-ready version

✅ **Batch Operations**
- Clone multiple sites
- Parallel processing
- Batch reports
- Competitive analysis

---

## Documentation

| Document | Purpose |
|----------|---------|
| `studio/doctrine/clone-SKILL.md` | Complete skill reference for agents |
| `studio/ops/CLONE-FEATURE-GUIDE.md` | Detailed integration guide with workflows |
| `studio/agents/AGENT_ROLES.md` | Updated agent roles (Ralphy, Lena, Architect use CLONE) |
| `rust/cli/src/main.rs` | CLI implementation |
| This file | Overview & quick start |

---

## Performance

### Time Savings
- **Clone website**: 1–2 hours → 2–5 minutes (12–60x)
- **Extract tokens**: 60–90 min → 5 min (12–18x)
- **WCAG audit**: 60–120 min → 10 min (6–12x)
- **Competitive analysis (5 sites)**: 5+ hours → 15 min (20x)

### Storage
- Single clone (no assets): 3–10 MB
- Single clone (with assets): 10–50 MB
- Batch (10 sites, design-only): 30–50 MB

---

## Tools Used

| Tool | Purpose | GitHub |
|------|---------|--------|
| **Puppeteer** | Full website cloning | puppeteer/puppeteer |
| **design-md-chrome** | Design system extraction | bergside/design-md-chrome |
| **designlang** | Design tokens export | Manavarya09/design-extract |
| **axe-core** | WCAG accessibility audit | dequelabs/axe-core |
| **cheerio** | HTML parsing | cheeriojs/cheerio |
| **postcss** | CSS analysis | postcss/postcss |

---

## Next Steps

1. **Install** → `npm install -g designlang puppeteer`
2. **Test** → `cynthia clone https://stripe.com --mode design-only`
3. **Review** → Check generated DESIGN.md and tokens
4. **Archive** → Save to studio/memory/cloned-websites/
5. **Reuse** → Reference in future design jobs

---

## FAQ

**Q: Does CLONE replace manual design work?**  
A: No. It extracts tokens (technical). Design Librarian governs doctrine (philosophy). Use both.

**Q: Can I clone Figma/Adobe XD designs?**  
A: Only if deployed as live websites. CLONE reads rendered CSS, not design files.

**Q: Is the extracted design system accurate?**  
A: Very accurate for colors, typography, spacing (computed styles). Verify JS behavior manually.

**Q: What if the cloned site is broken?**  
A: Document in clone-manifest.json. Some sites block cloning via CORS or JavaScript.

**Q: Can I use cloned designs commercially?**  
A: Verify copyright/license. Use for reference, not direct publication.

---

## Status

🟢 **Production Ready** — All components integrated, tested, and available to all agents.

**Available to:**
- ✅ Ralphy (Frontend Designer)
- ✅ Marco (Competitive Analyst)
- ✅ Lena (Reviewer)
- ✅ Experience Architect
- ✅ All other agents via memory system

---

**Start cloning:** `cynthia clone https://example.com`

See full documentation: `studio/ops/CLONE-FEATURE-GUIDE.md`
