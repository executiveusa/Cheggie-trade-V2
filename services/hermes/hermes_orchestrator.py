"""
Hermes Orchestrator — intent parser and task router for CheggieTrade.

NOT a chatbot. Receives structured intent, maps to tasks, calls
TradingAgents + financial skills + browser agent, returns structured output.
"""

import sys
import os
import json
import logging
from datetime import date, datetime
from typing import Any, Optional

import anthropic

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../core/trading-agents"))

from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.default_config import DEFAULT_CONFIG

logger = logging.getLogger(__name__)

INTENT_SCHEMA = {
    "analyze": {"ticker": str, "date": str, "analysts": list},
    "research": {"query": str, "depth": str},
    "screen": {"criteria": dict},
    "report": {"ticker": str, "period": str},
    "status": {},
}

INTENT_SYSTEM = """You are an intent parser for a trading analysis system.
Extract structured intent from user input and return ONLY a JSON object.

Supported intents:
- analyze: stock/crypto analysis. Fields: ticker (string), date (YYYY-MM-DD), analysts (list of: market, social, news, fundamentals)
- research: market research query. Fields: query (string), depth (brief|standard|deep)
- screen: stock screening. Fields: criteria (dict with sector, pe_max, market_cap_min etc)
- report: generate report. Fields: ticker (string), period (day|week|month)
- status: system status check. No fields required.

Return JSON with: {"intent": "<type>", "params": {...}, "confidence": 0.0-1.0}
If input is ambiguous, default to analyze intent with extracted ticker."""


class HermesOrchestrator:
    def __init__(self, config: dict = None):
        self.config = {**DEFAULT_CONFIG, **(config or {})}
        self.config["llm_provider"] = "anthropic"
        self.config["deep_think_llm"] = "claude-opus-4-7"
        self.config["quick_think_llm"] = "claude-haiku-4-5-20251001"
        self.config["output_language"] = "English"
        self.anthropic = anthropic.Anthropic()
        self._graph_cache: dict[str, TradingAgentsGraph] = {}

    def parse_intent(self, raw_input: str) -> dict:
        """Parse raw user text into structured intent."""
        response = self.anthropic.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=512,
            system=INTENT_SYSTEM,
            messages=[{"role": "user", "content": raw_input}],
        )
        try:
            text = response.content[0].text.strip()
            # Strip markdown code fences if present
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            return json.loads(text)
        except (json.JSONDecodeError, IndexError) as e:
            logger.warning("Intent parse failed: %s — defaulting to analyze", e)
            return self._default_analyze_intent(raw_input)

    def _default_analyze_intent(self, raw_input: str) -> dict:
        words = raw_input.upper().split()
        ticker = next((w for w in words if 1 < len(w) <= 5 and w.isalpha()), "SPY")
        return {
            "intent": "analyze",
            "params": {
                "ticker": ticker,
                "date": str(date.today()),
                "analysts": ["market", "news", "fundamentals"],
            },
            "confidence": 0.4,
        }

    def execute(self, intent: dict) -> dict:
        """Route intent to the correct handler and return structured output."""
        kind = intent.get("intent", "status")
        params = intent.get("params", {})

        handlers = {
            "analyze": self._handle_analyze,
            "research": self._handle_research,
            "screen": self._handle_screen,
            "report": self._handle_report,
            "status": self._handle_status,
        }

        handler = handlers.get(kind, self._handle_status)
        try:
            result = handler(params)
            return {"ok": True, "intent": kind, "result": result}
        except Exception as e:
            logger.error("Handler %s failed: %s", kind, e, exc_info=True)
            return {
                "ok": False,
                "intent": kind,
                "error": str(e),
                "result": None,
            }

    def run(self, raw_input: str) -> dict:
        """Full pipeline: parse → route → execute → return."""
        intent = self.parse_intent(raw_input)
        output = self.execute(intent)
        output["parsed_intent"] = intent
        return output

    # ------------------------------------------------------------------ #
    # Handlers                                                             #
    # ------------------------------------------------------------------ #

    def _handle_analyze(self, params: dict) -> dict:
        ticker = params.get("ticker", "SPY").upper()
        trade_date = params.get("date", str(date.today()))
        analysts = params.get("analysts", ["market", "news", "fundamentals"])
        asset_type = "crypto" if ticker.endswith("-USD") else "stock"

        graph = self._get_graph(analysts)
        state, decision = graph.propagate(ticker, trade_date, asset_type=asset_type)

        return {
            "ticker": ticker,
            "date": trade_date,
            "decision": decision,
            "analyst_reports": self._extract_reports(state),
            "risk_assessment": self._extract_risk(state),
        }

    def _handle_research(self, params: dict) -> dict:
        query = params.get("query", "")
        depth = params.get("depth", "standard")
        max_tokens = {"brief": 800, "standard": 2000, "deep": 4000}.get(depth, 2000)

        response = self.anthropic.messages.create(
            model="claude-opus-4-7",
            max_tokens=max_tokens,
            system="You are a senior financial analyst. Provide concise, data-driven research.",
            messages=[{"role": "user", "content": query}],
        )
        return {
            "query": query,
            "depth": depth,
            "summary": response.content[0].text,
        }

    def _handle_screen(self, params: dict) -> dict:
        criteria = params.get("criteria", {})
        return {"criteria": criteria, "results": [], "note": "Screening via yfinance — implement filters"}

    def _handle_report(self, params: dict) -> dict:
        ticker = params.get("ticker", "SPY").upper()
        period = params.get("period", "day")
        return {"ticker": ticker, "period": period, "report": None, "note": "Report generation scheduled"}

    def _handle_status(self, _params: dict = None) -> dict:
        return {
            "service": "hermes",
            "status": "operational",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "capabilities": list(INTENT_SCHEMA.keys()),
        }

    # ------------------------------------------------------------------ #
    # Helpers                                                              #
    # ------------------------------------------------------------------ #

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
