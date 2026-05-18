# Migration Phase 0 — Full Repository Inventory
# Date: 2026-04-04
# Status: COMPLETE

## Sources Analyzed

### 1. LOCAL — synthia-superdesign-main (C:\Users\execu\Downloads\synthia-superdesign-main(1)\synthia-superdesign-main)
- **Type**: Full studio repo with design intelligence, VS Code extension, Next.js web app, agent definitions, skill library
- **File count**: ~2000+ (includes master-design-files archives)
- **Key value**: Design doctrine, UDEC scoring, agent system, task routing, motion/color/brand skills

### 2. REMOTE — executiveusa/synthia-superdesign (GitHub)
- **Type**: Slimmed VS Code extension repo
- **File count**: ~89 files
- **Key value**: Clean extension codebase, cursor rules, CI/CD

### 3. PAPERCLIP — paperclipai/paperclip (GitHub)
- **Type**: Multi-agent orchestration platform
- **File count**: ~1371 files
- **Key value**: Company control plane, org charts, task routing, heartbeats, agent runtime, plugin system

---

## Inventory by Domain

### A. DESIGN DOCTRINE (15 files — ALL VALUABLE)
| File | Source | Classification | Action |
|------|--------|---------------|--------|
| CLAUDE.md | local | doctrine/master-ref | promote-to-canonical |
| AGENTS.md (root) | local+remote | doctrine/agent-spec | promote-to-canonical |
| system-prompt.txt | local+remote | prompt/doctrine | keep |
| KUPURI-FRONTEND-SKILL.md | local | doctrine/design-law | promote-to-canonical |
| skills/kupuri-frontend/SKILL.md | local | doctrine/component-system | promote-to-canonical |
| skills/design-principles/SKILL.md | local | doctrine/design-law | promote-to-canonical |
| skills/emerald-tablets/SKILL.md | local | doctrine/philosophy | keep |
| skills/udec-scorer/SKILL.md | local | doctrine/scoring | promote-to-canonical |
| skills/color-psychology/SKILL.md | local | doctrine/brand-law | keep |
| skills/brand/SKILL.md | local | doctrine/voice | keep |
| skills/motion/SKILL.md | local | doctrine/motion | keep |
| master-design-files/SYNTHIA_SYSTEMS_FORCE_PROMPT.md | local | doctrine/systems | refactor → studio/doctrine/ |
| master-design-files/ZTE_AGENT_PERSONA.md | local | doctrine/agent-behavior | merge → studio/doctrine/ |
| tasks/GATE.md | local | doctrine/quality-gate | promote-to-canonical |
| tasks/ROUTING.md | local | workflow/routing | keep |

### B. AGENT DEFINITIONS (8 agents)
| Agent | File | Action |
|-------|------|--------|
| Hermes (Director) | agents/hermes/AGENT.md | keep |
| Ralphy (Builder) | agents/ralphy/AGENT.md + guardrails.md | keep |
| Lena (Critic) | agents/lena/AGENT.md + guardrails.md | keep |
| Marco (Synthesist) | agents/marco/AGENT.md | keep |
| Aurora (Motion/Video) | agents/aurora/AGENT.md | keep |
| Bass (Audio) | agents/bass/AGENT.md | keep |
| Blender (3D) | agents/blender/AGENT.md | keep |
| Scout (Research) | agents/scout/AGENT.md | keep |

### C. TASK ROUTING & SCHEMAS (4 files)
| File | Classification | Action |
|------|---------------|--------|
| tasks/ROUTING.md | workflow/routing | keep + create JSON |
| tasks/FORMAT.md | schema/task-format | keep + create JSON Schema |
| tasks/DESIGN_GRAPH.json | schema/architecture | promote-to-canonical |
| tasks/queue/ | job-queue | keep |

### D. VS CODE EXTENSION (complete codebase)
| Area | Files | Action |
|------|-------|--------|
| src/extension.ts | entry point | keep |
| src/providers/ | LLM providers (Claude, OpenAI, etc.) | keep |
| src/services/ | chat, Claude Code, custom agent, logger | keep |
| src/tools/ | bash, edit, glob, grep, ls, read, write, theme | keep |
| src/types/ | agent.ts, context.ts | keep |
| src/webview/ | React chat UI | keep |
| src/templates/ | webview HTML template | keep |

### E. WEB APPLICATION (Next.js 15)
| Area | Files | Action |
|------|-------|--------|
| web/app/ | Next.js routes, blog | keep |
| web/components/ | React components | keep |
| web/content/ | Blog posts (MDX) | keep |
| web/lib/ | utilities | keep |

### F. MASTER DESIGN FILES (archive — needs triage)
| Subfolder | Content | Action |
|-----------|---------|--------|
| 21st-main/ | 21st.dev components | extract → studio/components/ |
| cinematic-site-components-master/ | Motion patterns | extract → studio/patterns/motion/ |
| GSAP-Awwwards-Website-main/ | GSAP techniques | extract → studio/patterns/web/ |
| motion-primitives-main/ | Animation primitives | extract → studio/components/motion/ |
| tweakcn-main/ | TweakCN components | extract → studio/components/ (isolate shadcn) |
| react-bits-main/ | React patterns | extract → studio/components/ |
| liquid-glass-react-master/ | Glass effects | extract → studio/patterns/web/ |
| spectrum-ui-main/ | UI components | extract → studio/components/ |
| pauli-Uncodixfy-main/ | Anti-pattern enforcement | extract → studio/anti-patterns/ |
| marketingskills-main/ | Marketing workflows | extract → studio/workflows/ |
| OpenSpec-main/ | Spec patterns | extract → studio/design-contracts/ |
| design-skills.md/ | Design skill docs | extract → studio/doctrine/ |
| llm-council-master/ | Multi-LLM council | extract → studio/workflows/ |
| awesome-blender-master/ | Blender resources | archive |
| awesome-cg-vfx-pipeline-master/ | VFX pipeline | archive |
| Hunyuan3D-2-main/ | 3D generation | archive |
| TRELLIS.2-main/ | 3D generation | archive |
| layer5-master/ | Sistent design system | extract patterns → archive |
| StoryToolkitAI-main/ | Story/video AI | archive |
| codebase-to-course-main/ | Code → course | archive |

### G. PAPERCLIP ARCHITECTURE (reference)
| Area | Key Files | Value |
|------|-----------|-------|
| Server | server/src/ | Agent runtime, org charts, heartbeats |
| CLI | cli/src/ | Command interface |
| UI | ui/src/ | Web dashboard |
| Plugins | packages/plugins/ | Extensible agent capabilities |
| Docs | doc/SPEC.md, doc/GOAL.md | Orchestration spec |
| Skills | skills/paperclip/ | Agent skill definitions |

---

## Summary Statistics
- **Total valuable doctrine files**: 15
- **Total agent definitions**: 8 (current) → 12 (target for Cynthia studio)
- **Total skills**: 8
- **Total components to extract**: ~200+ across master-design-files
- **Folders needing population**: patterns/, examples/, research/, video/, audio/, 3d/
- **Files to archive**: ~50% of master-design-files (external repos)
- **Duplicates detected**: See 02_duplicate_report.md
