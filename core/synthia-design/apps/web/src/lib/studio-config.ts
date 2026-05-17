export interface Agent {
  id: string
  name: string
  class: string | null
  role: string
  scope: string
  inputs: string
  outputs: string
  workspace: string
  color: string
}

export interface Skill {
  id: string
  name: string
  file: string
  domain: string
  description: string
  triggers: string[]
}

export interface DesignLaw {
  n: number
  title: string
  rule: string
}

// ─── 12 Agents ─────────────────────────────────────────────────────────────

export const AGENTS: Agent[] = [
  {
    id: 'concierge',
    name: 'Studio Concierge',
    class: null,
    role: 'Intake & Routing',
    scope: 'First contact for all incoming work. Owns the inbox.',
    inputs: 'PRDs, URLs, briefs, audit requests',
    outputs: 'Classified job records in studio/jobs/inbox/',
    workspace: 'studio/jobs/inbox/',
    color: '#8a8780',
  },
  {
    id: 'librarian',
    name: 'Design Librarian',
    class: null,
    role: 'Doctrine Guardian',
    scope: 'Owns the canonical knowledge system. Guards standards.',
    inputs: 'Queries about design doctrine, patterns, components',
    outputs: 'Canonical file references, anti-pattern warnings',
    workspace: 'studio/doctrine/',
    color: '#c9a96e',
  },
  {
    id: 'architect',
    name: 'Experience Architect',
    class: null,
    role: 'Design Strategy',
    scope: 'Translates PRD into design architecture. Decides what gets built.',
    inputs: 'Classified job from Concierge',
    outputs: 'Design brief: architecture, page structure, motion plan',
    workspace: 'studio/design-contracts/',
    color: '#8fb8d4',
  },
  {
    id: 'frontend',
    name: 'Frontend Designer',
    class: 'Ralphy-class',
    role: 'Visual Implementation',
    scope: 'All HTML/CSS/JS/React. Cinematic scroll systems.',
    inputs: 'Design brief from Experience Architect',
    outputs: '3 parallel HTML variations per brief',
    workspace: 'studio/jobs/active/',
    color: '#6ea87e',
  },
  {
    id: 'copy',
    name: 'Copy & Narrative Agent',
    class: 'Bass-class',
    role: 'UX Copy & Messaging',
    scope: 'Marketing copy, UX writing, newsletters, messaging systems.',
    inputs: 'Brand context, audience brief, page architecture',
    outputs: 'Markdown copy files, CTA structures, newsletter HTML',
    workspace: 'studio/copy/',
    color: '#b87db8',
  },
  {
    id: 'motion',
    name: 'Motion & Interaction Agent',
    class: 'Aurora-class',
    role: 'Animation & Motion',
    scope: 'Animation systems, transitions, Remotion compositions.',
    inputs: 'Design brief + asset references',
    outputs: 'Animation specs, Remotion compositions, video exports',
    workspace: 'studio/motion/',
    color: '#d4916e',
  },
  {
    id: 'spatial',
    name: '3D / Spatial Agent',
    class: 'Blender-class',
    role: '3D Assets & Worlds',
    scope: 'GLB exports, Lyra 3DGS worlds, Blender Python scripting.',
    inputs: 'Source image + trajectory (World Mode) or 3D brief',
    outputs: 'GLB/GLTF files, KSPLAT worlds, flythrough MP4',
    workspace: '3d/exports/',
    color: '#6ea8a8',
  },
  {
    id: 'reviewer',
    name: 'Design Reviewer',
    class: 'Lena-class',
    role: 'Quality Gate',
    scope: 'UDEC 14-axis scoring. Nothing ships below 8.5.',
    inputs: 'Any deliverable from any builder agent',
    outputs: 'Audit JSON, pass/fail decision, repair instructions',
    workspace: 'studio/audits/',
    color: '#e8c070',
  },
  {
    id: 'refactor',
    name: 'Refactor Agent',
    class: null,
    role: 'Design Debt',
    scope: 'Deduplication, component improvement, design debt cleanup.',
    inputs: 'Components, flagged deliverables',
    outputs: 'Refactored artifacts, cleanup reports',
    workspace: 'studio/components/',
    color: '#8a8780',
  },
  {
    id: 'packaging',
    name: 'Packaging & Delivery Agent',
    class: null,
    role: 'Client Delivery',
    scope: 'Prepare deliverables, manifests, exports for client handoff.',
    inputs: 'Reviewed and approved deliverables',
    outputs: 'Client-ready bundles, deploy manifests, portfolio pieces',
    workspace: 'studio/delivery/',
    color: '#8a8780',
  },
  {
    id: 'memory',
    name: 'Studio Memory Agent',
    class: null,
    role: 'Knowledge & Patterns',
    scope: 'Record patterns, lessons, critiques. Append-only memory.',
    inputs: 'Agent outputs, review decisions, client feedback',
    outputs: 'Indexed memory entries, pattern extractions',
    workspace: 'studio/memory/',
    color: '#8a8780',
  },
  {
    id: 'ops',
    name: 'Operations Agent',
    class: null,
    role: 'Health & Maintenance',
    scope: 'Scheduled audits, heartbeat checks, stale work detection.',
    inputs: 'Scheduled triggers, health event subscriptions',
    outputs: 'Health reports, cleanup recommendations, alerts',
    workspace: 'studio/heartbeats/',
    color: '#8a8780',
  },
]

// ─── Skills Registry ────────────────────────────────────────────────────────

export const SKILLS: Skill[] = [
  {
    id: '3d-world',
    name: '3D World Generation',
    file: '3d-world-SKILL.md',
    domain: '3D / Spatial',
    description: 'NVIDIA Lyra pipeline: image → 3DGS → explorable browser world. Covers trajectory design, depth estimation, Three.js delivery.',
    triggers: ['3d world', 'gaussian splatting', 'lyra', 'explorable scene', '3dgs', 'ksplat'],
  },
  {
    id: 'motion',
    name: 'Cinematic Motion',
    file: 'motion-SKILL.md',
    domain: 'Motion',
    description: '5-technique cinematic scroll stack: Lenis physics, CSS perspective parallax, GSAP SplitText, horizontal scroll, GLSL shaders.',
    triggers: ['scroll animation', 'parallax', 'gsap', 'lenis', 'cinematic', 'motion'],
  },
  {
    id: 'kupuri-frontend',
    name: 'Kupuri Frontend Stack',
    file: 'kupuri-frontend-SKILL.md',
    domain: 'Frontend',
    description: 'Full cinematic landing page implementation stack. Everything needed to build Awwwards-caliber frontends.',
    triggers: ['landing page', 'frontend', 'html', 'web design', 'ui'],
  },
  {
    id: 'design-principles',
    name: 'Design Principles',
    file: 'design-principles-SKILL.md',
    domain: 'Design',
    description: 'Foundational design principles governing all Cynthia output.',
    triggers: ['design principles', 'visual design', 'layout', 'typography'],
  },
  {
    id: 'color-psychology',
    name: 'Color Psychology',
    file: 'color-psychology-SKILL.md',
    domain: 'Design',
    description: 'Color theory and psychological impact for premium brand work.',
    triggers: ['color', 'palette', 'brand color', 'color system'],
  },
  {
    id: 'brand',
    name: 'Brand Voice',
    file: 'brand-SKILL.md',
    domain: 'Brand',
    description: 'Brand voice system, identity guidelines, messaging frameworks.',
    triggers: ['brand', 'voice', 'identity', 'brand system'],
  },
  {
    id: 'luxury-psychology',
    name: 'Luxury Psychology',
    file: 'luxury-psychology-SKILL.md',
    domain: 'Strategy',
    description: 'Premium market psychology for luxury brand positioning.',
    triggers: ['luxury', 'premium', 'high-end', 'prestige'],
  },
  {
    id: 'pass-framework',
    name: 'P.A.S.S. Copywriting',
    file: 'pass-framework-SKILL.md',
    domain: 'Copy',
    description: 'Problem → Agitation → Solution → Social proof. Conversion copywriting framework.',
    triggers: ['copy', 'copywriting', 'messaging', 'headline', 'cta'],
  },
  {
    id: 'behavioral-design',
    name: 'Behavioral Design Laws',
    file: 'behavioral-design-laws-SKILL.md',
    domain: 'UX',
    description: 'User behavior patterns that govern interaction design decisions.',
    triggers: ['ux', 'user behavior', 'interaction', 'conversion'],
  },
  {
    id: 'udec-scorer',
    name: 'UDEC Quality Scorer',
    file: 'udec-scorer-SKILL.md',
    domain: 'Quality',
    description: '14-axis weighted scoring framework. Minimum 8.5 floor. MOT and ACC are blockers.',
    triggers: ['udec', 'score', 'quality', 'audit', 'review'],
  },
  {
    id: 'land-the-plane',
    name: 'Land the Plane',
    file: 'land-the-plane-SKILL.md',
    domain: 'Delivery',
    description: 'Delivery patterns for getting production-ready work shipped.',
    triggers: ['delivery', 'ship', 'launch', 'finalize'],
  },
  {
    id: 'emerald-tablets',
    name: 'Emerald Tablets',
    file: 'emerald-tablets-SKILL.md',
    domain: 'Philosophy',
    description: 'The philosophical underpinnings of the Cynthia design approach.',
    triggers: ['philosophy', 'principles', 'ethos'],
  },
]

// ─── Design Laws ────────────────────────────────────────────────────────────

export const DESIGN_LAWS: DesignLaw[] = [
  { n: 1, title: 'No Banned Fonts', rule: 'Never use Inter, Roboto, Arial, Helvetica, Open Sans, Montserrat, Poppins, or Lato.' },
  { n: 2, title: 'No Purple', rule: 'Purple is banned. No neon gradients. No generic card grids.' },
  { n: 3, title: 'IntersectionObserver Only', rule: 'No scroll event listeners. Use IntersectionObserver for all scroll-driven behavior.' },
  { n: 4, title: 'Three Parallel Variations', rule: 'Every builder task produces 3 parallel variations. Never just one.' },
  { n: 5, title: 'Review Before Release', rule: 'Every deliverable scored by Reviewer (LENA) before release. No exceptions.' },
  { n: 6, title: 'Append-Only Memory', rule: 'Memory is append-only. No agent modifies another agent\'s memory.' },
  { n: 7, title: 'Human Approval for Financial', rule: 'Financial actions always require human approval. No autonomous payments.' },
  { n: 8, title: 'Reduced Motion Respected', rule: 'prefers-reduced-motion must always be respected. No exceptions.' },
  { n: 9, title: 'Zero TODOs', rule: 'No TODOs, stubs, or placeholder buttons in shipped work.' },
  { n: 10, title: 'UDEC 8.5 Floor', rule: 'Nothing ships below UDEC 8.5 composite score.' },
  { n: 11, title: 'MOT & ACC Blockers', rule: 'Motion (MOT) and Accessibility (ACC) below 7.0 = full rebuild. No overrides.' },
  { n: 12, title: 'No Secrets in Code', rule: 'Zero secrets in code. All secrets via Infisical (synthia-3 project).' },
  { n: 13, title: 'GLB Size Limits', rule: '3D assets: < 2MB for web embedding, < 5MB for video. KSPLAT: < 15MB.' },
  { n: 14, title: 'No Copyrighted Assets', rule: 'No copyrighted characters, trademark brand assets, or licensed fonts without clearance.' },
]

// ─── Anti-Patterns ──────────────────────────────────────────────────────────

export const ANTI_PATTERNS = [
  { id: 'banned-font', severity: 'error', description: 'Banned font family (Inter, Roboto, Arial, Helvetica, Open Sans, Montserrat, Poppins, Lato)' },
  { id: 'purple-color', severity: 'error', description: 'Purple color (#800080, #a020f0, purple, violet, etc.)' },
  { id: 'scroll-listener', severity: 'error', description: 'window.addEventListener("scroll", ...) — use IntersectionObserver instead' },
  { id: 'neon-gradient', severity: 'error', description: 'Neon gradient (high-saturation multi-color gradients)' },
  { id: 'generic-card-grid', severity: 'warning', description: 'Generic card grid pattern (3-column equal-weight cards with no hierarchy)' },
  { id: 'todo-stub', severity: 'error', description: 'TODO, FIXME, stub, or placeholder in shipped code' },
  { id: 'missing-reduced-motion', severity: 'error', description: 'Animation without prefers-reduced-motion guard' },
  { id: 'iframe-3d', severity: 'error', description: 'iframe embedding for 3D viewer (use native Three.js)' },
  { id: 'auto-pointer-lock', severity: 'error', description: 'Auto pointer lock on page load (must be user-initiated)' },
  { id: 'uncompressed-ply', severity: 'warning', description: 'Raw PLY file served to browser without ksplat conversion' },
  { id: 'raf-no-visibility', severity: 'warning', description: 'requestAnimationFrame loop without document.visibilitychange guard' },
]

// ─── UDEC Axes ──────────────────────────────────────────────────────────────

export const UDEC_AXES = [
  { id: 'VIS', name: 'Visual Hierarchy', weight: 1.2, blocker: false },
  { id: 'TYP', name: 'Typography', weight: 1.1, blocker: false },
  { id: 'COL', name: 'Color System', weight: 1.0, blocker: false },
  { id: 'LAY', name: 'Layout & Space', weight: 1.1, blocker: false },
  { id: 'MOT', name: 'Motion & Interaction', weight: 1.3, blocker: true },
  { id: 'ACC', name: 'Accessibility', weight: 1.4, blocker: true },
  { id: 'RES', name: 'Responsiveness', weight: 1.0, blocker: false },
  { id: 'PER', name: 'Performance', weight: 1.1, blocker: false },
  { id: 'COD', name: 'Code Quality', weight: 0.9, blocker: false },
  { id: 'BRD', name: 'Brand Alignment', weight: 1.0, blocker: false },
  { id: 'COP', name: 'Copy & Narrative', weight: 0.9, blocker: false },
  { id: 'CON', name: 'Conversion Design', weight: 1.0, blocker: false },
  { id: 'UNI', name: 'Uniqueness', weight: 1.2, blocker: false },
  { id: 'DEL', name: 'Delivery Completeness', weight: 0.8, blocker: false },
]

// ─── Task Routing ────────────────────────────────────────────────────────────

export const TASK_ROUTING: Record<string, string> = {
  'site-audit': 'concierge',
  'landing-page': 'frontend',
  'web-app': 'frontend',
  'animation': 'motion',
  '3d-asset': 'spatial',
  '3d-world': 'spatial',
  'copy': 'copy',
  'brand': 'architect',
  'review': 'reviewer',
  'refactor': 'refactor',
  'batch-update': 'refactor',
}
