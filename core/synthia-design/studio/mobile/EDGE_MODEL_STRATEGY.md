# Edge & Mobile Strategy — Cynthia Design Studio
# Version: 1.0.0

## Overview

Cynthia supports local/edge/mobile access for operators and clients. Parts of the system can run closer to the device where useful, with cloud as the primary runtime.

## Gemma 4 Integration Strategy

Google's Gemma 4 (released April 2, 2026) provides edge-capable model variants suitable for:

### Appropriate Uses
| Use Case | Gemma Variant | Rationale |
|----------|--------------|-----------|
| Local draft summarization | gemma-4-mini | Quick summaries without cloud round-trip |
| Mobile job status assistant | gemma-4-mini | On-device query about job progress |
| Offline audit preview | gemma-4-mini | Generate rough audit notes when offline |
| Privacy-sensitive review | gemma-4 | Client data stays on device |
| Edge retrieval helper | gemma-4-mini | Search studio index locally |
| Low-latency UI suggestions | gemma-4-mini | Inline design hints while working |

### Not Appropriate For
| Task | Why | Use Instead |
|------|-----|-------------|
| Full UDEC scoring | Requires complex multi-axis judgment | Claude/GPT (cloud) |
| Complete landing page generation | Needs deep design doctrine | Claude (cloud) |
| Final copy production | Brand voice precision required | Claude (cloud) |
| 3D scene specification | Complex spatial reasoning | Cloud models |
| Financial decisions | Requires audit trail and governance | Cloud with approval gates |

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ MOBILE/EDGE  │     │  CLOUD API   │     │ STUDIO REPO  │
│              │     │              │     │              │
│ Gemma 4 mini │◄───►│ Claude/GPT   │◄───►│ Canonical    │
│ Local index  │     │ Task Router  │     │ Knowledge    │
│ Job summary  │     │ Event Bus    │     │ Job Queue    │
│ Draft assist │     │ Review Gate  │     │ Memory       │
└──────────────┘     └──────────────┘     └──────────────┘
```

## Mobile Dashboard Access

### Features
- Job pipeline view (inbox → active → review → delivered)
- Agent status cards (heartbeat indicators)
- Recent events feed
- Approve/reject actions for human gates
- Quick audit trigger (submit URL from phone)
- Revenue summary

### Implementation
- Mobile-first responsive web dashboard (part of Next.js web app)
- SSE (Server-Sent Events) for real-time updates
- Offline-capable via service worker for status caching
- Push notifications via Telegram/Discord (primary) or web push (secondary)

## Model Capability Registry

```yaml
models:
  gemma-4-mini:
    provider: local/google
    capabilities: [summarization, classification, retrieval, simple_generation]
    max_context: 32k
    speed: fast
    cost: free (local)
    privacy: on-device
    suitable_for: [draft_assist, job_summary, index_search, offline_work]

  gemma-4:
    provider: local/google
    capabilities: [summarization, classification, generation, reasoning]
    max_context: 128k
    speed: medium
    cost: free (local)
    privacy: on-device
    suitable_for: [privacy_sensitive_review, detailed_summaries]

  claude-sonnet:
    provider: anthropic
    capabilities: [all]
    max_context: 200k
    speed: medium
    cost: per-token
    privacy: cloud
    suitable_for: [design_generation, scoring, copy_production, complex_reasoning]

  gpt-4o:
    provider: openai
    capabilities: [all]
    max_context: 128k
    speed: fast
    cost: per-token
    privacy: cloud
    suitable_for: [design_generation, scoring, copy_production]
```

## Task Routing: Local vs Cloud

```yaml
routing_rules:
  - condition: "task requires UDEC scoring"
    route: cloud
    reason: "Complex multi-axis judgment requires full model capability"

  - condition: "task is draft preview or summary"
    route: local_if_available
    fallback: cloud
    reason: "Speed matters, accuracy is best-effort"

  - condition: "client data is privacy-sensitive"
    route: local
    reason: "Data stays on device"

  - condition: "task involves financial decisions"
    route: cloud
    reason: "Requires audit trail and governance"

  - condition: "user is offline"
    route: local
    reason: "Only option available"

  - condition: "default"
    route: cloud
    reason: "Full capability by default"
```

## Offline-Safe Operations

When offline, agents can still:
- Browse cached studio index
- Draft preliminary work (marked as draft, not final)
- Review cached job status
- Generate summaries of cached data
- Queue actions for sync when online

When back online:
- Sync queued actions
- Validate offline work against current state
- Submit for review if appropriate
