# VIDEO PRODUCTION WORKFLOW — SYNTHIA VIDEO STUDIO

## Three-Stage Production Process

```
INTAKE → COMPOSITION → REVIEW → DELIVERY
  ↓          ↓            ↓         ↓
[Brief]  [Build]     [Audit]   [Render+Export]
[5m]     [1-4h]      [30m]      [10-30m]
```

---

## STAGE 1: INTAKE (5 minutes)

### Client Brief Required

```markdown
## Video Brief Template

**Project:** [Name]
**Type:** UGC | Product Demo | Design Showcase | Case Study | Ad
**Duration:** [seconds]
**Format:** Vertical (1080×1920) | Horizontal (1920×1080)
**Target Audience:** [Description]
**Key Message:** [1-2 sentences]
**CTA:** [Call-to-action text]
**Assets Provided:** 
  - B-roll videos: [list]
  - Product screenshots: [list]
  - Audio files: [list]
  - Brand assets: [logos, colors, fonts]
**Deadline:** [Date]
**Budget:** [For review/approval scope]
```

### Asset Checklist

- [ ] All video B-roll in MP4/MOV format (H.264 codec preferred)
- [ ] Audio files: music, voiceover, SFX (MP3 or WAV)
- [ ] Product screenshots/images (PNG/JPG, min 2x resolution)
- [ ] Brand guidelines (colors, fonts, logo)
- [ ] Any required captions/subtitles (SRT format or plain text)

---

## STAGE 2: COMPOSITION (1-4 hours)

### Step 1: Choose Template

Based on video type:

| Type | Template | Duration | Format |
|------|----------|----------|--------|
| UGC Testimonial | `ugc-testimonial.html` | 15-30s | Vertical |
| Product Demo | `product-demo.html` | 30-60s | Horizontal |
| Design Showcase | `design-showcase.html` | 10-20s | Vertical |
| Case Study | TBD | 45-90s | Horizontal |

### Step 2: Set Up Project Structure

```bash
cd studio/video/projects/
hyperframes init --name [project-name] --template [template-type]

cd [project-name]
mkdir -p assets/{video,audio,images,fonts}
```

### Step 3: Import Assets

```bash
# Copy client assets to appropriate directories
cp ~/Downloads/product-broll.mp4 assets/video/
cp ~/Downloads/voiceover.mp3 assets/audio/
cp ~/Downloads/logo.png assets/images/
```

### Step 4: Edit Composition

Open `index.html` and:

1. **Update metadata**
   - `data-composition-id` → unique project ID
   - `data-width` / `data-height` → target resolution
   - `data-duration` → video length in seconds

2. **Replace audio**
   - Update `<audio>` src attributes to point to client assets
   - Adjust `data-volume` for balance (music 0.4-0.6, VO 0.8-1.0)
   - Set `data-start` and `data-duration` based on timing

3. **Replace video/images**
   - Update `<video>` and `<img>` src attributes
   - Adjust `data-start` times to match audio timeline
   - Adjust `data-scale` if assets need resizing

4. **Update text**
   - Replace placeholder text with client copy
   - Update `data-start` times for caption reveals
   - Verify readability (min 32pt, 4.5:1 contrast)

5. **Verify animations**
   - Timeline in JavaScript should match new durations
   - Test in browser with `hyperframes preview`

### Step 5: Live Preview

```bash
npm run preview
# Opens localhost:3000 with hot reload
# Edit index.html, then refresh to see changes
```

**QA checklist during preview:**
- [ ] All assets load without errors
- [ ] Audio levels are balanced (no clipping)
- [ ] Text is readable (check contrast)
- [ ] Animations feel smooth and intentional
- [ ] Transitions between sections are clean
- [ ] CTA is visible and prominent
- [ ] Mobile/responsive rendering works

### Step 6: Generate Captions

```bash
# For auto-generated captions from voiceover:
hyperframes captions --input assets/audio/voiceover.mp3 --output captions.srt

# Then QA and correct:
# 00:00:00,500 --> 00:00:03,000
# "Your product changes everything"
```

Or manually add caption elements to HTML:

```html
<div class="caption" data-start="0.5" data-duration="2.5">
  Your product changes everything
</div>
```

---

## STAGE 3: REVIEW (30 minutes)

### Agent Auto-Audit

```bash
hyperframes audit
```

This validates:
- ✓ All data attributes correct
- ✓ Asset file references exist
- ✓ Timeline integrity (no overlaps in critical layers)
- ✓ Typography compliance (no banned fonts)
- ✓ Color palette compliance (no purple/neon)
- ✓ Audio sync correctness
- ✓ WCAG 2.1 contrast requirements
- ✓ Motion guidelines (no strobing, intentional easing)

### Manual Quality Review (UDEC)

**Checklist:**

```
Motion Quality (MOT) — Target ≥ 8.0
  [ ] Animations are smooth (no jank, 30+ FPS)
  [ ] Every motion has clear purpose
  [ ] Transitions are intentional (no random cuts)
  [ ] Camera moves feel cinematic (no jerky pans)

Accessibility (ACC) — Target ≥ 7.5
  [ ] All captions present and accurate
  [ ] Text contrast ≥ 4.5:1
  [ ] No strobing/flashing
  [ ] Audio descriptions for visual-only sections (if long-form)

Audio Quality (AUD) — Target ≥ 8.0
  [ ] No clipping (peaks at -3dB max)
  [ ] VO clear and intelligible
  [ ] Background music doesn't overshadow VO
  [ ] SFX timing matches visual action
  [ ] Audio is properly synced to video

Composition (CMP) — Target ≥ 8.0
  [ ] Visual hierarchy is clear
  [ ] No cluttered scenes
  [ ] Focus drawn to important elements
  [ ] Safe zones respected (titles safe area)

Typography (TYP) — Target ≥ 8.0
  [ ] No banned fonts (Inter, Roboto, etc.)
  [ ] Minimum 32pt for readability
  [ ] Hierarchy clear (heading > body > caption)
  [ ] Letter-spacing and line-height optimal

Color Palette (CAP) — Target ≥ 8.0
  [ ] Adheres to Synthia palette (gold/sage/deep)
  [ ] No purple gradients
  [ ] No neon/artificial colors
  [ ] Consistent throughout

Visual Storytelling (VIS) — Target ≥ 7.5
  [ ] Narrative arc is clear
  [ ] CTA is prominent and actionable
  [ ] Opening hook within 1 second
  [ ] Emotional arc supports message

Technical (TEC) — Target ≥ 8.5
  [ ] No render errors
  [ ] All assets load correctly
  [ ] Audio sync is bit-perfect
  [ ] No glitches or corruption
```

**Score calculation:**
- If ANY axis < required minimum → REJECT, request revisions
- If composite score < 8.5 → ITERATE, refine

### Revision Loop

If audit fails:

1. **Identify failures** (which axes below threshold)
2. **Make corrections** (edit HTML/GSAP)
3. **Preview again** (validate fixes)
4. **Re-audit** (run validation)
5. **Repeat until 8.5+ pass**

---

## STAGE 4: DELIVERY (10-30 minutes)

### Render Formats

```bash
# Standard MP4 (web, social media)
hyperframes render --format mp4 --quality standard

# High-quality MP4 (archival, editing)
hyperframes render --format mp4 --quality high

# WebM for web (smaller file size)
hyperframes render --format webm --quality standard

# ProRes MOV (for further editing in DaVinci, Premiere)
hyperframes render --format mov --quality high
```

### Output Specifications

**MP4 (H.264)** — Default
- Bitrate: 15 Mbps (short-form), 25 Mbps (standard), 50 Mbps (high)
- Resolution: as specified in composition
- Frame rate: 30fps or 60fps (as specified)
- Audio: AAC, 128 kbps

**WebM (VP9)** — Web-optimized
- Bitrate: 8 Mbps (standard), 15 Mbps (high)
- Audio: Opus, 128 kbps

**ProRes (MOV)** — Editing-ready
- Bitrate: 500+ Mbps (lossless quality)
- Audio: PCM, 48kHz

### Export & Upload

```bash
# View all renders
ls output/

# Upload to platforms
# - YouTube: output/[project].mp4
# - TikTok: output/[project].mp4 (vertical)
# - Instagram: output/[project].mp4 (square or vertical)
# - LinkedIn: output/[project].mp4
# - Website: output/[project].webm (for <video> tag)
```

### Archive

```bash
# Save project for future revisions
tar -czf projects-archive/[project-name]--[date].tar.gz studio/video/projects/[project-name]/

# Document final specs in project README.md
cat > studio/video/projects/[project-name]/README.md << EOF
# [Project Name]

**Type:** [UGC | Demo | etc]
**Duration:** [15s]
**Format:** [1080×1920]
**UDEC Score:** 9.1
**Delivery Date:** [Date]
**Revision Count:** [N]

## Assets Used
- [List audio/video/images]

## Render Output
- output/[project].mp4 (standard web)
- output/[project].webm (web-optimized)
- output/[project]-hq.mp4 (archival)

## Notes
[Any relevant production notes]
EOF
```

---

## SPECIAL WORKFLOWS

### UGC Testimonial (Fast-Track)

**Timeline: 30-45 minutes**

1. **Import user video** (1:1 portrait recording)
2. **Add background B-roll** (product shots, fades between transitions)
3. **Generate voiceover** (if text provided, synthesize; else use provided audio)
4. **Add quote text** (overlay on video)
5. **Design CTA button** (branded, prominent)
6. **Mix audio** (BG music 0.5, VO 0.95, SFX 0.7)
7. **Quick audit** (motion, accessibility, audio)
8. **Render** (MP4, standard)

### Product Demo (Standard)

**Timeline: 2-3 hours**

1. **Storyboard** (map out each feature/section)
2. **Record/import screen recordings** (feature walkthrough)
3. **Add feature callouts** (text boxes, arrows)
4. **Record voiceover narration** (script provided)
5. **Add background music** (matching product tone)
6. **Design results metrics** (data visualization)
7. **Create CTA section** (convert)
8. **Full audit** (UDEC scoring)
9. **Iterate** (if needed)
10. **Render** (MP4 high-quality)

### Design Showcase (Creative)

**Timeline: 1.5-2 hours**

1. **Plan component showcase** (which components to highlight)
2. **Screenshot/render** each component state
3. **Add typography samples** (heading/body examples)
4. **Add color palette** (4-6 key colors with values)
5. **Choose music** (ambient, subtle)
6. **Animate component reveals** (smooth fades/scales)
7. **Design final branded frame** (logo + tagline)
8. **Quick audit** (visual consistency)
9. **Render** (vertical for portfolio, horizontal for web)

---

## QUICK COMMANDS

```bash
# Create new project
hyperframes init --name [name] --template [template]

# Preview in browser
npm run preview

# Validate composition
hyperframes lint

# Generate captions
hyperframes captions --input audio.mp3

# Render all formats
hyperframes render --all-formats

# Render specific format
hyperframes render --format mp4 --quality high

# Archive project
tar -czf ~/archive/[name]-$(date +%Y%m%d).tar.gz .

# View output
ls output/
```

---

## COMMON ISSUES & FIXES

| Issue | Cause | Fix |
|-------|-------|-----|
| Audio out of sync | Timeline mismatch | Adjust `data-start` times in HTML |
| Video not loading | Asset path wrong | Check `src` attributes, verify files exist |
| Text unreadable | Font too small | Increase `font-size` (min 32pt) |
| Animation jerky | High CPU usage | Reduce complexity, use GPU transforms |
| Clipped audio | Volume too high | Lower `data-volume` (max 0.95) |
| Poor contrast | Text over busy BG | Add overlay, use text-shadow, reduce BG opacity |

---

## SIGN-OFF

When project reaches UDEC 8.5+:

1. Document final scores in project README
2. Archive production files
3. Export all render formats
4. Deliver to client
5. Log in studio memory (for future reference/improvements)

**The studio learns from every project — better templates, better workflows, better results.**
