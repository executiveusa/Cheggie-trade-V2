# Studio Runtime Journal — Architecture Decisions
# Migration Phase 05 — Decision Log

## Decision 001: Quality Floor = UDEC 8.5
**Date**: 2026-04-04
**Decision**: Nothing ships below UDEC 8.5. MOT and ACC are blockers at 7.0.
**Rationale**: The studio's value proposition is premium quality. Shipping mediocre work destroys trust faster than shipping nothing.
**Alternative considered**: 7.5 floor (rejected — not meaningfully above average)
**Consequences**: Some projects may require 3-4 iterations. This is acceptable. Speed is secondary to quality.

## Decision 002: Karpathy Council (3 Variations)
**Date**: 2026-04-04
**Decision**: Every design task produces 3 parallel variations, scored independently, best elements synthesized.
**Rationale**: Named after Andrej Karpathy's council approach. Parallel exploration finds better solutions than sequential iteration. The synthesis step captures the best of each variation.
**Consequences**: 3x compute per round 1. Worth it — produces meaningfully better output.

## Decision 003: Paperclip as Control Plane
**Date**: 2026-04-04
**Decision**: Paperclip handles org structure, governance, budgets, agent tracking. Cynthia handles design intelligence.
**Rationale**: Don't reinvent orchestration. Paperclip already has org charts, heartbeats, governance, plugins. Cynthia should focus on what makes it unique: design quality.
**Separation**: Paperclip = structure. Cynthia = substance.

## Decision 004: Rust-First Infrastructure
**Date**: 2026-04-04
**Decision**: CLI tools, validators, indexers, and MCP server written in Rust.
**Rationale**: The anti-pattern checker, doctrine validator, and knowledge indexer are the studio's immune system. They must be fast, reliable, and not dependent on LLM availability. Rust provides compile-time correctness guarantees, deterministic performance, and no runtime.
**Alternative considered**: TypeScript (rejected — runtime dependency, slower for file processing)

## Decision 005: Three Payment Providers
**Date**: 2026-04-04
**Decision**: Stripe (primary), Creem (MoR for international), Cash App Pay (US micro-payments).
**Rationale**: Different clients have different payment preferences. Stripe handles most cases. Creem simplifies international tax/compliance. Cash App Pay reaches clients who prefer mobile-native payments.

## Decision 006: Free Audit as Primary Funnel
**Date**: 2026-04-04
**Decision**: Free site audits are the primary client acquisition channel.
**Rationale**: Demonstrates capability before asking for money. The audit itself IS the sales pitch. A client who sees their site scored at 5.2/10 with specific, fixable issues will convert at significantly higher rates than cold outreach.

## Decision 007: 12 Agent Roles (Not 8)
**Date**: 2026-04-04
**Decision**: Expanded from 8 agents (AGENTS.md original) to 12 specialized roles.
**Rationale**: The original 8 conflated concerns. Adding Concierge (intake), Librarian (knowledge), Packaging (delivery), Ops (monitoring) makes the system more maintainable and each agent's scope clearer.
**New agents**: Concierge, Librarian, Refactor, Packaging, Memory, Ops

## Decision 008: Memory is Append-Only
**Date**: 2026-04-04
**Decision**: All memory writes are append-only. No agent can modify or delete another agent's memory. Only the Memory Agent compacts.
**Rationale**: Append-only memory prevents data loss and maintains audit trail. Compaction by a dedicated agent prevents inconsistencies. This mirrors write-ahead-log patterns in databases.

## Decision 009: Landing Page as 7-Scene Narrative
**Date**: 2026-04-04
**Decision**: The public landing page follows a 7-scene cinematic narrative structure.
**Rationale**: This is not a marketing site — it's a demonstration of what Cynthia can do. The landing page should be the best work in the portfolio. 7 scenes provide enough structure for a complete narrative arc.

## Decision 010: Edge/Mobile via Gemma 4
**Date**: 2026-04-04
**Decision**: Gemma 4 handles lightweight tasks locally on mobile/edge. Heavy tasks go to cloud.
**Rationale**: Mobile dashboard users need quick status checks and basic approvals. These don't need a full Claude call. Gemma 4 is fast, runs locally, and handles the common 70% of queries. Cloud handles the complex 30%.
