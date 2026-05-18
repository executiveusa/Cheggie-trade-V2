from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import Any, Dict, List


@dataclass
class HermesTask:
    name: str
    source: str
    payload: Dict[str, Any]


class HermesOrchestrator:
    """Strict operator layer that routes requests to platform capabilities."""

    def __init__(self, trading_agent_client, financial_skills_client, browser_agent_client):
        self.trading_agent_client = trading_agent_client
        self.financial_skills_client = financial_skills_client
        self.browser_agent_client = browser_agent_client

    def parse_intent(self, user_input: str) -> Dict[str, Any]:
        text = user_input.lower().strip()
        if any(k in text for k in ["analy", "signal", "trade", "position"]):
            intent = "market_analysis"
        elif any(k in text for k in ["news", "headline", "event"]):
            intent = "news_scan"
        elif any(k in text for k in ["browser", "site", "open"]):
            intent = "browser_automation"
        else:
            intent = "assistant_support"
        return {"intent": intent, "raw": user_input}

    def map_tasks(self, intent_payload: Dict[str, Any]) -> List[HermesTask]:
        intent = intent_payload["intent"]
        tasks: List[HermesTask] = []
        if intent in {"market_analysis", "assistant_support"}:
            tasks.append(HermesTask("trading_analysis", "trading_agents", intent_payload))
            tasks.append(HermesTask("risk_profile", "financial_skills", intent_payload))
        if intent in {"news_scan", "market_analysis"}:
            tasks.append(HermesTask("news_enrichment", "financial_skills", intent_payload))
        if intent == "browser_automation":
            tasks.append(HermesTask("browser_exec", "browser_agent", intent_payload))
        return tasks

    def execute(self, user_input: str, normalized_data: Dict[str, Any] | None = None) -> Dict[str, Any]:
        normalized_data = normalized_data or {}
        intent_payload = self.parse_intent(user_input)
        tasks = self.map_tasks(intent_payload)

        results: Dict[str, Any] = {}
        for task in tasks:
            payload = {**task.payload, "data": normalized_data}
            if task.source == "trading_agents":
                results[task.name] = self.trading_agent_client.run(payload)
            elif task.source == "financial_skills":
                results[task.name] = self.financial_skills_client.run(task.name, payload)
            elif task.source == "browser_agent":
                results[task.name] = self.browser_agent_client.run(payload)

        return {
            "type": "hermes_result",
            "intent": intent_payload["intent"],
            "tasks": [asdict(t) for t in tasks],
            "results": results,
        }
