# Rust Infrastructure — Cynthia Design Studio
# Version: 1.0.0

## Overview

Cynthia uses Rust for all durable production infrastructure: event processing, validation, indexing, routing, packaging, and mobile bridges. Rust is chosen for reliability, performance, and long-term maintainability.

## Workspace Structure

```
rust/
├── Cargo.toml              (workspace root)
├── cli/                    (cynthia CLI)
├── mcp/                    (MCP server for agent tool access)
├── bridges/                (integration bridges)
├── validators/             (doctrine + schema validators)
├── indexers/               (knowledge graph + search index)
├── parsers/                (file format parsers)
├── graph-tools/            (relationship graph utilities)
├── sync-tools/             (repo reconciliation)
└── crates/
    ├── cynthia-event-bus/       Event normalization and routing
    ├── cynthia-observer/        Observability API (SSE/WebSocket)
    ├── cynthia-router/          Task routing engine
    ├── cynthia-validator/       Doctrine + anti-pattern validator
    ├── cynthia-packager/        Artifact packaging and export
    ├── cynthia-heartbeat/       Agent heartbeat relay
    ├── cynthia-memory-compiler/ Memory compaction and indexing
    ├── cynthia-mobile-bridge/   Mobile-safe API layer
    ├── cynthia-payment-state/   Payment state normalization
    └── cynthia-design-indexer/  Studio knowledge graph compiler
```

## Crate Descriptions

### cynthia-event-bus
- Normalized event ingestion from all agents
- Append-only event log (file-backed or SQLite)
- Pub/sub for real-time consumers
- Event replay capability
- Schema validation on ingest

### cynthia-observer
- SSE endpoint for real-time dashboard updates
- WebSocket support for interactive views
- Per-job and per-agent event filtering
- Summary generation for mobile views
- Timeline reconstruction from events

### cynthia-router
- Task classification engine
- Agent assignment based on task-routing.yaml
- Skill/doctrine dependency resolution
- Load balancing across agent instances
- Escalation rule enforcement

### cynthia-validator
- Anti-pattern detection (regex-based from registry.yaml)
- Doctrine compliance checking
- HTML output validation (banned fonts, banned colors, etc.)
- Schema validation for job contracts, events, payments
- CI/CD integration for pre-commit checks

### cynthia-packager
- Artifact bundling for client delivery
- HTML/CSS/JS minification and optimization
- Asset collection and manifest generation
- ZIP/tar archive creation
- Deployment manifest generation

### cynthia-heartbeat
- Agent heartbeat collection and relay
- Health status aggregation
- Stale agent detection
- Alert generation for offline agents
- Heartbeat history for reliability metrics

### cynthia-memory-compiler
- Memory entry deduplication
- Pattern extraction from approved work
- Lesson consolidation
- Stale entry detection
- Knowledge graph update generation

### cynthia-mobile-bridge
- Lightweight REST API for mobile dashboard
- Job status queries
- Agent status queries
- Approval action endpoints
- Push notification triggers

### cynthia-payment-state
- Payment event normalization across providers (Stripe, Creem, Cash App)
- Invoice state machine
- Revenue ledger writer
- Webhook signature verification
- Fulfillment trigger logic

### cynthia-design-indexer
- Studio catalog generation from file system
- Component registry compilation
- Doctrine map generation
- Searchable full-text index
- Taxonomy classification

## CLI Commands

```
cynthia inventory          List all studio artifacts
cynthia plan <brief>       Generate design plan from brief
cynthia classify <file>    Classify an artifact
cynthia generate <type>    Generate artifact from template
cynthia review <file>      Run automated review checks
cynthia repair <file>      Apply automated fixes
cynthia package <job_id>   Package job for delivery
cynthia search <query>     Search studio knowledge
cynthia heartbeat          Show agent health status
cynthia audit <url>        Run site audit
cynthia index              Rebuild studio index
cynthia validate           Check doctrine compliance
```

## Build & Run

```bash
# Build all crates
cargo build --workspace

# Run CLI
cargo run -p cynthia-cli -- inventory

# Run event bus service
cargo run -p cynthia-event-bus -- serve --port 8080

# Run observer (SSE endpoint)
cargo run -p cynthia-observer -- serve --port 8081

# Run validator as CI check
cargo run -p cynthia-validator -- check ./studio/
```

## Dependencies (key crates)

```toml
[workspace.dependencies]
tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
serde_yaml = "0.9"
axum = "0.7"
sqlx = { version = "0.8", features = ["runtime-tokio", "sqlite"] }
uuid = { version = "1", features = ["v4", "serde"] }
chrono = { version = "0.4", features = ["serde"] }
regex = "1"
glob = "0.3"
clap = { version = "4", features = ["derive"] }
tracing = "0.1"
tracing-subscriber = "0.3"
```

## Implementation Priority

| Priority | Crate | Rationale |
|----------|-------|-----------|
| P0 | cynthia-validator | Immediate value: catch anti-patterns in CI |
| P0 | cynthia-design-indexer | Immediate value: searchable studio catalog |
| P1 | cynthia-event-bus | Foundation for observability |
| P1 | cynthia-router | Foundation for task automation |
| P1 | cynthia-cli | Developer experience |
| P2 | cynthia-observer | Dashboard backend |
| P2 | cynthia-heartbeat | Agent monitoring |
| P2 | cynthia-packager | Delivery automation |
| P3 | cynthia-memory-compiler | Long-term learning |
| P3 | cynthia-mobile-bridge | Mobile access |
| P3 | cynthia-payment-state | Revenue operations |
