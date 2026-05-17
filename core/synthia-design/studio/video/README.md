# SYNTHIA VIDEO STUDIO — Hyperframes Production Engine

## What This Is

Synthia Video Studio is a **production-grade video composition system** built on Hyperframes. It produces UGC videos, product demos, design showcases, animated case studies, and marketing content.

**Canonical authority:** All video production flows through this directory. UDEC 8.5 floor applies to video as well as web design.

---

## Architecture

```
VIDEO STUDIO (Synthia Video Engine)
├── Documentation
│   ├── hyperframes-SKILL.md        (Agent-teachable skill)
│   └── workflows/PRODUCTION_WORKFLOW.md  (Process)
│
├── Templates (Boilerplate Compositions)
│   ├── ugc-testimonial.html        (15-30s vertical)
│   ├── product-demo.html           (30-60s horizontal)
│   ├── design-showcase.html        (10-20s vertical)
│   └── [case-study.html]           (coming soon)
│
├── Projects (Client Work)
│   ├── [project-name]/
│   │   ├── index.html              (composition)
│   │   ├── assets/                 (video, audio, images)
│   │   └── output/                 (renders: MP4, WebM, MOV)
│   └── ...
│
├── Blocks (Reusable Components)
│   ├── animated-cta.html
│   ├── split-screen.html
│   ├── data-visualization.html
│   └── ...
│
├── Assets (Global Library)
│   ├── audio/                      (stock music, SFX, VO)
│   └── fonts/                      (Suisse BP, DM Sans, SF Pro)
│
├── Patterns (Agent-Usable Recipes)
│   └── agent-video-composition.md  (Claude-native creation)
│
├── Processors (Rendering & QA)
│   ├── auto-linter.js
│   ├── udec-scorer.js
│   └── caption-generator.js
│
└── Anti-Patterns
    └── registry.yaml               (What NOT to do)
```

---

## Quick Start

### 1. Preview a Template

```bash
# Change to video directory
cd studio/video

# Start live preview server
npx hyperframes preview

# Open browser to localhost:3000
# Edit template in real-time, changes appear instantly
```

### 2. Create New Project

```bash
# Initialize from template
npx hyperframes init --name "my-ugc-video" --template ugc-testimonial

cd projects/my-ugc-video

# Place your assets
mkdir -p assets/{video,audio,images}
cp ~/Downloads/product.mp4 assets/video/
cp ~/Downloads/voiceover.mp3 assets/audio/

# Edit index.html with your content
# Replace src paths, text, timing

# Preview
npm run preview
```

### 3. Validate & Lint

```bash
cd projects/my-ugc-video
npx hyperframes lint

# Output:
# ✓ All data attributes valid
# ✓ Asset references exist
# ✓ No banned fonts
# ✓ Color palette compliant
# ✓ Audio sync OK
# ✓ WCAG 2.1 contrast OK
# UDEC: 8.7/10 ✓ PASS
```

### 4. Render

```bash
cd projects/my-ugc-video

# MP4 (standard quality for web/social)
npx hyperframes render --format mp4 --quality standard

# WebM (optimized for web)
npx hyperframes render --format webm

# ProRes (for further editing)
npx hyperframes render --format mov --quality high

# All formats
npx hyperframes render --all-formats

# Output: output/my-ugc-video.mp4, .webm, .mov
```

---

## Templates

### UGC Testimonial (15-30s vertical)

**Best for:** User testimonials, short-form social, TikTok/Instagram Reels

```html
<!-- Structure -->
[0.0s] Fade in product B-roll (background)
[0.5s] User testimonial video overlay
[2.0s] Quote text + 5-star rating
[4.0s] CTA button "Get Started"
[8.0s] Product shot + social proof stats
[12.0s] Fade to black
[15.0s] END
```

**Files:**
- `ugc-testimonial.html` — Base template
- Audio: BG music (0.5 vol), VO (0.95 vol)

---

### Product Demo (30-60s horizontal)

**Best for:** Feature walkthroughs, SaaS demos, product launches

```html
<!-- Structure -->
[0-4s] Hero intro
[4-14s] Split-screen before/after comparison
[14-25s] Feature 1 with callout
[25-36s] Feature 2 with callout
[36-50s] Animated metrics/results
[50-60s] CTA + call-to-action
```

**Files:**
- `product-demo.html` — Base template
- Audio: Corporate music (0.4 vol), VO (0.9 vol), SFX (0.7 vol)

---

### Design Showcase (10-20s vertical)

**Best for:** Design system walkthroughs, portfolio pieces, brand showcases

```html
<!-- Structure -->
[0-3s] Hero component intro
[3-8s] Component variations (default, hover, active)
[8-12s] Typography samples
[12-17s] Color palette reveal
[17-20s] Final branded frame + logo
```

**Files:**
- `design-showcase.html` — Base template
- Audio: Ambient music (0.3 vol), subtle SFX

---

## Production Workflow

### Three Stages

1. **INTAKE (5 min)**
   - Get brief, assets, requirements
   - Use provided brief template

2. **COMPOSITION (1-4 hours)**
   - Choose template
   - Import assets
   - Edit HTML/GSAP
   - Preview & QA
   - Generate captions
   - Run auto-lint

3. **DELIVERY (10-30 min)**
   - Run final audit
   - Render all formats
   - Export & archive
   - Log in studio memory

**See:** `workflows/PRODUCTION_WORKFLOW.md` for detailed steps.

---

## Design Rules (Non-Negotiable)

### Typography
- ✗ Banned fonts: Inter, Roboto, Arial, Helvetica, Open Sans, Montserrat, Poppins, Lato
- ✓ Approved: Suisse BP, DM Sans, SF Pro, TT Norms, Futura
- Minimum size: 32pt (body), 48pt (headlines)
- Contrast: ≥ 4.5:1 (WCAG AA)

### Colors
- ✓ Primary: #c4963c (Gold)
- ✓ Secondary: #5a7a52 (Sage)
- ✓ Dark: #0a1108 (Deep)
- ✗ Banned: Purple gradients, neon, generic cyan/pink

### Motion
- ✓ Smooth easing: power3.out, cubic-bezier(0.16, 1, 0.3, 1)
- ✗ Banned easing: bounce.out, elastic.out
- Minimum transition: 0.3s (no rapid cuts)
- Respect `prefers-reduced-motion`

### Audio
- Background music: 0.4-0.6 volume
- Voiceover: 0.85-1.0 volume
- Peak levels: -6dB to -3dB (no clipping)
- All videos require captions (WCAG 2.1)

### Accessibility
- Captions required for all content
- Color contrast ≥ 4.5:1
- No strobing/flashing (>3x/sec)
- Motion controls respected

---

## UDEC Scoring for Video

All videos scored on 8-axis system (target ≥ 8.5):

| Axis | Target | What It Measures |
|------|--------|------------------|
| MOT (Motion) | ≥ 8.0 | Animation smoothness, intentionality |
| ACC (Accessibility) | ≥ 7.5 | Captions, contrast, audio description |
| AUD (Audio Quality) | ≥ 8.0 | Clarity, balance, sync |
| CMP (Composition) | ≥ 8.0 | Visual hierarchy, focus, clarity |
| TYP (Typography) | ≥ 8.0 | Readability, hierarchy, compliance |
| CAP (Color Palette) | ≥ 8.0 | Brand consistency, palette adherence |
| VIS (Visual Storytelling) | ≥ 7.5 | Narrative arc, clarity, CTA strength |
| TEC (Technical) | ≥ 8.5 | Render quality, audio sync, glitch-free |

**FLOOR: 8.5** (composite score). Below 8.5 = iterate.

---

## Agent Integration

### Compose Videos from Natural Language

```
/compose-video "Create 30-second UGC testimonial with 
product B-roll, user quote, CTA button, background music"
```

Agent:
1. Parses brief
2. Selects template
3. Generates HTML composition
4. Validates (lint)
5. Returns project directory
6. You preview & render

### Export Designs to Video

```
/clone https://example.com --export-video
```

Generates animated design system showcase (20-30s) featuring:
- Color palette
- Typography samples
- Components & states
- Layout grid
- Responsive breakpoints
- Brand identity sequence

---

## Common Commands

```bash
# Preview (live edit)
npm run video:preview

# Validate composition
npm run video:lint

# Render MP4
npm run video:render

# Render all formats
npm run video:render-all

# Create new project
npm run video:init
```

---

## File Organization

**Approved paths:**
```
studio/video/
├── templates/                    # Boilerplate compositions
├── projects/[project-name]/      # Client work
│   ├── index.html               # Composition
│   ├── assets/                  # Project-specific assets
│   └── output/                  # Renders
├── blocks/                       # Reusable components
├── assets/                       # Global library (music, fonts)
├── patterns/                     # Agent recipes
├── processors/                   # Validation & rendering
├── workflows/                    # Process documentation
├── anti-patterns/                # What NOT to do
└── README.md                     # This file
```

---

## Anti-Patterns

See `anti-patterns/registry.yaml` for machine-readable banned patterns.

**Examples (BLOCKER violations):**
- Banned fonts (Inter, Roboto, Arial, etc.)
- Undersized text (< 28pt)
- Poor contrast (< 4.5:1)
- Rapid cuts (< 0.3s)
- Childish easing (bounce.out, elastic.out)
- Purple gradients / Neon colors
- Missing captions
- Clipped audio
- No CTA

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Asset not found" | Check `src` paths are relative to project, files exist |
| "Audio out of sync" | Adjust `data-start` times in HTML, verify audio duration |
| "Text unreadable" | Increase `font-size` (min 32pt), add background overlay |
| "Animation jerky" | Reduce DOM complexity, use GPU transforms (translate, scale, rotate only) |
| "Clipped audio" | Lower `data-volume` values, peak should be -6dB to -3dB |
| "Poor contrast" | Add text-shadow, background overlay, reduce BG opacity |
| "Lint fails" | Run `hyperframes lint`, fix reported violations |

---

## Archive & Handoff

When project is complete:

1. **Verify UDEC ≥ 8.5**
2. **Document final scores** in `README.md`
3. **Export all formats** (MP4, WebM, ProRes)
4. **Archive production files**
   ```bash
   tar -czf ~/archive/project-name--2026-04-19.tar.gz .
   ```
5. **Log in studio memory** (agent learns from results)
6. **Deliver to client** (MP4 + WebM)

---

## Learning Resources

- `hyperframes-SKILL.md` — Complete Hyperframes reference
- `workflows/PRODUCTION_WORKFLOW.md` — Step-by-step process
- `patterns/agent-video-composition.md` — Agent composition patterns
- `anti-patterns/registry.yaml` — What NOT to do

---

## Canonical Authority

**Synthia Video Studio is the single source of truth for all video production.**

Changes to doctrine, templates, or processes require:
1. Update documentation
2. Git commit with `[STUDIO][VIDEO]` prefix
3. UDEC scoring verification
4. Log in studio memory

**All videos produced by this studio improve the studio.**
