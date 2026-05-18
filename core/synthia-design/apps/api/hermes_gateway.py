"""
HERMES™ Gateway - Business-aware routing layer for Synthia Studio.
"""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Literal
from uuid import uuid4

from pydantic import BaseModel, Field


class CustomerType(str, Enum):
    IVETTE = "ivette"
    SAAS = "saas"
    OPERATOR = "operator"
    MARKETPLACE = "marketplace"


class ProjectType(str, Enum):
    FRONTEND = "frontend_design"
    VIDEO = "video_production"
    THREE_D = "3d_environment"
    RESEARCH = "research_only"
    FULL_CAMPAIGN = "full_campaign"
    AUDIT = "audit_only"


class BriefRequest(BaseModel):
    title: str
    description: str
    reference_url: str | None = None
    customer_type: CustomerType
    customer_id: str
    budget_max_usd: float | None = None
    timeline_hours: int | None = None
    quality_requirements: dict = Field(default_factory=dict)


class HermesDecision(BaseModel):
    project_id: str
    project_type: ProjectType
    complexity: Literal["low", "medium", "high"]
    agent_workflow: list[dict]
    cost_projection: float
    revenue_projection: float
    margin_percent: float
    timeline_minutes: int
    approval: bool
    reason: str
    created_at: str


class HermesOrchestrator:
    DAILY_BUDGET_USD = 25.0
    MARGIN_THRESHOLD = 0.30
    UDEC_FLOOR = 8.5

    AGENT_COSTS = {
        "concierge": 0.00,
        "librarian": 0.00,
        "architect": 0.08,
        "ralphy": 0.16,
        "bass": 0.12,
        "aurora": 0.55,
        "blender": 0.50,
        "lena": 0.09,
        "scout": 0.12,
        "marco": 0.10,
        "dispatch": 0.02,
    }

    def __init__(self) -> None:
        self.daily_spent = 0.0

    async def route_brief(self, brief: BriefRequest) -> HermesDecision:
        project_type = self._classify_project(brief)
        complexity = self._assess_complexity(brief, project_type)
        workflow = self._build_workflow(project_type, complexity)
        cost_projection = sum(self.AGENT_COSTS.get(step["agent"], 0.0) for step in workflow)
        revenue_projection = self._project_revenue(brief.customer_type)
        margin_percent = ((revenue_projection - cost_projection) / revenue_projection) if revenue_projection else 0.0
        timeline_minutes = self._estimate_timeline(complexity, len(workflow))

        remaining = self.DAILY_BUDGET_USD - self.daily_spent
        if cost_projection > remaining:
            return self._decision(
                project_type,
                complexity,
                [],
                cost_projection,
                revenue_projection,
                margin_percent,
                timeline_minutes,
                False,
                f"Cost ${cost_projection:.2f} exceeds daily budget remaining ${remaining:.2f}",
            )

        if margin_percent < self.MARGIN_THRESHOLD and revenue_projection > 0:
            return self._decision(
                project_type,
                complexity,
                [],
                cost_projection,
                revenue_projection,
                margin_percent,
                timeline_minutes,
                False,
                f"Margin {margin_percent:.1%} below threshold {self.MARGIN_THRESHOLD:.1%}",
            )

        self.daily_spent += cost_projection
        return self._decision(
            project_type,
            complexity,
            workflow,
            cost_projection,
            revenue_projection,
            margin_percent,
            timeline_minutes,
            True,
            "All checks passed. Routing to agents.",
        )

    def _decision(
        self,
        project_type: ProjectType,
        complexity: Literal["low", "medium", "high"],
        workflow: list[dict],
        cost: float,
        revenue: float,
        margin: float,
        timeline: int,
        approval: bool,
        reason: str,
    ) -> HermesDecision:
        return HermesDecision(
            project_id=f"proj_{uuid4().hex[:12]}",
            project_type=project_type,
            complexity=complexity,
            agent_workflow=workflow,
            cost_projection=cost,
            revenue_projection=revenue,
            margin_percent=margin,
            timeline_minutes=timeline,
            approval=approval,
            reason=reason,
            created_at=datetime.now(timezone.utc).isoformat(),
        )

    def _classify_project(self, brief: BriefRequest) -> ProjectType:
        combined = f"{brief.title} {brief.description}".lower()
        if any(token in combined for token in ("video", "reel", "short", "render")):
            return ProjectType.VIDEO
        if any(token in combined for token in ("3d", "glb", "blender")):
            return ProjectType.THREE_D
        if "campaign" in combined:
            return ProjectType.FULL_CAMPAIGN
        if "audit" in combined:
            return ProjectType.AUDIT
        return ProjectType.FRONTEND

    def _assess_complexity(self, brief: BriefRequest, project_type: ProjectType) -> Literal["low", "medium", "high"]:
        desc_length = len(brief.description)
        if desc_length < 100 and project_type != ProjectType.FULL_CAMPAIGN:
            return "low"
        if desc_length > 500 or project_type == ProjectType.FULL_CAMPAIGN:
            return "high"
        return "medium"

    def _build_workflow(self, project_type: ProjectType, complexity: Literal["low", "medium", "high"]) -> list[dict]:
        if project_type == ProjectType.FRONTEND:
            ralphy_count = 2 if complexity == "low" else 3
            steps = [
                {"agent": "concierge"},
                {"agent": "architect"},
                {"agent": "dispatch"},
                {"agent": "ralphy", "count": ralphy_count},
                {"agent": "bass", "count": 1},
                {"agent": "lena"},
            ]
            if complexity != "low":
                steps.append({"agent": "marco"})
            return steps
        if project_type == ProjectType.VIDEO:
            return [{"agent": "architect"}, {"agent": "aurora", "count": 2 if complexity != "low" else 1}, {"agent": "lena"}]
        if project_type == ProjectType.THREE_D:
            return [{"agent": "architect"}, {"agent": "blender"}, {"agent": "lena"}]
        return [{"agent": "concierge"}, {"agent": "architect"}, {"agent": "lena"}]

    def _estimate_timeline(self, complexity: Literal["low", "medium", "high"], step_count: int) -> int:
        base = {"low": 45, "medium": 120, "high": 180}[complexity]
        return base + (step_count * 15)

    def _project_revenue(self, customer_type: CustomerType) -> float:
        if customer_type == CustomerType.IVETTE:
            return 2397.0
        if customer_type == CustomerType.SAAS:
            return 497.0 / 30.0
        if customer_type == CustomerType.OPERATOR:
            return 2397.0 * 0.075
        return 0.25
