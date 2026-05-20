"""
Hermes Orchestrator — intent classifier, skill planner, and task router.

NOT a chatbot. Receives user text or structured intent, maps to a skill plan,
calls TradingAgents + financial skills + browser agent, returns structured output.
All outputs carry a financial-research disclaimer. Internals are never surfaced.
"""

from __future__ import annotations

import json
import logging
import os
import sys
import uuid
from datetime import date, datetime
from typing import Any, Optional

import anthropic

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../core/trading-agents"))

from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.default_config import DEFAULT_CONFIG

from skills_manifest import (
    DISCLAIMER,
    DEFAULT_LOCALE,
    FORBIDDEN_ACTIONS,
    get_skill,
    get_skills_for_intent,
    registry_as_dict,
)
from financial_skills_adapter import run_skill as _adapter_run_skill

logger = logging.getLogger(__name__)

# ── Model IDs (env-overridable) ────────────────────────────────────── #
_DEEP_MODEL  = os.getenv("DEEP_THINK_MODEL",  "claude-opus-4-7")
_QUICK_MODEL = os.getenv("QUICK_THINK_MODEL", "claude-haiku-4-5-20251001")

# ── Intent schema ─────────────────────────────────────────────────── #
INTENT_SCHEMA: dict[str, dict] = {
    # new canonical intents
    "analyze_asset":   {"ticker": str, "date": str, "analysts": list},
    "explain_risk":    {"topic": str, "context": str},
    "generate_report": {"subject": str, "period": str, "sections": list},
    "update_watchlist":{"action": str, "tickers": list},
    "browser_research":{"query": str, "url": str},
    "summarize_news":  {"ticker": str, "topic": str, "days": int},
    "earnings_review": {"ticker": str, "period": str},
    "sector_review":   {"sector": str, "period": str},
    "status":          {},
    # legacy aliases kept for backward compatibility
    "analyze": {"ticker": str, "date": str, "analysts": list},
    "research": {"query": str, "depth": str},
    "screen":  {"criteria": dict},
    "report":  {"ticker": str, "period": str},
}

# legacy → canonical mapping
_LEGACY_MAP: dict[str, str] = {
    "analyze":  "analyze_asset",
    "research": "browser_research",
    "screen":   "analyze_asset",
    "report":   "generate_report",
}

INTENT_SYSTEM = """You are an intent classifier for CheggieTrade, a trading analysis platform.
Parse the user message (which may be in Serbian, English, or Spanish) and return ONLY a JSON object.

Supported intents:
- analyze_asset:    Analyse a stock, ETF, or crypto. Fields: ticker (str), date (YYYY-MM-DD), analysts (list)
- explain_risk:     Explain risk of a position or concept. Fields: topic (str), context (str, optional)
- generate_report:  Create a research report. Fields: subject (str), period (day|week|month), sections (list, optional)
- update_watchlist: Add/remove watchlist items. Fields: action (add|remove|list), tickers (list)
- browser_research: Research a query via web. Fields: query (str), url (str, optional)
- summarize_news:   Summarise news. Fields: ticker (str, optional), topic (str, optional), days (int, default 7)
- earnings_review:  Review earnings for a ticker. Fields: ticker (str), period (str, e.g. "Q2 2025")
- sector_review:    Sector-level analysis. Fields: sector (str), period (str)
- status:           System status. No fields.

Examples:
- "Analiziraj NVDA za swing trade" → {"intent": "analyze_asset", "params": {"ticker": "NVDA", "date": "<today>", "analysts": ["market","news","fundamentals"]}, "confidence": 0.95}
- "Napravi izveštaj za Telegram" → {"intent": "generate_report", "params": {"subject": "TLGN", "period": "week"}, "confidence": 0.85}
- "What is the risk on my Tesla position?" → {"intent": "explain_risk", "params": {"topic": "Tesla position risk", "context": "TSLA"}, "confidence": 0.9}
- "Pregledaj sektor tehnologije" → {"intent": "sector_review", "params": {"sector": "technology", "period": "week"}, "confidence": 0.9}

Return: {"intent": "<type>", "params": {...}, "confidence": 0.0–1.0}
If ambiguous, default to analyze_asset with any ticker extracted from the text."""


class HermesOrchestrator:
    def __init__(self, config: dict | None = None):
        self.config = {**DEFAULT_CONFIG, **(config or {})}
        self.config["llm_provider"] = "anthropic"
        self.config["deep_think_llm"]  = _DEEP_MODEL
        self.config["quick_think_llm"] = _QUICK_MODEL
        self.config["output_language"] = "English"

        api_key = os.getenv("ANTHROPIC_API_KEY")
        self._demo_mode = not bool(api_key)
        self.anthropic = anthropic.Anthropic(api_key=api_key) if not self._demo_mode else None
        self._graph_cache: dict[str, TradingAgentsGraph] = {}

    # ── Public interface ───────────────────────────────────────────── #

    def parse_intent(self, raw_input: str) -> dict:
        """Parse raw user text into structured intent JSON."""
        if self._demo_mode:
            return self._default_analyze_intent(raw_input)

        try:
            response = self.anthropic.messages.create(
                model=_QUICK_MODEL,
                max_tokens=512,
                system=INTENT_SYSTEM,
                messages=[{"role": "user", "content": raw_input}],
            )
            text = response.content[0].text.strip()
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            return json.loads(text)
        except (json.JSONDecodeError, IndexError, Exception) as exc:
            logger.warning("Intent parse failed: %s — defaulting", exc)
            return self._default_analyze_intent(raw_input)

    def execute(self, intent: dict, locale: str = DEFAULT_LOCALE) -> dict:
        """Route a structured intent to its handler. Returns structured output + audit."""
        kind = intent.get("intent", "status")
        params = intent.get("params", {})
        params.setdefault("locale", locale)

        # normalise legacy intent names
        kind = _LEGACY_MAP.get(kind, kind)

        handlers = {
            "analyze_asset":   self._handle_analyze,
            "explain_risk":    self._handle_explain_risk,
            "generate_report": self._handle_report,
            "update_watchlist":self._handle_watchlist,
            "browser_research":self._handle_research,
            "summarize_news":  self._handle_news_summary,
            "earnings_review": self._handle_earnings_review,
            "sector_review":   self._handle_sector_review,
            "status":          self._handle_status,
        }

        handler = handlers.get(kind, self._handle_status)
        skill_ids = [s.id for s in get_skills_for_intent(kind)]
        errors: list[str] = []

        try:
            result = handler(params)
            audit = self._build_audit(kind, skill_ids, skill_ids, errors, requires_approval=False)
            return {"ok": True, "intent": kind, "result": result, "audit": audit}
        except Exception as exc:
            errors.append(str(exc))
            logger.error("Handler %s failed: %s", kind, exc, exc_info=True)
            audit = self._build_audit(kind, skill_ids, [], errors)
            return {"ok": False, "intent": kind, "error": str(exc), "result": None, "audit": audit}

    def run(self, raw_input: str, locale: str = DEFAULT_LOCALE) -> dict:
        """Full pipeline: parse intent → select tools → execute → return."""
        intent = self.parse_intent(raw_input)
        output = self.execute(intent, locale=locale)
        output["parsed_intent"] = intent
        return output

    def select_tools(self, intent: str) -> list:
        """Return the SkillDef list planned for this intent."""
        return get_skills_for_intent(intent)

    def run_skill_plan(self, intent: str, params: dict) -> dict:
        """
        Execute all implemented skills planned for an intent.
        Returns combined results; never raises on partial failures.
        """
        locale = params.get("locale", DEFAULT_LOCALE)
        skills = self.select_tools(intent)
        results: dict = {}
        tools_used: list[str] = []
        errors: list[str] = []
        approval_required = False

        for skill in skills:
            if skill.requires_approval:
                approval_required = True
                results[skill.id] = {"status": "requires_approval"}
                continue
            if skill.status == "not_implemented":
                results[skill.id] = {"status": "not_implemented"}
                continue
            try:
                r = _adapter_run_skill(skill.id, {**params, "locale": locale}, self.anthropic)
                results[skill.id] = r
                if r.get("ok"):
                    tools_used.append(skill.id)
            except Exception as exc:
                errors.append(f"{skill.id}: {exc}")
                results[skill.id] = {"status": "error", "note": str(exc)}

        disclaimer = DISCLAIMER.get(locale, DISCLAIMER[DEFAULT_LOCALE])
        return {
            "intent": intent,
            "skills_planned": [s.id for s in skills],
            "tools_used": tools_used,
            "results": results,
            "disclaimer": disclaimer,
            "audit": self._build_audit(intent, [s.id for s in skills], tools_used, errors, approval_required),
        }

    def get_registry(self) -> list[dict]:
        """Return public skill registry (no internals)."""
        return registry_as_dict(include_internals=False)

    # ── Intent handlers ────────────────────────────────────────────── #

    def _handle_analyze(self, params: dict) -> dict:
        ticker = params.get("ticker", "SPY").upper()
        trade_date = params.get("date", str(date.today()))
        analysts = params.get("analysts", ["market", "news", "fundamentals"])
        locale = params.get("locale", DEFAULT_LOCALE)
        asset_type = "crypto" if ticker.endswith("-USD") else "stock"

        if self._demo_mode:
            return self._demo_analyze(ticker, trade_date, locale)

        graph = self._get_graph(analysts)
        state, decision = graph.propagate(ticker, trade_date, asset_type=asset_type)

        return {
            "ticker": ticker,
            "date": trade_date,
            "decision": decision,
            "analyst_reports": self._extract_reports(state),
            "risk_assessment": self._extract_risk(state),
            "disclaimer": DISCLAIMER.get(locale, DISCLAIMER[DEFAULT_LOCALE]),
        }

    def _handle_explain_risk(self, params: dict) -> dict:
        topic = params.get("topic", "")
        context = params.get("context", "")
        locale = params.get("locale", DEFAULT_LOCALE)
        disclaimer = DISCLAIMER.get(locale, DISCLAIMER[DEFAULT_LOCALE])

        if self._demo_mode:
            return {
                "topic": topic,
                "explanation": f"[Demo] Risk explanation for: {topic}",
                "risk_factors": [],
                "disclaimer": disclaimer,
            }

        prompt = (
            f"Explain the risk clearly and concisely for: {topic}. "
            f"Context: {context}. "
            "Focus on: key risk factors, magnitude, and what would change the picture. "
            "Do not mention AI, models, or internal systems. "
            f"{disclaimer}"
        )
        response = self.anthropic.messages.create(
            model=_QUICK_MODEL,
            max_tokens=800,
            messages=[{"role": "user", "content": prompt}],
        )
        return {
            "topic": topic,
            "explanation": response.content[0].text,
            "disclaimer": disclaimer,
        }

    def _handle_report(self, params: dict) -> dict:
        subject = params.get("subject") or params.get("ticker", "SPY").upper()
        period = params.get("period", "week")
        sections = params.get("sections") or ["overview", "technicals", "risk", "signal"]
        locale = params.get("locale", DEFAULT_LOCALE)
        disclaimer = DISCLAIMER.get(locale, DISCLAIMER[DEFAULT_LOCALE])

        if self._demo_mode:
            return {
                "subject": subject,
                "period": period,
                "report": f"[Demo] Research report for {subject} ({period}).",
                "disclaimer": disclaimer,
            }

        prompt = (
            f"Write a concise research report for: {subject}. "
            f"Period: {period}. "
            f"Sections to cover: {', '.join(sections)}. "
            "Be direct and data-focused. Do not mention AI, models, or internal tools. "
            f"\n\n{disclaimer}"
        )
        response = self.anthropic.messages.create(
            model=_DEEP_MODEL,
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}],
        )
        return {
            "subject": subject,
            "period": period,
            "report": response.content[0].text,
            "disclaimer": disclaimer,
        }

    def _handle_watchlist(self, params: dict) -> dict:
        action = params.get("action", "list")
        tickers = [t.upper() for t in params.get("tickers", [])]
        return {
            "action": action,
            "tickers": tickers,
            "result": f"Watchlist {action} recorded for: {tickers}",
            "note": "Persistent watchlist requires database integration.",
        }

    def _handle_research(self, params: dict) -> dict:
        query = params.get("query", "")
        depth = params.get("depth", "standard")
        locale = params.get("locale", DEFAULT_LOCALE)
        disclaimer = DISCLAIMER.get(locale, DISCLAIMER[DEFAULT_LOCALE])
        max_tokens = {"brief": 800, "standard": 2000, "deep": 4000}.get(depth, 2000)

        if self._demo_mode:
            return {"query": query, "summary": f"[Demo] Research for: {query}", "disclaimer": disclaimer}

        response = self.anthropic.messages.create(
            model=_DEEP_MODEL,
            max_tokens=max_tokens,
            system="You are a senior financial analyst. Be concise and data-driven. Never mention AI or internal systems.",
            messages=[{"role": "user", "content": query}],
        )
        return {
            "query": query,
            "depth": depth,
            "summary": response.content[0].text,
            "disclaimer": disclaimer,
        }

    def _handle_news_summary(self, params: dict) -> dict:
        ticker = params.get("ticker")
        topic = params.get("topic", ticker or "markets")
        days = int(params.get("days", 7))
        locale = params.get("locale", DEFAULT_LOCALE)
        disclaimer = DISCLAIMER.get(locale, DISCLAIMER[DEFAULT_LOCALE])

        if self._demo_mode:
            return {"topic": topic, "summary": f"[Demo] News summary for: {topic}", "articles": [], "disclaimer": disclaimer}

        prompt = f"Summarise the most important financial news for '{topic}' over the last {days} days. Be concise. {disclaimer}"
        response = self.anthropic.messages.create(
            model=_QUICK_MODEL,
            max_tokens=800,
            messages=[{"role": "user", "content": prompt}],
        )
        return {
            "topic": topic,
            "days": days,
            "summary": response.content[0].text,
            "articles": [],
            "disclaimer": disclaimer,
        }

    def _handle_earnings_review(self, params: dict) -> dict:
        ticker = params.get("ticker", "").upper()
        period = params.get("period", "latest")
        locale = params.get("locale", DEFAULT_LOCALE)
        return _adapter_run_skill(
            "earnings-analysis",
            {"ticker": ticker, "period": period, "locale": locale},
            self.anthropic,
        )

    def _handle_sector_review(self, params: dict) -> dict:
        sector = params.get("sector", "technology")
        period = params.get("period", "week")
        locale = params.get("locale", DEFAULT_LOCALE)
        return _adapter_run_skill(
            "sector-overview",
            {"sector": sector, "period": period, "locale": locale},
            self.anthropic,
        )

    def _handle_screen(self, params: dict) -> dict:
        criteria = params.get("criteria", {})
        return {"criteria": criteria, "results": [], "note": "Screening via yfinance — implement filters"}

    def _handle_status(self, _params: dict | None = None) -> dict:
        return {
            "service": "hermes",
            "status": "operational",
            "mode": "demo" if self._demo_mode else "live",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "capabilities": list(INTENT_SCHEMA.keys()),
        }

    # ── Helpers ────────────────────────────────────────────────────── #

    def _get_graph(self, analysts: list) -> TradingAgentsGraph:
        key = ",".join(sorted(analysts))
        if key not in self._graph_cache:
            self._graph_cache[key] = TradingAgentsGraph(
                selected_analysts=analysts,
                config=self.config,
            )
        return self._graph_cache[key]

    def _extract_reports(self, state: Any) -> dict:
        if not state:
            return {}
        reports = {}
        for key in ("market_report", "news_report", "fundamentals_report", "social_media_report"):
            val = getattr(state, key, None) or (state.get(key) if isinstance(state, dict) else None)
            if val:
                reports[key] = val
        return reports

    def _extract_risk(self, state: Any) -> Optional[str]:
        if not state:
            return None
        return getattr(state, "risk_debate_state", None) or (
            state.get("risk_debate_state") if isinstance(state, dict) else None
        )

    def _default_analyze_intent(self, raw_input: str) -> dict:
        words = raw_input.upper().split()
        ticker = next((w for w in words if 1 < len(w) <= 5 and w.isalpha()), "SPY")
        return {
            "intent": "analyze_asset",
            "params": {
                "ticker": ticker,
                "date": str(date.today()),
                "analysts": ["market", "news", "fundamentals"],
            },
            "confidence": 0.4,
        }

    def _demo_analyze(self, ticker: str, trade_date: str, locale: str) -> dict:
        disclaimer = DISCLAIMER.get(locale, DISCLAIMER[DEFAULT_LOCALE])
        return {
            "ticker": ticker,
            "date": trade_date,
            "decision": "[Demo] Connect API key for live analysis.",
            "analyst_reports": {},
            "risk_assessment": None,
            "disclaimer": disclaimer,
            "mode": "demo",
        }

    def _build_audit(
        self,
        intent: str,
        skill_ids: list[str],
        tools_used: list[str],
        errors: list[str],
        requires_approval: bool = False,
    ) -> dict:
        return {
            "run_id": str(uuid.uuid4()),
            "tenant_id": None,
            "user_id": None,
            "skill_ids": skill_ids,
            "tools_used": tools_used,
            "approval_required": requires_approval,
            "mode": "demo" if self._demo_mode else "live",
            "errors": errors,
            "created_at": datetime.utcnow().isoformat() + "Z",
        }
