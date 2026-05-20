"""
CheggieTrade Financial Skills Adapter.

Maps slash-commands and skill IDs to definitions in core/financial-skills.
Returns structured status — never crashes if a skill is unavailable.
Does NOT expose internal tool names, cookbook paths, or model details to callers.
"""

from __future__ import annotations

import logging
import os
from typing import Any

logger = logging.getLogger(__name__)

# Root of core/financial-skills relative to this file
_FS_ROOT = os.path.normpath(
    os.path.join(os.path.dirname(__file__), "../../core/financial-skills")
)

# Slash-command → skill-id
COMMAND_MAP: dict[str, str] = {
    "/comps":            "comparable-company-analysis",
    "/dcf":              "discounted-cash-flow",
    "/earnings":         "earnings-analysis",
    "/earnings-preview": "earnings-preview",
    "/sector":           "sector-overview",
    "/thesis":           "thesis-tracking",
    "/catalysts":        "catalyst-tracking",
    "/screen":           "idea-generation",
    "/rebalance":        "portfolio-rebalance",
    "/tlh":              "tax-loss-harvesting",
}

# skill-id → cookbook name in managed-agent-cookbooks (None = not mapped)
_COOKBOOK_MAP: dict[str, str | None] = {
    "earnings-analysis":           "earnings-reviewer",
    "earnings-preview":            "earnings-reviewer",
    "comparable-company-analysis": "market-researcher",
    "discounted-cash-flow":        "model-builder",
    "sector-overview":             "market-researcher",
    "thesis-tracking":             "pitch-agent",
    "catalyst-tracking":           "market-researcher",
    "idea-generation":             "market-researcher",
    "portfolio-rebalance":         None,
    "tax-loss-harvesting":         None,
}


def resolve_command(command: str) -> str | None:
    """Resolve a slash-command string to a skill ID. Returns None if unknown."""
    return COMMAND_MAP.get(command.lower().strip())


def get_skill_reference(skill_id: str) -> dict:
    """
    Return availability metadata for a financial-skills skill.
    Never raises — always returns a structured dict.
    """
    cookbook_name = _COOKBOOK_MAP.get(skill_id)

    if cookbook_name is None:
        return {
            "skill_id": skill_id,
            "status": "not_implemented",
            "note": "Skill planned but not yet wired.",
        }

    cookbook_path = os.path.join(_FS_ROOT, "managed-agent-cookbooks", cookbook_name)
    if not os.path.isdir(cookbook_path):
        return {
            "skill_id": skill_id,
            "status": "not_implemented",
            "note": "Cookbook directory not found.",
        }

    return {
        "skill_id": skill_id,
        "status": "available_as_reference",
        "note": "Skill definition loaded from financial-services cookbook.",
    }


def run_skill(skill_id: str, params: dict, anthropic_client: Any) -> dict:
    """
    Execute a financial skill by ID.

    Behaviour:
      implemented          → delegates to _reference_response (LLM-backed)
      available_as_reference → _reference_response with LLM best-effort
      not_implemented      → returns structured error, no crash
      requires_approval    → returns structured error, no crash
      unknown              → returns not_found, no crash
    """
    from skills_manifest import get_skill  # avoid module-level circular import

    skill_def = get_skill(skill_id)
    if skill_def is None:
        return _not_found(skill_id)

    if skill_def.requires_approval:
        return _requires_approval(skill_id, skill_def)

    if skill_def.status == "not_implemented":
        return _not_implemented(skill_id, skill_def)

    if skill_def.status in ("available_as_reference", "implemented"):
        return _reference_response(skill_id, skill_def, params, anthropic_client)

    return _not_implemented(skill_id, skill_def)


# ── Private response builders ──────────────────────────────────────── #

def _not_found(skill_id: str) -> dict:
    return {
        "ok": False,
        "skill_id": skill_id,
        "status": "not_found",
        "result": None,
        "note": "Unknown skill ID.",
    }


def _not_implemented(skill_id: str, skill_def) -> dict:
    return {
        "ok": False,
        "skill_id": skill_id,
        "status": "not_implemented",
        "name": skill_def.name,
        "result": None,
        "note": "This capability is planned but not yet active.",
    }


def _requires_approval(skill_id: str, skill_def) -> dict:
    return {
        "ok": False,
        "skill_id": skill_id,
        "status": "requires_approval",
        "name": skill_def.name,
        "result": None,
        "note": "This action requires explicit user approval before execution.",
    }


def _reference_response(skill_id: str, skill_def, params: dict, anthropic_client: Any) -> dict:
    """
    Best-effort LLM response guided by the skill definition.
    Falls back gracefully if the client is unavailable.
    """
    from skills_manifest import DISCLAIMER, DEFAULT_LOCALE

    ref = get_skill_reference(skill_id)
    locale = params.get("locale", DEFAULT_LOCALE)
    disclaimer = DISCLAIMER.get(locale, DISCLAIMER[DEFAULT_LOCALE])

    prompt = (
        f"You are running the '{skill_def.name}' analysis for CheggieTrade. "
        f"Task: {skill_def.description}. "
        f"Parameters: {params}. "
        "Provide a concise, professional financial analysis. "
        "Do not mention AI, models, agents, or internal systems. "
        f"\n\n{disclaimer}"
    )

    if anthropic_client is None:
        return {
            "ok": True,
            "skill_id": skill_id,
            "status": "demo",
            "name": skill_def.name,
            "result": f"[Demo mode] {skill_def.name} — connect an API key for live analysis.",
            "disclaimer": disclaimer,
        }

    try:
        resp = anthropic_client.messages.create(
            model=os.getenv("QUICK_THINK_MODEL", "claude-haiku-4-5-20251001"),
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}],
        )
        return {
            "ok": True,
            "skill_id": skill_id,
            "status": ref.get("status", "available_as_reference"),
            "name": skill_def.name,
            "result": resp.content[0].text,
            "disclaimer": disclaimer,
        }
    except Exception as exc:
        logger.warning("Skill LLM call failed for %s: %s", skill_id, exc)
        return {
            "ok": False,
            "skill_id": skill_id,
            "status": "error",
            "result": None,
            "note": "Analysis temporarily unavailable.",
        }
