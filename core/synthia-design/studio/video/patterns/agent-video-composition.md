# AGENT PATTERN: VIDEO COMPOSITION — CLAUDE-NATIVE VIDEO CREATION

**File:** `.claude/skills/compose-video.md`

This pattern enables Claude agents to author hyperframes compositions through natural language prompts, generating production-ready HTML/GSAP code that follows Synthia design rules.

---

## SKILL INVOCATION

```
/compose-video "Create a 30-second UGC testimonial. Include:
- Product B-roll background
- User quote overlay: 'This changed how we work'
- Star rating (5 stars)
- CTA button: 'Get Started'
- Background music, voiceover narration
- Use Synthia brand colors"
```

---

## AGENT WORKFLOW

### Step 1: Parse Brief

Agent extracts:
- **Video type** → UGC, Demo, Showcase, Case Study
- **Duration** → 15s, 30s, 60s, custom
- **Format** → Vertical (1080×1920) or Horizontal (1920×1080)
- **Key assets** → B-roll, audio, images, text
- **Brand requirements** → Colors, fonts, tone
- **CTA** → Button text, destination

```javascript
// Agent receives structured brief
const brief = {
  type: 'ugc-testimonial',
  duration: 30,
  format: 'vertical',
  assets: {
    video: ['product-broll.mp4', 'user-testimonial.mp4'],
    audio: ['bg-music.mp3', 'voiceover.mp3'],
    images: ['cta-button.png'],
  },
  text: {
    quote: 'This changed how we work',
    cta: 'Get Started Free',
  },
  brand: {
    palette: 'synthia-standard',
    fonts: ['suisse-bp'],
  },
};
```

### Step 2: Select Template

Agent picks appropriate base template:

```javascript
const templateMap = {
  'ugc-testimonial': 'studio/video/templates/ugc-testimonial.html',
  'product-demo': 'studio/video/templates/product-demo.html',
  'design-showcase': 'studio/video/templates/design-showcase.html',
  'case-study': 'studio/video/templates/case-study.html',
};

const template = loadTemplate(templateMap[brief.type]);
```

### Step 3: Generate Composition

Agent modifies template:

1. **Update metadata**
   ```html
   <div id="stage"
     data-composition-id="project-${randomId}"
     data-width="${format.width}"
     data-height="${format.height}"
     data-duration="${brief.duration}">
   </div>
   ```

2. **Replace audio**
   ```html
   <audio src="assets/audio/${brief.assets.audio[0]}"
     data-start="0" data-duration="${brief.duration}"
     data-volume="0.5"></audio>
   ```

3. **Replace video/images**
   ```html
   <video src="assets/video/${brief.assets.video[0]}"
     data-start="0" data-duration="5"
     data-track-index="0"></video>
   ```

4. **Update text content**
   ```html
   <div class="quote-text" data-start="2" data-duration="3">
     ${brief.text.quote}
   </div>
   ```

5. **Generate GSAP timeline**
   ```javascript
   // Agent generates timeline matching new durations
   timeline.from('.quote-text', {
     opacity: 0, y: 30, duration: 0.6,
     ease: 'power2.out',
   }, '2');
   ```

### Step 4: Validate

Agent runs auto-validation:

```bash
hyperframes lint
# Checks:
# ✓ Data attributes correct
# ✓ Asset references exist
# ✓ Typography compliance (no banned fonts)
# ✓ Color palette compliance
# ✓ Audio sync integrity
# ✓ WCAG contrast compliance
# ✓ Motion guidelines
```

If validation fails → Agent fixes and re-validates.

### Step 5: Return Composition

Agent returns:
- **HTML file** (ready to preview)
- **Project directory** (studio/video/projects/[name]/)
- **Render instructions** (`npm run video:render`)
- **Preview URL** (localhost:3000 once started)

---

## CODE GENERATION PATTERNS

### Pattern 1: Simple UGC (Template-Based)

**Input:**
```
UGC testimonial, 15s vertical, quote: "amazing product", 
CTA: "Try free", music + voiceover
```

**Agent generates:**
```html
<!DOCTYPE html>
<html>
<head>
  <title>UGC Testimonial</title>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
  <style>
    /* Base styles from template */
    .quote-text { font-size: 48px; color: #ffffff; }
    .cta-button { background: #c4963c; color: #0a1108; }
  </style>
</head>
<body>
  <div id="stage" data-width="1080" data-height="1920" data-duration="15">
    <!-- Audio -->
    <audio src="assets/audio/bg-music.mp3"
      data-start="0" data-duration="15" data-volume="0.5"></audio>
    <audio src="assets/audio/voiceover.mp3"
      data-start="0.5" data-duration="3" data-volume="0.95"></audio>
    
    <!-- Video -->
    <video id="product-video" src="assets/video/broll.mp4"
      data-start="0" data-duration="15"></video>
    
    <!-- Text -->
    <div class="quote-text" data-start="2" data-duration="3">
      amazing product
    </div>
    
    <!-- CTA -->
    <button class="cta-button" data-start="8" data-duration="4">
      Try free
    </button>
  </div>

  <script>
    const timeline = gsap.timeline();
    timeline.from('#product-video', { opacity: 0, duration: 0.5 }, '0');
    timeline.from('.quote-text', { opacity: 0, y: 30, duration: 0.6 }, '2');
    timeline.from('.cta-button', { opacity: 0, scale: 0.8, duration: 0.4 }, '8');
  </script>
</body>
</html>
```

### Pattern 2: Custom Layout (Agent-Built)

If template doesn't fit, agent builds custom composition:

```javascript
// Agent generates custom grid/layout
const customHTML = `
<div id="stage" data-width="1920" data-height="1080">
  <!-- Left panel: video -->
  <div style="position: absolute; left: 0; width: 50%; height: 100%;">
    <video src="assets/video/left-screen.mp4"></video>
  </div>
  
  <!-- Right panel: feature text + highlights -->
  <div style="position: absolute; right: 0; width: 50%; height: 100%;">
    <div class="feature-title">Real-time Collab</div>
    <div class="feature-list">
      <div class="feature-item">✓ Live updates</div>
      <div class="feature-item">✓ Instant sync</div>
    </div>
  </div>
</div>
`;
```

### Pattern 3: Data Visualization (Animated Charts)

Agent generates SVG or Canvas-based animated data:

```javascript
// Agent generates chart animation
timeline.to('.chart-bar-1', {
  height: '240px',
  duration: 0.8,
  ease: 'power2.out',
}, '2');

timeline.to('.chart-bar-2', {
  height: '320px',
  duration: 0.8,
  ease: 'power2.out',
}, '2.2');

timeline.to('.chart-label-1', {
  opacity: 1,
  y: -20,
  duration: 0.5,
}, '2.8');
```

---

## CONSTRAINTS & RULES

Agent MUST follow:

1. **Design Rules (Non-Negotiable)**
   - No banned fonts (Inter, Roboto, Arial, etc.)
   - Color palette: #c4963c (gold), #5a7a52 (sage), #0a1108 (deep)
   - No purple gradients, neon colors
   - Typography: min 32pt for text, 4.5:1 contrast

2. **Motion Rules**
   - Minimum 0.3s transitions (no rapid cuts)
   - Use `power3.out`, `power2.out`, cubic-bezier easing only
   - No `bounce.out`, `elastic.out`
   - Respect `prefers-reduced-motion`

3. **Audio Rules**
   - BG music: 0.4-0.6 volume
   - Voiceover: 0.85-1.0 volume
   - Peak levels: -6dB to -3dB (no clipping)
   - Captions required (WCAG 2.1)

4. **Narrative Rules**
   - Hook within 1 second
   - Every video must have clear CTA
   - Story structure: Problem → Solution → Results → CTA

5. **Output Rules**
   - Always generate valid HTML5
   - Include GSAP library (CDN)
   - All paths relative to project directory
   - Include comments for agent/human readability

---

## ERROR HANDLING

If agent encounters issues:

### Missing Assets
```javascript
// Agent validates asset existence
const missingAssets = brief.assets.filter(asset => !fileExists(asset));
if (missingAssets.length > 0) {
  return {
    status: 'error',
    message: `Missing assets: ${missingAssets.join(', ')}`,
    suggestion: 'Please provide all video/audio files',
  };
}
```

### Impossible Timeline
```javascript
// Agent checks if content fits in duration
const contentDuration = calculateContentDuration(brief);
if (contentDuration > brief.duration) {
  return {
    status: 'warning',
    message: `Content (${contentDuration}s) exceeds duration (${brief.duration}s)`,
    suggestion: 'Increase video duration or reduce content',
  };
}
```

### Unsupported Style Request
```javascript
// Agent rejects non-Synthia styles
if (brief.brand.colors.includes('#FF00FF')) { // purple
  return {
    status: 'error',
    message: 'Purple is prohibited by Synthia doctrine',
    suggestion: 'Use #c4963c (gold) or #5a7a52 (sage) instead',
  };
}
```

---

## EXAMPLE INVOCATION FLOW

**User prompt:**
```
Create a 45-second product demo video. Show 3 features with screenshots:
1. Real-time sync (5s)
2. Offline support (5s)
3. Cross-platform (5s)

Include voiceover narration, background music, and "Get Started" CTA.
Use our Synthia brand colors.
```

**Agent execution:**

1. Parse → Recognize as "product-demo" type
2. Load template → `studio/video/templates/product-demo.html`
3. Generate sections → 3 feature blocks @ 5s each
4. Create GSAP timeline → Stagger animations
5. Validate → Run lint, check all rules
6. Return → HTML file + instructions
7. User → Start preview (`npm run video:preview`)
8. Review → Watch composition
9. Render → Export MP4 (`npm run video:render`)
10. Deliver → Ready for social/marketing

**Output:**
```
✓ Composition created: studio/video/projects/product-demo-45s-v1/
✓ All validations passed
✓ Ready to preview: npm run video:preview
✓ Render command: npm run video:render
```

---

## SKILL PARAMETER REFERENCE

```
/compose-video "brief_text"
  --template [auto|ugc|demo|showcase|custom]
  --duration [15|30|45|60|90|custom_sec]
  --format [vertical|horizontal]
  --quality [draft|standard|premium]
  --auto-render [true|false]
```

Examples:
```
/compose-video "UGC testimonial" --duration 30 --format vertical
/compose-video "Product demo walkthrough" --template demo --quality premium
/compose-video "Design system showcase" --format vertical --auto-render true
```
