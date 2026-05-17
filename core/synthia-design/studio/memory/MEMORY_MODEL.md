# Memory Model — Cynthia Design Studio
# Version: 1.0.0

## What Memory Means

Cynthia's memory is the system by which the studio gets smarter with every project.
It is NOT a RAG database. It is layered, scoped, and purposeful.

## Memory Layers

### Layer 1: Doctrine (Read-Heavy, Rarely Written)
**Location**: studio/doctrine/, skills/
**What lives here**: Design laws, skill documents, anti-pattern registry, UDEC rubric
**Who writes**: Librarian (after Bambu approval for doctrine changes)
**Who reads**: Every agent
**Frequency**: Updated monthly or after significant learning

### Layer 2: Project Memory (Write-Heavy, Per-Project)
**Location**: studio/jobs/{project_id}/memory/
**What lives here**: 
- Decisions made during the project
- Variations attempted and why they were rejected
- Synthesis briefs and evolution
- Final scores and reviewer notes
- Client feedback
**Who writes**: Every agent during their work
**Who reads**: Any agent working on the same project
**Retention**: Permanent. Part of the studio's experience.

### Layer 3: Agent Memory (Per-Agent, Cross-Project)
**Location**: studio/agents/{role}/memory/
**What lives here**:
- Patterns the agent has learned
- Techniques that work well
- Common mistakes to avoid
- Personal heuristics
**Who writes**: The owning agent
**Who reads**: The owning agent + Memory Agent during compaction
**Retention**: Compacted monthly (duplicates removed, insights merged)

### Layer 4: Studio Memory (Global, Cross-Agent)
**Location**: studio/memory/
**What lives here**:
- Cross-project insights
- Client preferences database
- Technique effectiveness ratings
- Recurring patterns
- Competitive intelligence summary
**Who writes**: Memory Agent (via nightly compaction)
**Who reads**: Any agent
**Retention**: Permanent. Growing knowledge base.

### Layer 5: Operational Memory (Ephemeral)
**Location**: studio/heartbeats/, studio/schedules/
**What lives here**: Current state, active jobs, heartbeat data
**Who writes**: Ops Agent
**Who reads**: Dashboard, Concierge
**Retention**: Rolling 30-day window

## Memory Compaction

Monthly, the Memory Agent:
1. Reads all Agent Memory files
2. Extracts unique insights
3. Removes duplicates
4. Identifies patterns (e.g., "GLSL shaders consistently boost ATM by +1.5")
5. Writes compacted insights to Studio Memory
6. Archives raw agent memory (never deletes)

## Memory Rules

1. **Never delete memory.** Archive instead.
2. **Every memory entry has a timestamp, author agent, and project context.**
3. **Memory writes are append-only.** No agent can modify another agent's memory.
4. **The Memory Agent is the only agent that can compact (merge/summarize) memory.**
5. **Doctrine changes require Librarian + human approval.**
6. **No secrets in memory.** Use Infisical references, never values.
7. **Memory is searchable.** Rust indexer builds full-text search over all layers.

## Memory Entry Format

```yaml
- timestamp: "2026-04-04T14:30:00Z"
  agent: frontend
  project: querencia-v3
  type: learning
  content: "Lenis smooth scroll + GSAP ScrollTrigger combination works best when Lenis is initialized first, then GSAP ScrollTrigger proxy is set up. Reverse order causes jank."
  tags: [motion, lenis, gsap, performance]
  udec_impact: { MOT: "+1.0", PER: "+0.5" }
```
