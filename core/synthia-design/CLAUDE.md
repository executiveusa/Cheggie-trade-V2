# CLAUDE.md — executiveusa/synthia-superdesign
# The Pauli Effect™ — Cynthia Design Studio
# Canonical autonomous design authority

---

## What This Repo Is

This is **Cynthia** — an autonomous AI design studio that produces premium design work at Awwwards SOTD caliber. Twelve specialized agents collaborate under a machine-verified quality framework (UDEC 8.5 floor) using the Karpathy Council protocol (3 parallel variations → review → synthesize → iterate).

## Read First — In This Order

1. **STUDIO_MANIFEST.md** — What Cynthia is. Architecture. Rules.
2. **studio/agents/AGENT_ROLES.md** — The 12 agents and their contracts
3. **studio/doctrine/DESIGN_LAWS.md** — 14 non-negotiable design laws
4. **studio/ops/OPERATING_MODEL.md** — 8-layer operating system
5. **studio/index/studio-catalog.md** — Master index of everything

## Quality Floor

**UDEC 8.5** — Nothing ships below this score. Ever.

- **MOT** (Motion & Interaction) and **ACC** (Accessibility) are **blocker axes** — below 7.0 = full rebuild
- 14-axis weighted scoring framework: see `studio/index/udec-rubric.yaml`
- Anti-pattern detection: see `studio/anti-patterns/registry.yaml`

## Repo Structure

```
/
├── STUDIO_MANIFEST.md           ← Start here
├── AGENT_ONBOARDING.md          ← Onboarding for new agents
├── WHY_THIS_WORKS.md            ← Business reasoning
│
├── studio/
│   ├── doctrine/                ← Design laws + skill files
│   ├── agents/                  ← 12 agent definitions + workspaces
│   ├── anti-patterns/           ← Machine-readable banned patterns
│   ├── ops/                     ← Operating model, org, observability
│   ├── commercial/              ← Payments, checkout, funnels, delivery
│   ├── public/                  ← Landing page, free audit, client portal
│   ├── mobile/                  ← Edge model strategy (Gemma 4)
│   ├── memory/                  ← Memory model
│   ├── index/                   ← YAML indexes, routing, schemas
│   └── patterns/                ← Reusable HTML patterns
│
├── rust/                        ← Rust-first infrastructure
│   ├── cli/                     ← cynthia CLI
│   ├── validators/              ← Anti-pattern detection
│   ├── indexers/                ← Knowledge graph compiler
│   ├── mcp/                     ← MCP server
│   ├── bridges/                 ← Integration adapters
│   ├── parsers/                 ← File format parsers
│   ├── graph-tools/             ← Relationship graphs
│   └── sync-tools/              ← Repo reconciliation
│
├── migration/                   ← Migration artifacts + decisions
│
├── src/                         ← VS Code extension (TypeScript)
├── web/                         ← Next.js web application
├── 3d/                          ← Blender projects
├── audio/                       ← Audio production
└── video/                       ← Remotion video projects
```

## Commit Format

```
[STUDIO][AGENT] type: description | UDEC score
```

Examples:
```
[STUDIO][RALPHY] feat: querencia v3 landing | UDEC 9.1
[STUDIO][LENA] audit: querencia v3 scored | UDEC 9.1 all-pass
[STUDIO][MARCO] synth: querencia v3 synthesis brief
[STUDIO][OPS] infra: rust validator anti-pattern check
```

## Secrets

**Infisical** project: synthia-3 (76894224-eb02-4c6f-8ebe-d25fd172c861)
```bash
infisical run --env=prod -- {command}
```
**Zero secrets in code. Ever.**

## Key Rules

1. No banned fonts (Inter, Roboto, Arial, Helvetica, Open Sans, Montserrat, Poppins, Lato)
2. No purple. No neon gradients. No generic card grids.
3. No scroll event listeners — use IntersectionObserver
4. Every builder task produces 3 parallel variations
5. Every deliverable scored by Reviewer before release
6. Memory is append-only — no agent modifies another's memory
7. Financial actions always require human approval
8. prefers-reduced-motion always respected
