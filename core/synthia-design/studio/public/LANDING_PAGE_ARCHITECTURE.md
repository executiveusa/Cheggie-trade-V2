# Landing Page Architecture — Cynthia Design Studio
# Version: 1.0.0

## Narrative Arc

The landing page tells a single story in 7 scenes:

### Scene 1: The Promise (Hero)
**Message**: "Your website should feel like your best product."
**Visual**: Cinematic full-viewport hero with atmospheric depth. Lenis smooth scroll. GLSL noise shader background. Display type ≥5rem.
**CTA**: "Get Your Free Site Audit" (primary), "See Our Work" (secondary)

### Scene 2: The Problem (Pain)
**Message**: "Traditional agencies are slow, opaque, and expensive. Generic AI tools are just that — generic."
**Visual**: Split comparison. Left: waiting, black box, invoices. Right: generic templates, cookie-cutter output.
**Motion**: Parallax reveal on scroll.

### Scene 3: The Difference (Positioning)
**Message**: "Cynthia is an autonomous design studio. World-class standards. Visible execution. Premium outcomes."
**Visual**: Three pillars with staggered entrance:
1. **Standards** — UDEC 8.5 quality floor, 14-axis scoring
2. **Transparency** — Watch your project being built in real time
3. **Speed** — Hours, not weeks. Because agents don't sleep.

### Scene 4: The Proof (Capabilities)
**Message**: "Websites, apps, dashboards, motion, 3D, copy, newsletters — all under one roof."
**Visual**: Horizontal scroll gallery showing live work samples. Each card reveals on hover with UDEC score badge.
**Motion**: GSAP horizontal pin scroll.

### Scene 5: The Process (How It Works)
**Message**: "Submit your brief. Watch the design room. Receive premium work."
**Visual**: 3-step timeline:
1. Submit brief or URL
2. Open the design room — watch agents work in real time
3. Receive scored, reviewed, packaged deliverables
**Motion**: Step-by-step reveal with SplitText animation.

### Scene 6: The Invitation (Free Audit)
**Message**: "Start with a free site audit. We'll show you what's possible."
**Visual**: Clean form — URL input, optional fields (brand, goals, competitors). Premium input styling with micro-interactions.
**CTA**: "Analyze My Site — Free"
**Backend**: Triggers audit intake job via Concierge

### Scene 7: The Close (Trust + Footer)
**Message**: Quality badges, testimonials (when available), studio identity.
**Visual**: Minimal footer with brand mark, navigation, legal links.

## Technical Stack
- Next.js 15 (static generation where possible)
- Tailwind CSS
- GSAP + Lenis (cinematic scroll)
- SplitText (typography animation)
- GLSL noise shader (atmospheric hero)
- CSS perspective layers (depth)
- prefers-reduced-motion: respected

## Mobile Adaptation
- All parallax disabled at 375px
- Touch targets ≥ 44px
- Horizontal scroll gallery becomes vertical stack
- Hero type scales to 3rem on mobile
- Form optimized for thumb-reach input

## Performance Targets
- Lighthouse Performance ≥ 90
- First Contentful Paint < 1.5s
- Cumulative Layout Shift < 0.1
- Total Blocking Time < 200ms
