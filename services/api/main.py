from __future__ import annotations

import os
from datetime import datetime
from typing import Any, Dict

import requests
import yfinance as yf
from fastapi import FastAPI
from pydantic import BaseModel

from services.hermes.hermes_orchestrator import HermesOrchestrator


class StubTradingAgentClient:
    def run(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return {"engine": "TradingAgents", "summary": "Analysis generated.", "payload": payload}


class StubFinancialSkillsClient:
    def run(self, skill_name: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        return {"skill": skill_name, "status": "ok", "payload": payload}


class StubBrowserAgentClient:
    def run(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return {"browser": "queued", "payload": payload}


app = FastAPI(title="CheggieTrade API")
hermes = HermesOrchestrator(StubTradingAgentClient(), StubFinancialSkillsClient(), StubBrowserAgentClient())


class InputPayload(BaseModel):
    query: str
    symbol: str = "AAPL"


def normalize_market_data(symbol: str) -> Dict[str, Any]:
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period="5d")
        closes = [float(x) for x in hist["Close"].tolist()]
    except Exception:
        closes = []

    headlines = []
    try:
        api_key = os.getenv("NEWS_API_KEY", "")
        if api_key:
            response = requests.get(
                "https://newsapi.org/v2/everything",
                params={"q": symbol, "language": "en", "pageSize": 5, "apiKey": api_key},
                timeout=10,
            )
            response.raise_for_status()
            data = response.json()
            headlines = [{"title": a.get("title"), "source": a.get("source", {}).get("name")} for a in data.get("articles", [])]
    except Exception:
        headlines = []

    return {
        "symbol": symbol,
        "as_of": datetime.utcnow().isoformat(),
        "prices": {"close_5d": closes, "latest": closes[-1] if closes else None},
        "news": headlines,
    }


@app.get("/api/status")
def status() -> Dict[str, Any]:
    return {"status": "ok", "service": "cheggietrade", "timestamp": datetime.utcnow().isoformat()}


@app.post("/api/analyze")
def analyze(payload: InputPayload) -> Dict[str, Any]:
    normalized = normalize_market_data(payload.symbol)
    return hermes.execute(payload.query, normalized)


@app.post("/api/assistant")
def assistant(payload: InputPayload) -> Dict[str, Any]:
    normalized = normalize_market_data(payload.symbol)
    return {"assistant": hermes.execute(payload.query, normalized), "ui_mode": "non_technical"}


@app.get("/api/skills")
def skills() -> Dict[str, Any]:
    return {
        "skills": [
            "risk_profile",
            "news_enrichment",
            "market_analysis",
            "browser_automation",
        ]
    }
