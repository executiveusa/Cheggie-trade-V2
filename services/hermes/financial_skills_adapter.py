from __future__ import annotations

from pathlib import Path
from typing import Any

from services.hermes.skills_manifest import get_skill

COMMAND_MAP = {
    "/comps": "comparable-company-analysis",
    "/dcf": "discounted-cash-flow",
    "/earnings": "earnings-analysis",
    "/earnings-preview": "earnings-preview",
    "/sector": "sector-overview",
    "/thesis": "thesis-tracking",
    "/catalysts": "catalyst-tracking",
    "/screen": "idea-generation",
    "/rebalance": "portfolio-rebalance",
    "/tlh": "tax-loss-harvesting",
}


class FinancialSkillsAdapter:
    def __init__(self, root_dir: str | None = None):
        base = Path(__file__).resolve().parents[2]
        self.skills_root = Path(root_dir) if root_dir else (base / "core" / "financial-skills")

    def run_command(self, command: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
        payload = payload or {}
        skill_id = COMMAND_MAP.get(command)
        if not skill_id:
            return {"ok": False, "status": "not_implemented", "error": "unknown_command", "command": command}

        skill = get_skill(skill_id)
        if not skill:
            return {"ok": False, "status": "not_implemented", "error": "missing_skill_registry", "command": command}

        if skill.status != "implemented":
            return {
                "ok": True,
                "status": skill.status,
                "skill_id": skill.id,
                "source": skill.source,
                "result": None,
                "message": "Skill mapped in Hermes registry; runtime is intentionally not directly exposed.",
            }

        return {"ok": True, "status": "implemented", "skill_id": skill.id, "source": skill.source, "result": payload}
