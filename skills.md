# CheggieTrade Skills

## Philosophy

Skills are **internal capabilities** used by Hermes. The consumer UI sees clear outcomes — not skill IDs, tool names, model names, or system architecture. Nothing internal is ever surfaced to users.

---

## Architecture

```
User input (sr/en/es)
       │
       ▼
  Hermes intent classifier
       │  classify → analyze_asset / generate_report / explain_risk / …
       ▼
  Hermes skill planner  (select_tools + run_skill_plan)
       │  maps intent → [SkillDef, …]
       ├─▶  TradingAgents   (market analysis engine)
       ├─▶  financial-skills adapter (earnings, comps, DCF, sector …)
       └─▶  browser-agent   (web research)
       │
       ▼
  Structured output + disclaimer
       │
       ▼
  API service  (/api/analyze, /api/assistant, /api/skills/run)
       │
       ▼
  Web UI  (signal, not tool names)
```

---

## Skill Registry

| ID | Name | Command | Source | Status | Risk | Approval |
|----|------|---------|--------|--------|------|----------|
| `analyze-asset` | Asset Analysis | — | trading-agents | ✅ implemented | low | no |
| `earnings-analysis` | Earnings Analysis | `/earnings` | financial-skills | ✅ implemented | low | no |
| `earnings-preview` | Earnings Preview | `/earnings-preview` | financial-skills | 🔶 reference | low | no |
| `sector-overview` | Sector Overview | `/sector` | financial-skills | ✅ implemented | low | no |
| `comparable-company-analysis` | Comps | `/comps` | financial-skills | 🔶 reference | low | no |
| `discounted-cash-flow` | DCF Model | `/dcf` | financial-skills | 🔶 reference | medium | no |
| `thesis-tracking` | Thesis Tracking | `/thesis` | financial-skills | 🔶 reference | low | no |
| `catalyst-tracking` | Catalyst Tracking | `/catalysts` | financial-skills | 🔶 reference | low | no |
| `idea-generation` | Idea Generation | `/screen` | financial-skills | ✅ implemented | low | no |
| `portfolio-rebalance` | Portfolio Rebalance | `/rebalance` | financial-skills | ❌ not impl. | high | **YES** |
| `tax-loss-harvesting` | Tax-Loss Harvesting | `/tlh` | financial-skills | ❌ not impl. | high | **YES** |
| `explain-risk` | Risk Explanation | — | hermes | ✅ implemented | low | no |
| `generate-report` | Report Generation | — | hermes | ✅ implemented | low | no |
| `update-watchlist` | Watchlist Update | — | hermes | ✅ implemented | low | no |
| `browser-research` | Browser Research | — | hermes | ✅ implemented | medium | no |
| `summarize-news` | News Summary | — | hermes | ✅ implemented | low | no |

### Status legend

| Status | Meaning |
|--------|---------|
| `implemented` | Fully wired and running |
| `available_as_reference` | Cookbook loaded from `core/financial-skills`; uses LLM best-effort response |
| `not_implemented` | Planned but not yet active |
| `requires_approval` | Must receive explicit user approval before execution |

---

## Financial-Services Mapping

The `core/financial-skills` repository contains managed-agent cookbooks from Anthropic's financial-services library. CheggieTrade maps these **by reference** through its own skill registry — the cookbook definitions are not executed directly.

| Slash command | Skill ID | financial-skills cookbook |
|--------------|----------|--------------------------|
| `/comps` | `comparable-company-analysis` | `market-researcher` |
| `/dcf` | `discounted-cash-flow` | `model-builder` |
| `/earnings` | `earnings-analysis` | `earnings-reviewer` |
| `/earnings-preview` | `earnings-preview` | `earnings-reviewer` |
| `/sector` | `sector-overview` | `market-researcher` |
| `/thesis` | `thesis-tracking` | `pitch-agent` |
| `/catalysts` | `catalyst-tracking` | `market-researcher` |
| `/screen` | `idea-generation` | `market-researcher` |
| `/rebalance` | `portfolio-rebalance` | *(not mapped — approval required)* |
| `/tlh` | `tax-loss-harvesting` | *(not mapped — approval required)* |

Cookbook paths: `core/financial-skills/managed-agent-cookbooks/<cookbook-name>/`

---

## Intent Classification

Hermes classifies user input (in any supported language) into one of these intents:

| Intent | Description | Example (Serbian) | Example (English) |
|--------|-------------|------------------|-------------------|
| `analyze_asset` | Full trading analysis for ticker | "Analiziraj NVDA za swing trade" | "Analyse Apple for a swing trade" |
| `explain_risk` | Risk explanation | "Objasni rizik kratke pozicije" | "What is the risk on my short?" |
| `generate_report` | Research report | "Napravi izveštaj za Telegram" | "Generate a weekly report for TLGN" |
| `update_watchlist` | Watchlist add/remove | "Dodaj NVDA na watchlist" | "Add NVDA to my watchlist" |
| `browser_research` | Web research | "Istraži vesti o TSLA" | "Research recent TSLA news" |
| `summarize_news` | News summary | "Rezimiraj vesti za sektor energije" | "Summarise energy sector news" |
| `earnings_review` | Earnings analysis | "Pregled rezultata AAPL za Q2" | "Review AAPL Q2 earnings" |
| `sector_review` | Sector overview | "Pregledaj tehnološki sektor" | "Overview of the tech sector" |
| `status` | Health check | "Status sistema" | "System status" |

Legacy intent names (`analyze`, `research`, `screen`, `report`) are accepted and silently mapped to canonical names.

---

## Approval Policy

Skills with `risk_level = high` or `requires_approval = true` **must** receive explicit user confirmation before execution.

The orchestrator returns `status = "requires_approval"` and halts the skill plan. The API surfaces this to the frontend without exposing the skill ID. Execution resumes only after the approval token is recorded.

Currently requiring approval:
- `portfolio-rebalance` — modifies portfolio positions
- `tax-loss-harvesting` — has tax implications

---

## Forbidden Actions

These actions are always blocked. They are never returned to users and never appear in API responses.

| Action | Reason |
|--------|--------|
| `trade_execution` | CheggieTrade does not execute trades |
| `money_transfer` | Regulatory boundary |
| `broker_login` | Never authenticate on user's behalf without explicit approval |
| `profit_guarantee` | Prohibited financial claim |
| `regulated_advice` | Regulated financial advice boundary |
| `lbo_model` | Not a retail tool |
| `expose_model_name` | Never leak "Claude", "Anthropic", "GPT", or model IDs to the UI |
| `expose_agent_name` | Never leak skill IDs, agent names, or tool names to the UI |
| `expose_internal_tools` | Never surface system architecture to users |

---

## Output Rules

1. **Every response carries a disclaimer** in the user's locale:
   - `sr-RS`: "Ovo je isključivo za istraživanje. Nije finansijski savet."
   - `en-US`: "For research purposes only. Not financial advice."
   - `es-ES`: "Solo con fines de investigación. No es asesoramiento financiero."

2. **Default locale**: `sr-RS`

3. **Supported locales**: `sr-RS`, `en-US`, `es-ES`

4. Every response includes an **audit block** with:
   - `run_id` — unique UUID per execution
   - `tenant_id` — reserved for multi-tenant use
   - `user_id` — reserved
   - `skill_ids` — planned skill IDs
   - `tools_used` — executed skill IDs
   - `approval_required` — boolean
   - `mode` — `demo` or `live`
   - `errors` — list of error strings
   - `created_at` — ISO 8601 timestamp

---

## Demo Mode

When `ANTHROPIC_API_KEY` is not set, all services start in **demo mode**:
- `/api/status` returns `"mode": "demo"`
- `/api/analyze` returns market snapshot + `"[Demo]"` placeholder decision
- `/api/assistant` returns a friendly demo message — no crash
- `/api/skills` returns the full static registry
- `/api/skills/run` returns `"status": "demo"` for implemented skills

Demo mode is safe for local development and CI environments.
