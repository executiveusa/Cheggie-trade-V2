# Migration Phase 1 — Logic Graph
# Date: 2026-04-04

## System Architecture: How Knowledge Flows

```
                    ┌─────────────────────┐
                    │    CLAUDE.md         │ ← Master floor plan
                    │  (read-first doc)    │
                    └─────────┬───────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
     ┌────────────┐  ┌──────────────┐  ┌───────────────┐
     │  AGENTS.md  │  │system-prompt │  │ KUPURI-SKILL  │
     │ (8 agents)  │  │   .txt       │  │  (design law) │
     └──────┬─────┘  └──────┬───────┘  └───────┬───────┘
            │               │                   │
            ▼               ▼                   ▼
    ┌───────────────────────────────────────────────────┐
    │              TASK ROUTING LAYER                     │
    │  tasks/ROUTING.md → tasks/FORMAT.md                │
    │  tasks/DESIGN_GRAPH.json                           │
    └─────────────────┬─────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
   ┌─────────┐  ┌─────────┐  ┌─────────┐
   │ RALPHY  │  │  LENA   │  │  MARCO  │
   │ Builder │  │ Critic  │  │ Synth.  │
   └────┬────┘  └────┬────┘  └────┬────┘
        │             │             │
        ▼             ▼             ▼
   ┌─────────────────────────────────────┐
   │         SKILL LIBRARY               │
   │  kupuri-frontend → motion → color   │
   │  brand → design-principles          │
   │  udec-scorer → emerald-tablets      │
   │  awwwards-research                  │
   └──────────────┬──────────────────────┘
                  │
                  ▼
   ┌─────────────────────────────────────┐
   │         QUALITY GATE                │
   │  tasks/GATE.md (UDEC 8.5 floor)    │
   │  14-axis scoring → blocker check   │
   │  MOT ≥ 7.0, ACC ≥ 7.0 or reject   │
   └──────────────┬──────────────────────┘
                  │
                  ▼
   ┌─────────────────────────────────────┐
   │         OUTPUT                      │
   │  .superdesign/design_iterations/    │
   │  audits/*.json                      │
   │  examples/{project}/                │
   └─────────────────────────────────────┘
```

## Reference Dependencies

### Who reads what:
| Consumer | Reads | Purpose |
|----------|-------|---------|
| ALL agents | CLAUDE.md | Context, identity, folder map |
| ALL agents | AGENTS.md | Scope boundaries, protocols |
| Hermes | tasks/ROUTING.md | Agent assignment |
| Hermes | tasks/DESIGN_GRAPH.json | Topology, parallel execution |
| Ralphy | skills/kupuri-frontend/SKILL.md | Design law |
| Ralphy | skills/motion/SKILL.md | Cinematic scroll stack |
| Ralphy | skills/color-psychology/SKILL.md | Color rules |
| Ralphy | skills/design-principles/SKILL.md | Foundational laws |
| Ralphy | agents/ralphy/guardrails.md | Hard failures |
| Lena | skills/udec-scorer/SKILL.md | Scoring framework |
| Lena | tasks/GATE.md | Quality threshold |
| Lena | agents/lena/guardrails.md | Scoring integrity |
| Marco | Lena audit output | Synthesis input |
| Scout | skills/awwwards-research/SKILL.md | Research protocol |
| Aurora | skills/motion/SKILL.md | Motion spec |
| Bass | skills/brand/SKILL.md | Voice characters |
| Blender | No explicit SKILL.md yet | Gap |

### Cross-references found:
- AGENTS.md references CLAUDE.md → consistent
- system-prompt.txt references skills/ → consistent
- ROUTING.md references agents/ → consistent
- DESIGN_GRAPH.json references skills/ → consistent
- Emerald Tablets references Donella Meadows → external source
- ZTE_AGENT_PERSONA references WRITE→TEST→FIX→COMMIT loop → operational protocol
- kupuri-frontend references color-psychology, motion, brand → skill chain

## Gaps in the Graph
1. No formal dependency graph between skills (no SKILL_GRAPH.json)
2. No machine-readable routing table (ROUTING.md is prose only)
3. No formal output→memory feedback loop
4. No CI/CD validation of DESIGN_GRAPH.json against actual files
5. No automated guardrail enforcement (lint before scoring)
6. Blender agent has no skill doc
7. No pattern library to reference during builds
8. No exemplar library for calibration
