from __future__ import annotations

import os
from datetime import date, datetime
from typing import Any
from uuid import uuid4

from tradingagents.default_config import DEFAULT_CONFIG
from tradingagents.graph.trading_graph import TradingAgentsGraph

from services.hermes.financial_skills_adapter import FinancialSkillsAdapter
from services.hermes.skills_manifest import get_skill_registry

DISCLAIMER = "Ovo je finansijsko-istraživački izlaz, ne predstavlja investicioni savet." \
             " This is financial research, not investment advice."


class HermesOrchestrator:
    def __init__(self, config: dict | None = None):
        self.config = {**DEFAULT_CONFIG, **(config or {})}
        self.config["output_language"] = "Serbian"
        self.locale_default = os.getenv("HERMES_DEFAULT_LOCALE", "sr-RS")
        self._graph_cache: dict[str, TradingAgentsGraph] = {}
        self.financial_adapter = FinancialSkillsAdapter()

    def classify_intent(self, raw_input: str) -> dict[str, Any]:
        text = raw_input.lower()
        if "izve" in text or "report" in text or "telegram" in text:
            intent = "generate_report"
        elif "earnings" in text or "zarad" in text:
            intent = "earnings_review"
        elif "sektor" in text or "sector" in text:
            intent = "sector_review"
        elif "rizik" in text or "risk" in text:
            intent = "explain_risk"
        elif "watchlist" in text:
            intent = "update_watchlist"
        elif "news" in text or "vest" in text:
            intent = "summarize_news"
        elif "browser" in text or "istra" in text:
            intent = "browser_research"
        else:
            intent = "analyze_asset"
        return {"intent": intent, "params": {"query": raw_input}, "confidence": 0.8}

    def select_tools(self, intent: str) -> list[str]:
        mapping = {
            "analyze_asset": ["tradingagents"],
            "explain_risk": ["tradingagents", "risk"],
            "generate_report": ["report_builder"],
            "update_watchlist": ["watchlist"],
            "browser_research": ["browser"],
            "summarize_news": ["news"],
            "earnings_review": ["/earnings"],
            "sector_review": ["/sector"],
        }
        return mapping.get(intent, ["tradingagents"])

    def run_skill_plan(self, intent: str, params: dict[str, Any]) -> dict[str, Any]:
        tools = self.select_tools(intent)
        result: dict[str, Any] = {"intent": intent, "tools": tools}
        if intent == "analyze_asset":
            ticker = self._extract_ticker(params.get("query", "SPY"))
            result["analysis"] = self._handle_analyze({"ticker": ticker, "date": str(date.today()), "analysts": ["market", "news", "fundamentals"]})
        elif intent == "earnings_review":
            result["skill"] = self.financial_adapter.run_command("/earnings", {"query": params.get("query", "")})
        elif intent == "sector_review":
            result["skill"] = self.financial_adapter.run_command("/sector", {"query": params.get("query", "")})
        else:
            result["summary"] = f"Intent {intent} processed via Hermes orchestration layer."
        return result

    def execute(self, intent_payload: dict[str, Any], locale: str | None = None) -> dict[str, Any]:
        intent = intent_payload.get("intent") or "analyze_asset"
        params = intent_payload.get("params", {})
        locale = locale or self.locale_default
        output = self.run_skill_plan(intent, params)
        audit = self._audit_event(tools_used=output.get("tools", []), skill_ids=self._extract_skill_ids(output))
        return {"ok": True, "locale": locale if locale in ["sr-RS", "en-US", "es-ES"] else "sr-RS", "result": output, "audit": audit, "disclaimer": DISCLAIMER}

    def run(self, raw_input: str, locale: str | None = None) -> dict[str, Any]:
        parsed = self.classify_intent(raw_input)
        out = self.execute(parsed, locale=locale)
        out["parsed_intent"] = parsed
        return out

    def _handle_analyze(self, params: dict[str, Any]) -> dict[str, Any]:
        ticker = params.get("ticker", "SPY").upper()
        try:
            graph = self._get_graph(params.get("analysts", ["market", "news", "fundamentals"]))
            state, decision = graph.propagate(ticker, params.get("date", str(date.today())), asset_type="stock")
            return {"ticker": ticker, "decision": decision, "analyst_reports": self._extract_reports(state), "risk_assessment": self._extract_risk(state)}
        except Exception:
            return {"ticker": ticker, "decision": "DEMO: Hold/Watch", "analyst_reports": {}, "risk_assessment": "Demo mode: API keys missing for deep runtime."}

    def _get_graph(self, analysts: list[str]) -> TradingAgentsGraph:
        key = ",".join(sorted(analysts))
        if key not in self._graph_cache:
            self._graph_cache[key] = TradingAgentsGraph(selected_analysts=analysts, config=self.config)
        return self._graph_cache[key]

    def _extract_reports(self, state: Any) -> dict[str, Any]:
        if not state:
            return {}
        return {k: (getattr(state, k, None) or (state.get(k) if isinstance(state, dict) else None)) for k in ["market_report", "news_report", "fundamentals_report", "social_media_report"] if (getattr(state, k, None) or (state.get(k) if isinstance(state, dict) else None))}

    def _extract_risk(self, state: Any) -> str | None:
        return getattr(state, "risk_debate_state", None) or (state.get("risk_debate_state") if isinstance(state, dict) else None)

    def _extract_ticker(self, raw: str) -> str:
        for token in raw.upper().split():
            if token.isalpha() and 1 < len(token) <= 5:
                return token
        return "SPY"

    def _extract_skill_ids(self, output: dict[str, Any]) -> list[str]:
        skill = output.get("skill")
        return [skill.get("skill_id")] if isinstance(skill, dict) and skill.get("skill_id") else []

    def _audit_event(self, tools_used: list[str], skill_ids: list[str]) -> dict[str, Any]:
        return {
            "run_id": str(uuid4()),
            "tenant_id": "default",
            "user_id": "anonymous",
            "skill_ids": skill_ids,
            "tools_used": tools_used,
            "approval_required": any((s.get("requires_approval") for s in get_skill_registry() if s["id"] in skill_ids)),
            "mode": "live" if os.getenv("ANTHROPIC_API_KEY") else "demo",
            "errors": [],
            "created_at": datetime.utcnow().isoformat() + "Z",
        }
