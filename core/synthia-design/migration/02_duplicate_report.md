# Migration Phase 2 — Duplicate Report
# Date: 2026-04-04

## Exact Duplicates

### 1. AGENTS.md appears in 10+ locations
| Location | Content | Action |
|----------|---------|--------|
| /AGENTS.md (workspace root) | Full studio spec | CANONICAL |
| synthia-superdesign-main/CLAUDE.md | References AGENTS.md | keep (pointer) |
| paperclip-pauli-clip-master/.../default/AGENTS.md | Paperclip onboarding variant | archive |
| paperclip-pauli-clip-master/.../ceo/AGENTS.md | CEO variant | archive |
| master-design-files/ext-apps-main/AGENTS.md | ext-apps variant | archive |
| master-design-files/design-skills.md/.../AGENTS.md | Impeccable design variant | archive |
| master-design-files/marketingskills-main/AGENTS.md | Marketing variant | archive |
| master-design-files/OpenSpec-main/AGENTS.md | OpenSpec variant | archive |
| master-design-files/design-skills.md/ext-apps-main/AGENTS.md | Another ext-apps copy | delete |

**Resolution**: Keep root /AGENTS.md as CANONICAL. Archive all variants. Extract any unique logic from variants into studio/doctrine/ before archiving.

### 2. KUPURI-FRONTEND-SKILL.md duplicated
| Location | Action |
|----------|--------|
| /KUPURI-FRONTEND-SKILL.md (root) | Convenience copy → delete |
| skills/kupuri-frontend/SKILL.md | CANONICAL |

### 3. Design principles appear in multiple forms
| Location | Content | Action |
|----------|---------|--------|
| skills/design-principles/SKILL.md | Clean skill doc | CANONICAL |
| master-design-files/design-skills.md/pauli-impeccable-design--main/ | Raw source material | archive (extracted) |
| master-design-files/_OceanofPDF.com_Refactoring_UI_-_Adam_Wathan.txt | Book reference | archive |

### 4. Color psychology scattered
| Location | Content | Action |
|----------|---------|--------|
| skills/color-psychology/SKILL.md | Clean skill doc | CANONICAL |
| master-design-files/color pscyh.txt | Raw notes | archive |
| master-design-files/Color psychology refers to how colo.txt | Partial notes | delete (subsumed) |

### 5. Brand voice in multiple places
| Location | Content | Action |
|----------|---------|--------|
| skills/brand/SKILL.md | Clean skill doc | CANONICAL |
| master-design-files/brand-guide our culture.txt | Raw brand guide | archive |

### 6. esbuild.js has backup copy
| Location | Action |
|----------|--------|
| esbuild.js | keep |
| esbuild.js.backup | delete |

### 7. package.json has backup copy
| Location | Action |
|----------|--------|
| package.json | keep |
| package.json.backup | delete |

## Near-Duplicates (Same Logic, Different Packaging)

### 8. Motion knowledge across 3+ sources
| Location | Unique Content | Action |
|----------|---------------|--------|
| skills/motion/SKILL.md | Cinematic scroll stack spec | CANONICAL |
| master-design-files/cinematic-site-components-master/ | Implementation examples | extract patterns → archive |
| master-design-files/GSAP-Awwwards-Website-main/ | GSAP technique demos | extract patterns → archive |
| master-design-files/motion-primitives-main/ | React animation components | extract → studio/components/motion/ |

### 9. Component systems in 5+ scattered repos
| Location | System | Action |
|----------|--------|--------|
| master-design-files/tweakcn-main/ | TweakCN (shadcn-based) | extract (isolate shadcn) |
| master-design-files/21st-main/ | 21st.dev components | extract → studio/components/ |
| master-design-files/spectrum-ui-main/ | Spectrum UI | extract → studio/components/ |
| master-design-files/react-bits-main/ | React patterns | extract → studio/components/ |
| master-design-files/liquid-glass-react-master/ | Glass effects | extract → studio/patterns/ |

### 10. Anti-pattern logic in multiple places
| Location | Content | Action |
|----------|---------|--------|
| agents/ralphy/guardrails.md | Builder anti-patterns | CANONICAL (for Ralphy) |
| agents/lena/guardrails.md | Scorer anti-patterns | CANONICAL (for Lena) |
| master-design-files/pauli-Uncodixfy-main/ | Full anti-pattern system | extract → studio/anti-patterns/ |
| AGENTS.md (Lena section) | Inline anti-patterns | already in canonical |

## Obsolete / Junk

| File | Reason | Action |
|------|--------|--------|
| esbuild.js.backup | superseded | delete |
| package.json.backup | superseded | delete |
| master-design-files/compilation-of-3d-mesh-model-resources-master/ | Just a link list | archive |
| master-design-files/awesome-web-components-main/ | Generic collection | archive |
| master-design-files/profilepalette-main/ | Unrelated tool | archive |
| master-design-files/sistent-master/ | Layer5 design system (external) | archive |
| master-design-files/codebase-to-course-main/ | Unrelated tool | archive |

## Summary
- **Exact duplicates to resolve**: 7 clusters
- **Near-duplicates to merge**: 3 clusters
- **Files to delete**: 5
- **Files to archive**: ~15 folders from master-design-files/
- **Unique knowledge extracted**: All preserved in canonical locations
