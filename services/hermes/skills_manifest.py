"""
CheggieTrade Skills Manifest — single source of truth for Hermes skill registry.

Skills are internal. The consumer UI sees outcomes, not skill IDs or tool names.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from typing import Literal

RiskLevel = Literal["low", "medium", "high", "critical"]
SkillStatus = Literal["implemented", "available_as_reference", "not_implemented", "requires_approval"]


@dataclass(frozen=True)
class SkillDef:
    id: str
    name: str
    description: str
    command: str | None          # slash-command alias, None if skill has no command
    input_schema: dict
    output_schema: dict
    source: str                  # "hermes" | "financial-skills" | "trading-agents"
    status: SkillStatus
    risk_level: RiskLevel
    requires_approval: bool
    locales: tuple[str, ...]
    used_by: tuple[str, ...]     # intent types that invoke this skill


SKILLS: list[SkillDef] = [
    # ── Core analysis ──────────────────────────────────────────────── #
    SkillDef(
        id="analyze-asset",
        name="Asset Analysis",
        description="Full multi-analyst trading analysis for a stock, ETF, or crypto.",
        command=None,
        input_schema={"ticker": "str", "date": "str", "analysts": "list[str]"},
        output_schema={"decision": "str", "analyst_reports": "dict", "risk_assessment": "str"},
        source="trading-agents",
        status="implemented",
        risk_level="low",
        requires_approval=False,
        locales=("sr-RS", "en-US", "es-ES"),
        used_by=("analyze_asset",),
    ),
    SkillDef(
        id="earnings-analysis",
        name="Earnings Analysis",
        description="Earnings report interpretation and guidance analysis.",
        command="/earnings",
        input_schema={"ticker": "str", "period": "str"},
        output_schema={"summary": "str", "beat_miss": "str", "guidance": "str"},
        source="financial-skills",
        status="implemented",
        risk_level="low",
        requires_approval=False,
        locales=("sr-RS", "en-US", "es-ES"),
        used_by=("earnings_review",),
    ),
    SkillDef(
        id="earnings-preview",
        name="Earnings Preview",
        description="Pre-earnings expectations and risk/reward setup.",
        command="/earnings-preview",
        input_schema={"ticker": "str"},
        output_schema={"preview": "str", "consensus": "dict"},
        source="financial-skills",
        status="available_as_reference",
        risk_level="low",
        requires_approval=False,
        locales=("sr-RS", "en-US", "es-ES"),
        used_by=("earnings_review",),
    ),
    SkillDef(
        id="sector-overview",
        name="Sector Overview",
        description="Sector rotation, relative strength, and macro backdrop.",
        command="/sector",
        input_schema={"sector": "str", "period": "str"},
        output_schema={"summary": "str", "top_movers": "list", "rotation_signal": "str"},
        source="financial-skills",
        status="implemented",
        risk_level="low",
        requires_approval=False,
        locales=("sr-RS", "en-US", "es-ES"),
        used_by=("sector_review",),
    ),
    SkillDef(
        id="comparable-company-analysis",
        name="Comparable Company Analysis",
        description="Peer comparison using EV/EBITDA, P/E, and EV/Revenue multiples.",
        command="/comps",
        input_schema={"ticker": "str", "peers": "list[str] | None"},
        output_schema={"comps_table": "dict", "valuation_summary": "str"},
        source="financial-skills",
        status="available_as_reference",
        risk_level="low",
        requires_approval=False,
        locales=("sr-RS", "en-US", "es-ES"),
        used_by=("analyze_asset",),
    ),
    SkillDef(
        id="discounted-cash-flow",
        name="Discounted Cash Flow",
        description="DCF intrinsic value model with bear/base/bull scenario analysis.",
        command="/dcf",
        input_schema={"ticker": "str", "growth_rate": "float | None", "discount_rate": "float | None"},
        output_schema={"intrinsic_value": "float", "upside_pct": "float", "scenario_table": "dict"},
        source="financial-skills",
        status="available_as_reference",
        risk_level="medium",
        requires_approval=False,
        locales=("sr-RS", "en-US", "es-ES"),
        used_by=("analyze_asset", "generate_report"),
    ),
    SkillDef(
        id="thesis-tracking",
        name="Thesis Tracking",
        description="Track investment thesis milestones and invalidation criteria.",
        command="/thesis",
        input_schema={"ticker": "str", "thesis": "str"},
        output_schema={"status": "str", "milestones": "list", "risk_factors": "list"},
        source="financial-skills",
        status="available_as_reference",
        risk_level="low",
        requires_approval=False,
        locales=("sr-RS", "en-US", "es-ES"),
        used_by=("generate_report",),
    ),
    SkillDef(
        id="catalyst-tracking",
        name="Catalyst Tracking",
        description="Near-term event catalysts: earnings, macro, insider activity.",
        command="/catalysts",
        input_schema={"ticker": "str", "horizon_days": "int"},
        output_schema={"catalysts": "list", "risk_rating": "str"},
        source="financial-skills",
        status="available_as_reference",
        risk_level="low",
        requires_approval=False,
        locales=("sr-RS", "en-US", "es-ES"),
        used_by=("analyze_asset", "generate_report"),
    ),
    SkillDef(
        id="idea-generation",
        name="Idea Generation",
        description="Screener-based trade setup detection and opportunity ranking.",
        command="/screen",
        input_schema={"criteria": "dict", "limit": "int"},
        output_schema={"ideas": "list", "rationale": "str"},
        source="financial-skills",
        status="implemented",
        risk_level="low",
        requires_approval=False,
        locales=("sr-RS", "en-US", "es-ES"),
        used_by=("analyze_asset",),
    ),
    SkillDef(
        id="portfolio-rebalance",
        name="Portfolio Rebalance",
        description="Target-weight rebalancing with tax and cost minimisation.",
        command="/rebalance",
        input_schema={"holdings": "dict", "target_weights": "dict"},
        output_schema={"trades": "list", "cost_estimate": "float"},
        source="financial-skills",
        status="not_implemented",
        risk_level="high",
        requires_approval=True,
        locales=("sr-RS", "en-US", "es-ES"),
        used_by=(),
    ),
    SkillDef(
        id="tax-loss-harvesting",
        name="Tax-Loss Harvesting",
        description="Identify positions eligible for TLH to offset capital gains.",
        command="/tlh",
        input_schema={"holdings": "dict", "cost_basis": "dict"},
        output_schema={"candidates": "list", "estimated_benefit": "float"},
        source="financial-skills",
        status="not_implemented",
        risk_level="high",
        requires_approval=True,
        locales=("sr-RS", "en-US", "es-ES"),
        used_by=(),
    ),
    # ── Support skills ─────────────────────────────────────────────── #
    SkillDef(
        id="explain-risk",
        name="Risk Explanation",
        description="Plain-language explanation of position or portfolio risk.",
        command=None,
        input_schema={"topic": "str", "context": "str | None"},
        output_schema={"explanation": "str", "risk_factors": "list"},
        source="hermes",
        status="implemented",
        risk_level="low",
        requires_approval=False,
        locales=("sr-RS", "en-US", "es-ES"),
        used_by=("explain_risk",),
    ),
    SkillDef(
        id="generate-report",
        name="Report Generation",
        description="Structured research report for a ticker, sector, or watchlist.",
        command=None,
        input_schema={"subject": "str", "period": "str", "sections": "list[str] | None"},
        output_schema={"report": "str", "sections": "list"},
        source="hermes",
        status="implemented",
        risk_level="low",
        requires_approval=False,
        locales=("sr-RS", "en-US", "es-ES"),
        used_by=("generate_report",),
    ),
    SkillDef(
        id="update-watchlist",
        name="Watchlist Update",
        description="Add, remove, or query items on the user's watchlist.",
        command=None,
        input_schema={"action": "str", "tickers": "list[str]"},
        output_schema={"watchlist": "list", "changed": "list"},
        source="hermes",
        status="implemented",
        risk_level="low",
        requires_approval=False,
        locales=("sr-RS", "en-US", "es-ES"),
        used_by=("update_watchlist",),
    ),
    SkillDef(
        id="browser-research",
        name="Browser Research",
        description="Automated research for financial data not available via API.",
        command=None,
        input_schema={"query": "str", "url": "str | None"},
        output_schema={"findings": "str", "sources": "list"},
        source="hermes",
        status="implemented",
        risk_level="medium",
        requires_approval=False,
        locales=("sr-RS", "en-US", "es-ES"),
        used_by=("browser_research",),
    ),
    SkillDef(
        id="summarize-news",
        name="News Summary",
        description="Fetch and summarise recent news for a ticker or topic.",
        command=None,
        input_schema={"ticker": "str | None", "topic": "str | None", "days": "int"},
        output_schema={"summary": "str", "articles": "list"},
        source="hermes",
        status="implemented",
        risk_level="low",
        requires_approval=False,
        locales=("sr-RS", "en-US", "es-ES"),
        used_by=("summarize_news",),
    ),
]

# ── Forbidden actions (always blocked) ────────────────────────────── #
FORBIDDEN_ACTIONS: list[str] = [
    "trade_execution",
    "money_transfer",
    "broker_login",
    "profit_guarantee",
    "regulated_advice",
    "lbo_model",
    "expose_model_name",
    "expose_agent_name",
    "expose_internal_tools",
]

# ── Skills that need explicit user approval ────────────────────────── #
APPROVAL_REQUIRED: list[str] = [s.id for s in SKILLS if s.requires_approval]

# ── Approval policy description ────────────────────────────────────── #
APPROVAL_POLICY = (
    "Skills with risk_level='high' or requires_approval=True must receive "
    "explicit user confirmation before execution. The orchestrator must return "
    "status='requires_approval' and halt the skill plan until approval is recorded."
)

# ── Financial-research disclaimer (per locale) ─────────────────────── #
DISCLAIMER: dict[str, str] = {
    "sr-RS": "Ovo je isključivo za istraživanje. Nije finansijski savet.",
    "en-US": "For research purposes only. Not financial advice.",
    "es-ES": "Solo con fines de investigación. No es asesoramiento financiero.",
}

DEFAULT_LOCALE = "sr-RS"


# ── Lookup helpers ─────────────────────────────────────────────────── #

def get_skill(skill_id: str) -> SkillDef | None:
    return next((s for s in SKILLS if s.id == skill_id), None)


def get_skills_for_intent(intent: str) -> list[SkillDef]:
    return [s for s in SKILLS if intent in s.used_by]


def registry_as_dict(include_internals: bool = False) -> list[dict]:
    """Serialise registry. Public API responses must use include_internals=False."""
    result = []
    for s in SKILLS:
        item: dict = {
            "id": s.id,
            "name": s.name,
            "description": s.description,
            "status": s.status,
            "risk_level": s.risk_level,
            "requires_approval": s.requires_approval,
            "locales": list(s.locales),
        }
        if include_internals:
            item["source"] = s.source
            item["command"] = s.command
            item["used_by"] = list(s.used_by)
        result.append(item)
    return result
