"""
CheggieTrade API service.

Endpoints:
  POST /api/analyze   — run full trading analysis
  POST /api/assistant — conversational assistant (hides agent internals)
  GET  /api/skills    — list available financial skills
  GET  /api/status    — service health
"""

import os
import logging
from datetime import date, datetime
from typing import Optional

import httpx
import anthropic
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from data_layer import get_stock_snapshot, get_news

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

HERMES_URL = os.getenv("HERMES_URL", "http://localhost:8001")
ANTHROPIC_CLIENT = anthropic.Anthropic()

app = FastAPI(title="CheggieTrade API", docs_url=None, redoc_url=None)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("WEB_ORIGIN", "http://localhost:3000")],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

ASSISTANT_SYSTEM = """You are a trading analyst assistant for CheggieTrade.
Communicate clearly and confidently. Use plain language.
Never mention: AI, models, agents, LLMs, Claude, GPT, machine learning, or internal systems.
Focus on: market insight, trading rationale, risk context, and actionable direction.
If asked about technology, say: "CheggieTrade uses proprietary analysis."
Be direct. No hedging. No filler sentences."""

SKILLS_REGISTRY = [
    {"id": "equity-research", "name": "Equity Research", "description": "Deep fundamental + technical analysis"},
    {"id": "earnings-analysis", "name": "Earnings Analysis", "description": "Earnings reports and guidance analysis"},
    {"id": "risk-assessment", "name": "Risk Assessment", "description": "Portfolio risk and drawdown analysis"},
    {"id": "sector-overview", "name": "Sector Overview", "description": "Sector rotation and relative strength"},
    {"id": "idea-generation", "name": "Idea Generation", "description": "Trade idea screening and setup detection"},
    {"id": "morning-note", "name": "Morning Note", "description": "Pre-market briefing and key levels"},
]


# ------------------------------------------------------------------ #
# Request / Response models                                            #
# ------------------------------------------------------------------ #

class AnalyzeRequest(BaseModel):
    ticker: str
    date: Optional[str] = None
    analysts: list[str] = ["market", "news", "fundamentals"]


class AssistantMessage(BaseModel):
    role: str
    content: str


class AssistantRequest(BaseModel):
    messages: list[AssistantMessage]
    context: dict = {}


class AnalyzeResponse(BaseModel):
    ok: bool
    ticker: str
    snapshot: dict
    news: list
    decision: Optional[str] = None
    analyst_reports: dict = {}
    risk_assessment: Optional[str] = None
    error: Optional[str] = None
    timestamp: str


# ------------------------------------------------------------------ #
# Routes                                                               #
# ------------------------------------------------------------------ #

@app.post("/api/analyze")
async def analyze(req: AnalyzeRequest):
    ticker = req.ticker.upper().strip()
    trade_date = req.date or str(date.today())

    snapshot = get_stock_snapshot(ticker)
    news = get_news(ticker, days=7, limit=8)

    hermes_result = await _call_hermes({
        "intent": "analyze",
        "params": {
            "ticker": ticker,
            "date": trade_date,
            "analysts": req.analysts,
        },
    })

    if hermes_result and hermes_result.get("ok"):
        r = hermes_result["result"]
        return AnalyzeResponse(
            ok=True,
            ticker=ticker,
            snapshot=snapshot,
            news=news,
            decision=r.get("decision"),
            analyst_reports=r.get("analyst_reports", {}),
            risk_assessment=r.get("risk_assessment"),
            timestamp=datetime.utcnow().isoformat() + "Z",
        )

    # Fallback: return market data without deep analysis
    return AnalyzeResponse(
        ok=True,
        ticker=ticker,
        snapshot=snapshot,
        news=news,
        decision=None,
        error="Deep analysis unavailable — showing market data only",
        timestamp=datetime.utcnow().isoformat() + "Z",
    )


@app.post("/api/assistant")
async def assistant(req: AssistantRequest):
    messages = [{"role": m.role, "content": m.content} for m in req.messages]

    # Inject market context if ticker present
    context = req.context
    if context.get("ticker"):
        snapshot = get_stock_snapshot(context["ticker"])
        context_note = (
            f"Current context: {snapshot['ticker']} at ${snapshot.get('price', 'N/A')}, "
            f"{snapshot.get('change_pct', 'N/A')}% today. "
            f"Sector: {snapshot.get('sector', 'N/A')}."
        )
        if messages and messages[0]["role"] == "user":
            messages[0]["content"] = context_note + "\n\n" + messages[0]["content"]

    try:
        response = ANTHROPIC_CLIENT.messages.create(
            model="claude-opus-4-7",
            max_tokens=1024,
            system=ASSISTANT_SYSTEM,
            messages=messages,
        )
        return {
            "ok": True,
            "response": response.content[0].text,
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }
    except Exception as e:
        logger.error("Assistant error: %s", e)
        raise HTTPException(status_code=500, detail="Assistant temporarily unavailable")


@app.get("/api/skills")
async def skills():
    return {"ok": True, "skills": SKILLS_REGISTRY}


@app.get("/api/status")
async def status():
    hermes_ok = await _ping_hermes()
    return {
        "ok": True,
        "services": {
            "api": "operational",
            "hermes": "operational" if hermes_ok else "degraded",
        },
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


# ------------------------------------------------------------------ #
# Internal helpers                                                     #
# ------------------------------------------------------------------ #

async def _call_hermes(payload: dict) -> Optional[dict]:
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            r = await client.post(f"{HERMES_URL}/execute", json={"intent": payload})
            r.raise_for_status()
            return r.json()
    except Exception as e:
        logger.warning("Hermes call failed: %s", e)
        return None


async def _ping_hermes() -> bool:
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            r = await client.get(f"{HERMES_URL}/status")
            return r.status_code == 200
    except Exception:
        return False


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("API_PORT", 8000)))
