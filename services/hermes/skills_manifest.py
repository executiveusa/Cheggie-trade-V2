from __future__ import annotations

from typing import Literal
from pydantic import BaseModel, Field


SkillStatus = Literal["implemented", "available_as_reference", "not_implemented"]
RiskLevel = Literal["low", "medium", "high"]
SkillSource = Literal["hermes", "tradingagents", "anthropic_financial_services", "api"]


class SkillManifestEntry(BaseModel):
    id: str
    name: str
    description: str
    input_schema: dict = Field(default_factory=dict)
    output_schema: dict = Field(default_factory=dict)
    source: SkillSource
    status: SkillStatus
    risk_level: RiskLevel
    requires_approval: bool = False
    locales: list[str] = Field(default_factory=lambda: ["sr-RS", "en-US", "es-ES"])
    used_by: list[str] = Field(default_factory=lambda: ["hermes_orchestrator"])


SKILLS_REGISTRY: list[SkillManifestEntry] = [
    SkillManifestEntry(
        id="analyze-asset",
        name="Analyze Asset",
        description="Runs TradingAgents market analysis and summarizes actionable setup.",
        input_schema={"ticker": "string", "date": "YYYY-MM-DD", "analysts": ["market", "news", "fundamentals"]},
        output_schema={"decision": "string", "risk_assessment": "string|null", "analyst_reports": "object"},
        source="tradingagents",
        status="implemented",
        risk_level="medium",
    ),
    SkillManifestEntry(id="comparable-company-analysis", name="Comparable Company Analysis", description="Relative valuation with peer multiples.", input_schema={"ticker": "string"}, output_schema={"summary": "string", "status": "string"}, source="anthropic_financial_services", status="available_as_reference", risk_level="medium"),
    SkillManifestEntry(id="discounted-cash-flow", name="Discounted Cash Flow", description="Intrinsic valuation using projected cash flows.", input_schema={"ticker": "string"}, output_schema={"summary": "string", "status": "string"}, source="anthropic_financial_services", status="available_as_reference", risk_level="high", requires_approval=True),
    SkillManifestEntry(id="earnings-analysis", name="Earnings Analysis", description="Post-earnings read-through and estimate delta view.", input_schema={"ticker": "string"}, output_schema={"summary": "string", "status": "string"}, source="anthropic_financial_services", status="available_as_reference", risk_level="medium"),
    SkillManifestEntry(id="earnings-preview", name="Earnings Preview", description="Pre-earnings setup, expectations and scenarios.", input_schema={"ticker": "string"}, output_schema={"summary": "string", "status": "string"}, source="anthropic_financial_services", status="available_as_reference", risk_level="medium"),
    SkillManifestEntry(id="sector-overview", name="Sector Overview", description="Sector rotation and relative strength framing.", input_schema={"sector": "string"}, output_schema={"summary": "string", "status": "string"}, source="anthropic_financial_services", status="available_as_reference", risk_level="low"),
    SkillManifestEntry(id="thesis-tracking", name="Thesis Tracking", description="Track thesis assumptions and invalidation points.", input_schema={"thesis": "string"}, output_schema={"summary": "string", "status": "string"}, source="anthropic_financial_services", status="not_implemented", risk_level="low"),
    SkillManifestEntry(id="catalyst-tracking", name="Catalyst Tracking", description="Monitor catalysts and date-driven triggers.", input_schema={"ticker": "string"}, output_schema={"summary": "string", "status": "string"}, source="anthropic_financial_services", status="not_implemented", risk_level="low"),
    SkillManifestEntry(id="idea-generation", name="Idea Generation", description="Screen and rank candidate trade ideas.", input_schema={"criteria": "object"}, output_schema={"results": "array", "status": "string"}, source="anthropic_financial_services", status="available_as_reference", risk_level="medium"),
    SkillManifestEntry(id="portfolio-rebalance", name="Portfolio Rebalance", description="Suggest rebalance deltas against target constraints.", input_schema={"holdings": "array"}, output_schema={"summary": "string", "status": "string"}, source="anthropic_financial_services", status="not_implemented", risk_level="high", requires_approval=True),
    SkillManifestEntry(id="tax-loss-harvesting", name="Tax-loss Harvesting", description="Identify potential TLH candidates and wash-sale risk flags.", input_schema={"positions": "array"}, output_schema={"summary": "string", "status": "string"}, source="anthropic_financial_services", status="not_implemented", risk_level="high", requires_approval=True),
]


def get_skill_registry() -> list[dict]:
    return [entry.model_dump() for entry in SKILLS_REGISTRY]


def get_skill(skill_id: str) -> SkillManifestEntry | None:
    for skill in SKILLS_REGISTRY:
        if skill.id == skill_id:
            return skill
    return None
