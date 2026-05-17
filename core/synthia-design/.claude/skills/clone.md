# Clone Skill

Extract and clone complete design systems from any website using designlang.

## Usage

```
/clone https://example.com
```

Or mention it in conversation:
- "clone this website"
- "extract the design from https://example.com"
- "activate the clone skill for https://example.com"

## What It Does

Extracts comprehensive design system documentation from a target website including:
- **Colors & Gradients** - Complete color palette extraction
- **Typography** - Font families, weights, sizes, and line heights
- **Spacing & Layout** - Grid patterns, flexbox usage, container structures
- **Shadows & Effects** - Box shadows, text shadows, blur effects
- **Interaction States** - Hover, focus, and active state transitions
- **Responsive Breakpoints** - Changes across 4 viewports
- **Accessibility Metrics** - WCAG 2.1 compliance scoring

## Output Formats

Generates 8 files:
1. **design-tokens.md** - AI-optimized markdown documentation
2. **design-tokens.html** - Visual preview
3. **tailwind.config.js** - Tailwind configuration
4. **theme.ts** - React TypeScript theme
5. **design-tokens.json** - JSON format
6. **design-tokens.yaml** - YAML format
7. **styles.css** - CSS variables
8. **accessibility-report.md** - WCAG analysis

## Examples

Extract from a design-focused site:
```
/clone https://dribbble.com
```

Clone an Awwwards winner:
```
/clone https://awwwards.com
```

Get design tokens for a SaaS product:
```
/clone https://stripe.com
```

## Installation

Uses `designlang` (npm package):
```bash
npx designlang https://example.com
```

Or install globally:
```bash
npm install -g designlang
```

## Video Export (NEW)

Generate Hyperframes video composition from extracted design system:

```
/clone https://example.com --export-video
```

Creates:
- **design-showcase-video.html** - Animated design system walkthrough
- **preview** - Live video preview (localhost:3000)
- **render** - MP4 export ready

### Showcase Includes

The generated video showcases:
- **Color palette** - Animated color boxes with hex values
- **Typography** - Heading & body text samples with hierarchy
- **Components** - Interactive component states (default, hover, active)
- **Layout grid** - Spacing system visualization
- **Responsive breakpoints** - Layout changes across 4 viewports
- **Brand identity** - Logo, colors, fonts animated together
- **Accessibility score** - WCAG 2.1 rating displayed

### Video Output Formats

```bash
# Standard web MP4
npm run video:render  # → design-showcase.mp4

# All formats (MP4, WebM, ProRes)
npm run video:render-all

# Preview before rendering
npm run video:preview
```

**Specifications:**
- Format: Vertical (1080×1920) or Horizontal (1920×1080)
- Duration: 20-30 seconds
- Frame rate: 30 fps
- Audio: Ambient background music
- Captions: Auto-generated with hex values, font names

---

**Note:** This extracts visual design systems only. For component extraction, use the design-extract repository patterns directly.

**Video + Design:** Clone skill now integrates with Hyperframes video studio for complete design documentation (static + animated).
